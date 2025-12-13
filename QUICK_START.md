# ⚡ Quick Start - Get DafLegal Running NOW

## 🎯 Current Status

- ✅ **Frontend:** LIVE and working
- ❌ **Backend:** DOWN - needs environment variables
- 📦 All code deployed to Render
- 🔐 Secrets generated and ready

## 🚨 DO THIS NOW (5 minutes)

### Step 1: Open Render Dashboard

Go to: **https://dashboard.render.com**

### Step 2: Set Backend Environment Variables

1. Click on **`daflegal-backend`** service
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Add these TWO variables:

```bash
Key: SECRET_KEY
Value: 8490cb8c1e9092484e0b653bf9d2f3208e07a6e3e73cf1da2f48ca484530c6c4
```

```bash
Key: OPENAI_API_KEY
Value: <YOUR_OPENAI_API_KEY_HERE>
```

**Get OpenAI key from:** https://platform.openai.com/api-keys

5. Click **Save Changes**

### Step 3: Verify Auto-Populated Variables

Check that these exist (Render should have auto-populated them):
- ✅ DATABASE_URL
- ✅ REDIS_URL

If missing, contact Render support.

### Step 4: Deploy Backend

1. Still in `daflegal-backend` service
2. Click **Manual Deploy** button (top right)
3. Click **Deploy latest commit**
4. **Wait 3-5 minutes** for build to complete
5. Watch the logs - look for "Application startup complete"

### Step 5: Set Frontend Environment Variable

1. Click on **`daflegal-frontend`** service
2. Click **Environment** tab
3. Add this variable:

```bash
Key: NEXTAUTH_SECRET
Value: e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

4. Click **Save Changes**

**Note:** Frontend should auto-redeploy. If not, manually deploy.

### Step 6: Verify Everything Works

Run the test script:
```bash
./test_deployment.sh
```

Or manually test:
```bash
# Test backend
curl https://daflegal-backend.onrender.com/health

# Should return: {"status":"healthy","version":"1.0.0"}
```

Open frontend in browser:
```
https://daflegal-frontend.onrender.com
```

## ✅ Success Criteria

You'll know it's working when:
- ✅ Backend health endpoint returns `{"status":"healthy"}`
- ✅ Frontend loads without errors
- ✅ Can see the signup/login pages
- ✅ No console errors in browser

## 🎉 Next Steps After Basic Setup

Once backend is running:

1. **Test Authentication** (5 min)
   - Try creating an account
   - Try logging in

2. **Test File Upload** (5 min)
   - Upload a test PDF
   - Check if it processes

3. **Add Cloudinary** (30 min)
   - For persistent file storage
   - See `RENDER_ENV_SETUP.md`

4. **Add Stripe** (1 hour)
   - For payment processing
   - Use test mode first

## 🐛 If Something Goes Wrong

### Backend still won't start

1. Check logs in Render dashboard
2. Look for red error messages
3. Common fixes:
   - Wrong OpenAI API key format
   - Database not ready (wait 2 more minutes)
   - Missing environment variable

### Can't access OpenAI

- Verify key starts with `sk-proj-` or `sk-`
- Check you have credits: https://platform.openai.com/usage
- Verify key is active (not revoked)

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com`
- Check browser console for CORS errors
- Backend must be running first

## 📚 Full Documentation

- **Environment Setup:** `RENDER_ENV_SETUP.md`
- **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Secrets Reference:** `SECRETS.txt` (on your computer only)
- **Test Script:** `./test_deployment.sh`

## ⏱️ Time Estimates

- Basic setup (this guide): **5 minutes**
- Testing authentication: **5 minutes**
- Adding Cloudinary: **30 minutes**
- Adding Stripe: **1 hour**
- Full production setup: **3 hours**

## 🆘 Need Help?

1. Check `DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting
2. Check Render logs for specific errors
3. All secrets are in `SECRETS.txt` on your machine

---

**Last Updated:** December 13, 2025
**Priority:** HIGH - Backend is down, needs env vars ASAP
