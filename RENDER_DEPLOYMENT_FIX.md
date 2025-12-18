# Render Deployment Fix Guide

**Issue:** Multiple failed deployments on Render
**Date:** December 18, 2024
**Status:** Investigating

---

## ✅ Build Works Locally

Confirmed: `npm run build` succeeds locally with all Phase 2 components.

```
✓ Compiled successfully
✓ Generating static pages (32/32)
✓ Finalizing page optimization
```

All components import correctly:
- FeatureCard ✅
- RecentActivity ✅
- RecentDocuments ✅
- UsageWidget ✅
- QuickSearchBar ✅
- EmptyState ✅
- FABUpload ✅

---

## Common Render Deployment Issues

### 1. Missing Environment Variables ⚠️

**Critical:** NEXTAUTH_SECRET must be set in Render dashboard

**To Fix:**
1. Go to Render Dashboard: https://dashboard.render.com
2. Select `daflegal-frontend` service
3. Go to **Environment** tab
4. Add/verify these variables:

```bash
NEXTAUTH_SECRET=XNXrhujdylNPVfFYmxIRQhNTvV5tiwWxYH4tiBvH8qc=
NEXTAUTH_URL=https://daflegal.com
NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com
NODE_ENV=production
```

5. Click **Save Changes**
6. Trigger manual redeploy

### 2. Build Memory Limits

Render free/starter tiers have memory limits. Large Next.js builds can exceed them.

**To Fix:**
- Upgrade to paid plan (recommended)
- Or optimize build:

Add to `frontend/next.config.js`:
```javascript
module.exports = {
  // ... existing config
  swcMinify: true, // Use faster SWC compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Reduce memory usage
  experimental: {
    optimizeCss: true,
  },
}
```

### 3. Node Version Mismatch

**Check Node Version:**
```bash
node --version  # Should be 18.x or 20.x
```

**To Fix:**
Add `.node-version` file in frontend folder:
```bash
echo "20.10.0" > frontend/.node-version
```

Or add to `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 4. Build Timeout

Render has build timeouts. If build takes too long, it fails.

**To Fix:**
Optimize build command in `render.yaml`:
```yaml
buildCommand: npm ci --legacy-peer-deps && npm run build
```

Use `npm ci` instead of `npm install` (faster, more reliable for CI/CD).

### 5. TypeScript Errors (Strict Mode)

Production builds may enforce stricter TypeScript rules.

**To Fix:**
Check `frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": false,  // Or fix all strict mode errors
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

### 6. Image Optimization Issues

Next.js image optimization can fail on Render.

**To Fix:**
Add to `frontend/next.config.js`:
```javascript
module.exports = {
  images: {
    unoptimized: true,  // Disable image optimization
  }
}
```

---

## Immediate Action Steps

### Step 1: Check Render Logs
1. Go to https://dashboard.render.com
2. Click on `daflegal-frontend`
3. Click **Logs** tab
4. Look for specific error messages

**Common errors:**
- `NEXTAUTH_SECRET is not set` → Add env var
- `JavaScript heap out of memory` → Memory limit issue
- `npm ERR! code ELIFECYCLE` → Build command failed
- `Error: Cannot find module` → Dependency issue

### Step 2: Verify Environment Variables
Check these are set in Render:
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] NEXT_PUBLIC_API_URL
- [ ] NODE_ENV

### Step 3: Manual Redeploy
1. Go to Render Dashboard
2. Select `daflegal-frontend`
3. Click **Manual Deploy** → **Deploy latest commit**
4. Watch the logs for errors

### Step 4: If Still Failing
Try clearing build cache:
1. Render Dashboard → `daflegal-frontend`
2. Click **Settings**
3. Scroll to **Build Cache**
4. Click **Clear Build Cache**
5. Trigger new deployment

---

## Quick Fix Commands

### If You Need to Rollback Dashboard:
```bash
cd ~/daflegal/frontend/src/app/dashboard
cp page.original.backup page.tsx
git add page.tsx
git commit -m "rollback: Temporarily revert dashboard for debugging"
git push origin main
```

### To Test Build Locally:
```bash
cd ~/daflegal/frontend
rm -rf .next
npm run build
npm start
# Visit http://localhost:3000/dashboard
```

### To Check for TypeScript Errors:
```bash
cd ~/daflegal/frontend
npx tsc --noEmit
```

### To Check for ESLint Errors:
```bash
cd ~/daflegal/frontend
npm run lint
```

---

## Render.yaml Current Configuration

```yaml
- type: web
  name: daflegal-frontend
  env: node
  buildCommand: npm install && npm run build
  startCommand: npm start
  envVars:
    - key: NODE_ENV
      value: production
    - key: NEXT_PUBLIC_API_URL
      value: https://daflegal-backend.onrender.com
    - key: NEXTAUTH_URL
      value: https://daflegal.com
    - key: NEXTAUTH_SECRET
      sync: false  # ⚠️ Must be set in dashboard
  autoDeploy: true
  branch: main
  rootDir: frontend
```

**Note:** `sync: false` means the value must be manually set in Render Dashboard.

---

## Suggested Optimizations

### 1. Improve Build Command
Change in `render.yaml`:
```yaml
buildCommand: npm ci --prefer-offline && npm run build
```

### 2. Add Health Check
Change in `render.yaml`:
```yaml
healthCheckPath: /api/health
```

Then create `frontend/src/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

### 3. Add Build Status to README
Monitor: https://dashboard.render.com/

---

## Debug Checklist

When deployment fails, check:

1. **Render Logs**
   - [ ] Read full error message
   - [ ] Note where build fails (install/build/start)
   - [ ] Check for out of memory errors

2. **Environment Variables**
   - [ ] All required vars set
   - [ ] No typos in var names
   - [ ] Values are correct

3. **Local Build**
   - [ ] `npm run build` works locally
   - [ ] No TypeScript errors
   - [ ] No ESLint errors
   - [ ] All imports resolve

4. **Dependencies**
   - [ ] package.json has all deps
   - [ ] No version conflicts
   - [ ] package-lock.json committed

5. **Configuration**
   - [ ] render.yaml syntax correct
   - [ ] rootDir set to "frontend"
   - [ ] Node version compatible

---

## Next Steps

1. **Check Render Logs** for specific error
2. **Verify NEXTAUTH_SECRET** is set
3. **Try manual redeploy**
4. **If still failing**, share error logs

**Most likely cause:** Missing NEXTAUTH_SECRET environment variable

**Quick fix:**
1. Go to Render Dashboard
2. Add NEXTAUTH_SECRET env var
3. Redeploy

---

## Contact Support

If issues persist:
- Render Support: https://render.com/support
- Check status: https://status.render.com/
- Community: https://community.render.com/

---

**Status:** Build works locally ✅
**Action needed:** Check Render dashboard for specific error
