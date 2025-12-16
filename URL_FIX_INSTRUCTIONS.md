# 🌐 Fix: URLs Still Showing Render Subdomain

## What's Happening

You're seeing URLs like `https://daflegal-frontend.onrender.com/clauses` instead of `https://daflegal.com/clauses`

**Good news:** The code is correct! All links use relative paths.

**The issue:** Browser caching + Render deployment delay

---

## ✅ Solution - Follow These Steps

### Step 1: Check Render Deployment Status (2 min)

1. Go to: https://dashboard.render.com
2. Click: **daflegal-frontend** service
3. Check the "Events" tab
4. Look for: **"Deploy live"** status
5. **Wait** if it still says "Building" or "Deploying"

**Render takes 2-5 minutes to deploy after changing environment variables.**

---

### Step 2: Clear Browser Cache (1 min)

After Render shows "Deploy live":

**Option A: Hard Refresh (Easiest)**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Cache Completely**
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "Cached images and files"
3. Click "Clear data"

**Option C: Incognito/Private Window**
- Open an incognito/private window
- Visit: https://daflegal.com
- This bypasses all caching

---

### Step 3: Test the Fix (2 min)

1. Visit: **https://daflegal.com** (use your custom domain)
2. Sign in to your account
3. Navigate to different pages:
   - Dashboard
   - Clauses
   - Compare
   - Analyze
4. Check the URL bar - should show `daflegal.com` ✅

---

## 🔍 Why This Happened

### Browser/CDN Caching

Your browser cached the old site configuration when `NEXTAUTH_URL` was set to `daflegal-frontend.onrender.com`. This causes:
- Old session cookies with old domain
- Cached redirects pointing to old URLs
- Service workers with old configuration

### The Code is Correct

I checked the code - all navigation links use relative paths:
```tsx
<Link href="/clauses">Clauses</Link>  ✅ Correct
<Link href="/compare">Compare</Link>  ✅ Correct
```

Not:
```tsx
<Link href="https://daflegal-frontend.onrender.com/clauses">  ❌ Wrong
```

---

## 🎯 Expected Behavior After Fix

**Before:**
- Visit daflegal.com → redirects to daflegal-frontend.onrender.com
- All URLs show Render subdomain
- Navigation uses Render URLs

**After:**
- Visit daflegal.com → stays on daflegal.com ✅
- All URLs show daflegal.com ✅
- Navigation uses custom domain ✅

---

## 🐛 Troubleshooting

### Issue: Still seeing Render URLs after hard refresh

**Solution:**
1. Sign out completely
2. Clear all cookies for the site:
   - Chrome: Settings → Privacy → Cookies → See all site data → Search "daflegal" → Remove all
   - Firefox: Settings → Privacy → Cookies → Manage Data → Remove daflegal entries
3. Close all browser tabs with daflegal open
4. Open new incognito window
5. Visit https://daflegal.com

### Issue: Render deployment stuck

**Check:**
1. Render Dashboard → daflegal-frontend → Logs
2. Look for any errors in red
3. If stuck for >10 minutes, click "Manual Deploy" → "Clear build cache & deploy"

### Issue: Mixed domains (some pages work, some don't)

**This is normal during transition:**
- Old tabs/windows might still use old domain
- Close ALL daflegal tabs
- Open fresh window at https://daflegal.com

---

## ✅ Verification Checklist

After following all steps:

- [ ] Render shows "Deploy live"
- [ ] Cleared browser cache (hard refresh)
- [ ] Visited https://daflegal.com (custom domain)
- [ ] Signed in successfully
- [ ] Dashboard URL shows: `daflegal.com/dashboard` ✅
- [ ] Clicked "Clauses" - URL shows: `daflegal.com/clauses` ✅
- [ ] All navigation stays on daflegal.com ✅

---

## 📊 What We Fixed

**Environment Variable Changed:**
```
NEXTAUTH_URL = https://daflegal.com  ✅
(was: https://daflegal-frontend.onrender.com)
```

**What This Controls:**
- NextAuth session cookies domain
- OAuth callback URLs
- Authentication redirects
- All post-login navigation

**Code Status:**
- ✅ No hardcoded Render URLs found
- ✅ All navigation uses relative paths
- ✅ Configuration correct

---

## ⏱️ Timeline

1. **You changed NEXTAUTH_URL** → Render starts deploying
2. **2-5 minutes later** → Render deployment completes
3. **Clear browser cache** → Old URLs purged
4. **Visit daflegal.com** → Everything uses custom domain ✅

---

**Current Status:** Waiting for Render deployment + browser cache clear

**ETA:** ~5 minutes total from when you changed the environment variable

**Next:** Check Render deployment status, then hard refresh your browser
