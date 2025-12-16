import json
import os
from typing import Any, Dict, Optional

from pywebpush import WebPushException, webpush


def _env(name: str) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


class WebPushSender:
    def __init__(self):
        self.vapid_public_key = _env("VAPID_PUBLIC_KEY")
        self.vapid_private_key = self._load_private_key(_env("VAPID_PRIVATE_KEY"))
        self.vapid_subject = _env("VAPID_SUBJECT") or "mailto:admin@example.com"

    @staticmethod
    def _load_private_key(value: Optional[str]) -> Optional[str]:
        if not value:
            return None

        # If it's a file path, read it.
        # (Supports relative or absolute; common in local dev via .env)
        if os.path.exists(value) and os.path.isfile(value):
            try:
                with open(value, "r", encoding="utf-8") as f:
                    return f.read().strip() or None
            except Exception:
                return None

        # Otherwise treat it as a raw PEM string.
        return value

    def is_configured(self) -> bool:
        return bool(self.vapid_public_key and self.vapid_private_key)

    def send(self, subscription_info: Dict[str, Any], payload: Dict[str, Any]) -> None:
        if not self.is_configured():
            raise RuntimeError("Web Push is not configured (missing VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY)")

        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=self.vapid_private_key,
                vapid_claims={"sub": self.vapid_subject},
            )
        except WebPushException as e:
            # Bubble up for callers to decide whether to disable subscription
            raise RuntimeError(f"WebPush failed: {e}")
