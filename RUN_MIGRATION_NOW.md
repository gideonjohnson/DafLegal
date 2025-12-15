# 🚀 Run Database Migration - QUICK GUIDE

## What This Does
Adds 3 new columns to your `users` table:
- `google_id` - For Google OAuth login
- `paystack_customer_code` - For Paystack customer tracking
- `paystack_subscription_code` - For Paystack subscriptions

---

## Option 1: Run SQL File (Easiest - 2 minutes)

### Step 1: Get your database connection string
1. Go to https://dashboard.render.com
2. Click your PostgreSQL database
3. Copy the "External Database URL"

### Step 2: Run the migration

**If you have psql installed:**
```bash
cd ~/daflegal/backend
psql "YOUR_DATABASE_URL_HERE" -f migrations/001_add_oauth_paystack_fields.sql
```

**If you have pgAdmin or DBeaver:**
1. Open the SQL file: `backend/migrations/001_add_oauth_paystack_fields.sql`
2. Copy the contents
3. Connect to your database
4. Paste and execute the SQL

---

## Option 2: Run Python Script (Alternative)

```bash
cd ~/daflegal/backend

# Make sure you have DATABASE_URL in your .env file
# Or export it: export DATABASE_URL="your_database_url"

python migrate_add_oauth_paystack.py
```

---

## Option 3: Manual SQL (Copy & Paste)

Connect to your database and run:

```sql
-- Add google_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add paystack_customer_code
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE;

-- Add paystack_subscription_code
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

## Verification

After running the migration, verify it worked:

```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

Should return **200 OK** instead of **500 Error**.

---

## Files Created

- `backend/migrate_add_oauth_paystack.py` - Python migration script
- `backend/migrations/001_add_oauth_paystack_fields.sql` - SQL migration file
- `RUN_MIGRATION_NOW.md` - This guide

---

**Need help?** The migration is safe to run multiple times - it checks if columns exist before adding them.
