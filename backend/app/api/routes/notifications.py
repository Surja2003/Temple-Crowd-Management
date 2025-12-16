from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.notifications_store import NotificationStore, normalize_phone_to_e164


router = APIRouter()
_store = NotificationStore()


class SubscribeRequest(BaseModel):
    bookingId: str = Field(..., min_length=3)
    mobile: str = Field(..., min_length=8)
    temple: str = Field(..., min_length=2)
    queueNumber: int = Field(..., ge=1)
    timeSlot: str | None = None
    enabled: bool = True


class SubscribeResponse(BaseModel):
    status: str
    phoneE164: str
    enabled: bool


@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe(req: SubscribeRequest):
    try:
        phone = normalize_phone_to_e164(req.mobile)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    sub = _store.upsert(
        booking_id=req.bookingId,
        phone_e164=phone,
        temple=req.temple,
        queue_number=req.queueNumber,
        time_slot=req.timeSlot,
        enabled=bool(req.enabled),
    )

    return SubscribeResponse(status="subscribed", phoneE164=sub.phone_e164, enabled=sub.enabled)
