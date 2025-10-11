# Deploy DafLegal to Railway - Complete Guide

## Step 1: Push Code to GitHub

```bash
# Navigate to project
cd /c/Users/Administrator/daflegal

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DafLegal MVP"

# Create GitHub repo at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/daflegal.git
git branch -M main
git push -u origin main
```

---

## Step 2: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repos

---

## Step 3: Create Services

### 3.1 Create Postgres Database

1. Click "New Project"
2. Click "+ New"
3. Select "Database" → "Add PostgreSQL"
4. Railway will provision a Postgres database
5. Copy the `DATABASE_URL` from the "Connect" tab

### 3.2 Create Redis

1. In the same project, click "+ New"
2. Select "Database" → "Add Redis"
3. Copy the `REDIS_URL` from the "Connect" tab

### 3.3 Deploy Backend

1. Click "+ New"
2. Select "GitHub Repo"
3. Choose `daflegal` repository
4. Railway will auto-detect the Dockerfile
5. Set the root directory to `backend/`

### 3.4 Deploy Worker (Celery)

1. Click "+ New"
2. Select "GitHub Repo" (same repo)
3. Choose `daflegal` repository again
4. Set the root directory to `backend/`
5. Override start command:
   ```
   celery -A app.workers.celery_app worker --loglevel=info
   ```

### 3.5 Deploy Frontend

1. Click "+ New"
2. Select "GitHub Repo"
3. Choose `daflegal` repository
4. Set root directory to `frontend/`
5. Railway auto-detects Next.js
6. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

---

## Step 4: Configure Environment Variables

### Backend Service Variables

Click on the Backend service → "Variables" tab → Add:

```bash
# Database (auto-filled by Railway if you link Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-filled by Railway if you link Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=daflegal-production

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_STARTER_PRICE_ID=price_starter_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_TEAM_PRICE_ID=price_team_id

# App
SECRET_KEY=generate-random-64-char-string
ENVIRONMENT=production

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn
```

### Worker Service Variables

Same as Backend (Railway can share variables across services)

### Frontend Service Variables

```bash
NEXT_PUBLIC_API_URL=https://daflegal-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
```

---

## Step 5: Link Services

1. Click on Backend service
2. Go to "Settings" → "Service Variables"
3. Click "Reference" next to Postgres and Redis
4. This auto-populates DATABASE_URL and REDIS_URL

Repeat for Worker service.

---

## Step 6: Deploy & Verify

### Backend

1. Railway automatically deploys on git push
2. Check logs: Backend service → "Deployments" → Latest deployment → "View Logs"
3. Wait for: `Application startup complete`
4. Get public URL: "Settings" → "Networking" → "Generate Domain"
5. Test: `curl https://your-backend.railway.app/health`

### Worker

1. Check logs for: `celery@worker ready`
2. Should show: `[tasks] . app.workers.tasks.process_contract`

### Frontend

1. Check logs for: `ready started server on 0.0.0.0:3000`
2. Generate domain: "Settings" → "Networking" → "Generate Domain"
3. Visit: `https://your-frontend.railway.app`

---

## Step 7: Configure Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-backend.railway.app/api/v1/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy webhook signing secret
6. Update Railway env var: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## Step 8: Test End-to-End

### 8.1 Test API

```bash
# Register user
curl -X POST https://your-backend.railway.app/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# Create API key (save the response)
curl -X POST https://your-backend.railway.app/api/v1/users/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"name": "Test Key"}'

# Upload contract
curl -X POST https://your-backend.railway.app/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_YOUR_KEY" \
  -F "file=@sample.pdf"
```

### 8.2 Test Frontend

1. Visit `https://your-frontend.railway.app`
2. Enter API key
3. Upload PDF contract
4. Verify analysis completes in 10-20 seconds

### 8.3 Test Stripe

1. Click upgrade to Starter plan
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Verify subscription in Stripe dashboard
5. Verify user upgraded in database

---

## Step 9: Custom Domain (Optional)

### Backend

1. Go to Backend service → "Settings" → "Networking"
2. Click "Add Custom Domain"
3. Enter: `api.daflegal.com`
4. Add CNAME record in your DNS:
   ```
   CNAME api.daflegal.com → your-backend.railway.app
   ```
5. Railway auto-provisions SSL certificate

### Frontend

1. Go to Frontend service → "Settings" → "Networking"
2. Click "Add Custom Domain"
3. Enter: `daflegal.com` and `www.daflegal.com`
4. Add DNS records:
   ```
   CNAME www.daflegal.com → your-frontend.railway.app
   ALIAS daflegal.com → your-frontend.railway.app
   ```

---

## Step 10: Monitoring

### Railway Dashboard

- Monitor CPU/Memory usage
- View real-time logs
- Track deployment history

### Sentry

1. Create project at https://sentry.io
2. Add `SENTRY_DSN` to Railway env vars
3. Errors will auto-report to Sentry

### Healthchecks

1. Create check at https://healthchecks.io
2. Add cron job in Railway:
   ```bash
   */5 * * * * curl https://hc-ping.com/YOUR_UUID && curl https://api.daflegal.com/health
   ```

---

## Cost Estimate on Railway

### Free Tier (Testing)
- $5/month credit
- Enough for: Backend + Worker + Postgres + Redis
- Good for: MVP testing, first 10-50 users

### Paid Tier (Production)
- **Starter**: ~$20-40/month
  - Backend: $10
  - Worker: $10
  - Postgres: $10
  - Redis: $5
- **Growth** (1,000 users): ~$100-150/month
- **Scale** (10,000 users): ~$500-800/month

**Note**: Railway charges for actual usage (CPU/RAM/Network)

---

## Troubleshooting

### Backend won't start
- Check logs for import errors
- Verify all env vars are set
- Check DATABASE_URL is valid

### Worker not processing
- Check worker logs for Celery errors
- Verify REDIS_URL is correct
- Ensure worker and backend share same REDIS_URL

### Frontend can't reach backend
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS settings in backend
- Test backend health endpoint

### Stripe webhooks failing
- Check webhook URL is correct (must be HTTPS)
- Verify STRIPE_WEBHOOK_SECRET matches
- Check webhook logs in Stripe dashboard

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Postgres database added
- [ ] Redis added
- [ ] Backend deployed
- [ ] Worker deployed
- [ ] Frontend deployed
- [ ] All environment variables set
- [ ] Services linked (DB, Redis)
- [ ] Health check passes
- [ ] Test contract upload works
- [ ] Stripe webhooks configured
- [ ] Custom domain added (optional)
- [ ] Sentry monitoring enabled
- [ ] SSL certificates active

---

## Post-Deployment

### Update Frontend API URL

After backend is deployed, update frontend env var:

```bash
# In Railway Frontend service → Variables
NEXT_PUBLIC_API_URL=https://your-actual-backend.railway.app
```

Then redeploy frontend.

---

## Auto-Deploy on Git Push

Railway automatically deploys when you push to `main` branch:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Railway automatically deploys all services
# Check deployment status in Railway dashboard
```

---

## Scaling Tips

### Horizontal Scaling

1. Backend: Railway auto-scales based on load
2. Workers: Add more worker services (click "+ New" → Same repo → Worker command)

### Vertical Scaling

1. Go to service → "Settings" → "Resources"
2. Increase CPU/RAM allocation

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **DafLegal Docs**: Check README.md

---

**You're live on Railway! 🚀**

Your DafLegal API is now accessible at:
- Backend: `https://your-backend.railway.app`
- Frontend: `https://your-frontend.railway.app`
- Docs: `https://your-backend.railway.app/docs`

Start getting users and building your business!
