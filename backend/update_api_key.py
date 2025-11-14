#!/usr/bin/env python3
"""Update existing API key to proper format"""

from sqlmodel import Session, SQLModel, create_engine, select
from app.models.user import APIKey

# Create engine
DATABASE_URL = "sqlite:///./daflegal.db"
engine = create_engine(DATABASE_URL, echo=False)

with Session(engine) as session:
    # Get the API key
    api_key = session.exec(select(APIKey).where(APIKey.key == 'test-api-key-12345678')).first()

    if api_key:
        # Update to proper format
        api_key.key = 'dfk_test1234567890123456789012345678901234567890'
        session.add(api_key)
        session.commit()
        print(f'Updated API key to: {api_key.key}')
    else:
        print('API key not found')
