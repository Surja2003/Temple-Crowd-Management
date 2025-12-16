import json
import os
import threading
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4


DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "notification_subscriptions.json")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_phone_to_e164(phone: str) -> str:
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    if not digits:
        raise ValueError("Phone number is required")

    # If already includes country code and is long enough, assume it's E.164 without +
    if len(digits) >= 11 and digits.startswith("91"):
        return f"+{digits}"

    # Common case: Indian 10-digit mobile number
    if len(digits) == 10:
        return f"+91{digits}"

    # Fallback: treat as country-less digits
    if len(digits) >= 11:
        return f"+{digits}"

    raise ValueError("Invalid phone number")


@dataclass
class NotificationSubscription:
    id: str
    booking_id: str
    phone_e164: str
    temple: str
    queue_number: int
    time_slot: Optional[str]
    enabled: bool
    created_at: str
    last_sent_at: Optional[str]


class NotificationStore:
    def __init__(self, path: str = DATA_FILE):
        self._path = os.path.abspath(path)
        # Re-entrant because store methods may call each other.
        self._lock = threading.RLock()
        os.makedirs(os.path.dirname(self._path), exist_ok=True)

    def load_all(self) -> List[NotificationSubscription]:
        with self._lock:
            if not os.path.exists(self._path):
                return []
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                items = raw if isinstance(raw, list) else raw.get("subscriptions", [])
                out: List[NotificationSubscription] = []
                for it in items:
                    out.append(
                        NotificationSubscription(
                            id=str(it.get("id") or uuid4()),
                            booking_id=str(it.get("booking_id") or it.get("bookingId") or ""),
                            phone_e164=str(it.get("phone_e164") or it.get("phone") or ""),
                            temple=str(it.get("temple") or ""),
                            queue_number=int(it.get("queue_number") or it.get("queueNumber") or 0),
                            time_slot=(it.get("time_slot") or it.get("timeSlot")),
                            enabled=bool(it.get("enabled", True)),
                            created_at=str(it.get("created_at") or it.get("createdAt") or _now_iso()),
                            last_sent_at=(it.get("last_sent_at") or it.get("lastSentAt")),
                        )
                    )
                return out
            except Exception:
                return []

    def save_all(self, subs: List[NotificationSubscription]) -> None:
        with self._lock:
            payload = [asdict(s) for s in subs]
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

    def upsert(self, booking_id: str, phone_e164: str, temple: str, queue_number: int, time_slot: Optional[str], enabled: bool) -> NotificationSubscription:
        booking_id = str(booking_id)
        with self._lock:
            subs = self.load_all()
            existing = next((s for s in subs if s.booking_id == booking_id), None)
            if existing:
                updated = NotificationSubscription(
                    id=existing.id,
                    booking_id=booking_id,
                    phone_e164=phone_e164,
                    temple=temple,
                    queue_number=int(queue_number),
                    time_slot=time_slot,
                    enabled=bool(enabled),
                    created_at=existing.created_at,
                    last_sent_at=existing.last_sent_at,
                )
                subs = [updated if s.booking_id == booking_id else s for s in subs]
                self.save_all(subs)
                return updated

            created = NotificationSubscription(
                id=str(uuid4()),
                booking_id=booking_id,
                phone_e164=phone_e164,
                temple=temple,
                queue_number=int(queue_number),
                time_slot=time_slot,
                enabled=bool(enabled),
                created_at=_now_iso(),
                last_sent_at=None,
            )
            subs.append(created)
            self.save_all(subs)
            return created

    def mark_sent(self, subscription_id: str) -> None:
        with self._lock:
            subs = self.load_all()
            new_list: List[NotificationSubscription] = []
            for s in subs:
                if s.id == subscription_id:
                    new_list.append(
                        NotificationSubscription(
                            id=s.id,
                            booking_id=s.booking_id,
                            phone_e164=s.phone_e164,
                            temple=s.temple,
                            queue_number=s.queue_number,
                            time_slot=s.time_slot,
                            enabled=s.enabled,
                            created_at=s.created_at,
                            last_sent_at=_now_iso(),
                        )
                    )
                else:
                    new_list.append(s)
            self.save_all(new_list)
