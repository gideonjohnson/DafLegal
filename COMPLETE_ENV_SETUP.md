# 🔐 Complete Environment Variables Setup Guide

## Overview
This guide covers ALL environment variables needed for DafLegal to work properly.

---

## 🎯 Priority Setup (Required for Basic Functionality)

### Backend Environment Variables (Render Dashboard → daflegal-backend → Environment)

**1. Database Connection (Auto-configured by Render)**
```
DATABASE_URL = [Auto-filled by Render PostgreSQL]
```

**2. Secret Keys (CRITICAL - Required)**
```
SECRET_KEY = 8490cb8c1e9092484e0b653bf9d2f3208e07a6e3e73cf1da2f48ca484530c6c4
NEXTAUTH_SECRET = e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

**3. OpenAI API Key (Required for AI features)**
```
OPENAI_API_KEY = sk-proj-[GET FROM https://platform.openai.com/api-keys]
```

**4. Basic Configuration**
```
ENVIRONMENT = production
FRONTEND_URL = https://daflegal-frontend.onrender.com
BACKEND_URL = https://daflegal-backend.onrender.com
ALLOWED_ORIGINS = https://daflegal-frontend.onrender.com,http://localhost:3000
```

---

### Frontend Environment Variables (Render Dashboard → daflegal-frontend → Environment)

**1. NextAuth Configuration**
```
NEXTAUTH_URL = https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET = e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

**2. Backend Connection**
```
NEXT_PUBLIC_API_URL = https://daflegal-backend.onrender.com
```

**3. Build Configuration**
```
NODE_ENV = production
```

---

## 💳 Payment Integration (Paystack - TEST MODE)

### Backend - Paystack Test Keys

**Get these from:** https://dashboard.paystack.com/settings/developer

```
PAYSTACK_SECRET_KEY = sk_test_[YOUR_TEST_SECRET_KEY]
PAYSTACK_PUBLIC_KEY = pk_test_[YOUR_TEST_PUBLIC_KEY]
```

**Test Plan Codes (Create in Paystack Dashboard first):**
```
PAYSTACK_BASIC_PLAN_CODE = PLN_[your_basic_plan_code]
PAYSTACK_PRO_PLAN_CODE = PLN_[your_pro_plan_code]
PAYSTACK_ENTERPRISE_PLAN_CODE = PLN_[your_enterprise_plan_code]
```

### Frontend - Paystack Public Key

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = pk_test_[YOUR_TEST_PUBLIC_KEY]
```

**Test Card:**
```
Card: 4084 0840 8408 4081
CVV: Any 3 digits
Expiry: Any future date
OTP: 123456
```

---

## 🔐 Google OAuth (Optional - Social Login)

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project: "DafLegal"
3. Enable Google+ API

### Step 2: Create OAuth Credentials
1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```

### Backend Environment Variables
```
GOOGLE_CLIENT_ID = [YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-[YOUR_CLIENT_SECRET]
```

### Frontend Environment Variables
```
GOOGLE_CLIENT_ID = [YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-[YOUR_CLIENT_SECRET]
```

---

## 📊 Analytics (Optional - Recommended)

### Google Analytics 4

**Get GA4 Measurement ID:**
1. Go to https://analytics.google.com
2. Create property for daflegal.com
3. Get Measurement ID (format: G-XXXXXXXXXX)

**Frontend Environment Variable:**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX
```

### Microsoft Clarity

**Get Clarity Project ID:**
1. Go to https://clarity.microsoft.com
2. Create new project
3. Get Project ID

**Frontend Environment Variable:**
```
NEXT_PUBLIC_CLARITY_PROJECT_ID = [YOUR_CLARITY_ID]
```

---

## 📁 File Storage (Cloudinary - Optional)

**Get credentials from:** https://cloudinary.com/console

### Backend Environment Variables
```
CLOUDINARY_CLOUD_NAME = [your_cloud_name]
CLOUDINARY_API_KEY = [your_api_key]
CLOUDINARY_API_SECRET = [your_api_secret]
```

### Frontend Environment Variables
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = [your_cloud_name]
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = [your_upload_preset]
```

---

## 📧 Email (Optional - SendGrid)

**Get API key from:** https://app.sendgrid.com/settings/api_keys

### Backend Environment Variables
```
SENDGRID_API_KEY = SG.[YOUR_SENDGRID_API_KEY]
SENDGRID_FROM_EMAIL = noreply@daflegal.com
SENDGRID_FROM_NAME = DafLegal
```

---

## 🔍 Additional Services (Optional)

### Redis (Auto-configured by Render)
```
REDIS_URL = [Auto-filled by Render Redis]
```

### Sentry (Error Tracking)
```
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]
```

---

## 📋 Quick Setup Checklist

### Minimum Required (To Get Started):
- [ ] SECRET_KEY (backend)
- [ ] NEXTAUTH_SECRET (backend & frontend)
- [ ] NEXTAUTH_URL (frontend)
- [ ] NEXT_PUBLIC_API_URL (frontend)
- [ ] OPENAI_API_KEY (backend)

### For Payments:
- [ ] PAYSTACK_SECRET_KEY (backend)
- [ ] PAYSTACK_PUBLIC_KEY (backend)
- [ ] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (frontend)
- [ ] Paystack plan codes (backend)

### For Social Login:
- [ ] GOOGLE_CLIENT_ID (backend & frontend)
- [ ] GOOGLE_CLIENT_SECRET (backend & frontend)

### For Analytics:
- [ ] NEXT_PUBLIC_GA_MEASUREMENT_ID (frontend)
- [ ] NEXT_PUBLIC_CLARITY_PROJECT_ID (frontend)

---

## 🚀 How to Add Environment Variables on Render

1. **Go to:** https://dashboard.render.com
2. **Select your service** (backend or frontend)
3. **Click:** "Environment" tab
4. **Click:** "Add Environment Variable"
5. **Enter:** Key and Value
6. **Click:** "Save Changes"
7. **Wait:** for automatic redeploy (or click "Manual Deploy")

---

## 🧪 Testing After Setup

### Test Backend Health
```bash
curl https://daflegal-backend.onrender.com/health
```
Expected: `{"status":"healthy","version":"1.0.0"}`

### Test Frontend
Visit: https://daflegal-frontend.onrender.com
Should load without errors

### Test Signup
Visit: https://daflegal-frontend.onrender.com/auth/signup
Create account and verify redirect to dashboard

---

## 📞 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **OpenAI API Keys:** https://platform.openai.com/api-keys
- **Paystack Dashboard:** https://dashboard.paystack.com
- **Google Cloud Console:** https://console.cloud.google.com
- **Google Analytics:** https://analytics.google.com
- **Microsoft Clarity:** https://clarity.microsoft.com
- **Cloudinary Console:** https://cloudinary.com/console

---

## 🎯 Next Steps

1. **Add minimum required variables** (5 minutes)
2. **Run database migration** (see RUN_MIGRATION_NOW.md)
3. **Test basic functionality** (signup, login)
4. **Add payment integration** (Paystack)
5. **Add social login** (Google OAuth)
6. **Add analytics** (GA4 + Clarity)

---

**Questions?** Refer to the specific setup guides:
- `SETUP_PAYSTACK.md` - Paystack payment setup
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup
- `SETUP_ANALYTICS.md` - Analytics setup
- `SETUP_CLOUDINARY.md` - File storage setup
