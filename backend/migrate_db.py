#!/usr/bin/env python3
"""
Quick database migration script
Adds new columns to users table for OAuth and Paystack integration
"""

from sqlalchemy import create_engine, text
import sys

# Database connection string - uses environment variable when deployed
import os
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://daflegal:EjZnGxlSsFeKKiWDVwatKlOQyKfIeIaf@dpg-d4or6en5r7bs73btg90g-a.oregon-postgres.render.com/daflegal')

# Fix postgres:// to postgresql:// for SQLAlchemy
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

def run_migration():
    """Run database migration to add new columns"""

    print("Starting database migration...")
    print("=" * 50)

    try:
        # Create engine
        engine = create_engine(DATABASE_URL)

        with engine.connect() as conn:
            # Add google_id column
            print("Adding google_id column...")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE"
            ))
            conn.commit()
            print("[OK] google_id column added")

            # Add paystack_customer_code column
            print("Adding paystack_customer_code column...")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE"
            ))
            conn.commit()
            print("[OK] paystack_customer_code column added")

            # Add paystack_subscription_code column
            print("Adding paystack_subscription_code column...")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE"
            ))
            conn.commit()
            print("[OK] paystack_subscription_code column added")

            # Verify columns were added
            print("\nVerifying migration...")
            result = conn.execute(text(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
                """
            ))

            columns = [row[0] for row in result]
            print(f"\nFound {len(columns)} columns in users table:")
            for col in columns:
                marker = "[NEW]" if col in ['google_id', 'paystack_customer_code', 'paystack_subscription_code'] else "     "
                print(f"  {marker} {col}")

            # Check if all new columns exist
            required_columns = ['google_id', 'paystack_customer_code', 'paystack_subscription_code']
            missing = [col for col in required_columns if col not in columns]

            if missing:
                print(f"\n[ERROR] Missing columns: {', '.join(missing)}")
                sys.exit(1)
            else:
                print("\n" + "=" * 50)
                print("SUCCESS: Migration completed successfully!")
                print("=" * 50)
                return True

    except Exception as e:
        print(f"\n[ERROR] Migration failed!")
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
