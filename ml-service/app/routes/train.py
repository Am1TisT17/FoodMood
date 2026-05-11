from fastapi import APIRouter, Depends, Request
import logging

from ..services.training import retrain_pipeline
from ..auth import verify_internal_key

log = logging.getLogger(__name__)
router = APIRouter(tags=["train"])


@router.post("/train", dependencies=[Depends(verify_internal_key)])
async def trigger_train(request: Request):
    matcher = request.app.state.matcher
    result = await retrain_pipeline(matcher)
    log.info("Training finished: %s", result)
    return result
