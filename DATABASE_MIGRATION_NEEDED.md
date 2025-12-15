# ⚠️ Database Migration Required

## Issue Detected

The backend code has been updated with new fields in the User model, but the database schema needs to be updated to match.

**New fields added:**
- `google_id` - For Google OAuth users
- `paystack_customer_code` - For Paystack customer tracking
- `paystack_subscription_code` - For Paystack subscriptions

**Error you might see:**
```
Internal Server Error (500) when trying to register a user
```

---

## 🔧 Solution: Add Missing Columns to Database

You need to run SQL commands to add the new columns to the `users` table.

### Option 1: Using Render PostgreSQL Dashboard (Easiest)

1. **Go to:** https://dashboard.render.com/
2. **Click:** Your PostgreSQL database service
3. **Click:** "Connect" → "External Connection"
4. **Copy the connection details**
5. **Use a PostgreSQL client** (like pgAdmin, DBeaver, or psql) to connect
6. **Run the SQL below**

### Option 2: Using Render Shell (Quick)

1. **Go to:** https://dashboard.render.com/
2. **Click:** `daflegal-backend` service
3. **Click:** "Shell" tab
4. **Run:**
   ```bash
   python -c "from app.core.database import engine; from app.models.user import User; from sqlmodel import SQLModel; SQLModel.metadata.create_all(engine)"
   ```

**Note:** This might not work if SQLModel doesn't automatically add columns to existing tables.

---

## 📝 SQL Migration Script

**Run these SQL commands in your PostgreSQL database:**

```sql
-- Add Google OAuth ID field
ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add Paystack customer code
ALTER TABLE users
ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE;

-- Add Paystack subscription code
ALTER TABLE users
ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected output after verification:**
```
column_name                    | data_type         | is_nullable
-------------------------------+-------------------+-------------
id                            | integer           | NO
email                         | varchar           | NO
hashed_password               | varchar           | NO
full_name                     | varchar           | YES
google_id                     | varchar           | YES  ← NEW
plan                          | varchar           | YES
stripe_customer_id            | varchar           | YES
stripe_subscription_id        | varchar           | YES
paystack_customer_code        | varchar           | YES  ← NEW
paystack_subscription_code    | varchar           | YES  ← NEW
pages_used_current_period     | integer           | YES
files_used_current_period     | integer           | YES
billing_period_start          | timestamp         | YES
billing_period_end            | timestamp         | YES
is_active                     | boolean           | YES
created_at                    | timestamp         | YES
updated_at                    | timestamp         | YES
```

---

## 🧪 Testing After Migration

Once you've added the columns, test the registration:

### Test 1: Backend API Test

```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123","full_name":"Test User"}'
```

**Expected Response (Success):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "full_name": "Test User",
  "plan": "free",
  "pages_used_current_period": 0,
  "files_used_current_period": 0,
  "created_at": "2024-XX-XXTXX:XX:XX"
}
```

### Test 2: Frontend Signup

1. Visit: https://daflegal-frontend.onrender.com/auth/signup
2. Fill in the form
3. Click "Create account"
4. Should redirect to dashboard

---

## 🔄 Alternative: Automatic Migration Setup (Future)

For future schema changes, we should set up Alembic for database migrations:

### Quick Alembic Setup (Optional - for later):

```bash
cd backend

# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add google_id and paystack fields"

# Apply migration
alembic upgrade head
```

This is recommended for production but not required right now.

---

## 📞 Getting Database Connection Info

### From Render Dashboard:

1. **Go to:** https://dashboard.render.com/
2. **Click:** Your PostgreSQL database
3. **Look for:** "Internal Database URL" or "External Database URL"
4. **Format:**
   ```
   postgres://user:password@host:port/database
   ```

### Using psql Command:

```bash
psql "postgres://user:password@host:port/database"
```

Then run the SQL commands above.

---

## ✅ Verification Checklist

After running the migration:

- [ ] Ran SQL ALTER TABLE commands
- [ ] Verified columns exist with SELECT query
- [ ] Tested backend registration endpoint (should return 200, not 500)
- [ ] Tested frontend signup (should work without errors)
- [ ] Checked backend logs (no database errors)

---

## 🐛 Still Getting Errors?

If you still see "Internal Server Error" after migration:

1. **Check backend logs:**
   - Render Dashboard → daflegal-backend → Logs
   - Look for Python traceback or database errors

2. **Restart backend service:**
   - Render Dashboard → daflegal-backend
   - Click "Manual Deploy" → "Clear build cache & deploy"

3. **Verify environment variables:**
   - Check DATABASE_URL is set correctly
   - Check SECRET_KEY is set

---

**Need help running the migration?** Let me know and I can guide you through accessing the database.
