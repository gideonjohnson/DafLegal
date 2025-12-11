"""
User Settings API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, APIKey
from app.core.security import (
    verify_password,
    get_password_hash,
    create_api_key
)

router = APIRouter(prefix="/settings", tags=["settings"])


# Request/Response Models
class ProfileResponse(BaseModel):
    """User profile response"""
    id: int
    email: str
    full_name: Optional[str]
    plan: str
    pages_used_current_period: int
    files_used_current_period: int
    billing_period_start: datetime
    billing_period_end: datetime
    created_at: datetime


class ProfileUpdateRequest(BaseModel):
    """Profile update request"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class PasswordChangeRequest(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str


class APIKeyResponse(BaseModel):
    """API key response"""
    id: int
    name: str
    key: str  # Only shown on creation
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime


class APIKeyListResponse(BaseModel):
    """API key list item (doesn't include full key)"""
    id: int
    name: str
    key_preview: str  # First/last chars only
    is_active: bool
    last_used_at: Optional[datetime]
    created_at: datetime


class APIKeyCreateRequest(BaseModel):
    """API key creation request"""
    name: str


# Profile Endpoints
@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile
    """
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        plan=current_user.plan.value,
        pages_used_current_period=current_user.pages_used_current_period,
        files_used_current_period=current_user.files_used_current_period,
        billing_period_start=current_user.billing_period_start,
        billing_period_end=current_user.billing_period_end,
        created_at=current_user.created_at
    )


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile (name, email)
    """
    # Check if email is already taken (if changing email)
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = db.exec(
            select(User).where(User.email == profile_data.email)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_data.email

    # Update name if provided
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name

    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        plan=current_user.plan.value,
        pages_used_current_period=current_user.pages_used_current_period,
        files_used_current_period=current_user.files_used_current_period,
        billing_period_start=current_user.billing_period_start,
        billing_period_end=current_user.billing_period_end,
        created_at=current_user.created_at
    )


# Security Endpoints
@router.post("/password")
async def change_password(
    password_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password (basic validation)
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()

    return {"message": "Password changed successfully"}


# API Key Management
@router.get("/api-keys", response_model=List[APIKeyListResponse])
async def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all API keys for current user
    """
    statement = select(APIKey).where(APIKey.user_id == current_user.id)
    api_keys = db.exec(statement).all()

    return [
        APIKeyListResponse(
            id=key.id,
            name=key.name,
            key_preview=f"{key.key[:8]}...{key.key[-4:]}",  # Show first 8 and last 4 chars
            is_active=key.is_active,
            last_used_at=key.last_used_at,
            created_at=key.created_at
        )
        for key in api_keys
    ]


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_new_api_key(
    key_data: APIKeyCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new API key
    WARNING: The full key is only shown once. Store it securely!
    """
    # Limit number of API keys per user
    existing_keys = db.exec(
        select(APIKey).where(
            APIKey.user_id == current_user.id,
            APIKey.is_active == True
        )
    ).all()

    if len(existing_keys) >= 10:  # Max 10 active keys
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum number of API keys reached (10). Please revoke unused keys."
        )

    # Generate new API key
    new_key = create_api_key()

    api_key = APIKey(
        user_id=current_user.id,
        key=new_key,
        name=key_data.name,
        is_active=True,
        created_at=datetime.utcnow()
    )

    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key=api_key.key,  # Full key shown only on creation
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at
    )


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Revoke (deactivate) an API key
    """
    # Find the API key
    api_key = db.get(APIKey, key_id)

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    # Verify ownership
    if api_key.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke this API key"
        )

    # Deactivate the key (don't delete for audit trail)
    api_key.is_active = False
    db.add(api_key)
    db.commit()

    return {"message": "API key revoked successfully"}


@router.post("/api-keys/{key_id}/activate")
async def activate_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reactivate a revoked API key
    """
    api_key = db.get(APIKey, key_id)

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    if api_key.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    api_key.is_active = True
    db.add(api_key)
    db.commit()

    return {"message": "API key activated successfully"}
