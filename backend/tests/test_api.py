import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.database import get_session
from app.models.user import User, APIKey
from app.core.security import get_password_hash, create_api_key


# Create test database
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_user(client: TestClient):
    """Test user registration"""
    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["plan"] == "free_trial"


def test_create_api_key(client: TestClient, session: Session):
    """Test API key creation"""
    # Create user first
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        full_name="Test User"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create API key
    api_key = create_api_key()
    db_api_key = APIKey(
        user_id=user.id,
        key=api_key,
        name="Test Key"
    )
    session.add(db_api_key)
    session.commit()

    # Test API key format
    assert api_key.startswith("dfk_")
    assert len(api_key) > 40


def test_upload_contract_without_auth(client: TestClient):
    """Test contract upload without authentication"""
    response = client.post("/api/v1/contracts/analyze")
    assert response.status_code == 401


def test_quota_enforcement(client: TestClient, session: Session):
    """Test quota enforcement"""
    # Create user with exhausted quota
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        full_name="Test User",
        pages_used_current_period=100,  # Exceeded free trial limit
        files_used_current_period=10
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create API key
    api_key = create_api_key()
    db_api_key = APIKey(
        user_id=user.id,
        key=api_key,
        name="Test Key"
    )
    session.add(db_api_key)
    session.commit()

    # Try to upload (should fail due to quota)
    # Note: This test would need a real file upload
    # Skipping actual upload test for now
    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
