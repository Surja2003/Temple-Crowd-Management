from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import random
import time
from typing import Dict, Optional

router = APIRouter()


class QueueStatusRequest(BaseModel):
    bookingId: str = Field(..., min_length=3)
    temple: str = Field(..., min_length=2)
    queueNumber: int = Field(..., ge=1)
    createdAt: Optional[str] = None


class QueueStatusResponse(BaseModel):
    bookingId: str
    temple: str
    position: int
    total: int
    movementSpeed: str
    estimatedEntryTime: str
    estimatedWaitMinutes: int
    lastUpdated: str


_queue_state: Dict[str, Dict[str, object]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _init_queue_state(req: QueueStatusRequest) -> Dict[str, object]:
    # Pick a stable movement speed for this booking.
    speed = random.choice(["Slow", "Normal", "Fast"])
    # Base total should be >= starting position for a nice progress bar.
    total = int(req.queueNumber + random.randint(30, 120))
    return {
        "created_epoch": time.time(),
        "start_position": int(req.queueNumber),
        "total": total,
        "speed": speed,
    }


def _speed_step(speed: str) -> int:
    # How many positions move per 10 seconds.
    if speed == "Fast":
        return 3
    if speed == "Slow":
        return 1
    return 2

@router.get("/temple/{temple_slug}/status")
async def get_live_status(temple_slug: str):
    base_crowd = 3000
    return {
        "templeId": temple_slug,
        "currentQueue": base_crowd + random.randint(-100, 100),
        "estimatedWaitTime": f"{random.randint(40, 70)} minutes",
        "estimatedWaitTimeConfidence": "5",
        "nextBatchTime": "10 minutes",
        "crowdLevel": "medium",
        "lastUpdated": datetime.now().isoformat(),
        "zones": [
            {"name": "Main Hall", "count": 800, "capacity": 1000},
            {"name": "Entrance", "count": 500, "capacity": 800}
        ]
    }


@router.post("/queue/status", response_model=QueueStatusResponse)
async def get_queue_status(req: QueueStatusRequest):
    state = _queue_state.get(req.bookingId)
    if not state:
        state = _init_queue_state(req)
        _queue_state[req.bookingId] = state

    created_epoch = float(state["created_epoch"])
    start_position = int(state["start_position"])
    total = int(state["total"])
    speed = str(state["speed"])

    # Backend-driven progression: update every 10 seconds worth of progress.
    elapsed = max(0.0, time.time() - created_epoch)
    ticks = int(elapsed // 10)
    step = _speed_step(speed)
    advanced = ticks * step
    position = max(1, start_position - advanced)

    # Rough estimate: each position ~ 25/20/15 seconds depending on speed.
    seconds_per_position = 25 if speed == "Slow" else 20 if speed == "Normal" else 15
    eta_seconds = position * seconds_per_position
    estimated_wait_minutes = max(1, int(round(eta_seconds / 60)))
    estimated_entry_time = datetime.now(timezone.utc).timestamp() + eta_seconds
    entry_iso = datetime.fromtimestamp(estimated_entry_time, tz=timezone.utc).isoformat()

    return QueueStatusResponse(
        bookingId=req.bookingId,
        temple=req.temple,
        position=position,
        total=total,
        movementSpeed=speed,
        estimatedEntryTime=entry_iso,
        estimatedWaitMinutes=estimated_wait_minutes,
        lastUpdated=_now_iso(),
    )
