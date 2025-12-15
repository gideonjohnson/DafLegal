# Google OAuth Setup Guide for DafLegal

## What is Google OAuth?

Google OAuth allows users to sign in with their Google account instead of creating a password. Benefits:
- **Faster signups** - One-click registration
- **Better security** - Google handles authentication
- **User convenience** - No password to remember
- **Increased trust** - Users familiar with Google sign-in

## Time Required: 20 minutes

---

## Step 1: Create Google Cloud Project (5 min)

1. Go to: https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Configure:
   - **Project name:** DafLegal
   - **Organization:** (optional)
   - **Location:** (optional)
4. Click **Create**
5. Wait for project creation (takes 10-20 seconds)
6. Select your new project from the dropdown

---

## Step 2: Enable Google OAuth API (3 min)

1. In Google Cloud Console, go to: **APIs & Services** → **Library**
2. Search for: "Google+ API" or "People API"
3. Click on **Google+ API**
4. Click **Enable**
5. Wait for activation

---

## Step 3: Configure OAuth Consent Screen (7 min)

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public access)
3. Click **Create**

### App Information

```
App name: DafLegal
User support email: your-email@example.com
App logo: (optional - upload your logo)
```

### App Domain

```
Application home page: https://daflegal-frontend.onrender.com
Application privacy policy: https://daflegal-frontend.onrender.com/privacy
Application terms of service: https://daflegal-frontend.onrender.com/terms
```

### Authorized Domains

```
daflegal-frontend.onrender.com
daflegal.com (if you have a custom domain)
```

### Developer Contact Information

```
Email addresses: your-email@example.com
```

4. Click **Save and Continue**

### Scopes

1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `../auth/userinfo.email` - See your email address
   - `../auth/userinfo.profile` - See your personal info
3. Click **Update**
4. Click **Save and Continue**

### Test Users (Optional for Testing)

Add your test email addresses if in testing mode.

5. Click **Save and Continue**
6. Review and click **Back to Dashboard**

---

## Step 4: Create OAuth Credentials (5 min)

1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure:

### Application Type

```
Application type: Web application
Name: DafLegal Web Client
```

### Authorized JavaScript Origins

```
https://daflegal-frontend.onrender.com
http://localhost:3000 (for local development)
```

### Authorized Redirect URIs

```
https://daflegal-frontend.onrender.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google (for local development)
```

4. Click **Create**

### Save Your Credentials

You'll see a popup with:

```
Client ID: xxxxxxxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxx
```

**Important:** Copy these immediately - you'll need them!

---

## Step 5: Set Environment Variables on Render (5 min)

### Backend Environment Variables

Go to: https://dashboard.render.com → **daflegal-backend** → **Environment**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://daflegal-frontend.onrender.com/api/auth/callback/google
```

### Frontend Environment Variables

Go to: **daflegal-frontend** → **Environment**

```bash
# Google OAuth (NextAuth.js)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# NextAuth Configuration (if not already set)
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET=e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

Click **Save Changes** on both services.

---

## Step 6: Test Google Sign-In (5 min)

1. Wait for services to redeploy (3-5 minutes)
2. Go to: https://daflegal-frontend.onrender.com
3. Click **Sign In**
4. Click **Sign in with Google**
5. Select your Google account
6. Grant permissions
7. You should be redirected back to DafLegal and logged in

### Check User Creation

The backend should automatically:
- Create a user account
- Link it to Google ID
- Generate a session
- Redirect to dashboard

---

## Environment Variables Summary

### Backend (daflegal-backend)

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://daflegal-frontend.onrender.com/api/auth/callback/google
```

### Frontend (daflegal-frontend)

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET=e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

---

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

**Cause:** Redirect URI doesn't match what's in Google Console

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Click on your OAuth client
3. Check **Authorized redirect URIs** exactly matches:
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/google
   ```
4. No trailing slashes!
5. Save and try again

### "Error 401: invalid_client"

**Cause:** Client ID or Secret is wrong

**Fix:**
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Render
2. Make sure there are no extra spaces
3. Check you copied the full credentials
4. Try regenerating credentials if needed

