"""
Authentication Tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

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


def test_user_registration_success(client: TestClient):
    """Test successful user registration"""
    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["plan"] == "free_trial"
    assert "id" in data


def test_user_registration_duplicate_email(client: TestClient, session: Session):
    """Test registration with duplicate email"""
    # Create user first
    user = User(
        email="existing@example.com",
        hashed_password=get_password_hash("password"),
        full_name="Existing User"
    )
    session.add(user)
    session.commit()

    # Try to register with same email
    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "existing@example.com",
            "password": "AnotherPass123!",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_user_login_success(client: TestClient, session: Session):
    """Test successful login"""
    # Create user
    user = User(
        email="logintest@example.com",
        hashed_password=get_password_hash("MyPassword123!"),
        full_name="Login Test"
    )
    session.add(user)
    session.commit()

    # Login
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "logintest@example.com",
            "password": "MyPassword123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_user_login_wrong_password(client: TestClient, session: Session):
    """Test login with wrong password"""
    # Create user
    user = User(
        email="wrongpass@example.com",
        hashed_password=get_password_hash("CorrectPassword123!"),
        full_name="Wrong Pass Test"
    )
    session.add(user)
    session.commit()

    # Try to login with wrong password
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "wrongpass@example.com",
            "password": "WrongPassword123!"
        }
    )
    assert response.status_code == 401


def test_user_login_nonexistent_user(client: TestClient):
    """Test login with non-existent user"""
    response = client.post(
        "/api/v1/users/login",
        data={
            "username": "nonexistent@example.com",
            "password": "SomePassword123!"
        }
    )
    assert response.status_code == 401


def test_protected_endpoint_without_auth(client: TestClient):
    """Test accessing protected endpoint without authentication"""
    response = client.get("/api/v1/settings/profile")
    assert response.status_code == 401


def test_protected_endpoint_with_auth(client: TestClient, session: Session):
    """Test accessing protected endpoint with authentication"""
    # Create user
    user = User(
        email="protected@example.com",
        hashed_password=get_password_hash("Password123!"),
        full_name="Protected Test"
    )
    session.add(user)
    session.commit()

    # Login to get token
    login_response = client.post(
        "/api/v1/users/login",
        data={
            "username": "protected@example.com",
            "password": "Password123!"
        }
    )
    token = login_response.json()["access_token"]

    # Access protected endpoint
    response = client.get(
        "/api/v1/settings/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "protected@example.com"
