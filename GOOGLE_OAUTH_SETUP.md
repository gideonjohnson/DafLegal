# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project (5 min)

1. **Go to:** https://console.cloud.google.com/
2. **Click:** "Select a project" → "New Project"
3. **Enter:**
   - Project name: `DafLegal`
   - Click "Create"

---

## Step 2: Configure OAuth Consent Screen (5 min)

1. **In Google Cloud Console:**
   - Navigate to: **APIs & Services** → **OAuth consent screen**

2. **Select User Type:**
   - Choose: **External**
   - Click "Create"

3. **Fill in App Information:**
   ```
   App name: DafLegal
   User support email: your-email@example.com
   Developer contact email: your-email@example.com
   ```

4. **App Domain (Optional for testing):**
   ```
   Application home page: https://daflegal.com
   Privacy policy: https://daflegal.com/privacy
   Terms of service: https://daflegal.com/terms
   ```

5. **Click:** Save and Continue

6. **Scopes:**
   - Click "Add or Remove Scopes"
   - Select:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click "Update" → "Save and Continue"

7. **Test Users (For development):**
   - Add your email and any test users
   - Click "Save and Continue"

8. **Summary:**
   - Review and click "Back to Dashboard"

---

## Step 3: Create OAuth Credentials (5 min)

1. **In Google Cloud Console:**
   - Navigate to: **APIs & Services** → **Credentials**

2. **Create Credentials:**
   - Click: **+ Create Credentials** → **OAuth client ID**

3. **Configure OAuth Client:**
   - Application type: **Web application**
   - Name: `DafLegal Web Client`

4. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://daflegal-frontend.onrender.com
   https://daflegal.com
   ```

5. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://daflegal-frontend.onrender.com/api/auth/callback/google
   https://daflegal.com/api/auth/callback/google
   ```

6. **Click:** Create

7. **Copy Credentials:**
   - ✅ Client ID: `XXXXXXXXXXXX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - ✅ Client Secret: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

   **⚠️ IMPORTANT:** Keep these secret! Never commit to Git!

---

## Step 4: Add Environment Variables to Render (5 min)

### Frontend Environment Variables

**Go to:** https://dashboard.render.com → daflegal-frontend → Environment

**Add these variables:**

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://daflegal-backend.onrender.com
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Click:** Save Changes

---

## Step 5: Local Development Setup (Optional)

Create `.env.local` in `frontend/` directory:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**⚠️ DO NOT commit `.env.local` to Git!**

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## Step 6: Test Google OAuth (5 min)

### Test in Production:

1. **Visit:** https://daflegal-frontend.onrender.com/auth/signin

2. **Click:** "Sign in with Google" button

3. **Expected Flow:**
   - Redirects to Google sign-in page
   - Select your Google account
   - Grant permissions (email, profile)
   - Redirects back to DafLegal dashboard
   - User is signed in!

4. **Check User in Database:**
   - User should be created with:
     - Email from Google
     - Name from Google
     - `google_id` populated
     - Plan: `free`
     - No password (OAuth users)

### Test Locally:

1. **Start backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit:** http://localhost:3000/auth/signin

4. **Test Google sign-in**

---

## Troubleshooting

### Issue 1: "redirect_uri_mismatch" Error

**Problem:** Google shows error about redirect URI not matching

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Ensure redirect URI exactly matches:
   ```
   https://daflegal-frontend.onrender.com/api/auth/callback/google
   ```
4. No trailing slash, exact match required

---

### Issue 2: "Access blocked: This app hasn't been verified"

**Problem:** Google shows warning about unverified app

**Fix for Development:**
1. This is normal for apps in testing mode
2. Click "Advanced" → "Go to DafLegal (unsafe)"
3. This only shows for external users

**Fix for Production:**
1. Submit app for verification (if > 100 users)
2. Or keep in testing mode (up to 100 test users)

---

### Issue 3: Sign-in Succeeds But Redirects to Error Page

**Problem:** Google auth works but shows error page

**Possible Causes:**
1. `NEXTAUTH_URL` not set correctly
2. `NEXTAUTH_SECRET` not set
3. Backend not receiving user data

**Fix:**
1. Check all environment variables are set in Render
2. Redeploy frontend after adding variables
3. Check browser console for errors

---

### Issue 4: "Error: Invalid provider" on Sign-in Page

**Problem:** Google button doesn't work

**Fix:**
1. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Redeploy frontend
3. Clear browser cache
4. Check NextAuth configuration in `frontend/src/lib/auth.ts`

---

## Security Best Practices

### ✅ DO:
- Keep client secrets in environment variables only
- Use HTTPS in production (already configured on Render)
- Set proper redirect URIs (exact match)
- Rotate secrets periodically
- Use different credentials for dev/staging/prod

### ❌ DON'T:
- Commit secrets to Git
- Share secrets in chat/email
- Use production credentials in development
- Allow wildcard redirect URIs

---

## Additional Configuration (Optional)

### Add More OAuth Providers:

NextAuth supports many providers:
- GitHub
- Microsoft
- Facebook
- Apple
- LinkedIn

See: https://next-auth.js.org/providers/

### Custom Sign-in Page:

Already configured at `/auth/signin`

### Session Management:

- JWT strategy (stateless)
- 30-day expiration
- Auto-refresh on activity

---

## ✅ Final Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client credentials
- [ ] Copied Client ID and Client Secret
- [ ] Added environment variables to Render (frontend)
- [ ] Deployed frontend
- [ ] Tested Google sign-in flow
- [ ] Verified user created in database
- [ ] Confirmed redirect to dashboard works

---

**Setup Time:** ~25 minutes
**Difficulty:** Medium ⭐⭐⭐

**Next Steps:**
1. Set up Email/Password authentication (already done!)
2. Test both sign-in methods
3. Add email verification (optional)
4. Set up password reset flow
