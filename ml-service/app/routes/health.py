from fastapi import APIRouter, Request

from ..models.elcs_classifier import waste_classifier
from ..models.pantry_vectorizer import vectorizer
from ..schemas import HealthResponse


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def healthcheck(request: Request):
    matcher = getattr(request.app.state, "matcher", None)
    recipes_indexed = matcher.size if matcher is not None else 0
    ready = vectorizer.fitted and recipes_indexed > 0

    return HealthResponse(
        status="ok" if ready else "degraded",
        vectorizerFitted=vectorizer.fitted,
        recipesIndexed=recipes_indexed,
        elcsFitted=waste_classifier.fitted,
        modelVersion=(
            f"{vectorizer.MODEL_VERSION}+"
            f"{getattr(matcher, 'MODEL_VERSION', 'recipe-match-uninitialized')}+"
            f"{waste_classifier.MODEL_VERSION}"
        ),
    )
