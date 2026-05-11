from fastapi import APIRouter, Request

from ..config import settings
from ..schemas import ReceiptConfirmationRequest, ReceiptConfirmationResponse
from ..services.receipt_feedback import save_receipt_confirmation
from ..services.training import retrain_pipeline


router = APIRouter(tags=["receipts"])


@router.post("/receipts/confirm", response_model=ReceiptConfirmationResponse)
async def confirm_receipt_feedback(payload: ReceiptConfirmationRequest, request: Request):
    result = save_receipt_confirmation(payload)
    accepted = result["accepted"]
    rejected = result["rejected"]

    training_status = None
    training_triggered = False
    if accepted and settings.auto_train_on_receipt_feedback:
        training_status = await retrain_pipeline(request.app.state.matcher)
        request.app.state.training_status = training_status
        training_triggered = True

    return ReceiptConfirmationResponse(
        acceptedFoodItems=len(accepted),
        rejectedNonFoodItems=len(rejected),
        acceptedNames=[item.name for item in accepted],
        rejectedNames=[item.name for item in rejected],
        trainingTriggered=training_triggered,
        trainingStatus=training_status,
    )
