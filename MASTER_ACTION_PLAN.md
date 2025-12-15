# 🚀 DafLegal - Master Action Plan

## 📊 Current Status

### ✅ Completed Today:
1. ✅ Committed dashboard background image updates
2. ✅ Created database migration scripts (SQL + Python)
3. ✅ Created comprehensive environment setup guide
4. ✅ Created analytics setup guide
5. ✅ Pushed all changes to GitHub

### 📝 Code Files Created/Updated:
- `frontend/src/app/dashboard/page.tsx` - Enhanced with background images
- `backend/migrate_add_oauth_paystack.py` - Python migration script
- `backend/migrations/001_add_oauth_paystack_fields.sql` - SQL migration
- `RUN_MIGRATION_NOW.md` - Migration instructions
- `COMPLETE_ENV_SETUP.md` - All environment variables guide
- `SETUP_ANALYTICS_QUICK.md` - GA4 + Clarity setup

---

## 🎯 Next Actions (Prioritized)

### **PRIORITY 1: Get Backend Running** (5-10 minutes)

**Action:** Add environment variables to Render backend

**Steps:**
1. Go to https://dashboard.render.com
2. Click `daflegal-backend` service
3. Click "Environment" tab
4. Add these variables:

```
SECRET_KEY = 8490cb8c1e9092484e0b653bf9d2f3208e07a6e3e73cf1da2f48ca484530c6c4
OPENAI_API_KEY = [Get from https://platform.openai.com/api-keys]
ENVIRONMENT = production
FRONTEND_URL = https://daflegal-frontend.onrender.com
BACKEND_URL = https://daflegal-backend.onrender.com
ALLOWED_ORIGINS = https://daflegal-frontend.onrender.com,http://localhost:3000
```

5. Click "Save Changes"
6. Wait for automatic redeploy (~3 minutes)

**Verification:**
```bash
curl https://daflegal-backend.onrender.com/health
```
Expected: `{"status":"healthy","version":"1.0.0"}`

**Guide:** See `COMPLETE_ENV_SETUP.md`

---

### **PRIORITY 2: Add Frontend Environment Variables** (2 minutes)

**Steps:**
1. Go to https://dashboard.render.com
2. Click `daflegal-frontend` service
3. Click "Environment" tab
4. Add these variables:

```
NEXTAUTH_URL = https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET = e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
NEXT_PUBLIC_API_URL = https://daflegal-backend.onrender.com
NODE_ENV = production
```

5. Click "Save Changes"
6. Wait for redeploy

---

### **PRIORITY 3: Run Database Migration** (3 minutes)

**Option A: SQL (Easiest)**

1. Get database URL from Render dashboard
2. Run migration SQL:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(255) UNIQUE;
```

**Option B: Python Script**

```bash
cd ~/daflegal/backend
python migrate_add_oauth_paystack.py
```

**Guide:** See `RUN_MIGRATION_NOW.md`

---

### **PRIORITY 4: Test Core Functionality** (10 minutes)

#### Test 1: Backend Health
```bash
curl https://daflegal-backend.onrender.com/health
```

#### Test 2: Signup
1. Visit: https://daflegal-frontend.onrender.com/auth/signup
2. Create account
3. Verify redirect to dashboard

#### Test 3: Login
1. Visit: https://daflegal-frontend.onrender.com/auth/signin
2. Sign in
3. Verify dashboard loads

#### Test 4: Dashboard
1. Check all features load
2. Check background images appear on hover
3. Navigate around

---

### **PRIORITY 5: Set Up Paystack Payments** (15 minutes)

**Steps:**

1. **Get Paystack Keys:**
   - Go to https://dashboard.paystack.com/settings/developer
   - Copy Test Secret Key (sk_test_...)
   - Copy Test Public Key (pk_test_...)

2. **Create Plans in Paystack:**
   - Basic: $29/month
   - Pro: $49/month
   - Enterprise: $299/month
   - Get plan codes (PLN_...)

3. **Add to Render Backend:**
   ```
   PAYSTACK_SECRET_KEY = sk_test_...
   PAYSTACK_PUBLIC_KEY = pk_test_...
   PAYSTACK_BASIC_PLAN_CODE = PLN_...
   PAYSTACK_PRO_PLAN_CODE = PLN_...
   PAYSTACK_ENTERPRISE_PLAN_CODE = PLN_...
   ```

4. **Add to Render Frontend:**
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = pk_test_...
   ```

5. **Test Payment:**
   - Visit: https://daflegal-frontend.onrender.com/pricing
   - Click "Start Pro Plan"
   - Use test card: 4084 0840 8408 4081
   - CVV: 123, OTP: 123456

**Guide:** See `SETUP_PAYSTACK.md`

---

### **PRIORITY 6: Set Up Analytics** (15 minutes)

#### Google Analytics 4

