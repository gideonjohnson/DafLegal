# Render Environment Variables Setup Guide

## 🚨 CRITICAL: Backend is Not Starting

Your backend deployment is failing. Follow these steps to fix it:

## Step 1: Check Backend Logs in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **daflegal-backend** service
3. Click **Logs** tab
4. Look for error messages (usually in red)

**Common errors:**
- Missing environment variables
- Database connection failed
- OpenAI API key missing
- Port binding issues

## Step 2: Set Required Environment Variables

### Backend Service (daflegal-backend)

Go to: `daflegal-backend` → **Environment** → Add the following:

#### Required Variables (MUST SET):

```bash
# Generate this secret (copy from below)
SECRET_KEY=<USE_GENERATED_VALUE_BELOW>

# Your OpenAI API key
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Database (should auto-populate, verify it exists)
DATABASE_URL=postgresql://...

# Redis (should auto-populate, verify it exists)
REDIS_URL=redis://...

# Environment
ENVIRONMENT=production
```

#### Generated Secrets for Backend:

Run this command to generate SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Or use this pre-generated one:
```
SECRET_KEY=<GENERATE_NEW_ONE>
```

### Frontend Service (daflegal-frontend)

Go to: `daflegal-frontend` → **Environment** → Add the following:

#### Required Variables:

```bash
# Generate this secret (copy from below)
NEXTAUTH_SECRET=<USE_GENERATED_VALUE_BELOW>

# Backend URL (already set)
NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com

# Frontend URL (already set)
NEXTAUTH_URL=https://daflegal-frontend.onrender.com

# Node environment
NODE_ENV=production
```

#### Generated Secrets for Frontend:

Run this command to generate NEXTAUTH_SECRET:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Or use this pre-generated one:
```
NEXTAUTH_SECRET=<GENERATE_NEW_ONE>
```

## Step 3: Optional Services (Can Add Later)

### Cloudinary (File Storage)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Get from: [Cloudinary Dashboard](https://cloudinary.com/console)

### Stripe (Payments)
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
```

Get from: [Stripe Dashboard](https://dashboard.stripe.com)

### Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

Get from: [Google Cloud Console](https://console.cloud.google.com)

### Analytics (Optional)
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id
```

### Email Marketing (Optional)
```bash
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_LIST_ID=your-list-id
```

### Sentry (Error Tracking - Optional)
```bash
SENTRY_DSN=https://your-sentry-dsn
```

## Step 4: Trigger Manual Deploy

After adding environment variables:

1. Go to **daflegal-backend** service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait 3-5 minutes for build to complete
4. Check logs for success message

## Step 5: Verify Deployment

Test backend health:
```bash
curl https://daflegal-backend.onrender.com/health
```

Expected response:
```json
{"status": "healthy", "version": "1.0.0"}
```

Test frontend:
```bash
curl https://daflegal-frontend.onrender.com
```

Expected: HTML response with status 200

## 🔍 Troubleshooting

### Backend won't start

**Check logs for:**
- `ValidationError: OPENAI_API_KEY` → Add OpenAI API key
- `ValidationError: SECRET_KEY` → Add SECRET_KEY
- `Connection refused` → Database/Redis not ready
- `ModuleNotFoundError` → Build failed, check requirements.txt

**Solution:** Add missing env vars, then redeploy

### Frontend won't connect to backend

**Check:**
- `NEXT_PUBLIC_API_URL` is correct
- Backend is actually running (check /health)
- No CORS errors in browser console

### Database errors

**Check:**
- `DATABASE_URL` is set correctly
- PostgreSQL service is running
- Run migrations: Check backend logs for migration errors

### Redis errors

**Check:**
- `REDIS_URL` is set correctly
- Redis service is running
- Connection string format is correct

## 📝 Quick Checklist

Backend:
- [ ] SECRET_KEY set
- [ ] OPENAI_API_KEY set
- [ ] DATABASE_URL verified
- [ ] REDIS_URL verified
- [ ] Service deployed successfully
- [ ] /health endpoint returns 200

Frontend:
- [ ] NEXTAUTH_SECRET set
- [ ] NEXT_PUBLIC_API_URL correct
- [ ] NEXTAUTH_URL correct
- [ ] Service deployed successfully
- [ ] Homepage loads

## 🎯 Next Steps After Backend is Running

1. Test authentication (signup/login)
2. Test file upload
3. Test contract analysis
4. Add optional services (Cloudinary, Stripe, etc.)
5. Set up monitoring and alerts

---

**Last Updated:** December 13, 2025
**Status:** Backend needs environment variables
