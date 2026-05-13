"""Shared personal-ranker re-ordering for /recommend and notifications."""
from __future__ import annotations

from typing import Any

from ..models.personal_ranker import RankInput, ranker
from ..models.recipe_matcher import MatchResult
from .feedback_store import recipe_popularity, user_action_counts, user_recipe_interactions


async def personal_rerank_match_results(
    user_id: str | None,
    candidates: list[MatchResult],
    *,
    days_to_expiry_feature: int,
    take: int,
) -> tuple[list[MatchResult], list[float] | None, dict[str, Any]]:
    """Re-order matcher candidates using the personal ranker (or its cold-start heuristic).

    Returns (top_slice, rank_scores_aligned, diagnostics).
    """
    if not candidates:
        return [], None, {"reranked": False, "ranker_fitted": ranker.fitted}

    if not user_id:
        top = candidates[:take]
        return top, None, {"reranked": False, "ranker_fitted": ranker.fitted}

    popularity = await recipe_popularity()
    counts = await user_action_counts(user_id)
    history = await user_recipe_interactions(user_id)

    inputs: list[RankInput] = []
    for c in candidates:
        recipe_id = str(c.recipe.get("_id"))
        inputs.append(
            RankInput(
                cosine=c.cosine,
                coverage=c.coverage,
                urgent_used=len(c.urgent_used),
                days_to_expiry=days_to_expiry_feature,
                user_total_acts=int(counts.get("total", 0)),
                user_seen_recipe=float(history.get(recipe_id, 0.0)),
                recipe_popularity=float(popularity.get(recipe_id, 0.0)),
            )
        )

    scores = ranker.score(inputs)
    paired = sorted(zip(scores, candidates), key=lambda p: -p[0])
    top = [c for _, c in paired[:take]]
    top_scores = [float(s) for s, _ in paired[:take]]

    return top, top_scores, {
        "reranked": True,
        "ranker_fitted": ranker.fitted,
    }
