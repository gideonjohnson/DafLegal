from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from typing import Annotated

from app.core.database import get_session
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import Token, GoogleAuthRequest

router = APIRouter(prefix="/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    """
    OAuth2 compatible token login, get an access token for future requests

    This endpoint follows the OAuth2 spec and accepts:
    - username (we use email)
    - password
    """
    # Find user by email (username field contains email)
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()

    # Verify credentials
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(days=30)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "plan": user.plan
        }
    )


@router.post("/login", response_model=Token)
async def login(
    email: str,
    password: str,
    session: Session = Depends(get_session)
):
    """
    Alternative login endpoint that accepts JSON

    Request body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    # Find user
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    # Verify credentials
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": str(user.id)}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "plan": user.plan
        }
    )


@router.post("/google", response_model=Token)
async def google_auth(
    auth_request: GoogleAuthRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate or create user from Google OAuth token

    The frontend will handle Google OAuth flow and send us:
    - Google ID token
    - User info (email, name, picture)

    We'll create the user if they don't exist, or return existing user
    """
    # In production, verify the Google token here
    # For now, we trust the frontend has validated it

    # Find or create user
    statement = select(User).where(User.email == auth_request.email)
    user = session.exec(statement).first()

    if not user:
        # Create new user from Google auth
        from datetime import datetime, timedelta
        from app.models.user import PlanType

        user = User(
            email=auth_request.email,
            full_name=auth_request.name,
            hashed_password="",  # No password for OAuth users
            google_id=auth_request.google_id,
            plan=PlanType.FREE,
            billing_period_start=datetime.utcnow(),
            billing_period_end=datetime.utcnow() + timedelta(days=365)  # Free plan doesn't expire
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": str(user.id)}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "plan": user.plan
        }
    )
