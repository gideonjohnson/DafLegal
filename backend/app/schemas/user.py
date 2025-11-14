from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import PlanType


class UserCreate(BaseModel):
    """User registration"""
    email: EmailStr
    password: str
    full_name: str


class UserResponse(BaseModel):
    """User profile response"""
    id: int
    email: str
    full_name: str
    plan: PlanType
    pages_used_current_period: int
    files_used_current_period: int
    created_at: datetime


class APIKeyCreate(BaseModel):
    """Create new API key"""
    name: str


class APIKeyResponse(BaseModel):
    """API key response"""
    id: int
    key: str  # Only shown once on creation
    name: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None
