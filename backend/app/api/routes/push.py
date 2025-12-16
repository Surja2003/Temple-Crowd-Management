from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()


def _get_store(request: Request):
    store = getattr(request.app.state, "web_push_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="Web Push store not initialized")
    return store


def _get_sender(request: Request):
    sender = getattr(request.app.state, "web_push_sender", None)
    if sender is None:
        raise HTTPException(status_code=503, detail="Web Push sender not initialized")
    return sender


class SubscriptionKeys(BaseModel):
    p256dh: str = Field(..., min_length=10)
    auth: str = Field(..., min_length=5)


class PushSubscription(BaseModel):
    endpoint: str = Field(..., min_length=10)
    keys: SubscriptionKeys


class PushSubscribeRequest(BaseModel):
    subscription: PushSubscription
    bookingId: Optional[str] = None
    temple: Optional[str] = None
    queueNumber: Optional[int] = Field(default=None, ge=1)
    timeSlot: Optional[str] = None
    enabled: bool = True


class PushSubscribeResponse(BaseModel):
    status: str
    subscriptionId: str


class VapidPublicKeyResponse(BaseModel):
    publicKey: str


class PushTestRequest(BaseModel):
    endpoint: Optional[str] = None
    title: str = "Test Notification"
    body: str = "This is a test push notification."
    url: str = "/live-tracking"


@router.get("/vapid-public-key", response_model=VapidPublicKeyResponse)
async def vapid_public_key(request: Request):
    sender = _get_sender(request)
    if not sender.vapid_public_key:
        raise HTTPException(status_code=503, detail="VAPID_PUBLIC_KEY not configured")
    return VapidPublicKeyResponse(publicKey=sender.vapid_public_key)


@router.post("/subscribe", response_model=PushSubscribeResponse)
async def subscribe(req: PushSubscribeRequest, request: Request):
    store = _get_store(request)
    try:
        created = store.upsert(
            subscription=req.subscription.model_dump(),
            booking_id=req.bookingId,
            temple=req.temple,
            queue_number=req.queueNumber,
            time_slot=req.timeSlot,
            enabled=bool(req.enabled),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return PushSubscribeResponse(status="subscribed", subscriptionId=created.id)


@router.post("/unsubscribe")
async def unsubscribe(subscription: PushSubscription, request: Request):
    store = _get_store(request)
    changed = store.disable_by_endpoint(subscription.endpoint)
    return {"status": "unsubscribed" if changed else "not_found"}


@router.post("/send-test")
async def send_test(req: PushTestRequest, request: Request):
    store = _get_store(request)
    sender = _get_sender(request)
    if not sender.is_configured():
        raise HTTPException(status_code=503, detail="Web Push is not configured")

    subs = store.load_all()
    if not subs:
        raise HTTPException(status_code=404, detail="No subscriptions stored")

    targets = subs
    if req.endpoint:
        targets = [s for s in subs if str(s.subscription.get("endpoint") or "") == req.endpoint]
        if not targets:
            raise HTTPException(status_code=404, detail="Subscription not found for endpoint")

    payload = {
        "title": req.title,
        "body": req.body,
        "tag": "test",
        "url": req.url,
    }

    sent = 0
    for s in targets:
        if not s.enabled:
            continue
        try:
            sender.send(s.subscription, payload)
            store.mark_sent(s.id)
            sent += 1
        except Exception as e:
            print(f"[webpush][error] subscription={s.id} err={e}")

    return {"status": "ok", "sent": sent}
