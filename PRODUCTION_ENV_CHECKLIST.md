# Production Environment Variables Checklist

**Last Updated:** December 18, 2024
**Production URL:** https://daflegal.com
**Backend API:** https://daflegal-backend.onrender.com

---

## ✅ Status Legend
- ✅ **SET** - Environment variable is configured
- ⚠️ **REQUIRED** - Must be set for production
- 🟡 **OPTIONAL** - Feature-specific, can be added later
- 🔴 **CRITICAL** - Needed immediately

---

## Backend Environment Variables

### 🔴 Critical - Must Set Now

| Variable | Status | Value/Instructions | Priority |
|----------|--------|-------------------|----------|
| `OPENAI_API_KEY` | ⚠️ REQUIRED | Get from https://platform.openai.com/api-keys<br>Format: `sk-proj-...` or `sk-...` | 🔴 CRITICAL |
| `SECRET_KEY` | ✅ SET | Already configured in render.yaml | ✅ Done |
| `SENTRY_DSN` | ⚠️ REQUIRED | 1. Create project at https://sentry.io<br>2. Get DSN: `https://abc123@o123456.ingest.sentry.io/7891011`<br>3. Add to Render backend environment | 🔴 CRITICAL |

### 🟡 File Storage (Required if users upload files)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `CLOUDINARY_CLOUD_NAME` | ⚠️ REQUIRED | 1. Sign up at https://cloudinary.com<br>2. Dashboard → Account Details<br>3. Copy "Cloud name" | 🟡 HIGH |
| `CLOUDINARY_API_KEY` | ⚠️ REQUIRED | Copy from Cloudinary Dashboard | 🟡 HIGH |
| `CLOUDINARY_API_SECRET` | ⚠️ REQUIRED | Copy from Cloudinary Dashboard | 🟡 HIGH |

### 💳 Payments (Optional - only if accepting payments)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `STRIPE_SECRET_KEY` | 🟡 OPTIONAL | **Test Mode:**<br>1. Go to https://dashboard.stripe.com/test/apikeys<br>2. Copy "Secret key" (`sk_test_...`)<br><br>**Live Mode:**<br>1. Go to https://dashboard.stripe.com/apikeys<br>2. Copy "Secret key" (`sk_live_...`) | 🟡 MEDIUM |
| `STRIPE_WEBHOOK_SECRET` | 🟡 OPTIONAL | 1. Go to https://dashboard.stripe.com/webhooks<br>2. Create endpoint: `https://daflegal-backend.onrender.com/api/v1/billing/webhook`<br>3. Select events: `checkout.session.completed`, `customer.subscription.*`<br>4. Copy signing secret (`whsec_...`) | 🟡 MEDIUM |
| `STRIPE_STARTER_PRICE_ID` | 🟡 OPTIONAL | 1. Create Product in Stripe Dashboard<br>2. Add Price: $19/month<br>3. Copy Price ID (`price_...`) | 🟡 MEDIUM |
| `STRIPE_PRO_PRICE_ID` | 🟡 OPTIONAL | Same as above, $49/month | 🟡 MEDIUM |
| `STRIPE_TEAM_PRICE_ID` | 🟡 OPTIONAL | Same as above, $99/month | 🟡 MEDIUM |

### 📊 Monitoring (Recommended)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `HEALTHCHECK_URL` | 🟡 OPTIONAL | 1. Create account at https://healthchecks.io<br>2. Create new check (period: 5 minutes)<br>3. Copy ping URL: `https://hc-ping.com/YOUR-UUID-HERE` | 🟡 MEDIUM |

### ✅ Auto-Configured (No Action Needed)

| Variable | Status | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ✅ SET | Auto-configured from PostgreSQL service |
| `REDIS_URL` | ✅ SET | Auto-configured from Redis service |
| `OPENAI_MODEL` | ✅ SET | Set to `gpt-4o-mini` |
| `ENVIRONMENT` | ✅ SET | Set to `production` |
| `CLAMAV_ENABLED` | ✅ SET | Set to `false` |

---

## Frontend Environment Variables

### 🔴 Critical - Must Set Now

| Variable | Status | Value/Instructions | Priority |
|----------|--------|-------------------|----------|
| `NEXTAUTH_SECRET` | ⚠️ REQUIRED | Generate with:<br>`openssl rand -base64 32`<br>Or use: `e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8` | 🔴 CRITICAL |

### 🔐 Google OAuth (Optional)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `GOOGLE_CLIENT_ID` | 🟡 OPTIONAL | 1. Go to https://console.cloud.google.com<br>2. Create OAuth 2.0 Client ID<br>3. Authorized redirect URIs:<br>   - `https://daflegal.com/api/auth/callback/google`<br>4. Copy Client ID | 🟡 LOW |
| `GOOGLE_CLIENT_SECRET` | 🟡 OPTIONAL | Copy from Google Cloud Console | 🟡 LOW |

