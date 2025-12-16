# ✅ Backend Environment Variables Checklist

## Required Backend Environment Variables

Go to: **https://dashboard.render.com** → **daflegal-backend** → **Environment**

### ✅ Must Have (Required)

```
SECRET_KEY
8490cb8c1e9092484e0b653bf9d2f3208e07a6e3e73cf1da2f48ca484530c6c4
```

```
OPENAI_API_KEY
sk-proj-[YOUR_OPENAI_KEY_HERE]
```
Get from: https://platform.openai.com/api-keys

```
ENVIRONMENT
production
```

### ✅ Auto-Configured by Render (Check they exist)

```
DATABASE_URL
[Automatically filled by Render PostgreSQL]
```

```
REDIS_URL  
[Automatically filled by Render Redis]
```

---

## ❌ NOT Needed for Backend

**You do NOT need these on the backend:**
- ❌ FRONTEND_URL (not used - CORS is hardcoded in code)
- ❌ BACKEND_URL (not used)
- ❌ ALLOWED_ORIGINS (not used - CORS is hardcoded in code)
- ❌ NEXTAUTH_URL (that's frontend only)
- ❌ NEXTAUTH_SECRET (that's frontend only)

The CORS configuration is already set in the code to allow:
- https://daflegal.com ✅
- https://www.daflegal.com ✅
- http://localhost:3000 ✅
- https://daflegal-frontend.onrender.com ✅

---

## 🎯 Summary - Backend Needs Only:

**Required:**
1. SECRET_KEY ✅
2. OPENAI_API_KEY ✅
3. ENVIRONMENT ✅

**Auto-configured:**
4. DATABASE_URL ✅
5. REDIS_URL ✅

**Total:** 5 environment variables

That's it! No FRONTEND_URL needed.

---

## Optional (Add Later When Ready)

### For Paystack Payments:
```
PAYSTACK_SECRET_KEY = sk_test_[YOUR_KEY]
PAYSTACK_PUBLIC_KEY = pk_test_[YOUR_KEY]
PAYSTACK_BASIC_PLAN_CODE = PLN_[CODE]
PAYSTACK_PRO_PLAN_CODE = PLN_[CODE]
PAYSTACK_ENTERPRISE_PLAN_CODE = PLN_[CODE]
```

### For Google OAuth:
```
GOOGLE_CLIENT_ID = [YOUR_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-[YOUR_SECRET]
```

### For File Storage (Cloudinary):
```
CLOUDINARY_CLOUD_NAME = [your_cloud]
CLOUDINARY_API_KEY = [your_key]
CLOUDINARY_API_SECRET = [your_secret]
```

---

## ✅ Frontend Environment Variables

Go to: **https://dashboard.render.com** → **daflegal-frontend** → **Environment**

### Required:

```
NEXTAUTH_URL
https://daflegal.com
```
⚠️ **IMPORTANT:** Use `daflegal.com` NOT `daflegal-frontend.onrender.com`

```
NEXTAUTH_SECRET
e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

```
NEXT_PUBLIC_API_URL
https://daflegal-backend.onrender.com
```

```
NODE_ENV
production
```

---

## 🎯 Quick Fix for Domain Issue

**Frontend only - change this:**

```
NEXTAUTH_URL = https://daflegal.com
```

(Change from `daflegal-frontend.onrender.com` to `daflegal.com`)

After changing:
1. Click "Save Changes"
2. Wait 2-3 minutes for redeploy
3. Test: https://daflegal.com/auth/signin

---

**That's all you need!** 

Backend: 5 variables (3 required + 2 auto-configured)  
Frontend: 4 variables (all required)
