import os
import random
from datetime import datetime, timezone
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler

from .web_push_sender import WebPushSender
from .web_push_store import WebPushStore


_scheduler: Optional[BackgroundScheduler] = None


def _build_payload(temple: str, queue_number: int, wait_minutes: int) -> dict:
    return {
        "title": "Temple Queue Update",
        "body": f"Temple: {temple}\nToken: {queue_number}\nEstimated wait: {wait_minutes} min\nTime: {datetime.now(timezone.utc).strftime('%H:%M UTC')}",
        "tag": "queue_update",
        "url": "/live-tracking",
        "data": {
            "temple": temple,
            "queueNumber": queue_number,
            "waitMinutes": wait_minutes,
        },
    }


def start_web_push_scheduler(store: WebPushStore) -> BackgroundScheduler:
    global _scheduler
    if _scheduler and _scheduler.running:
        return _scheduler

    sender = WebPushSender()

    def job() -> None:
        if not sender.is_configured():
            return

        subs = store.load_all()
        for s in subs:
            if not s.enabled:
                continue

            temple = s.temple or "Temple"
            queue = int(s.queue_number or 1)

            base = 45
            jitter = random.randint(-8, 10)
            wait_minutes = max(5, base + jitter)

            payload = _build_payload(temple, queue, wait_minutes)
            try:
                sender.send(s.subscription, payload)
                store.mark_sent(s.id)
            except Exception as e:
                # If endpoint is gone, callers would normally remove it.
                # Keep it for now; disable explicitly via unsubscribe.
                print(f"[webpush][error] subscription={s.id} err={e}")

    interval_seconds = int(os.getenv("PUSH_NOTIFICATION_INTERVAL_SECONDS", os.getenv("NOTIFICATION_INTERVAL_SECONDS", "3600")))

    sched = BackgroundScheduler(timezone="UTC")
    sched.add_job(job, "interval", seconds=interval_seconds, id="web_push", replace_existing=True)
    sched.start()

    _scheduler = sched
    print(f"[webpush] scheduler started interval_seconds={interval_seconds}")
    print(f"[webpush] vapid_configured={sender.is_configured()}")

    return sched


def stop_web_push_scheduler() -> None:
    global _scheduler
    if _scheduler:
        try:
            _scheduler.shutdown(wait=False)
        except Exception:
            pass
        _scheduler = None
