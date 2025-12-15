# Environment Variables to Add to Render

## 🎯 Frontend Environment Variables

### Step-by-Step Instructions:

1. **Go to:** https://dashboard.render.com/
2. **Click:** `daflegal-frontend` service
3. **Click:** "Environment" tab (left sidebar)
4. **Click:** "Add Environment Variable" button
5. **Add these 3 variables one by one:**

---

### Variable 1: NEXTAUTH_SECRET

```
Key: NEXTAUTH_SECRET
Value: 1BxDIMULZJluI86r53qD/eIOIMYdQWwKYu2tAe4qOa0=
```

**What it does:** Encrypts session tokens and cookies (required for NextAuth)

---

### Variable 2: NEXTAUTH_URL

```
Key: NEXTAUTH_URL
Value: https://daflegal-frontend.onrender.com
```

**What it does:** Tells NextAuth where your app is deployed (required for redirects)

---

### Variable 3: NEXT_PUBLIC_BACKEND_URL

```
Key: NEXT_PUBLIC_BACKEND_URL
Value: https://daflegal-backend.onrender.com
```

**What it does:** Tells frontend where to find the backend API

**Note:** You may already have this variable - if so, just verify it's correct!

---

## 📋 Quick Copy-Paste Format

If Render allows bulk add, copy this:

```bash
NEXTAUTH_SECRET=1BxDIMULZJluI86r53qD/eIOIMYdQWwKYu2tAe4qOa0=
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://daflegal-backend.onrender.com
```

---

## ✅ After Adding Variables:

1. **Click:** "Save Changes" button (Render will automatically redeploy)
2. **Wait:** 3-5 minutes for deployment to complete
3. **Test:** Visit https://daflegal-frontend.onrender.com/auth/signup

---

## 🔍 Verify Variables Were Added:

After adding, you should see in the Environment tab:

```
NEXTAUTH_SECRET=******************* (hidden)
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://daflegal-backend.onrender.com
```

Plus all your existing variables:
- NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
- NEXT_PUBLIC_PAYMENT_PROVIDER
- NEXT_PUBLIC_PAYSTACK_PLAN_CODE_BASIC
- NEXT_PUBLIC_PAYSTACK_PLAN_CODE_PRO
- NEXT_PUBLIC_PAYSTACK_PLAN_CODE_ENTERPRISE
- (and any others)

---

## ⚠️ Important Notes:

1. **NEXTAUTH_SECRET** should be kept secret - never commit to Git
2. **NEXTAUTH_URL** must match your exact deployment URL (no trailing slash)
3. **NEXT_PUBLIC_BACKEND_URL** must match backend deployment URL (no trailing slash)
4. After adding, Render will automatically redeploy the frontend
5. Deployment takes about 3-5 minutes

---

## 🧪 Test After Deployment:

Once deployed, test authentication:

**Test 1: Registration**
- Visit: https://daflegal-frontend.onrender.com/auth/signup
- Sign up with a test account
- Should redirect to dashboard after signup

**Test 2: Login**
- Visit: https://daflegal-frontend.onrender.com/auth/signin
- Use credentials from Test 1
- Should sign in successfully

---

## 🐛 Troubleshooting:

### If signup/login doesn't work after adding variables:

1. **Check deployment completed:**
   - Render dashboard should show "Live" status
   - Check "Logs" tab for any errors

2. **Verify variables are set:**
   - Go to Environment tab
   - Confirm all 3 variables exist

3. **Hard refresh browser:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)
   - Or clear browser cache

4. **Check browser console:**
   - Press F12 → Console tab
   - Look for any error messages

---

## 📞 Need Help?

If you run into issues:
1. Check Render logs: Dashboard → daflegal-frontend → Logs
2. Check browser console: F12 → Console
3. Verify backend is healthy: https://daflegal-backend.onrender.com/health

---

**Ready to add the variables?** Let me know when you're done and I'll help you test!