### 📈 Analytics (Recommended)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 🟡 OPTIONAL | **Google Analytics 4:**<br>1. Go to https://analytics.google.com<br>2. Create property: "DafLegal"<br>3. Get Measurement ID: `G-XXXXXXXXXX` | 🟡 MEDIUM |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | 🟡 OPTIONAL | **Microsoft Clarity:**<br>1. Go to https://clarity.microsoft.com<br>2. Create project: "DafLegal"<br>3. Get Project ID | 🟡 MEDIUM |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | 🟡 OPTIONAL | **Live Chat:**<br>1. Sign up at https://crisp.chat<br>2. Get Website ID from settings | 🟡 LOW |

### 📧 Email Marketing (Optional)

| Variable | Status | Instructions | Priority |
|----------|--------|--------------|----------|
| `MAILCHIMP_API_KEY` | 🟡 OPTIONAL | Get from https://mailchimp.com/help/about-api-keys/ | 🟡 LOW |
| `MAILCHIMP_LIST_ID` | 🟡 OPTIONAL | Get from Mailchimp audience settings | 🟡 LOW |

### ✅ Auto-Configured (No Action Needed)

| Variable | Status | Notes |
|----------|--------|-------|
| `NODE_ENV` | ✅ SET | Set to `production` |
| `NEXT_PUBLIC_API_URL` | ✅ SET | Set to `https://daflegal-backend.onrender.com` |
| `NEXTAUTH_URL` | ✅ SET | **JUST UPDATED** to `https://daflegal.com` |

---

## 🎯 Action Plan - Priority Order

### 🔴 Do This First (15 minutes)

1. **OPENAI_API_KEY** - AI features won't work without this
2. **NEXTAUTH_SECRET** - Authentication requires this
3. **SENTRY_DSN** - Error tracking for production issues

### 🟡 Do This Week (30 minutes)

4. **Cloudinary** - If you need file uploads to work
5. **Google Analytics** - Start tracking users immediately
6. **Microsoft Clarity** - Session recordings and heatmaps

### 🟢 Optional (When Needed)

7. **Stripe** - When ready to accept payments
8. **Google OAuth** - For "Sign in with Google"
9. **Healthchecks.io** - Uptime monitoring
10. **Live Chat/Email** - Marketing tools

---

## 📋 How to Add Environment Variables in Render

### Step-by-Step:

1. Go to https://dashboard.render.com
2. Select the service:
   - **Backend variables** → Click `daflegal-backend`
   - **Frontend variables** → Click `daflegal-frontend`
3. Click **Environment** in left sidebar
4. Click **Add Environment Variable**
5. Enter:
   - **Key:** Variable name (e.g., `OPENAI_API_KEY`)
   - **Value:** Your API key or secret
6. Click **Save Changes**
7. Wait 2-3 minutes for automatic redeploy

### ⚠️ Important Notes:

- Backend and frontend have **separate** environment variables
- Changes trigger automatic redeployment
- Use **test keys** first, then switch to **live keys** when ready
- Never commit secrets to git (they're in render.yaml as `sync: false`)

---

## 🧪 Testing After Setup

### Backend Health Check
```bash
curl https://daflegal-backend.onrender.com/health
# Expected: {"status":"healthy","version":"1.0.0"}
```

### Test OpenAI Integration
```bash
cd backend
python test_openai.py
# Should return: "OpenAI API is working! ✅"
```

### Test Frontend
```
Visit: https://daflegal.com
- Should load without errors
- Try signup/login
- Check browser console for errors
```

---

## 📊 Current Status Summary

| Category | Required | Set | Missing | % Complete |
|----------|----------|-----|---------|------------|
| **Backend Critical** | 3 | 1 | 2 | 33% |
| **Backend Optional** | 10 | 5 | 5 | 50% |
| **Frontend Critical** | 1 | 0 | 1 | 0% |
| **Frontend Optional** | 7 | 3 | 4 | 43% |
| **TOTAL** | 21 | 9 | 12 | 43% |

---

## 🚀 Quick Start Commands

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Test All Integrations
```bash
# Backend tests
cd backend
pytest -v

# Frontend tests
cd frontend
npm test
```

### Check Render Logs
```bash
# View in dashboard or use Render CLI
render logs daflegal-backend --tail
render logs daflegal-frontend --tail
```

---

## 📞 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Production Site:** https://daflegal.com
- **Backend API:** https://daflegal-backend.onrender.com
- **API Docs:** https://daflegal-backend.onrender.com/docs
- **GitHub Repo:** https://github.com/gideonjohnson/DafLegal

---

**Next:** Set up the critical environment variables first, then test production!
