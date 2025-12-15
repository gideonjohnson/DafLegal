# 🔐 Social Login Setup Guide

Enable one-click signup/login with Google, Facebook, and X (Twitter).

**Note on Instagram:** Instagram doesn't have direct OAuth. Users sign in with Facebook (Meta owns both), and Instagram data can be accessed through Facebook Login if needed.

---

## 🎯 Quick Overview

You need to get OAuth credentials from each platform:
- **Google** → Google Cloud Console
- **Facebook** → Meta for Developers
- **X (Twitter)** → X Developer Portal

Then add them to Render environment variables.

---

## 1️⃣ Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Name: `DafLegal`
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click it → Click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** → Click **"Create"**
3. Fill in:
   - **App name:** DafLegal
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **"Save and Continue"**
5. Skip "Scopes" → Click **"Save and Continue"**
6. Add test users (optional) → Click **"Save and Continue"**

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `DafLegal Web`
5. **Authorized JavaScript origins:**
   ```
   https://daflegal-frontend.onrender.com
   https://daflegal.com
   ```
6. **Authorized redirect URIs:**
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/google
   https://daflegal.com/api/auth/callback/google
   ```
7. Click **"Create"**

### Step 5: Copy Credentials

You'll see a modal with:
- **Client ID:** `xxx.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-xxx`

**Save these!** You'll add them to Render.

---

## 2️⃣ Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to: https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Consumer"** → Click **"Next"**
4. Fill in:
   - **App name:** DafLegal
   - **App contact email:** Your email
5. Click **"Create App"**

### Step 2: Add Facebook Login

1. In your app dashboard, find **"Facebook Login"**
2. Click **"Set Up"**
3. Choose **"Web"**
4. Site URL: `https://daflegal-frontend.onrender.com`
5. Click **"Save"** → **"Continue"**

### Step 3: Configure OAuth Settings

1. Go to **"Facebook Login"** → **"Settings"** (left sidebar)
2. **Valid OAuth Redirect URIs:**
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/facebook
   https://daflegal.com/api/auth/callback/facebook
   ```
3. Click **"Save Changes"**

### Step 4: Get App Credentials

1. Go to **"Settings"** → **"Basic"**
2. You'll see:
   - **App ID:** `123456789012345`
   - **App Secret:** Click **"Show"** → Copy it

**Save these!** You'll add them to Render.

### Step 5: Make App Live (Optional - Later)

For now, your app is in "Development Mode" - only you and test users can use it.

When ready to launch:
1. Go to **"Settings"** → **"Basic"**
2. Switch **"App Mode"** from Development to Live
3. Provide required info (Privacy Policy URL, etc.)

---

## 3️⃣ X (Twitter) OAuth Setup

### Step 1: Apply for Developer Account

1. Go to: https://developer.twitter.com/
2. Click **"Sign in"** with your Twitter/X account
3. Click **"Apply"** for developer access
4. Fill in the application:
   - **Use case:** Building a legal tech SaaS platform
   - **Will you make Twitter content available to government?** No
5. Submit and wait for approval (usually instant to 1 day)

### Step 2: Create App

1. Once approved, go to **Developer Portal**
2. Click **"Projects & Apps"** → **"Create App"**
3. App name: `DafLegal`
4. Click **"Complete"**

### Step 3: Configure App Settings

1. Click your app name → **"Settings"**
2. **App permissions:** Read (default is fine)
3. **Type of App:** Web App
4. **Callback URLs / Redirect URLs:**
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/twitter
   https://daflegal.com/api/auth/callback/twitter
   ```
5. **Website URL:** `https://daflegal.com`
6. Click **"Save"**

### Step 4: Enable OAuth 2.0

1. Go to **"User authentication settings"**
2. Click **"Set up"**
3. **App permissions:** Read
4. **Type of App:** Web App
5. **Callback URI:**
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/twitter
   ```
6. **Website URL:** `https://daflegal.com`
7. Click **"Save"**

### Step 5: Get Credentials

1. Go to **"Keys and tokens"** tab
2. You'll see:
   - **API Key:** (This is your Client ID)
   - **API Key Secret:** (This is your Client Secret)
