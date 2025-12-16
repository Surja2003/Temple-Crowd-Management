from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt

router = APIRouter()

# Mock user database
USERS_DB = {
    "pilgrim": {"password": "pilgrim123", "role": "devotee", "name": "Pilgrim User"},
    "admin": {"password": "admin123", "role": "admin", "name": "Admin User"}
}

SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password
    
    if username not in USERS_DB or USERS_DB[username]["password"] != password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Create access token
    access_token = jwt.encode(
        {"sub": username, "exp": datetime.utcnow() + timedelta(days=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    # For demo purposes, return a mock user
    return {
        "id": "user-123",
        "email": "pilgrim@example.com",
        "name": "Pilgrim User",
        "role": "devotee"
    }
