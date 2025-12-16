from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class AlertCreate(BaseModel):
    type: str
    location: str
    severity: str
    description: Optional[str] = None

class AlertResponse(BaseModel):
    id: str
    type: str
    location: str
    severity: str
    status: str
    createdAt: str

@router.post("/", response_model=AlertResponse)
async def create_alert(alert: AlertCreate):
    return {
        "id": f"ALT{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "type": alert.type,
        "location": alert.location,
        "severity": alert.severity,
        "status": "active",
        "createdAt": datetime.now().isoformat()
    }

@router.get("/")
async def get_alerts():
    return []