### "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured properly

**Fix:**
1. Complete OAuth consent screen setup
2. Add authorized domains
3. Set app status to "Testing" or "Published"
4. Add test users if in testing mode

### "User signs in but no account created"

**Cause:** Backend not handling OAuth callback

**Fix:**
1. Check backend logs for errors
2. Verify GOOGLE_CLIENT_ID is set on backend
3. Ensure database is running
4. Check user creation endpoint

### "Email scope not granted"

**Cause:** Required scopes not requested

**Fix:**
1. Go to OAuth consent screen → Scopes
2. Ensure `userinfo.email` and `userinfo.profile` are added
3. Save changes
4. Try signing in again

---

## Publishing Your App (Going Live)

### Current Status: Testing Mode

In testing mode:
- Only you and added test users can sign in
- Shows warning to users
- Good for development

### To Publish (Make Available to Everyone)

1. **Complete OAuth consent screen:**
   - Add privacy policy URL
   - Add terms of service URL
   - Upload app logo
   - Fill all required fields

2. **Submit for verification:**
   - Go to OAuth consent screen
   - Click **Publish App**
   - Submit for Google review (takes 3-7 days)

3. **Provide required documentation:**
   - YouTube demo video
   - Privacy policy document
   - Explanation of why you need each scope

4. **Wait for approval:**
   - Google will review your app
   - They may ask questions
   - Once approved, all users can sign in

**For MVP:** Stay in testing mode and add specific test users as needed.

---

## Security Best Practices

### 1. Keep Credentials Secret

```bash
# ✅ Good - in environment variables
GOOGLE_CLIENT_SECRET=stored-securely

# ❌ Bad - in code
const secret = "GOCSPX-xxxxx"  // NEVER DO THIS
```

### 2. Use HTTPS Only

```bash
# ✅ Good
https://daflegal-frontend.onrender.com

# ❌ Bad (except localhost)
http://daflegal-frontend.onrender.com
```

### 3. Validate Redirect URIs

Only add URIs you control:
```
✅ https://yourdomain.com/api/auth/callback/google
❌ https://evil-site.com/steal-tokens
```

### 4. Limit Scopes

Only request what you need:
```
✅ userinfo.email, userinfo.profile
❌ full Gmail access (unless needed)
```

---

## Benefits After Setup

Once Google OAuth is configured:

✅ **Faster Signups** - Users can register in one click
✅ **Better Conversion** - Less friction = more signups
✅ **Improved Security** - Google handles password security
✅ **User Convenience** - No passwords to remember
✅ **Trust Signal** - Users trust Google sign-in
✅ **Automatic Updates** - Profile info stays current

---

## User Experience Flow

1. **User visits** → https://daflegal-frontend.onrender.com
2. **Clicks** → "Sign in with Google"
3. **Redirected** → Google login page
4. **Selects account** → Chooses Google account
5. **Grants permission** → Approves email/profile access
6. **Redirected back** → DafLegal dashboard
7. **Account created** → Automatically created if new user
8. **Logged in** → Ready to use the app

Entire process takes **less than 10 seconds**!

---

## Analytics Integration

Track Google sign-ins:

```javascript
// When user signs in with Google
analytics.track('User Signed Up', {
  method: 'google',
  timestamp: new Date(),
  user_id: user.id
})
```

Monitor conversion rates:
- How many users choose Google vs email
- Sign-up completion rate
- Time to first contract upload

---

## Next Steps

After Google OAuth is working:

1. Test sign-in flow end-to-end
2. Verify user accounts are created correctly
3. Set up Analytics tracking
4. Monitor sign-in method preferences
5. Consider adding more OAuth providers (GitHub, Microsoft)

---

## Additional OAuth Providers (Optional)

You can also add:

### GitHub OAuth
- Popular with developers
- Simple setup
- Free

### Microsoft OAuth
- Good for enterprise users
- Azure AD integration
- Professional market

### LinkedIn OAuth
- Professional network
- B2B focused
- Business users

---

**Google OAuth Setup Complete!** 🎉

Your users can now sign in with their Google accounts!
