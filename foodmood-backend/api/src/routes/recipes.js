import { Router } from 'express';
import { z } from 'zod';
import Recipe from '../models/Recipe.js';
import FoodItem from '../models/FoodItem.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recommendForUser, rankRecipes } from '../services/recommender.js';
import { recommendFromML, isMlConfigured } from '../services/mlClient.js';
import { computeStatsDelta, applyDelta } from '../services/statsCalculator.js';

const router = Router();

// Public: list all recipes (no ranking, no auth). Useful for the Recipes page browsing.
router.get('/', async (req, res) => {
  const recipes = await Recipe.find({}).limit(100).lean();
  res.json({
    recipes: recipes.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      cookingTime: r.cookingTime,
      servings: r.servings,
      image: r.image,
      ingredients: r.ingredients.map(({ name, amount }) => ({ name, amount, inPantry: false })),
      instructions: r.instructions,
      matchPercentage: 0,
    })),
  });
});

router.get('/:id', async (req, res) => {
  const r = await Recipe.findById(req.params.id).lean();
  if (!r) return res.status(404).json({ error: 'Recipe not found' });
  res.json({
    recipe: {
      id: r._id.toString(),
      name: r.name,
      cookingTime: r.cookingTime,
      servings: r.servings,
      image: r.image,
      ingredients: r.ingredients.map(({ name, amount }) => ({ name, amount, inPantry: false })),
      instructions: r.instructions,
    },
  });
});

// Authenticated: expiry-aware recommendations against the user's pantry.
// Tries ML service first, falls back to local rule-based ranking.
router.get('/recommend/me', authRequired, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '12', 10), 50);
  const pantry = await FoodItem.find({ user: req.userId, status: 'active' }).lean();

  let recipes = null;
  if (isMlConfigured()) {
    recipes = await recommendFromML(pantry, { limit });
  }
  if (!recipes) {
    recipes = await recommendForUser(pantry, { limit });
  }
  res.json({ recipes, source: isMlConfigured() && recipes ? 'ml-or-fallback' : 'rule-based' });
});

// POST variant — front can pass a custom pantry snapshot or preferences.
router.post(
  '/recommend',
  authRequired,
  validate({
    body: z.object({
      pantry: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.number().optional(),
            unit: z.string().optional(),
            expiryDate: z.string().optional(),
          })
        )
        .optional(),
      limit: z.number().int().positive().max(50).optional(),
    }),
  }),
  async (req, res) => {
    const pantry =
      req.body.pantry?.length
        ? req.body.pantry
        : await FoodItem.find({ user: req.userId, status: 'active' }).lean();

    let recipes = null;
    if (isMlConfigured()) {
      recipes = await recommendFromML(pantry, { limit: req.body.limit });
    }
    if (!recipes) {
      const all = await Recipe.find({}).lean();
      recipes = rankRecipes(all, pantry, { limit: req.body.limit });
    }
    res.json({ recipes });
  }
);

// Marking a recipe as cooked: consumes matching pantry items.
router.post('/:id/use', authRequired, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).lean();
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const pantry = await FoodItem.find({ user: req.userId, status: 'active' });
  const wanted = new Set(
    recipe.ingredients.map((i) => (i.normalizedName || String(i.name).toLowerCase()).trim())
  );

  const consumed = [];
  for (const item of pantry) {
    if (wanted.has(item.name.toLowerCase().trim())) {
      const delta = computeStatsDelta(item, 'consumed');
      applyDelta(req.user, delta);
      item.status = 'consumed';
      item.consumedAt = new Date();
      await item.save();
      consumed.push(item.toDTO());
    }
  }
  await req.user.save();

  res.json({ ok: true, consumed, stats: req.user.stats });
});

export default router;
