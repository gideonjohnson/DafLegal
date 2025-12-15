# Login Error Troubleshooting Guide

## Common Login Errors & Solutions

### Error 1: "Invalid email or password"

**Cause:** No account exists yet

**Solution:** You need to create an account first!
1. Go to: https://daflegal-frontend.onrender.com/auth/signup
2. Create an account
3. Then try logging in

---

### Error 2: "An error occurred. Please try again."

**Cause:** Frontend can't reach backend

**Solution:** Check environment variables are set

**Verify in Render Dashboard:**
1. Go to: https://dashboard.render.com/
2. Click: `daflegal-frontend`
3. Click: "Environment" tab
4. **Verify these exist:**
   ```
   NEXTAUTH_SECRET=1BxDIMULZJluI86r53qD/eIOIMYdQWwKYu2tAe4qOa0=
   NEXTAUTH_URL=https://daflegal-frontend.onrender.com
   NEXT_PUBLIC_BACKEND_URL=https://daflegal-backend.onrender.com
   ```

If any are missing, add them and redeploy.

---

### Error 3: Network Error / Timeout

**Cause:** Backend not responding

**Solution:** Check backend is running
1. Visit: https://daflegal-backend.onrender.com/health
2. Should see: `{"status":"healthy","version":"1.0.0"}`
3. If not, backend may be sleeping - wait 30 seconds and try again

---

### Error 4: Page Redirects in Loop

**Cause:** NEXTAUTH_URL mismatch

**Solution:** Verify NEXTAUTH_URL exactly matches your frontend URL
- Should be: `https://daflegal-frontend.onrender.com`
- No trailing slash!

---

## 🔍 How to See the Actual Error

### Open Browser Console:
1. **Press F12** (or right-click → Inspect)
2. **Click "Console" tab**
3. **Try to sign in again**
4. **Look for red error messages**

**Common console errors:**

**"Failed to fetch"**
- Backend is down or URL is wrong
- Check NEXT_PUBLIC_BACKEND_URL

**"CORS error"**
- Backend needs to allow frontend domain
- Should already be configured

**"401 Unauthorized"**
- Wrong credentials (normal)
- Or account doesn't exist

---

## ✅ Step-by-Step Test

### Test 1: Create Account First

1. **Visit:** https://daflegal-frontend.onrender.com/auth/signup

2. **Fill in:**
   ```
   Name: Test User
   Email: mytest@example.com
   Organization: Test Firm
   Password: MySecurePass123
   Confirm: MySecurePass123
   ```

3. **Click:** "Create account"

4. **Expected:**
   - Success → Redirected to dashboard
   - Error → Tell me the exact error message

---

### Test 2: Sign In with Created Account

1. **Visit:** https://daflegal-frontend.onrender.com/auth/signin

2. **Use same credentials from Test 1:**
   ```
   Email: mytest@example.com
   Password: MySecurePass123
   ```

3. **Click:** "Sign in"

4. **Expected:**
   - Success → Redirected to dashboard
   - Error → Tell me the exact error

---

### Test 3: Check Browser Console

1. **Open console** (F12 → Console tab)
2. **Try signing in**
3. **Take screenshot of any red errors**

---

## 🐛 Quick Diagnostic Commands

**Check if backend is healthy:**
```bash
curl https://daflegal-backend.onrender.com/health
```

**Check if auth endpoint works:**
```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=test123"
```

Expected: `{"detail":"Incorrect email or password"}` (means endpoint is working)

---

## 📋 Information I Need to Help You:

Please tell me:
1. **Exact error message** you see (screenshot if possible)
2. **Are you trying to:**
   - [ ] Create new account (signup)
   - [ ] Log into existing account (signin)
3. **Any red errors in browser console?** (F12 → Console)
4. **What page are you on?**
   - /auth/signup
   - /auth/signin

---

## 🚀 Quick Fix: Try Demo Account

If you just want to test login quickly:

**Demo credentials** (should work immediately):
```
Email: demo@daflegal.com
Password: demo123
```

**BUT** this is a hardcoded demo account. For real testing, you need to create your own account via signup.

---

## ⚡ Most Likely Issue:

**You're trying to sign in without creating an account first!**

**Solution:**
1. Go to signup page: https://daflegal-frontend.onrender.com/auth/signup
2. Create an account
3. Then you can sign in

---

Let me know what error you're seeing and I'll help you fix it!
