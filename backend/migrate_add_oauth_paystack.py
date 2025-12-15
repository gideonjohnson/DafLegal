"""
Database migration script to add OAuth and Paystack fields to users table.
Run this with: python migrate_add_oauth_paystack.py
"""
import os
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Add missing columns to users table if they don't exist"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    # Create engine
    engine = create_engine(database_url)
    
    print("🔍 Checking existing columns in users table...")
    
    # Check existing columns
    inspector = inspect(engine)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    print(f"📋 Current columns: {', '.join(existing_columns)}")
    
    # Define columns to add
    columns_to_add = {
        'google_id': 'VARCHAR(255)',
        'paystack_customer_code': 'VARCHAR(255)',
        'paystack_subscription_code': 'VARCHAR(255)'
    }
    
    # Add missing columns
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add.items():
            if column_name not in existing_columns:
                print(f"➕ Adding column: {column_name}")
                sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"
                if 'id' in column_name or column_name in ['google_id', 'paystack_customer_code', 'paystack_subscription_code']:
                    sql += " UNIQUE"
                conn.execute(text(sql))
                conn.commit()
                print(f"✅ Added {column_name}")
            else:
                print(f"⏭️  Column {column_name} already exists, skipping")
    
    print("\n✨ Migration completed successfully!")
    
    # Verify columns
    print("\n🔍 Verifying final schema...")
    inspector = inspect(engine)
    final_columns = [col['name'] for col in inspector.get_columns('users')]
    print(f"📋 Final columns: {', '.join(final_columns)}")
    
    return True

if __name__ == "__main__":
    print("🚀 Starting database migration...")
    success = run_migration()
    if success:
        print("\n✅ Migration completed successfully!")
    else:
        print("\n❌ Migration failed!")
