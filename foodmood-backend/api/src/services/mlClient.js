// Thin client for the ML microservice. Falls back to null when ML_SERVICE_URL is empty.
// Contract (negotiable with ML teammate):
//
//   POST {ML_SERVICE_URL}/recommend
//   Request:  { pantry: [{ name, quantity, unit, expiryDate }], limit }
//   Response: { recipes: [{ id, name, matchPercentage, cookingTime, servings,
//                           ingredients: [{ name, amount, inPantry }],
//                           instructions: [string], image }] }
//
// If the ML service returns a different shape, normalize it in `parseMlResponse`.

import { env } from '../config/env.js';

export function isMlConfigured() {
  return !!env.ML_SERVICE_URL;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('ML timeout')), ms)),
  ]);
}

export async function recommendFromML(pantryItems, opts = {}) {
  if (!isMlConfigured()) return null;
  const url = `${env.ML_SERVICE_URL.replace(/\/$/, '')}/recommend`;
  const payload = {
    pantry: pantryItems.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      expiryDate:
        it.expiryDate instanceof Date ? it.expiryDate.toISOString() : it.expiryDate,
    })),
    limit: opts.limit || 12,
  };
  try {
    const res = await withTimeout(
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      env.ML_TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`ML service returned ${res.status}`);
    const data = await res.json();
    return parseMlResponse(data);
  } catch (err) {
    console.warn('[ml] fallback to rule-based:', err.message);
    return null;
  }
}

function parseMlResponse(data) {
  // Defensive normalization in case ML returns a slightly different shape.
  const recipes = Array.isArray(data) ? data : data.recipes || [];
  return recipes.map((r) => ({
    id: r.id || r._id || r.recipeId,
    name: r.name || r.title,
    matchPercentage: r.matchPercentage ?? Math.round((r.score || 0) * 100),
    cookingTime: r.cookingTime ?? r.time_minutes ?? 30,
    servings: r.servings ?? 2,
    ingredients: (r.ingredients || []).map((i) => ({
      name: i.name,
      amount: i.amount || i.quantity || '',
      inPantry: !!i.inPantry,
    })),
    instructions: r.instructions || r.steps || [],
    image: r.image || r.image_url || '',
  }));
}
