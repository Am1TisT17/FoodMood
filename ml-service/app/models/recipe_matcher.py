"""recipe matcher: cosine similarity + coverage + urgency-aware boost"""
from __future__ import annotations
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .pantry_vectorizer import vectorizer

log = logging.getLogger(__name__)


@dataclass
class MatchResult:
    recipe: Dict[str, Any]
    score: float
    cosine: float
    coverage: float
    matched: List[str]
    urgent_used: List[str]


class RecipeMatcher:
    MODEL_VERSION = "recipe-match-1.1"

    W_COSINE = 1.0
    W_COVERAGE = 0.6
    W_URGENT = 0.4

    def __init__(self) -> None:
        self._recipe_matrix = None
        self._recipes: List[Dict[str, Any]] = []

    @property
    def size(self) -> int:
        return len(self._recipes)

    def index_recipes(self, recipes: List[Dict[str, Any]]) -> None:
        """recipes: [{ _id, name, canonical_ingredients: [str], ... }, ...]"""
        if not vectorizer.fitted:
            raise RuntimeError("Fit PantryVectorizer before indexing recipes")
        if not recipes:
            self._recipe_matrix = None
            self._recipes = []
            return
        docs = [" ".join(r["canonical_ingredients"]) for r in recipes]
        self._recipe_matrix = vectorizer.underlying().transform(docs)
        self._recipes = recipes
        log.info("RecipeMatcher indexed %d recipes", len(recipes))

    def match(
        self,
        canonical_items: List[str],
        urgent_items: List[str],
        top_k: int = 12,
        min_score: float = 0.0,
    ) -> List[MatchResult]:
        if self._recipe_matrix is None or not self._recipes:
            raise RuntimeError("No recipes indexed")

        q = vectorizer.transform_items(canonical_items)
        cos = cosine_similarity(q, self._recipe_matrix).flatten()

        pantry_set = set(canonical_items)
        urgent_set = set(urgent_items)

        results: List[MatchResult] = []
        for idx, recipe in enumerate(self._recipes):
            recipe_set = set(recipe["canonical_ingredients"])
            if not recipe_set:
                continue
            matched = sorted(recipe_set & pantry_set)
            urgent_used = sorted(recipe_set & urgent_set)
            coverage = len(matched) / len(recipe_set)

            score = self.W_COSINE * float(cos[idx]) + self.W_COVERAGE * coverage
            if urgent_used:
                score += self.W_URGENT * min(len(urgent_used) / 3.0, 1.0)

            if score < min_score:
                continue
            results.append(MatchResult(
                recipe=recipe,
                score=score,
                cosine=float(cos[idx]),
                coverage=coverage,
                matched=matched,
                urgent_used=urgent_used,
            ))

        results.sort(key=lambda r: -r.score)
        return results[:top_k]
