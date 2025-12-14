from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.core.database import engine

router = APIRouter(prefix="/migrate", tags=["migration"])


@router.post("/run")
async def run_migration():
    """
    Run database migration to add new columns
    This is a one-time endpoint to add OAuth and Paystack fields
    """
    try:
        results = []

        with engine.connect() as conn:
            # Add google_id column
            try:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE"
                ))
                conn.commit()
                results.append("✓ google_id column added")
            except Exception as e:
                results.append(f"google_id: {str(e)}")

            # Add paystack_customer_code column
            try:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE"
                ))
                conn.commit()
                results.append("✓ paystack_customer_code column added")
            except Exception as e:
                results.append(f"paystack_customer_code: {str(e)}")

            # Add paystack_subscription_code column
            try:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE"
                ))
                conn.commit()
                results.append("✓ paystack_subscription_code column added")
            except Exception as e:
                results.append(f"paystack_subscription_code: {str(e)}")

            # Verify columns were added
            result = conn.execute(text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
                """
            ))

            columns = [row[0] for row in result]

            # Check if all new columns exist
            required_columns = ['google_id', 'paystack_customer_code', 'paystack_subscription_code']
            existing = [col for col in required_columns if col in columns]
            missing = [col for col in required_columns if col not in columns]

        return {
            "status": "success" if not missing else "partial",
            "message": "Migration completed",
            "results": results,
            "columns_added": existing,
            "columns_missing": missing,
            "total_columns": len(columns)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Migration failed: {str(e)}"
        )


@router.get("/status")
async def check_migration_status():
    """
    Check if migration has been run
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
                """
            ))

            columns = [row[0] for row in result]

            # Check if new columns exist
            required_columns = ['google_id', 'paystack_customer_code', 'paystack_subscription_code']
            existing = [col for col in required_columns if col in columns]
            missing = [col for col in required_columns if col not in columns]

        return {
            "migration_needed": len(missing) > 0,
            "columns_present": existing,
            "columns_missing": missing,
            "all_columns": columns
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Status check failed: {str(e)}"
        )
