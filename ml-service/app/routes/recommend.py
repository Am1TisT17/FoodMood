from fastapi import APIRouter, Depends, HTTPException, Request
import logging

from ..schemas import RecommendRequest, RecommendResponse
from ..models.pantry_vectorizer import vectorizer
from ..services.recommendation import recommend
from ..auth import verify_internal_key

log = logging.getLogger(__name__)
router = APIRouter(tags=["recommend"])


@router.post("/recommend", response_model=RecommendResponse,
             dependencies=[Depends(verify_internal_key)])
def recommend_endpoint(payload: RecommendRequest, request: Request):
    matcher = request.app.state.matcher

    if not vectorizer.fitted or matcher.size == 0:
        raise HTTPException(
            status_code=503,
            detail="ML models not ready — POST /train first or seed recipes/fooditems.",
        )

    try:
        recipes = recommend(matcher, payload.pantry, payload.limit)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return RecommendResponse(
        recipes=recipes,
        modelVersion=f"{vectorizer.MODEL_VERSION}+{matcher.MODEL_VERSION}",
    )
