import os
import random
from datetime import datetime, timezone
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler

from .notifications_store import NotificationStore
from .sms_sender import SmsSender


_scheduler: Optional[BackgroundScheduler] = None


def _build_message(temple: str, queue_number: int, wait_minutes: int) -> str:
    return (
        f"Temple Queue Update\n"
        f"Temple: {temple}\n"
        f"Token: {queue_number}\n"
        f"Estimated wait: {wait_minutes} min\n"
        f"Time: {datetime.now(timezone.utc).strftime('%H:%M UTC')}"
    )


def start_scheduler(store: NotificationStore) -> BackgroundScheduler:
    global _scheduler
    if _scheduler and _scheduler.running:
        return _scheduler

    sender = SmsSender()

    def job() -> None:
        subs = store.load_all()
        for s in subs:
            if not s.enabled:
                continue

            # For now we simulate the wait time (you can wire this to real sensors/live endpoints later)
            base = 45
            jitter = random.randint(-8, 10)
            wait_minutes = max(5, base + jitter)

            body = _build_message(s.temple, s.queue_number, wait_minutes)
            try:
                sender.send_sms(s.phone_e164, body)
                store.mark_sent(s.id)
            except Exception as e:
                print(f"[sms][error] subscription={s.id} to={s.phone_e164} err={e}")

    # Default: hourly notifications
    interval_seconds = int(os.getenv("NOTIFICATION_INTERVAL_SECONDS", "3600"))

    sched = BackgroundScheduler(timezone="UTC")
    sched.add_job(job, "interval", seconds=interval_seconds, id="hourly_sms", replace_existing=True)
    sched.start()

    _scheduler = sched
    print(f"[notifications] scheduler started interval_seconds={interval_seconds}")
    print(f"[notifications] twilio_configured={sender.is_configured()}")

    return sched


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler:
        try:
            _scheduler.shutdown(wait=False)
        except Exception:
            pass
        _scheduler = None
