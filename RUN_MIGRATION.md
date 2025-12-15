# 🚀 Run Database Migration (No Shell Access Needed!)

## What This Does

Adds 3 new columns to your database:
- `google_id` - For Google OAuth users
- `paystack_customer_code` - For Paystack customer tracking
- `paystack_subscription_code` - For Paystack subscriptions

---

## Step 1: Wait for Backend Deployment

1. **Go to:** https://dashboard.render.com/
2. **Click:** `daflegal-backend`
3. **Wait for status:** "Live" (green indicator)
   - Takes about 2-3 minutes after pushing code

---

## Step 2: Run the Migration

Once backend shows "Live", run this single command:

```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/migrate/run
```

---

## Expected Response (Success):

```json
{
  "status": "success",
  "message": "Migration completed",
  "results": [
    "✓ google_id column added",
    "✓ paystack_customer_code column added",
    "✓ paystack_subscription_code column added"
  ],
  "columns_added": [
    "google_id",
    "paystack_customer_code",
    "paystack_subscription_code"
  ],
  "columns_missing": [],
  "total_columns": 20
}
```

---

## Check Migration Status (Optional):

To check if migration is needed:

```bash
curl https://daflegal-backend.onrender.com/api/v1/migrate/status
```

**Response if migration needed:**
```json
{
  "migration_needed": true,
  "columns_present": [],
  "columns_missing": ["google_id", "paystack_customer_code", "paystack_subscription_code"],
  "all_columns": ["id", "email", "hashed_password", ...]
}
```

**Response after migration:**
```json
{
  "migration_needed": false,
  "columns_present": ["google_id", "paystack_customer_code", "paystack_subscription_code"],
  "columns_missing": [],
  "all_columns": ["id", "email", "google_id", ...]
}
```

---

## Troubleshooting

### Issue: "404 Not Found"

**Problem:** Backend hasn't deployed yet or endpoint doesn't exist

**Fix:**
1. Wait longer for deployment (check Render dashboard)
2. Verify URL is correct
3. Check backend logs in Render dashboard

---

### Issue: "500 Internal Server Error"

**Problem:** Database connection issue or migration error

**Fix:**
1. Check backend logs in Render dashboard
2. Verify DATABASE_URL environment variable is set
3. Try running the status endpoint first to see what's wrong

---

### Issue: Columns already exist

**Response:**
```json
{
  "status": "partial",
  "results": [
    "google_id: column already exists",
    ...
  ]
}
```

**This is OK!** It means migration already ran. You're good to go!

---

## After Migration Completes

Test user registration:

```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123","full_name":"Test User"}'
```

**Should return user data (not "Internal Server Error"):**
```json
{
  "id": 1,
  "email": "test@example.com",
  "full_name": "Test User",
  "plan": "free",
  ...
}
```

---

## ✅ Success Checklist

- [ ] Backend deployment shows "Live" status
- [ ] Ran: `curl -X POST .../migrate/run`
- [ ] Got "status": "success" response
- [ ] All 3 columns in "columns_added" list
- [ ] "columns_missing" is empty []
- [ ] Test registration works (no 500 error)

---

**That's it! No shell access needed!** 🎉
