import { Router } from 'express';
import { z } from 'zod';
import Recipe from '../models/Recipe.js';
import FoodItem from '../models/FoodItem.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recommendForUser, rankRecipes } from '../services/recommender.js';
import { recommendFromML, isMlConfigured } from '../services/mlClient.js';
import {
  findRecipesByIngredients,
  hydrateRecipeDetails,
  isSpoonacularConfigured,
} from '../services/spoonacularClient.js';
import { computeStatsDelta, applyDelta } from '../services/statsCalculator.js';

const router = Router();

// Public: list all recipes (no ranking, no auth).
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
      instructions: r.instructions || [],
      matchPercentage: 0,
    })),
  });
});

router.get('/:id', async (req, res) => {
  let r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Recipe not found' });
  // Lazy-fetch Spoonacular details on first detail view.
  if (isSpoonacularConfigured() && (r.instructions || []).length === 0) {
    r = await hydrateRecipeDetails(r);
  }
  res.json({
    recipe: {
      id: r._id.toString(),
      name: r.name,
      cookingTime: r.cookingTime,
      servings: r.servings,
      image: r.image,
      ingredients: r.ingredients.map(({ name, amount }) => ({ name, amount, inPantry: false })),
      instructions: r.instructions || [],
    },
  });
});

// Recommendation fallback chain:
//   1. ML microservice (team-mate's service), if configured
//   2. Spoonacular external API, if configured
//   3. Local rule-based ranker (always available)
async function getRecommendations(pantry, limit) {
  if (isMlConfigured()) {
    const ml = await recommendFromML(pantry, { limit });
    if (ml && ml.length > 0) return { recipes: ml, source: 'ml' };
  }
  if (isSpoonacularConfigured()) {
    const sp = await findRecipesByIngredients(pantry, { limit });
    if (sp && sp.length > 0) return { recipes: sp, source: 'spoonacular' };
  }
  const local = await recommendForUser(pantry, { limit });
  return { recipes: local, source: 'rule-based' };
}

router.get('/recommend/me', authRequired, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '12', 10), 25);
  const pantry = await FoodItem.find({ user: req.userId, status: 'active' }).lean();
  const { recipes, source } = await getRecommendations(pantry, limit);
  res.json({ recipes, source });
});

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
      limit: z.number().int().positive().max(25).optional(),
    }),
  }),
  async (req, res) => {
    const pantry =
      req.body.pantry?.length
        ? req.body.pantry
        : await FoodItem.find({ user: req.userId, status: 'active' }).lean();
    const limit = req.body.limit || 12;
    const { recipes, source } = await getRecommendations(pantry, limit);
    // For an explicit pantry snapshot we may want the user to see the local
    // ranker too — but keeping the same chain for consistency.
    if (source === 'rule-based' && req.body.pantry?.length) {
      const all = await Recipe.find({}).lean();
      return res.json({ recipes: rankRecipes(all, pantry, { limit }), source: 'rule-based' });
    }
    res.json({ recipes, source });
  }
);

// Marking a recipe as cooked: consumes matching pantry items.
router.post('/:id/use', authRequired, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).lean();
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const pantry = await FoodItem.find({ user: req.userId, status: 'active' });
  const wantedTokens = new Set();
  for (const ing of recipe.ingredients) {
    const n = (ing.normalizedName || String(ing.name)).toLowerCase().trim();
    if (n) wantedTokens.add(n);
    for (const tok of n.split(' ')) if (tok.length >= 3) wantedTokens.add(tok);
  }

  const consumed = [];
  for (const item of pantry) {
    const itemName = item.name.toLowerCase().trim();
    let matched = false;
    if (wantedTokens.has(itemName)) matched = true;
    if (!matched) {
      for (const tok of itemName.split(' ')) {
        if (tok.length >= 3 && wantedTokens.has(tok)) {
          matched = true;
          break;
        }
      }
    }
    if (matched) {
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
