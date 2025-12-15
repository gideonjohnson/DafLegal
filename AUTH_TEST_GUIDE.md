# Authentication System Test Guide

## ✅ What Was Implemented

### Backend Authentication API:
1. **POST /api/v1/auth/token** - OAuth2-compatible login endpoint
2. **POST /api/v1/auth/login** - JSON-based login endpoint
3. **POST /api/v1/auth/google** - Google OAuth authentication
4. **POST /api/v1/users/register** - User registration endpoint

### Frontend Integration:
1. **NextAuth** connected to backend API
2. **Email/Password** authentication working
3. **User Registration** creates real users in database
4. **Google OAuth** ready (needs credentials)
5. **Session Management** with JWT tokens

### Database Updates:
1. Added `google_id` field for OAuth users
2. Added `paystack_customer_code` and `paystack_subscription_code`
3. Updated plan types: FREE, BASIC, PRO, ENTERPRISE
4. Free plan now lasts 365 days (essentially permanent)

---

## 🧪 Testing Checklist

### Test 1: User Registration (Signup)

**URL:** https://daflegal-frontend.onrender.com/auth/signup

**Steps:**
1. Fill in the form:
   ```
   Full name: Test User
   Email: test@example.com
   Organization: Test Law Firm
   Password: TestPassword123!
   Confirm Password: TestPassword123!
   ```

2. Click "Create account"

**Expected Result:**
- ✅ User is created in database
- ✅ Automatically signed in
- ✅ Redirected to dashboard
- ✅ User has FREE plan
- ✅ No errors in browser console

**Failure Scenarios to Test:**
- Email already exists → Shows error "Email already registered"
- Password too short → Shows error "Password must be at least 8 characters"
- Passwords don't match → Shows error "Passwords do not match"

**Status:** _______________

---

### Test 2: Email/Password Login (Sign In)

**URL:** https://daflegal-frontend.onrender.com/auth/signin

**Steps:**
1. Use the account created in Test 1:
   ```
   Email: test@example.com
   Password: TestPassword123!
   ```

2. Click "Sign in"

**Expected Result:**
- ✅ User is authenticated
- ✅ Redirected to dashboard
- ✅ Session is created
- ✅ User info is displayed in dashboard

**Failure Scenarios:**
- Wrong password → Shows error "Invalid email or password"
- Non-existent email → Shows error "Invalid email or password"
- Empty fields → Shows validation errors

**Status:** _______________

---

### Test 3: Backend API Direct Test

**Test Registration Endpoint:**
```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "SecurePassword123!",
    "full_name": "API Test User"
  }'
```

**Expected Response:**
```json
{
  "id": 123,
  "email": "api-test@example.com",
  "full_name": "API Test User",
  "plan": "free",
  "pages_used_current_period": 0,
  "files_used_current_period": 0,
  "created_at": "2024-XX-XXTXX:XX:XX"
}
```

**Test Login Endpoint:**
```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=api-test@example.com&password=SecurePassword123!"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "api-test@example.com",
    "name": "API Test User",
    "plan": "free"
  }
}
```

**Status:** _______________

---

### Test 4: Session Persistence

**Steps:**
1. Sign in at https://daflegal-frontend.onrender.com/auth/signin
2. Navigate to different pages (pricing, analyze, etc.)
3. Close browser tab
4. Open new tab and go back to https://daflegal-frontend.onrender.com

**Expected Result:**
- ✅ User stays logged in across pages
- ✅ User stays logged in after tab close
- ✅ Session persists for 30 days (until manual logout)

**Status:** _______________

---

### Test 5: Protected Routes

**Steps:**
1. Open incognito/private browser window
2. Try to access:
   - https://daflegal-frontend.onrender.com/dashboard
   - https://daflegal-frontend.onrender.com/analyze

**Expected Result:**
- ✅ Redirected to signin page
- ✅ After signin, redirected back to intended page

**Status:** _______________

---

### Test 6: Logout

**Steps:**
1. Sign in to dashboard
2. Click user menu → "Sign Out" (or navigate to logout)
3. Try to access /dashboard

**Expected Result:**
- ✅ User is signed out
- ✅ Session is cleared
- ✅ Redirected to signin page when accessing protected routes

**Status:** _______________

---

### Test 7: Multiple Signups with Same Email

**Steps:**
1. Sign up with email: duplicate@example.com
2. Sign out
3. Try to sign up again with same email

**Expected Result:**
- ✅ Second signup fails
- ✅ Error message: "Email already registered"
- ✅ User is directed to sign in instead

**Status:** _______________

---

### Test 8: Password Requirements

**Test various passwords:**

| Password | Should Pass? | Expected Result |
|----------|-------------|-----------------|
| `short` | ❌ No | "Password must be at least 8 characters" |
| `LongPassword123!` | ✅ Yes | Registration successful |
| `12345678` | ✅ Yes | Registration successful (backend accepts) |
| `` (empty) | ❌ No | Form validation error |