3. Also generate **OAuth 2.0 Client ID** and **Client Secret**

**Save these!** Use the OAuth 2.0 credentials for NextAuth.

---

## 4️⃣ Add Credentials to Render

Now add all credentials to your Render frontend service:

### Go to Render Dashboard

1. Visit: https://dashboard.render.com/
2. Click **daflegal-frontend**
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**

### Add These Variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Facebook OAuth
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=xxx

# Twitter/X OAuth (use OAuth 2.0 credentials)
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx
```

### Save and Deploy

1. Click **"Save Changes"**
2. Render will automatically redeploy (takes 3-5 minutes)
3. Wait for "Live" status

---

## 5️⃣ Test Social Login

Once deployed, test each provider:

### Test Google Login

1. Go to: https://daflegal-frontend.onrender.com/auth/signup
2. Click **"Continue with Google"**
3. Choose your Google account
4. Should redirect to dashboard

### Test Facebook Login

1. Go to: https://daflegal-frontend.onrender.com/auth/signup
2. Click **"Continue with Facebook"**
3. Log in with Facebook
4. Should redirect to dashboard

### Test X Login

1. Go to: https://daflegal-frontend.onrender.com/auth/signup
2. Click **"Continue with X"**
3. Authorize the app
4. Should redirect to dashboard

---

## 🐛 Troubleshooting

### Error: "Redirect URI mismatch"

**Solution:** Check that redirect URIs match EXACTLY:
- Render: `https://daflegal-frontend.onrender.com/api/auth/callback/[provider]`
- Production: `https://daflegal.com/api/auth/callback/[provider]`

### Error: "App not approved" (Facebook)

**Solution:** Facebook app is in Development Mode. Add yourself as a test user:
1. **Roles** → **Test Users** → Add your Facebook account

### Error: "Invalid Client" (Twitter)

**Solution:** Make sure you're using **OAuth 2.0** credentials, not OAuth 1.0a

### Social login button doesn't work

**Check:**
1. Environment variables are set in Render
2. Render deployment completed successfully
3. No console errors (F12 → Console)

---

## 📊 What Happens When Users Sign In

When a user clicks a social login button:

1. **Redirects** to Google/Facebook/Twitter
2. **User authorizes** DafLegal
3. **Redirects back** to your app with user info
4. **Backend creates** or finds user account
5. **Signs user in** and redirects to dashboard

All user data (email, name, profile pic) is automatically fetched.

---

## 🎯 Priority Order

**Recommended setup order:**

1. **Google** (15 min) - Most users prefer Google
2. **Facebook** (15 min) - Second most popular
3. **X/Twitter** (20 min) - Developer approval needed

Total time: ~50 minutes

---

## 📝 About Instagram

Instagram doesn't provide separate OAuth. Users sign in with **Facebook Login**, which gives access to Instagram data if needed.

If you specifically need Instagram data:
1. Use Facebook Login (already set up above)
2. Request `instagram_basic` permission in Facebook app
3. User will authorize both Facebook and Instagram

For now, Facebook Login covers Instagram users.

---

## ✅ Checklist

- [ ] Google OAuth credentials obtained
- [ ] Facebook OAuth credentials obtained
- [ ] X OAuth credentials obtained
- [ ] All credentials added to Render
- [ ] Frontend redeployed successfully
- [ ] Tested Google login
- [ ] Tested Facebook login
- [ ] Tested X login

---

## 🚀 Next Steps After Setup

Once social login works:

1. **Switch to production URLs** when you move to daflegal.com
2. **Update redirect URIs** in all platforms
3. **Make Facebook app Live** (remove Development Mode)
4. **Add Privacy Policy** (required by Facebook/Google)
5. **Add Terms of Service** (required by most platforms)

---

**Need help?** Check the provider's documentation:
- Google: https://console.cloud.google.com/
- Facebook: https://developers.facebook.com/
- Twitter: https://developer.twitter.com/

---

**Ready to start?** Begin with Google OAuth (easiest and fastest!)
