from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# Import routers
from app.api.routes import auth, temples, bookings, analytics, live, alerts, notifications, push

from app.services.notifications_store import NotificationStore
from app.services.notification_scheduler import start_scheduler, stop_scheduler

from app.services.web_push_store import WebPushStore
from app.services.web_push_sender import WebPushSender
from app.services.web_push_scheduler import start_web_push_scheduler, stop_web_push_scheduler

_notification_store = NotificationStore()
_web_push_store = WebPushStore()

app = FastAPI(
    title="Temple Crowd Management API",
    description="Backend API for managing temple crowds, bookings, and real-time monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(temples.router, prefix="/api/v1/temples", tags=["Temples"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(live.router, prefix="/api/v1/live", tags=["Live Tracking"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(push.router, prefix="/api/v1/push", tags=["Push"])


@app.on_event("startup")
async def _startup():
    # Starts hourly SMS sender (Twilio if configured, otherwise dev-log)
    start_scheduler(_notification_store)

    # Shared singletons for push routes
    app.state.web_push_store = _web_push_store
    app.state.web_push_sender = WebPushSender()

    # Starts Web Push sender (only sends if VAPID is configured)
    start_web_push_scheduler(_web_push_store)


@app.on_event("shutdown")
async def _shutdown():
    stop_scheduler()
    stop_web_push_scheduler()

@app.get("/")
async def root():
    return {
        "message": "Temple Crowd Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
