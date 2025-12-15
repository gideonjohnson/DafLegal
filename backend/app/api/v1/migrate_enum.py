from fastapi import APIRouter
from sqlalchemy import text
from app.core.database import engine

router = APIRouter(prefix="/migrate-enum", tags=["migration"])


@router.post("/update-plan-enum")
async def update_plan_enum():
    """
    Update the plantype enum to include new plan types
    """
    try:
        results = []

        with engine.connect() as conn:
            # Add new enum values to the existing enum
            try:
                conn.execute(text("ALTER TYPE plantype ADD VALUE IF NOT EXISTS 'free'"))
                conn.commit()
                results.append("✓ Added 'free' to enum")
            except Exception as e:
                results.append(f"free: {str(e)}")

            try:
                conn.execute(text("ALTER TYPE plantype ADD VALUE IF NOT EXISTS 'basic'"))
                conn.commit()
                results.append("✓ Added 'basic' to enum")
            except Exception as e:
                results.append(f"basic: {str(e)}")

            try:
                conn.execute(text("ALTER TYPE plantype ADD VALUE IF NOT EXISTS 'enterprise'"))
                conn.commit()
                results.append("✓ Added 'enterprise' to enum")
            except Exception as e:
                results.append(f"enterprise: {str(e)}")

            # Check current enum values
            result = conn.execute(text(
                """
                SELECT e.enumlabel
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'plantype'
                ORDER BY e.enumsortorder
                """
            ))

            enum_values = [row[0] for row in result]

        return {
            "status": "success",
            "message": "Enum update completed",
            "results": results,
            "current_enum_values": enum_values
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@router.get("/check-enum")
async def check_enum_values():
    """
    Check current plantype enum values
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                """
                SELECT e.enumlabel
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'plantype'
                ORDER BY e.enumsortorder
                """
            ))

            enum_values = [row[0] for row in result]

        required_values = ['free', 'basic', 'pro', 'enterprise']
        missing = [val for val in required_values if val not in enum_values]

        return {
            "current_values": enum_values,
            "required_values": required_values,
            "missing_values": missing,
            "migration_needed": len(missing) > 0
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
