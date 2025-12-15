# ⚡ Cloudinary Quick Setup - 15 Minutes

## Why Cloudinary?
Without Cloudinary, uploaded files disappear when the server restarts. Cloudinary provides:
- Persistent cloud storage
- Fast CDN delivery
- Free tier: 25GB storage + 25GB bandwidth

---

## Step 1: Create Account (3 min)

1. **Go to:** https://cloudinary.com/users/register_free
2. **Sign up** with email or Google
3. **Choose:** Free plan (no credit card needed)
4. **Verify** your email

---

## Step 2: Get Credentials (2 min)

After login, you'll land on the **Dashboard**. Look for the box that says **"Account Details"**:

```
Cloud Name: xxxxx-xxxxx
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWx
```

**📋 Copy these now! You'll need them next.**

---

## Step 3: Add to Render Backend (5 min)

1. **Go to:** https://dashboard.render.com
2. **Click:** `daflegal-backend` service
3. **Click:** `Environment` tab (in the left menu)
4. **Click:** `Add Environment Variable` button
5. **Add these 3 variables:**

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | (paste your Cloud Name) |
| `CLOUDINARY_API_KEY` | (paste your API Key) |
| `CLOUDINARY_API_SECRET` | (paste your API Secret) |

6. **Click:** `Save Changes` (bottom right)

**⏳ Wait 3-5 minutes** - Render will automatically redeploy your backend.

---

## Step 4: Verify Deployment (2 min)

Watch the logs to confirm redeploy is complete:

1. On Render, click **Logs** tab
2. Wait for: `"Application startup complete"` or similar message
3. Or check health: https://daflegal-backend.onrender.com/health

When you see the backend is healthy again, you're done!

---

## Step 5: Test Upload (3 min)

1. **Go to:** https://daflegal-frontend.onrender.com
2. **Sign up** or **Sign in**
3. **Upload** a test PDF contract
4. **Check Cloudinary:**
   - Go to: https://console.cloudinary.com/console/media_library
   - You should see your uploaded file!

---

## ✅ Success Checklist

- [ ] Created Cloudinary account
- [ ] Copied Cloud Name, API Key, API Secret
- [ ] Added 3 environment variables to Render
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy (3-5 min)
- [ ] Backend health check passes
- [ ] Uploaded test file
- [ ] File appears in Cloudinary dashboard

---

## 🐛 Troubleshooting

### "Can't find credentials on Cloudinary dashboard"
- Look for "Account Details" or "API Keys" section
- Should be visible immediately after login
- Try clicking "Settings" → "Access Keys"

### "Render not redeploying"
- Click "Manual Deploy" → "Deploy latest commit"
- Wait 3-5 minutes

### "File upload fails"
- Check Render logs for errors
- Verify all 3 variables are set correctly (no typos)
- Make sure no extra spaces in values

### "File not in Cloudinary"
- Go to Media Library: https://console.cloudinary.com/console/media_library
- Check the folder structure (may be in subfolders)
- Wait a minute and refresh

---

## 💰 Cost

**FREE FOREVER Plan:**
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

This is perfect for development and early production!

---

## 🎯 What's Next?

After Cloudinary works:

1. ✅ Cloudinary ← **You are here**
2. ⏭️ Stripe (30 min) - Accept payments
3. ⏭️ Google OAuth (20 min) - Social login
4. ⏭️ Analytics (25 min) - Track users

---

**Time to complete:** 15 minutes
**Difficulty:** Easy ⭐
**Priority:** 🔴 High (essential for production)

**Let's do this! 🚀**
