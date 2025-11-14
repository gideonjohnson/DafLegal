#!/usr/bin/env python3
"""Create test user and API key for development"""

from sqlmodel import Session, SQLModel, create_engine, select
from app.models.user import User, APIKey
import secrets
from datetime import datetime

# Create engine
DATABASE_URL = "sqlite:///./daflegal.db"
engine = create_engine(DATABASE_URL, echo=False)

# Create tables
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    # Check if test user exists
    user = session.exec(select(User).where(User.email == 'test@example.com')).first()

    if not user:
        # Create test user
        user = User(
            email='test@example.com',
            hashed_password='$2b$12$dummy_hash_for_testing_only',  # Dummy hash
            full_name='Test User',
            organization='Test Org',
            plan='pro',
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f'Created user: {user.email} (ID: {user.id})')
    else:
        print(f'User exists: {user.email} (ID: {user.id})')

    # Check if API key exists
    api_key = session.exec(select(APIKey).where(APIKey.user_id == user.id)).first()

    if not api_key:
        # Create API key with proper format (dfk_ prefix, >40 chars)
        key = 'dfk_test1234567890123456789012345678901234567890'
        api_key = APIKey(
            user_id=user.id,
            key=key,
            name='Test API Key',
            is_active=True,
            created_at=datetime.utcnow()
        )
        session.add(api_key)
        session.commit()
        session.refresh(api_key)
        print(f'Created API key: {api_key.key}')
    else:
        print(f'API key exists: {api_key.key}')

print('\nTest user and API key ready!')
print(f'Email: test@example.com')
print(f'API Key: {api_key.key}')
