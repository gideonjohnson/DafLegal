from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime, timedelta
import traceback

from app.core.database import get_session
from app.core.security import get_password_hash
from app.models.user import User, PlanType

router = APIRouter(prefix="/debug", tags=["debug"])


@router.post("/test-user-creation")
async def test_user_creation(session: Session = Depends(get_session)):
    """
    Test user creation to debug 500 errors
    Returns detailed error information
    """
    try:
        # Try to create a test user
        test_email = f"debug-{datetime.utcnow().timestamp()}@example.com"

        user = User(
            email=test_email,
            hashed_password=get_password_hash("TestPassword123"),
            full_name="Debug Test User",
            plan=PlanType.FREE,
            billing_period_start=datetime.utcnow(),
            billing_period_end=datetime.utcnow() + timedelta(days=365)
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "status": "success",
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "plan": user.plan,
                "created_at": str(user.created_at)
            }
        }

    except Exception as e:
        error_details = {
            "status": "error",
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc()
        }
        return error_details


@router.get("/check-plan-types")
async def check_plan_types():
    """Check what plan types are available"""
    return {
        "available_plans": [plan.value for plan in PlanType],
        "plan_enum": {
            "FREE": PlanType.FREE.value,
            "BASIC": PlanType.BASIC.value,
            "PRO": PlanType.PRO.value,
            "ENTERPRISE": PlanType.ENTERPRISE.value,
        }
    }


@router.get("/check-db-connection")
async def check_db_connection(session: Session = Depends(get_session)):
    """Test database connection"""
    try:
        # Try a simple query
        result = session.exec(select(User)).first()

        return {
            "status": "success",
            "database_connected": True,
            "user_count_sample": "Database accessible",
            "message": "Database connection working"
        }
    except Exception as e:
        return {
            "status": "error",
            "database_connected": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
