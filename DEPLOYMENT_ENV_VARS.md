# Environment Variables for Production Deployment

## Required Environment Variables

### Frontend (daflegal-frontend)

#### Essential
```bash
# Next.js
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com

# NextAuth (Required for authentication)
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

#### Authentication - Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Analytics (Optional but Recommended)
```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity (Optional)
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
```

#### Live Chat (Optional)
```bash
# Crisp Chat
NEXT_PUBLIC_CRISP_WEBSITE_ID=your-crisp-website-id
```

#### Email Marketing (Optional)
```bash
# Mailchimp or SendGrid
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-mailchimp-list-id

# OR SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Backend (daflegal-backend)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# Security
SECRET_KEY=<generate-with: openssl rand -hex 32>
```

---

## How to Generate Secrets

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### SECRET_KEY (Backend)
```bash
openssl rand -hex 32
```

---

## Setting Up in Render

### Method 1: Via Render Dashboard
1. Go to https://dashboard.render.com
2. Select your service (daflegal-frontend)
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable one by one

### Method 2: Via render.yaml (Recommended)
Update `render.yaml` with all environment variables (see updated file)

---

## Priority Setup Guide

### Phase 1: Minimum Viable (Required)
1. ✅ `NODE_ENV=production`
2. ✅ `NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com`
3. ✅ `NEXTAUTH_URL=https://daflegal-frontend.onrender.com`
4. ✅ `NEXTAUTH_SECRET=<generate>`

**Status:** App will work with authentication

### Phase 2: Analytics (Recommended)
5. `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

**How to get:**
- Go to https://analytics.google.com
- Create property for daflegal.com
- Get Measurement ID (starts with G-)

### Phase 3: Enhanced Features (Optional)
6. Google OAuth (for social login)
7. Crisp Chat (for live chat)
8. Email service (for newsletters)

---

## Google Analytics Setup

### Step 1: Create GA4 Property
1. Go to https://analytics.google.com
2. Click "Admin" (bottom left)
3. Click "Create Property"
4. Name: "DafLegal"
5. Select timezone and currency
6. Click "Next"

### Step 2: Create Data Stream
1. Select "Web"
2. Website URL: `https://daflegal.com` (or your domain)
3. Stream name: "DafLegal Website"
4. Click "Create stream"

### Step 3: Get Measurement ID
1. Copy the "Measurement ID" (format: G-XXXXXXXXXX)
2. Add to Render environment variables:
   - Key: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX`

---

## Google OAuth Setup (Optional)

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project: "DafLegal"
3. Enable "Google+ API"

### Step 2: Create OAuth Credentials
1. Go to "Credentials" tab
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "DafLegal Auth"
5. Authorized redirect URIs:
   - `https://daflegal-frontend.onrender.com/api/auth/callback/google`
   - `https://daflegal.com/api/auth/callback/google` (if custom domain)

### Step 3: Add to Environment Variables
```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

---

## Crisp Chat Setup (Optional)

### Step 1: Create Crisp Account
1. Go to https://crisp.chat
2. Sign up for free account
3. Create website: "DafLegal"

### Step 2: Get Website ID
1. Go to Settings → Website Settings
2. Copy "Website ID"
3. Add to environment variables:
   ```bash
   NEXT_PUBLIC_CRISP_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

---

## Email Marketing Setup (Optional)

### Option 1: Mailchimp
1. Go to https://mailchimp.com
2. Create account
3. Get API key from Account → Extras → API keys
4. Create audience and get List ID
5. Add to env vars:
   ```bash
   MAILCHIMP_API_KEY=xxxxx-us21
   MAILCHIMP_LIST_ID=xxxxxxxxxx
   ```

### Option 2: SendGrid
1. Go to https://sendgrid.com
2. Create account
3. Go to Settings → API Keys
4. Create API key with "Mail Send" permissions
5. Add to env vars:
   ```bash
   SENDGRID_API_KEY=SG.xxxxx
   ```

---

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads
- [ ] Sign in page works
- [ ] Sign up page works
- [ ] Google Analytics tracking (check Real-time in GA4)
- [ ] Live chat widget appears (if configured)
- [ ] Newsletter signup works (if configured)
- [ ] Blog posts load
- [ ] Pricing page works
- [ ] All features functional

---

## Troubleshooting

### Issue: "Invalid NEXTAUTH_URL"
**Solution:** Make sure NEXTAUTH_URL matches your actual deployment URL

### Issue: "Google OAuth not working"
**Solution:** Check redirect URIs in Google Cloud Console match exactly

### Issue: "Analytics not tracking"
**Solution:**
1. Check NEXT_PUBLIC_GA_MEASUREMENT_ID is set
2. View page source, search for "gtag"
3. Check GA4 DebugView for real-time events

### Issue: "Build fails"
**Solution:**
1. Check build logs in Render
2. Verify all dependencies are in package.json
3. Try building locally: `npm run build`

---

## Security Notes

⚠️ **NEVER commit secrets to git!**

✅ **DO:**
- Use environment variables
- Generate strong secrets (32+ characters)
- Rotate secrets periodically
- Use different secrets for production/staging

❌ **DON'T:**
- Commit .env files
- Share secrets in plain text
- Use weak/default secrets
- Reuse secrets across services

---

## Quick Start Commands

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate SECRET_KEY
openssl rand -hex 32

# Test build locally
cd frontend
npm run build

# Start production server locally
npm start
```

---

## Support

If you need help:
1. Check Render logs: `https://dashboard.render.com/web/YOUR_SERVICE/logs`
2. Check deployment status
3. Verify environment variables are set
4. Test locally first with production build

---

**Last Updated:** December 9, 2024
**All 12 features ready for production deployment!** 🚀
