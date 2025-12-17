# Backend Test Suite

Comprehensive test suite for DafLegal backend API using pytest.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_user_registration_success

# Run with coverage report
pytest --cov=app --cov-report=html

# Run and show print statements
pytest -s
```

## Test Structure

```
tests/
├── test_api.py              # General API tests
├── test_auth.py             # Authentication & authorization tests
├── test_contracts.py        # Contract analysis tests
├── test_rate_limiting.py    # Rate limiting tests
└── README.md               # This file
```

## Test Coverage

### Authentication (`test_auth.py`)
- ✅ User registration (success)
- ✅ Duplicate email prevention
- ✅ User login (success)
- ✅ Wrong password rejection
- ✅ Non-existent user rejection
- ✅ Protected endpoint access control
- ✅ Token-based authentication

### API Endpoints (`test_api.py`)
- ✅ Health check endpoint
- ✅ User registration
- ✅ API key creation
- ✅ Unauthorized access prevention
- ✅ Quota enforcement

### Contracts (`test_contracts.py`)
- ✅ Contract upload authentication
- ✅ Invalid file type rejection
- ✅ Contract list retrieval
- ✅ Non-existent contract handling
- ✅ User quota enforcement

### Rate Limiting (`test_rate_limiting.py`)
- ✅ Rate limit enforcement
- ✅ Rate limit headers (if applicable)

## Test Database

Tests use an in-memory SQLite database that is:
- Created fresh for each test
- Automatically cleaned up after tests
- Isolated from production database

## Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt

    - name: Run tests
      run: |
        cd backend
        pytest --cov=app --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml
```

## Writing New Tests

### Example Test

```python
import pytest
from fastapi.testclient import TestClient

def test_my_endpoint(client: TestClient, auth_token: str):
    """Test description"""
    response = client.get(
        "/api/v1/my-endpoint",
        headers={"Authorization": f"Bearer {auth_token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "expected_field" in data
```

### Fixtures Available

- `session`: Database session (in-memory SQLite)
- `client`: FastAPI test client
- `auth_token`: Authenticated user token (in test_contracts.py)

## Mocking External Services

For tests involving external APIs (OpenAI, Stripe), use `unittest.mock`:

```python
from unittest.mock import patch, MagicMock

@patch('app.services.ai_analyzer.OpenAI')
def test_contract_analysis(mock_openai, client, auth_token):
    # Mock OpenAI response
    mock_openai.return_value.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content='{"result": "test"}'))]
    )

    # Your test here
    pass
```

## Current Test Statistics

Run `pytest --cov=app` to see coverage:

```
tests/test_api.py ........                                    [ 33%]
tests/test_auth.py ........                                   [ 66%]
tests/test_contracts.py ......                                [100%]

================== X passed in X.XXs ==================
```

## Troubleshooting

### Import Errors

If you get import errors, ensure you're running pytest from the `backend` directory:

```bash
cd backend
pytest
```

### Database Errors

If you get database errors, the in-memory database might not be creating tables correctly. Check that all models are imported in `conftest.py`.

### Async Tests

For async endpoints, use `pytest-asyncio`:

```python
@pytest.mark.asyncio
async def test_async_endpoint():
    # Test async code here
    pass
```

## Next Steps

- Add integration tests with real database
- Add load testing with locust
- Add API contract tests with Pact
- Add E2E tests with Playwright
