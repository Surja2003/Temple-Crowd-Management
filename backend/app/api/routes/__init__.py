"""Routes package.

This module re-exports route modules so `from app.api.routes import ...` works.
"""

from . import alerts, analytics, auth, bookings, live, notifications, push, temples

__all__ = [
	"auth",
	"temples",
	"bookings",
	"analytics",
	"live",
	"alerts",
	"notifications",
	"push",
]
