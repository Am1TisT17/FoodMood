// Rule-based recipe recommender with expiry-aware urgency ranking.
// Used as a fallback when ML_SERVICE_URL is not configured or unreachable.
//
// The ranking blends:
//   - ingredientMatch     : fraction of recipe ingredients available in pantry
//   - expiryUrgencyBoost  : bonus when the recipe uses items that expire soonest
//   - quickWinBonus       : small bonus for short cookingTime
//
// Output shape matches the frontend Recipe interface so the response is drop-in.

import Recipe from '../models/Recipe.js';

function normalize(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/s$/, '') // very rough singularization
    .trim();
}

function daysUntil(date) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function urgencyScore(daysLeft) {
  // 0 days = max urgency (1.0); decays to ~0 over a week.
  if (daysLeft <= 0) return 1.0;
  if (daysLeft >= 7) return 0;
  return 1 - daysLeft / 7;
}

export function rankRecipes(recipes, pantryItems, opts = {}) {
  const { limit = 12 } = opts;

  // Build a pantry index: normalizedName → { item, urgency }
  const pantryIndex = new Map();
  for (const it of pantryItems) {
    const key = normalize(it.name);
    const urgency = urgencyScore(daysUntil(it.expiryDate));
    const prev = pantryIndex.get(key);
    if (!prev || urgency > prev.urgency) {
      pantryIndex.set(key, { item: it, urgency });
    }
  }

  const scored = recipes.map((r) => {
    const total = r.ingredients.length;
    let have = 0;
    let urgencyBoost = 0;
    const annotatedIngredients = r.ingredients.map((ing) => {
      const key = ing.normalizedName || normalize(ing.name);
      const hit = pantryIndex.get(key);
      const inPantry = !!hit;
      if (inPantry) {
        have += 1;
        urgencyBoost += hit.urgency;
      }
      return { name: ing.name, amount: ing.amount, inPantry };
    });

    const matchRatio = total > 0 ? have / total : 0;
    const quickWin = r.cookingTime <= 20 ? 0.05 : 0;
    // Composite score in [0, 1.5+]
    const score = matchRatio + urgencyBoost / Math.max(total, 1) + quickWin;
    const matchPercentage = Math.round(matchRatio * 100);

    return {
      id: r._id?.toString?.() ?? r.id,
      name: r.name,
      matchPercentage,
      cookingTime: r.cookingTime,
      servings: r.servings,
      ingredients: annotatedIngredients,
      instructions: r.instructions,
      image: r.image,
      _score: score,
    };
  });

  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...rest }) => rest);
}

// Convenience helper: load recipes from DB and rank them against the user's pantry.
export async function recommendForUser(pantryItems, opts) {
  const recipes = await Recipe.find({}).lean();
  return rankRecipes(recipes, pantryItems, opts);
}
