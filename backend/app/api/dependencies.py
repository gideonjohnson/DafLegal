from fastapi import Depends, HTTPException, status, Header
from sqlmodel import Session, select
from typing import Optional
from app.core.database import get_session
from app.core.security import verify_api_key_format
from app.models.user import User, APIKey


async def get_current_user(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session)
) -> User:
    """
    Dependency to get current user from API key
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    # Extract API key from "Bearer <key>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

    api_key = authorization.replace("Bearer ", "")

    # Validate format
    if not verify_api_key_format(api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format"
        )

    # Find API key in database
    statement = select(APIKey).where(
        APIKey.key == api_key,
        APIKey.is_active == True
    )
    db_api_key = session.exec(statement).first()

    if not db_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key"
        )

    # Get user
    user = session.get(User, db_api_key.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )

    # Update last used timestamp
    from datetime import datetime
    db_api_key.last_used_at = datetime.utcnow()
    session.add(db_api_key)
    session.commit()

    return user


def check_quota(user: User) -> bool:
    """
    Check if user has available quota
    Raises HTTPException if quota exceeded
    """
    from app.core.config import settings

    plan_config = settings.PLANS.get(user.plan.value)
    if not plan_config:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid plan configuration"
        )

    # Check file quota
    if user.files_used_current_period >= plan_config["files_per_month"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"File quota exceeded. Limit: {plan_config['files_per_month']} files/month. Upgrade your plan."
        )

    # Check page quota
    if user.pages_used_current_period >= plan_config["pages_per_month"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Page quota exceeded. Limit: {plan_config['pages_per_month']} pages/month. Upgrade your plan."
        )

    return True
