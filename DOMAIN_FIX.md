# 🌐 Fix Dashboard Domain Issue

## Problem
Dashboard is using `https://daflegal-frontend.onrender.com/dashboard` instead of `https://daflegal.com/dashboard`

## Root Cause
The `NEXTAUTH_URL` environment variable in Render is set to the Render subdomain instead of your custom domain.

## Solution

### Update Frontend Environment Variables on Render

1. Go to: https://dashboard.render.com
2. Click: `daflegal-frontend` service
3. Click: "Environment" tab
4. Find and update: `NEXTAUTH_URL`

**Change from:**
```
NEXTAUTH_URL = https://daflegal-frontend.onrender.com
```

**Change to:**
```
NEXTAUTH_URL = https://daflegal.com
```

5. Click "Save Changes"
6. Wait for automatic redeploy (2-3 minutes)

## Verification

After redeployment:

1. Visit: https://daflegal.com/auth/signin
2. Sign in with your credentials
3. After successful login, check the URL bar
4. Should see: `https://daflegal.com/dashboard` ✅
5. Not: `https://daflegal-frontend.onrender.com/dashboard` ❌

## Additional Check

Also verify these environment variables use `daflegal.com`:

**Frontend:**
- `NEXTAUTH_URL` = https://daflegal.com ✅

**Backend:**
- `FRONTEND_URL` = https://daflegal.com ✅
- `ALLOWED_ORIGINS` = https://daflegal.com,http://localhost:3000 ✅

## Why This Matters

NextAuth uses `NEXTAUTH_URL` to:
- Generate authentication URLs
- Set callback URLs
- Configure session cookies
- Build redirect URLs

If it's set to the Render subdomain, all redirects will use that URL instead of your custom domain.

## Quick Fix

**Single command to remember:**

Go to Render → daflegal-frontend → Environment → Update `NEXTAUTH_URL` to `https://daflegal.com`

That's it!

---

**Time to fix:** 2 minutes
**Impact:** All URLs will use daflegal.com instead of Render subdomain
