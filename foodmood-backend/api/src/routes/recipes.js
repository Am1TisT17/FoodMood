import { Router } from 'express';
import { z } from 'zod';
import Recipe from '../models/Recipe.js';
import FoodItem from '../models/FoodItem.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recommendForUser, rankRecipes } from '../services/recommender.js';
import { recommendFromML, isMlConfigured, sendMlFeedback, triggerMlTrain } from '../services/mlClient.js';
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
//   1. ML microservice — personalized when userId is supplied (returns meta + personalRank)
//   2. Spoonacular external API
//   3. Local rule-based ranker (always available)
async function getRecommendations(pantry, limit, userId) {
  if (isMlConfigured()) {
    const ml = await recommendFromML(pantry, { limit, userId });
    if (ml && ml.recipes && ml.recipes.length > 0) {
      return {
        recipes: ml.recipes,
        source: 'ml',
        meta: ml.meta,
        modelVersion: ml.modelVersion,
      };
    }
  }
  if (isSpoonacularConfigured()) {
    const sp = await findRecipesByIngredients(pantry, { limit });
    if (sp && sp.length > 0) return { recipes: sp, source: 'spoonacular', meta: null };
  }
  const local = await recommendForUser(pantry, { limit });
  return { recipes: local, source: 'rule-based', meta: null };
}

router.get('/recommend/me', authRequired, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '12', 10), 25);
  const pantry = await FoodItem.find({ user: req.userId, status: 'active' }).lean();
  const result = await getRecommendations(pantry, limit, req.userId);
  res.json({
    recipes: result.recipes,
    source: result.source,
    meta: result.meta || null,
    modelVersion: result.modelVersion || null,
  });
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
            category: z.string().optional(),
            price: z.number().optional(),
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
    const result = await getRecommendations(pantry, limit, req.userId);
    res.json({
      recipes: result.recipes,
      source: result.source,
      meta: result.meta || null,
      modelVersion: result.modelVersion || null,
    });
  }
);

// Recipe interaction feedback — forwarded to ML's personal ranker.
// Frontend calls this on view / cook / dismiss / like so the ranker can learn.
router.post(
  '/:id/feedback',
  authRequired,
  validate({
    body: z.object({
      action: z.enum(['view', 'cook', 'dismiss', 'like']),
      scoreShown: z.number().optional(),
      daysToExpiry: z.number().int().optional(),
      canonicalTarget: z.string().optional(),
    }),
  }),
  async (req, res) => {
    // Fire-and-forget — never block the UI on ML availability.
    sendMlFeedback({
      userId: req.userId.toString(),
      recipeId: req.params.id,
      action: req.body.action,
      canonicalTarget: req.body.canonicalTarget,
      scoreShown: req.body.scoreShown,
      daysToExpiry: req.body.daysToExpiry,
    });
    res.json({ ok: true });
  }
);

// Admin: trigger a full ML retrain (e.g. after seeding). Best-effort.
router.post('/retrain', authRequired, async (req, res) => {
  const status = await triggerMlTrain();
  res.json({ ok: !!status, status });
});

// Marking a recipe as cooked: consumes matching pantry items + sends 'cook' feedback.
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

  // Tell the ML ranker the user actually cooked this recipe.
  sendMlFeedback({
    userId: req.userId.toString(),
    recipeId: req.params.id,
    action: 'cook',
  });

  res.json({ ok: true, consumed, stats: req.user.stats });
});

export default router;
