from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    """JWT Token response"""
    access_token: str
    token_type: str
    user: dict


class TokenData(BaseModel):
    """Token payload data"""
    email: Optional[str] = None
    user_id: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    """Google OAuth authentication request"""
    email: EmailStr
    name: str
    google_id: str
    picture: Optional[str] = None
