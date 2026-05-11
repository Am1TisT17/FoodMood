"""training pipeline: loads FoodItems + Recipes from MongoDB, fits TF-IDF, indexes recipes, mines eLCS rules"""
from __future__ import annotations
import logging
from collections import defaultdict
from typing import List, Dict, Any

from ..db import get_db
from ..config import settings
from ..preprocessing.normalizer import canonical_ingredient
from ..models.pantry_vectorizer import vectorizer
from ..models.recipe_matcher import RecipeMatcher
from ..models.elcs_classifier import waste_classifier
from .feature_builder import build_outcome_samples

log = logging.getLogger(__name__)


async def _load_fooditems() -> List[Dict[str, Any]]:
    db = get_db()
    cursor = db[settings.fooditems_collection].find({})
    return await cursor.to_list(length=None)


async def _load_recipes() -> List[Dict[str, Any]]:
    db = get_db()
    cursor = db[settings.recipes_collection].find({})
    return await cursor.to_list(length=None)


def _canonicalize_recipe(recipe: Dict[str, Any]) -> List[str]:
    """recipe.ingredients[].normalizedName wins; otherwise fall back to .name"""
    out: list[str] = []
    seen: set[str] = set()
    for ing in recipe.get("ingredients") or []:
        candidate = (ing.get("normalizedName") or ing.get("name") or "").strip()
        if not candidate:
            continue
        c = canonical_ingredient(candidate) or candidate.lower()
        if c and c not in seen:
            seen.add(c)
            out.append(c)
    return out


def _aggregate_user_pantries(food_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """one document per user = concatenation of all their canonical FoodItem names"""
    by_user: dict[str, list[str]] = defaultdict(list)
    for item in food_items:
        user_id = str(item.get("user", ""))
        canon = canonical_ingredient(item.get("name", "") or "")
        if user_id and canon:
            by_user[user_id].append(canon)
    return [
        {"user_id": uid, "canonical_items": items}
        for uid, items in by_user.items() if items
    ]


async def retrain_pipeline(matcher: RecipeMatcher) -> dict:
    food_items = await _load_fooditems()
    recipes_raw = await _load_recipes()
    log.info("Loaded %d FoodItems and %d recipes", len(food_items), len(recipes_raw))

    user_pantries = _aggregate_user_pantries(food_items)
    if not user_pantries:
        log.warning("No usable FoodItems — vectorizer trained on recipe corpus as fallback")
        if not recipes_raw:
            return {"status": "no_data", "fooditems": 0, "recipes": 0}
        fallback = [
            {"user_id": "__fallback__", "canonical_items": _canonicalize_recipe(r)}
            for r in recipes_raw
        ]
        vectorizer.fit([f for f in fallback if f["canonical_items"]])
    else:
        vectorizer.fit(user_pantries)

    enriched_recipes: list[dict] = []
    for r in recipes_raw:
        canon = _canonicalize_recipe(r)
        if canon:
            enriched_recipes.append({**r, "canonical_ingredients": canon})
    matcher.index_recipes(enriched_recipes)

    X, y, feature_names = build_outcome_samples(food_items)
    if X.shape[0] >= 5:
        waste_classifier.fit(X, y, feature_names)
    else:
        log.info("Only %d outcome samples — skipping eLCS fit", X.shape[0])

    return {
        "status": "ok",
        "fooditems": len(food_items),
        "recipes_indexed": matcher.size,
        "users": len(user_pantries),
        "elcs_samples": int(X.shape[0]),
    }
