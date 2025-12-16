from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class TempleInfo(BaseModel):
    id: str
    name: str
    location: str
    capacity: int
    currentCrowd: int
    status: str

@router.get("/{temple_slug}")
async def get_temple_info(temple_slug: str):
    # Return mock temple data
    return {
        "id": temple_slug,
        "name": "Temple",
        "location": "Location",
        "capacity": 5000,
        "currentCrowd": 3000,
        "status": "open",
        "isOpen": True,
        "crowdLevel": "medium",
        "lastUpdated": datetime.now().isoformat()
    }

@router.get("/")
async def list_temples():
    return [
        {"id": "somnath", "name": "Somnath Temple", "location": "Gujarat"},
        {"id": "dwarka", "name": "Dwarkadhish Temple", "location": "Gujarat"},
    ]
