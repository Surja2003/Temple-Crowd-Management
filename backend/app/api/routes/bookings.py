from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class BookingCreate(BaseModel):
    templeId: str
    date: str
    timeSlot: str
    name: str
    phone: str
    numberOfPeople: int = 1

class BookingResponse(BaseModel):
    id: str
    templeId: str
    date: str
    timeSlot: str
    queueNumber: int
    status: str

@router.post("/", response_model=BookingResponse)
async def create_booking(booking: BookingCreate):
    # Mock booking creation
    return {
        "id": f"BKG{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "templeId": booking.templeId,
        "date": booking.date,
        "timeSlot": booking.timeSlot,
        "queueNumber": 123,
        "status": "confirmed"
    }

@router.get("/")
async def get_bookings(userId: Optional[str] = None):
    return []

@router.get("/available-slots")
async def get_available_slots(date: str, darshanType: str):
    return [
        "06:00 AM - 08:00 AM",
        "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM"
    ]
