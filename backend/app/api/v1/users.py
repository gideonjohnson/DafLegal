from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import List

from app.core.database import get_session
from app.core.security import get_password_hash, create_api_key
from app.api.dependencies import get_current_user
from app.models.user import User, APIKey, PlanType
from app.schemas.user import UserCreate, UserResponse, APIKeyCreate, APIKeyResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Register a new user with free trial
    """
    # Check if email exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user with FREE plan
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        plan=PlanType.FREE,
        billing_period_start=datetime.utcnow(),
        billing_period_end=datetime.utcnow() + timedelta(days=365)  # Free plan doesn't expire
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        plan=user.plan,
        pages_used_current_period=user.pages_used_current_period,
        files_used_current_period=user.files_used_current_period,
        created_at=user.created_at
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        plan=current_user.plan,
        pages_used_current_period=current_user.pages_used_current_period,
        files_used_current_period=current_user.files_used_current_period,
        created_at=current_user.created_at
    )


@router.post("/api-keys", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_new_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new API key
    """
    # Generate API key
    api_key = create_api_key()

    # Create record
    db_api_key = APIKey(
        user_id=current_user.id,
        key=api_key,
        name=key_data.name,
        is_active=True
    )

    session.add(db_api_key)
    session.commit()
    session.refresh(db_api_key)

    return APIKeyResponse(
        id=db_api_key.id,
        key=api_key,  # Only shown once
        name=db_api_key.name,
        is_active=db_api_key.is_active,
        created_at=db_api_key.created_at,
        last_used_at=db_api_key.last_used_at
    )


@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List user's API keys (without showing actual keys)
    """
    statement = select(APIKey).where(APIKey.user_id == current_user.id)
    api_keys = session.exec(statement).all()

    return [
        APIKeyResponse(
            id=key.id,
            key="dfk_*********************",  # Masked
            name=key.name,
            is_active=key.is_active,
            created_at=key.created_at,
            last_used_at=key.last_used_at
        )
        for key in api_keys
    ]


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Revoke an API key
    """
    statement = select(APIKey).where(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    )
    api_key = session.exec(statement).first()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    api_key.is_active = False
    session.add(api_key)
    session.commit()

    return None
