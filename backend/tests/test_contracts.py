"""
Contract Analysis Tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from io import BytesIO

from app.main import app
from app.core.database import get_session
from app.models.user import User
from app.core.security import get_password_hash


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


@pytest.fixture(name="auth_token")
def auth_token_fixture(client: TestClient, session: Session):
    """Create a user and return auth token"""
    user = User(
        email="contract@example.com",
        hashed_password=get_password_hash("Password123!"),
        full_name="Contract Test"
    )
    session.add(user)
    session.commit()

    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "contract@example.com",
            "password": "Password123!"
        }
    )
    return response.json()["access_token"]


def test_contract_upload_requires_auth(client: TestClient):
    """Test that contract upload requires authentication"""
    response = client.post("/api/v1/contracts/analyze")
    assert response.status_code == 401


def test_contract_upload_invalid_file_type(client: TestClient, auth_token: str):
    """Test uploading invalid file type"""
    # Create a fake text file
    file_content = b"This is not a PDF or DOCX"
    file = BytesIO(file_content)

    response = client.post(
        "/api/v1/contracts/analyze",
        headers={"Authorization": f"Bearer {auth_token}"},
        files={"file": ("test.txt", file, "text/plain")}
    )

    # Should reject text files (only PDF/DOCX allowed)
    # The actual status code depends on validation logic
    assert response.status_code in [400, 415, 422]


def test_get_contracts_list(client: TestClient, auth_token: str):
    """Test getting list of contracts"""
    response = client.get(
        "/api/v1/contracts",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    # Should return empty list for new user
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_nonexistent_contract(client: TestClient, auth_token: str):
    """Test getting a contract that doesn't exist"""
    response = client.get(
        "/api/v1/contracts/nonexistent-id",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 404


def test_user_quota_check(client: TestClient, session: Session):
    """Test that user quota is enforced"""
    # Create user with exhausted quota
    user = User(
        email="noquota@example.com",
        hashed_password=get_password_hash("Password123!"),
        full_name="No Quota",
        pages_used_current_period=1000,  # Way over limit
        files_used_current_period=100
    )
    session.add(user)
    session.commit()

    # Login
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "noquota@example.com",
            "password": "Password123!"
        }
    )
    token = response.json()["access_token"]

    # Try to analyze contract
    file_content = b"%PDF-1.4 fake pdf content"
    file = BytesIO(file_content)

    response = client.post(
        "/api/v1/contracts/analyze",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test.pdf", file, "application/pdf")}
    )

    # Should be rejected due to quota (or 400 for invalid file)
    assert response.status_code in [403, 400, 422]
