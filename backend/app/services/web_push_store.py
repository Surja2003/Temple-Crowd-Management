import json
import os
import threading
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4


DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "web_push_subscriptions.json")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class WebPushSubscription:
    id: str
    booking_id: Optional[str]
    temple: Optional[str]
    queue_number: Optional[int]
    time_slot: Optional[str]
    enabled: bool
    subscription: Dict[str, Any]
    created_at: str
    last_sent_at: Optional[str]


class WebPushStore:
    def __init__(self, path: str = DATA_FILE):
        self._path = os.path.abspath(path)
        self._lock = threading.RLock()
        os.makedirs(os.path.dirname(self._path), exist_ok=True)

    def load_all(self) -> List[WebPushSubscription]:
        with self._lock:
            if not os.path.exists(self._path):
                return []
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                items = raw if isinstance(raw, list) else raw.get("subscriptions", [])
                out: List[WebPushSubscription] = []
                for it in items:
                    out.append(
                        WebPushSubscription(
                            id=str(it.get("id") or uuid4()),
                            booking_id=(it.get("booking_id") or it.get("bookingId")),
                            temple=(it.get("temple")),
                            queue_number=(it.get("queue_number") or it.get("queueNumber")),
                            time_slot=(it.get("time_slot") or it.get("timeSlot")),
                            enabled=bool(it.get("enabled", True)),
                            subscription=dict(it.get("subscription") or {}),
                            created_at=str(it.get("created_at") or it.get("createdAt") or _now_iso()),
                            last_sent_at=(it.get("last_sent_at") or it.get("lastSentAt")),
                        )
                    )
                return out
            except Exception:
                return []

    def save_all(self, subs: List[WebPushSubscription]) -> None:
        with self._lock:
            payload = [asdict(s) for s in subs]
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

    def upsert(
        self,
        *,
        subscription: Dict[str, Any],
        booking_id: Optional[str] = None,
        temple: Optional[str] = None,
        queue_number: Optional[int] = None,
        time_slot: Optional[str] = None,
        enabled: bool = True,
    ) -> WebPushSubscription:
        endpoint = str((subscription or {}).get("endpoint") or "").strip()
        if not endpoint:
            raise ValueError("subscription.endpoint is required")

        with self._lock:
            subs = self.load_all()
            existing = next((s for s in subs if str(s.subscription.get("endpoint") or "") == endpoint), None)
            if existing:
                updated = WebPushSubscription(
                    id=existing.id,
                    booking_id=str(booking_id) if booking_id else existing.booking_id,
                    temple=str(temple) if temple else existing.temple,
                    queue_number=int(queue_number) if queue_number is not None else existing.queue_number,
                    time_slot=str(time_slot) if time_slot else existing.time_slot,
                    enabled=bool(enabled),
                    subscription=subscription,
                    created_at=existing.created_at,
                    last_sent_at=existing.last_sent_at,
                )
                subs = [updated if s.id == existing.id else s for s in subs]
                self.save_all(subs)
                return updated

            created = WebPushSubscription(
                id=str(uuid4()),
                booking_id=str(booking_id) if booking_id else None,
                temple=str(temple) if temple else None,
                queue_number=int(queue_number) if queue_number is not None else None,
                time_slot=str(time_slot) if time_slot else None,
                enabled=bool(enabled),
                subscription=subscription,
                created_at=_now_iso(),
                last_sent_at=None,
            )
            subs.append(created)
            self.save_all(subs)
            return created

    def disable_by_endpoint(self, endpoint: str) -> bool:
        endpoint = str(endpoint or "").strip()
        if not endpoint:
            return False

        with self._lock:
            subs = self.load_all()
            changed = False
            new_list: List[WebPushSubscription] = []
            for s in subs:
                if str(s.subscription.get("endpoint") or "") == endpoint and s.enabled:
                    changed = True
                    new_list.append(
                        WebPushSubscription(
                            id=s.id,
                            booking_id=s.booking_id,
                            temple=s.temple,
                            queue_number=s.queue_number,
                            time_slot=s.time_slot,
                            enabled=False,
                            subscription=s.subscription,
                            created_at=s.created_at,
                            last_sent_at=s.last_sent_at,
                        )
                    )
                else:
                    new_list.append(s)
            if changed:
                self.save_all(new_list)
            return changed

    def mark_sent(self, subscription_id: str) -> None:
        with self._lock:
            subs = self.load_all()
            new_list: List[WebPushSubscription] = []
            for s in subs:
                if s.id == subscription_id:
                    new_list.append(
                        WebPushSubscription(
                            id=s.id,
                            booking_id=s.booking_id,
                            temple=s.temple,
                            queue_number=s.queue_number,
                            time_slot=s.time_slot,
                            enabled=s.enabled,
                            subscription=s.subscription,
                            created_at=s.created_at,
                            last_sent_at=_now_iso(),
                        )
                    )
                else:
                    new_list.append(s)
            self.save_all(new_list)