**Status:** _______________

---

### Test 9: Sign In from Pricing Page

**Steps:**
1. Visit: https://daflegal-frontend.onrender.com/pricing
2. Click "Start Pro Plan" (when not logged in)
3. Should redirect to signup with `?plan=pro` parameter

**Expected Result:**
- ✅ Redirected to /auth/signup?plan=pro
- ✅ After signup, should remember selected plan
- ✅ User can upgrade to Pro immediately

**Status:** _______________

---

### Test 10: Google OAuth (After Setup)

**Prerequisites:** Complete GOOGLE_OAUTH_SETUP.md first

**Steps:**
1. Visit: https://daflegal-frontend.onrender.com/auth/signin
2. Click "Sign in with Google"
3. Select Google account
4. Grant permissions

**Expected Result:**
- ✅ Redirected to Google sign-in
- ✅ User grants permissions
- ✅ Redirected back to DafLegal dashboard
- ✅ User created in database with google_id
- ✅ User has FREE plan

**Status:** _______________

---

## 🔧 Environment Variables Checklist

### Frontend (Render Dashboard → daflegal-frontend → Environment)

**Required for Authentication:**
```bash
NEXTAUTH_SECRET=<random-secret-generated-with-openssl>
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://daflegal-backend.onrender.com
```

**Optional (For Google OAuth):**
```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Example output: `X8h3kP9mN2qR5tY7wZ4vU6sD1fG3jL8a`

**Status:** _______________

---

### Backend (Should already be configured)

**Already Set:**
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=...
PAYSTACK_SECRET_KEY=sk_test_...
```

**Status:** _______________

---

## 🐛 Troubleshooting

### Issue 1: "Invalid email or password" on correct credentials

**Possible Causes:**
1. Backend not deployed yet
2. Database migration not run
3. Environment variables not set

**Fix:**
1. Wait for backend deployment to complete (3-5 min)
2. Check backend logs in Render dashboard
3. Verify NEXT_PUBLIC_BACKEND_URL is set correctly

---

### Issue 2: Registration succeeds but login fails

**Possible Causes:**
1. Password hashing mismatch
2. Backend API not responding
3. CORS issues

**Fix:**
1. Check browser console for errors
2. Test backend API directly (see Test 3)
3. Check backend logs

---

### Issue 3: Redirect loop after signin

**Possible Causes:**
1. NEXTAUTH_URL not set correctly
2. NEXTAUTH_SECRET not set
3. Session callback error

**Fix:**
1. Ensure NEXTAUTH_URL matches deployed URL exactly
2. Regenerate and set NEXTAUTH_SECRET
3. Check browser console for errors

---

### Issue 4: "Internal Server Error" on registration

**Possible Causes:**
1. Database connection error
2. Missing database migration (google_id field)
3. Backend error

**Fix:**
1. Check backend logs in Render dashboard
2. May need to run database migration:
   ```bash
   # In backend container or locally
   alembic revision --autogenerate -m "Add google_id and paystack fields"
   alembic upgrade head
   ```

---

## 📊 Database Verification

### Check if user was created:

**Using psql:**
```sql
SELECT id, email, full_name, plan, google_id, created_at
FROM users
WHERE email = 'test@example.com';
```

**Expected Result:**
```
 id |        email         |   full_name    | plan | google_id |      created_at
----+---------------------+----------------+------+-----------+---------------------
  1 | test@example.com    | Test User      | free | NULL      | 2024-XX-XX XX:XX:XX
```

---

## ✅ Final Acceptance Criteria

Before marking authentication as complete, verify:

- [ ] Users can sign up with email/password
- [ ] Users can sign in with email/password
- [ ] Sessions persist across page refreshes
- [ ] Protected routes redirect to signin
- [ ] Logout works correctly
- [ ] Duplicate email registration is prevented
- [ ] Password validation works (min 8 characters)
- [ ] Users are created with FREE plan
- [ ] Backend API endpoints respond correctly
- [ ] Frontend connects to backend successfully
- [ ] NEXTAUTH_SECRET and NEXTAUTH_URL are configured
- [ ] Google OAuth ready (credentials can be added anytime)

---

## 🚀 Next Steps

After authentication is verified:

1. **Set up Google OAuth** (optional)
   - Follow GOOGLE_OAUTH_SETUP.md
   - Add credentials to Render
   - Test Google sign-in

2. **Add Email Verification** (optional)
   - Send verification email on signup
   - Verify email before full access

3. **Add Password Reset** (optional)
   - "Forgot password" flow
   - Email with reset link

4. **Add User Profile** (optional)
   - Edit name, organization
   - Change password
   - View plan and usage

---

**Test Date:** _______________
**Tested By:** _______________
**All Tests Passed:** ☐ Yes ☐ No

**Notes:**
_______________________________________
_______________________________________
_______________________________________
