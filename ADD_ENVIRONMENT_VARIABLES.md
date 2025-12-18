# Add Environment Variables to Render

**Date:** December 18, 2024
**Status:** Ready to add
**Time Required:** 20-30 minutes

---

## 🎯 Quick Navigation

- [Backend Environment Variables](#backend-environment-variables) (7 variables)
- [Frontend Environment Variables](#frontend-environment-variables) (5 variables)
- [How to Add in Render](#how-to-add-variables-in-render)
- [Verification Steps](#verification-after-adding)

---

## Backend Environment Variables

### Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click on: **`daflegal-backend`** service
3. Click: **Environment** (left sidebar)

---

### 🔴 Critical Variables (Required Now)

#### 1. OPENAI_API_KEY
**Purpose:** Powers all AI features (contract analysis, drafting, research)
**Priority:** 🔴 CRITICAL

**Get Your Key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click: **Create new secret key**
4. Name it: "DafLegal Production"
5. Copy the key (starts with `sk-proj-` or `sk-`)

**Add to Render:**
```
Key:   OPENAI_API_KEY
Value: [Paste your OpenAI API key here]
```

**⚠️ IMPORTANT:** The key will only be shown once! Save it securely.

---

#### 2. SENTRY_DSN
**Purpose:** Error tracking and monitoring in production
**Priority:** 🔴 CRITICAL

**Get Your DSN:**
1. Go to: https://sentry.io
2. Sign up or log in
3. Click: **Create Project**
   - Platform: **Python**
   - Project name: **DafLegal Backend**
4. Copy the DSN (format: `https://abc123@o456.ingest.sentry.io/789`)

**Add to Render:**
```
Key:   SENTRY_DSN
Value: [Paste your Sentry DSN here]
```

**Example DSN format:**
```
https://1a2b3c4d5e6f7g8h9i0j@o1234567.ingest.us.sentry.io/8901234
```

---

### 🟡 Recommended Variables (Add When Ready)

#### 3. HEALTHCHECK_URL
**Purpose:** Uptime monitoring and alerts
**Priority:** 🟡 MEDIUM

**Get Your URL:**
1. Go to: https://healthchecks.io
2. Sign up or log in
3. Click: **Add Check**
   - Name: **DafLegal Backend**
   - Period: **5 minutes**
   - Grace Time: **2 minutes**
4. Copy the ping URL (format: `https://hc-ping.com/your-uuid-here`)

**Add to Render:**
```
Key:   HEALTHCHECK_URL
Value: [Paste your Healthchecks.io ping URL]
```

---

#### 4-6. Cloudinary (If you need file uploads)
**Purpose:** File storage for uploaded contracts
**Priority:** 🟡 MEDIUM (only if accepting file uploads)

**Get Your Credentials:**
1. Go to: https://cloudinary.com
2. Sign up or log in
3. Dashboard → **Account Details**
4. Copy all three values

**Add to Render:**
```
Key:   CLOUDINARY_CLOUD_NAME
Value: [Your cloud name]

Key:   CLOUDINARY_API_KEY
Value: [Your API key]

Key:   CLOUDINARY_API_SECRET
Value: [Your API secret]
```

---

#### 7. Stripe (If accepting payments)
**Purpose:** Payment processing
**Priority:** 🟢 LOW (only when ready for payments)

**For Testing:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (starts with `sk_test_`)

**Add to Render:**
```
Key:   STRIPE_SECRET_KEY
Value: [Your Stripe secret key]
```

**Note:** Start with test keys. Switch to live keys when ready for production payments.

---

## Frontend Environment Variables

### Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click on: **`daflegal-frontend`** service
3. Click: **Environment** (left sidebar)

---

### 🔴 Critical Variable (Required Now)

#### 1. NEXTAUTH_SECRET
**Purpose:** Secures authentication sessions
**Priority:** 🔴 CRITICAL

**Generated for you:**
```
Key:   NEXTAUTH_SECRET
Value: XNXrhujdylNPVfFYmxIRQhNTvV5tiwWxYH4tiBvH8qc=
```

**✅ Copy the value above and paste into Render**

---

### 🟡 Recommended Variables (Add for Analytics)

#### 2. NEXT_PUBLIC_GA_MEASUREMENT_ID
**Purpose:** Google Analytics tracking
**Priority:** 🟡 MEDIUM

**Get Your Measurement ID:**
1. Go to: https://analytics.google.com
2. Sign in with Google account
3. Click: **Admin** (bottom left)
4. Click: **Create Property**
   - Property name: **DafLegal**
   - Time zone: Your timezone
   - Currency: Your currency
5. Click: **Create**
6. Click: **Data Streams** → **Add stream** → **Web**
   - Website URL: `https://daflegal.com`
   - Stream name: **DafLegal Production**
7. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

**Add to Render:**
```
Key:   NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: [Your measurement ID, e.g., G-ABC123XYZ]
```

---

#### 3. NEXT_PUBLIC_CLARITY_PROJECT_ID
**Purpose:** Session recordings and heatmaps
**Priority:** 🟡 MEDIUM

**Get Your Project ID:**
1. Go to: https://clarity.microsoft.com
2. Sign in with Microsoft account
3. Click: **Add new project**
   - Name: **DafLegal**
   - Website: `https://daflegal.com`
   - Category: **Technology**
4. Copy the **Project ID** (shown after creation)

**Add to Render:**
```
Key:   NEXT_PUBLIC_CLARITY_PROJECT_ID
Value: [Your Clarity project ID]
```

---

#### 4. NEXT_PUBLIC_CRISP_WEBSITE_ID (Optional)
**Purpose:** Live chat support
**Priority:** 🟢 LOW

**Get Your Website ID:**
1. Go to: https://crisp.chat
2. Sign up or log in
3. Create a new website
4. Copy the Website ID from settings

**Add to Render:**
```
Key:   NEXT_PUBLIC_CRISP_WEBSITE_ID
Value: [Your Crisp website ID]
```

---

#### 5. Google OAuth (Optional)
**Purpose:** "Sign in with Google" functionality
**Priority:** 🟢 LOW

**Get Your Credentials:**
1. Go to: https://console.cloud.google.com
2. Create a new project: **DafLegal**
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `https://daflegal.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (for testing)
5. Copy **Client ID** and **Client Secret**

**Add to Render:**
```
Key:   GOOGLE_CLIENT_ID
Value: [Your Google Client ID]

Key:   GOOGLE_CLIENT_SECRET
Value: [Your Google Client Secret]
```

---

## How to Add Variables in Render

### Step-by-Step Process:

1. **Navigate to Service**
   - Go to https://dashboard.render.com
   - Click on the service (backend or frontend)

2. **Open Environment Tab**
   - Click **Environment** in left sidebar

3. **Add Variable**
   - Click **Add Environment Variable** button
   - Enter **Key** (exact name, case-sensitive)
   - Enter **Value** (paste the secret/key)
   - Click **Save Changes**

4. **Wait for Redeploy**
   - Render will automatically redeploy (2-3 minutes)
   - Watch the **Logs** tab for deployment progress

5. **Verify Success**
   - Check logs for "Build successful" and "Deploy live"
   - Test the application

### ⚠️ Important Notes:

- **Case-sensitive:** Variable names must match exactly
- **No quotes:** Don't wrap values in quotes
- **One at a time:** Add variables individually
- **Auto-redeploy:** Each save triggers a redeploy
- **Check logs:** Always verify deployment succeeded

---

## Verification After Adding

### Backend Verification

**1. Check Health Endpoint**
```bash
curl https://daflegal-backend.onrender.com/health
# Should return: {"status":"healthy","version":"1.0.0"}
```

**2. Check Sentry (if configured)**
- Go to: https://sentry.io/organizations/your-org/projects/daflegal-backend/
- Should show "Waiting for events" (no errors yet = good!)

**3. Check Logs**
```
Go to Render Dashboard → daflegal-backend → Logs
Look for:
✓ "Sentry initialized" (if SENTRY_DSN added)
✓ "Healthcheck monitoring started" (if HEALTHCHECK_URL added)
✓ No "OpenAI API key missing" errors
```

---

### Frontend Verification

**1. Visit Website**
```
https://daflegal.com
```
**Check for:**
- ✅ Page loads without errors
- ✅ No console errors (press F12)
- ✅ Can navigate between pages

**2. Test Signup/Login**
```
https://daflegal.com/auth/signup
```
**Try:**
- Create a test account
- Should redirect to dashboard after signup
- Should be able to log in

**3. Check Analytics (if configured)**
- **Google Analytics:**
  - Go to: https://analytics.google.com
  - Navigate to **Realtime** report
  - Visit your site in another tab
  - Should see 1 active user

- **Microsoft Clarity:**
  - Go to: https://clarity.microsoft.com
  - Select your project
  - Visit your site
  - Should see recording start (may take 5-10 minutes)

---

## Quick Copy-Paste Checklist

### Backend (daflegal-backend)
```
✅ Variables to Add:
□ OPENAI_API_KEY (Get from platform.openai.com)
□ SENTRY_DSN (Get from sentry.io)
□ HEALTHCHECK_URL (Get from healthchecks.io)
□ CLOUDINARY_CLOUD_NAME (Optional, for file uploads)
□ CLOUDINARY_API_KEY (Optional, for file uploads)
□ CLOUDINARY_API_SECRET (Optional, for file uploads)
□ STRIPE_SECRET_KEY (Optional, for payments)
```

### Frontend (daflegal-frontend)
```
✅ Variables to Add:
□ NEXTAUTH_SECRET (Use: XNXrhujdylNPVfFYmxIRQhNTvV5tiwWxYH4tiBvH8qc=)
□ NEXT_PUBLIC_GA_MEASUREMENT_ID (Get from analytics.google.com)
□ NEXT_PUBLIC_CLARITY_PROJECT_ID (Get from clarity.microsoft.com)
□ NEXT_PUBLIC_CRISP_WEBSITE_ID (Optional, for live chat)
□ GOOGLE_CLIENT_ID (Optional, for OAuth)
□ GOOGLE_CLIENT_SECRET (Optional, for OAuth)
```

---

## Priority Order

### Do First (15 minutes) 🔴
1. **NEXTAUTH_SECRET** (frontend) - Authentication
2. **OPENAI_API_KEY** (backend) - AI features
3. **SENTRY_DSN** (backend) - Error tracking

### Do Next (15 minutes) 🟡
4. **NEXT_PUBLIC_GA_MEASUREMENT_ID** (frontend) - Analytics
5. **NEXT_PUBLIC_CLARITY_PROJECT_ID** (frontend) - UX insights
6. **HEALTHCHECK_URL** (backend) - Monitoring

### Do Later 🟢
7. Cloudinary (when accepting file uploads)
8. Stripe (when accepting payments)
9. Google OAuth (when adding social login)

---

## Troubleshooting

### "Build failed" after adding variable
- Check the **Logs** tab for specific error
- Verify variable name is spelled correctly (case-sensitive)
- Make sure value doesn't have extra spaces

### "Cannot connect to OpenAI"
- Verify API key starts with `sk-proj-` or `sk-`
- Check you have credits in OpenAI account
- Test key at: https://platform.openai.com/playground

### "Authentication not working"
- Verify NEXTAUTH_SECRET is set in frontend
- Check NEXTAUTH_URL is `https://daflegal.com` (we updated this!)
- Clear browser cookies and try again

### "Analytics not tracking"
- Wait 5-10 minutes for first data
- Check browser console for errors (F12)
- Verify measurement ID format is correct (`G-XXXXXXXXXX`)
- Test in incognito mode (avoid ad blockers)

---

## After Adding All Variables

### Test Everything:
```bash
# Run production test scripts
./test_production_env.sh
./test_production_flow.sh
```

### Check Deployment:
- Backend: https://daflegal-backend.onrender.com/health
- Frontend: https://daflegal.com
- API Docs: https://daflegal-backend.onrender.com/docs

### Monitor:
- Sentry: https://sentry.io (errors)
- Healthchecks: https://healthchecks.io (uptime)
- Analytics: https://analytics.google.com (users)
- Clarity: https://clarity.microsoft.com (sessions)

---

## 🎉 Success Criteria

You're done when:

- ✅ Backend health check returns 200
- ✅ Frontend loads without console errors
- ✅ Can signup/login successfully
- ✅ Sentry shows "Waiting for events"
- ✅ Analytics shows realtime users
- ✅ No errors in Render logs

**Estimated Time:** 20-30 minutes
**Production Score After:** 10/10 ⭐⭐⭐⭐⭐

---

## Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Sentry:** https://sentry.io
- **Healthchecks.io:** https://healthchecks.io
- **Google Analytics:** https://analytics.google.com
- **Microsoft Clarity:** https://clarity.microsoft.com
- **Cloudinary:** https://cloudinary.com
- **Stripe:** https://dashboard.stripe.com

---

**Ready to add these variables? Start with the 🔴 Critical ones first!**
