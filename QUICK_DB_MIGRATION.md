# Quick Database Migration Guide

## Option 1: Using Backend Service Shell (Easiest)

Since Render PostgreSQL doesn't always have a direct console, we can run the migration from the backend service.

### Steps:

1. **Go to:** https://dashboard.render.com/
2. **Click:** `daflegal-backend` service (NOT the database)
3. **Click:** "Shell" tab (top right area)
4. **Wait for shell to load** (you'll see a terminal prompt)
5. **Run this Python command:**

```python
python -c "
from sqlalchemy import create_engine, text
import os

engine = create_engine(os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://'))

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE'))
    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE'))
    conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE'))
    conn.commit()
    print('✅ Migration completed successfully!')
"
```

6. **Press Enter**
7. **Should see:** "✅ Migration completed successfully!"

---

## Option 2: Using Database Connection String

If the backend shell doesn't work, we can connect externally.

### Steps:

1. **In PostgreSQL dashboard**, look for:
   - "Info" tab
   - "Connect" button
   - "Connection Details"

2. **Find:** "External Database URL" or "Internal Database URL"
   - Format: `postgres://user:password@host:port/database`

3. **Copy the URL** and let me know - I'll help you connect

---

## Option 3: Create Migration Script File

We can add a migration script to the backend code and run it.

### Steps:

1. I'll create a migration script file
2. Commit and push to Git
3. Deploy backend
4. Run the script via backend shell

---

## Which Option Should You Try?

**👉 Try Option 1 first** (Backend Shell) - it's the quickest!

Let me know:
- Can you see a "Shell" tab in daflegal-backend service?
- Or do you see connection details in the database dashboard?