1. Go to https://analytics.google.com
2. Create property: "DafLegal"
3. Create web data stream
4. Get Measurement ID (G-XXXXXXXXXX)
5. Add to Render Frontend:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX
   ```

#### Microsoft Clarity

1. Go to https://clarity.microsoft.com
2. Create project: "DafLegal"
3. Get Project ID
4. Add to Render Frontend:
   ```
   NEXT_PUBLIC_CLARITY_PROJECT_ID = [your_id]
   ```

**Guide:** See `SETUP_ANALYTICS_QUICK.md`

---

### **PRIORITY 7: Set Up Google OAuth** (20 minutes - Optional)

1. Go to https://console.cloud.google.com
2. Create project: "DafLegal"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - https://daflegal-frontend.onrender.com/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
6. Get Client ID and Secret
7. Add to both backend and frontend on Render:
   ```
   GOOGLE_CLIENT_ID = [client_id].apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = GOCSPX-[secret]
   ```

**Guide:** See `GOOGLE_OAUTH_SETUP.md`

---

### **PRIORITY 8: Production Readiness** (Later - When Ready to Launch)

**When you're ready for real payments:**

1. **Switch Paystack to Live Mode:**
   - Get live keys from Paystack dashboard
   - Create live plans
   - Update Render environment variables
   - Test with small real payment

2. **Set Up Monitoring:**
   - Error tracking (Sentry)
   - Uptime monitoring
   - Database backups

3. **Final Testing:**
   - End-to-end user flow
   - Payment processing
   - Email notifications
   - Error handling

---

## 📋 Quick Reference

### Documentation Files:
- `MASTER_ACTION_PLAN.md` ← **START HERE**
- `COMPLETE_ENV_SETUP.md` - All environment variables
- `RUN_MIGRATION_NOW.md` - Database migration
- `SETUP_ANALYTICS_QUICK.md` - Analytics setup
- `SETUP_PAYSTACK.md` - Payment setup
- `GOOGLE_OAUTH_SETUP.md` - OAuth setup
- `NEXT_STEPS.md` - Detailed next steps

### Testing Scripts:
- `test_deployment.sh` - Test deployment
- `test_paystack_deployment.sh` - Test Paystack
- `test_production_deployment.sh` - Full testing

### Key URLs:
- Frontend: https://daflegal-frontend.onrender.com
- Backend: https://daflegal-backend.onrender.com
- Render Dashboard: https://dashboard.render.com
- GitHub Repo: https://github.com/gideonjohnson/DafLegal

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Add backend env vars | 5 min | 🔴 HIGH |
| Add frontend env vars | 2 min | 🔴 HIGH |
| Run database migration | 3 min | 🔴 HIGH |
| Test core functionality | 10 min | 🔴 HIGH |
| **SUBTOTAL - Must Do** | **20 min** | |
| Set up Paystack | 15 min | 🟡 MEDIUM |
| Set up analytics | 15 min | 🟡 MEDIUM |
| Set up Google OAuth | 20 min | 🟢 OPTIONAL |
| **TOTAL** | **70 min** | |

---

## 🎯 Suggested Schedule

### Today (Must Do - 20 minutes):
1. ✅ Add backend environment variables
2. ✅ Add frontend environment variables
3. ✅ Run database migration
4. ✅ Test signup/login works

### This Week (Recommended - 30 minutes):
5. 💳 Set up Paystack payments
6. 📊 Set up analytics (GA4 + Clarity)

### When Ready (Optional):
7. 🔐 Set up Google OAuth
8. 🚀 Switch to production mode

---

## ✅ Success Criteria

You'll know everything is working when:

- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Can create a new account
- [ ] Can log in successfully
- [ ] Dashboard displays properly
- [ ] Can click through all features
- [ ] (Optional) Paystack payment modal appears
- [ ] (Optional) Analytics tracking works
- [ ] (Optional) Google sign-in works

---

## 🆘 Need Help?

**If backend won't start:**
- Check `ACTION_REQUIRED.md`
- Verify all environment variables are added
- Check Render logs for errors

**If signup/login fails:**
- Check `DATABASE_MIGRATION_NEEDED.md`
- Run the migration SQL
- Restart backend service

**For payment issues:**
- Check `PAYSTACK_TEST_CHECKLIST.md`
- Verify plan codes are correct
- Test with test card: 4084 0840 8408 4081

**For deployment issues:**
- Check `DEPLOYMENT_CHECKLIST.md`
- Run `test_deployment.sh`
- Check Render logs

---

## 🎉 What We've Accomplished

### Code Changes:
✅ Enhanced dashboard with background images
✅ Created database migration scripts
✅ Generated secure secrets
✅ Prepared comprehensive documentation

### Documentation Created:
✅ Master action plan (this file)
✅ Complete environment setup guide
✅ Database migration guide
✅ Analytics setup guide
✅ All changes pushed to GitHub

---

**Start with Priority 1 and work your way down!**

**Time to complete minimum setup:** ~20 minutes
**Time to complete full setup:** ~70 minutes

**You're 80% done - just need to add environment variables and test!** 🚀
