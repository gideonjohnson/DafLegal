# Deploy DafLegal to Render - Complete Guide

## Overview

This guide walks you through deploying DafLegal to Render.com with:
- **Backend API** (FastAPI + Celery worker)
- **Frontend** (Next.js)
- **PostgreSQL** database
- **Redis** cache/queue
- **Custom domain** (optional)

**Total time:** ~60-90 minutes
**Cost:** ~$50-100/month for production tier

---

## Prerequisites

### Required Accounts
1. **GitHub** - Code repository (already done ✅)
2. **Render** - Hosting platform (free to start)
3. **AWS** - S3 bucket for file storage
4. **Stripe** - Payment processing
5. **OpenAI** - API key (already have ✅)

### Required Tools
- Git (installed ✅)
- Web browser
- Text editor

---

## Step 1: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended) or email
4. Verify your email address
5. Complete onboarding (choose "Deploy from Git")

---

## Step 2: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   ```
   Name: daflegal-db
   Database: daflegal
   User: daflegal
   Region: Oregon (US West) or nearest to your users
   PostgreSQL Version: 16
   Plan: Starter ($7/month) or Free (development only)
   ```
3. Click **"Create Database"**
4. Wait 2-3 minutes for provisioning
5. Copy the **Internal Database URL** (starts with `postgresql://`)
   - Format: `postgresql://user:password@host/database`
   - Save this for later!

---

## Step 3: Create Redis Instance

1. Click **"New +"** → **"Redis"**
2. Configure Redis:
   ```
   Name: daflegal-redis
   Region: Same as your database (Oregon)
   Plan: Starter ($7/month) or Free (development only)
   Maxmemory Policy: allkeys-lru (recommended)
   ```
3. Click **"Create Redis"**
4. Wait 1-2 minutes for provisioning
5. Copy the **Internal Redis URL** (starts with `redis://`)
   - Format: `redis://red-xxx:6379`
   - Save this for later!

---

## Step 4: Set Up AWS S3 Bucket

### 4.1 Create S3 Bucket

1. Go to https://console.aws.amazon.com/s3
2. Click **"Create bucket"**
3. Configure:
   ```
   Bucket name: daflegal-production-contracts
   Region: us-east-1 (or nearest to Render region)
   Block Public Access: Keep all blocked ✅
   Versioning: Enable (recommended)
   Encryption: Enable (SSE-S3)
   ```
4. Click **"Create bucket"**

### 4.2 Create IAM User

1. Go to https://console.aws.amazon.com/iam
2. Click **"Users"** → **"Add users"**
3. User name: `daflegal-app`
4. Select **"Access key - Programmatic access"**
5. Click **"Next: Permissions"**
6. Click **"Attach policies directly"**
7. Select **"AmazonS3FullAccess"** (or create custom policy)
8. Click **"Next"** → **"Create user"**
9. **SAVE THESE CREDENTIALS** (only shown once):
   ```
   AWS_ACCESS_KEY_ID: AKIA...
   AWS_SECRET_ACCESS_KEY: abcd1234...
   ```

### 4.3 Configure CORS (for direct uploads)

1. Go to your S3 bucket → **"Permissions"** → **"CORS"**
2. Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT"],
       "AllowedOrigins": ["https://your-frontend.onrender.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Click **"Save changes"**

---

## Step 5: Set Up Stripe

### 5.1 Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Complete registration
3. Verify email and business info

### 5.2 Create Products & Prices

1. Go to **"Products"** → **"Add product"**

**Product 1: Starter**
```
Name: Starter Plan
Description: Perfect for small firms
Pricing: $19/month (recurring)
```
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

**Product 2: Pro**
```
Name: Pro Plan
Description: For growing practices
Pricing: $49/month (recurring)
```
- Copy the **Price ID**

**Product 3: Team**
```
Name: Team Plan
Description: For larger organizations
Pricing: $99/month (recurring)
```
- Copy the **Price ID**

### 5.3 Get API Keys

1. Go to **"Developers"** → **"API keys"**
2. Copy these keys:
   ```
   Publishable key: pk_test_... (for testing) or pk_live_... (production)
   Secret key: sk_test_... (for testing) or sk_live_... (production)
   ```
3. **For production:** Toggle from "Test mode" to "Live mode" (top right)

---

## Step 6: Deploy Backend Service

### 6.1 Create Backend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect account"** → Authorize GitHub
3. Select repository: **daflegal**
4. Configure service:
   ```
   Name: daflegal-backend
   Region: Oregon (same as database)
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Instance Type: Starter ($7/month) or higher
   ```

### 6.2 Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```bash
# Database (from Step 2)
DATABASE_URL=postgresql://user:password@host/database

# Redis (from Step 3)
REDIS_URL=redis://red-xxx:6379

# Security
SECRET_KEY=<generate-with-command-below>
ENVIRONMENT=production

# OpenAI
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# AWS S3 (from Step 4)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abcd1234...
AWS_REGION=us-east-1
S3_BUCKET_NAME=daflegal-production-contracts

# Stripe (from Step 5)
STRIPE_SECRET_KEY=sk_live_YOUR-KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR-SECRET (add later)
STRIPE_STARTER_PRICE_ID=price_starter_id
STRIPE_PRO_PRICE_ID=price_pro_id
STRIPE_TEAM_PRICE_ID=price_team_id

# API Settings
API_V1_PREFIX=/api/v1
PROJECT_NAME=DafLegal API
VERSION=1.0.0

# Optional: Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 6.3 Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Build Docker image from `backend/Dockerfile`
   - Deploy container
   - Assign public URL: `https://daflegal-backend.onrender.com`
3. Wait 5-10 minutes for first deploy
4. Monitor logs: Click service → **"Logs"** tab

### 6.4 Verify Backend

1. Once deployed, click the service URL
2. Test health endpoint:
   ```
   https://daflegal-backend.onrender.com/health
   ```
3. Should return:
   ```json
   {
     "status": "healthy",
     "version": "1.0.0",
     "environment": "production"
   }
   ```
4. Check API docs:
   ```
   https://daflegal-backend.onrender.com/docs
   ```

---

## Step 7: Deploy Celery Worker

### 7.1 Create Background Worker Service

1. Click **"New +"** → **"Background Worker"**
2. Select repository: **daflegal**
3. Configure:
   ```
   Name: daflegal-worker
   Region: Oregon (same as backend)
   Branch: main
   Root Directory: backend
   Runtime: Docker
   Instance Type: Starter ($7/month)
   ```

### 7.2 Override Docker Command

In **"Docker Command"** field, enter:
```bash
celery -A app.workers.celery_app worker --loglevel=info --concurrency=2
```

### 7.3 Add Environment Variables

**Important:** Add the SAME environment variables as the backend service.

Quick method:
1. Go to backend service → **"Environment"** tab
2. Copy all variables
3. Paste into worker service

### 7.4 Deploy Worker

1. Click **"Create Background Worker"**
2. Wait 3-5 minutes for deployment
3. Check logs for:
   ```
   [INFO] celery@worker ready
   [INFO] Registered tasks: analyze_contract, process_comparison
   ```

---

## Step 8: Deploy Frontend

### 8.1 Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Select repository: **daflegal**
3. Configure:
   ```
   Name: daflegal-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm run build
   Publish Directory: .next
   ```

### 8.2 Add Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

### 8.3 Deploy Frontend

1. Click **"Create Static Site"**
2. Render will:
   - Install dependencies (`npm install`)
   - Build Next.js app (`npm run build`)
   - Deploy static files
3. Wait 5-10 minutes
4. Get URL: `https://daflegal-frontend.onrender.com`

**Note:** If static site doesn't work, use **Web Service** instead:
- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

---

## Step 9: Configure Stripe Webhooks

### 9.1 Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Configure:
   ```
   Endpoint URL: https://daflegal-backend.onrender.com/api/v1/billing/webhook
   Description: DafLegal production webhooks
   Events to send: Select these events:
     ✅ checkout.session.completed
     ✅ customer.subscription.created
     ✅ customer.subscription.updated
     ✅ customer.subscription.deleted
     ✅ invoice.payment_succeeded
     ✅ invoice.payment_failed
   ```
4. Click **"Add endpoint"**

### 9.2 Get Webhook Secret

1. Click on the newly created webhook
2. Click **"Reveal"** under **"Signing secret"**
3. Copy the secret (starts with `whsec_`)
4. Go to Render → Backend service → **"Environment"**
5. Update `STRIPE_WEBHOOK_SECRET=whsec_your_secret`
6. Service will auto-redeploy

---

## Step 10: Test Production Deployment

### 10.1 Test API Health

```bash
# Health check
curl https://daflegal-backend.onrender.com/health

# Expected: {"status":"healthy","version":"1.0.0","environment":"production"}
```

### 10.2 Register Test User

```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@daflegal.com",
    "password": "Test123!@#",
    "full_name": "Test User"
  }'
```

### 10.3 Create API Key

```bash
# Login first to get access token
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@daflegal.com",
    "password": "Test123!@#"
  }'

# Use access_token from response
curl -X POST https://daflegal-backend.onrender.com/api/v1/users/api-keys \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'

# Save the API key (dfk_...)
```

### 10.4 Test Contract Upload

```bash
# Create a test contract file
echo "SERVICE AGREEMENT

This is a test contract for DafLegal analysis.

TERM: 12 months
PAYMENT: $10,000 annually
LIABILITY: Limited to fees paid" > test-contract.txt

# Upload for analysis
curl -X POST https://daflegal-backend.onrender.com/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -F "file=@test-contract.txt"

# Get contract ID from response, then check status
curl https://daflegal-backend.onrender.com/api/v1/contracts/<contract_id> \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

### 10.5 Test Frontend

1. Visit: `https://daflegal-frontend.onrender.com`
2. Should see DafLegal homepage
3. Test contract upload via UI
4. Verify analysis completes

### 10.6 Test Stripe Payment

1. Go to frontend
2. Click "Upgrade" → Select "Starter Plan"
3. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ```
4. Complete checkout
5. Verify subscription in Stripe dashboard
6. Check user upgraded in database

---

## Step 11: Custom Domain (Optional)

### 11.1 Add Custom Domain to Backend

1. Go to backend service → **"Settings"** → **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Enter: `api.daflegal.com`
4. Render shows DNS instructions:
   ```
   CNAME api.daflegal.com → daflegal-backend.onrender.com
   ```
5. Add this CNAME record in your domain registrar (GoDaddy, Namecheap, etc.)
6. Wait 10-60 minutes for DNS propagation
7. Render auto-provisions SSL certificate

### 11.2 Add Custom Domain to Frontend

1. Go to frontend service → **"Settings"** → **"Custom Domain"**
2. Add these domains:
   ```
   daflegal.com
   www.daflegal.com
   ```
3. Add DNS records:
   ```
   CNAME www.daflegal.com → daflegal-frontend.onrender.com
   ALIAS daflegal.com → daflegal-frontend.onrender.com
   ```
   (Or use CNAME for both if your DNS provider requires it)

### 11.3 Update Environment Variables

After custom domain is active:

**Backend:** No changes needed

**Frontend:** Update CORS in backend if needed
1. Go to `backend/app/main.py`
2. Update CORS origins to include `https://daflegal.com`

**Stripe Webhook:** Update endpoint URL
1. Go to Stripe dashboard → Webhooks
2. Edit endpoint URL to: `https://api.daflegal.com/api/v1/billing/webhook`

---

## Step 12: Monitoring & Maintenance

### 12.1 Set Up Sentry (Error Tracking)

1. Create account at https://sentry.io
2. Create new project (Python/FastAPI)
3. Copy DSN: `https://abc123@o123.ingest.sentry.io/456`
4. Add to Render environment variables:
   ```
   SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
   ```
5. Errors will auto-report to Sentry

### 12.2 Set Up Healthchecks.io (Uptime Monitoring)

1. Create account at https://healthchecks.io
2. Create new check:
   ```
   Name: DafLegal API
   Period: 5 minutes
   Grace time: 2 minutes
   ```
3. Copy ping URL: `https://hc-ping.com/abc-123`
4. Set up cron job in Render (or use external cron service):
   ```bash
   */5 * * * * curl https://api.daflegal.com/health && curl https://hc-ping.com/abc-123
   ```

### 12.3 Monitor Render Services

1. Go to each service → **"Metrics"** tab
2. Monitor:
   - CPU usage (should be <70% average)
   - Memory usage (should be <80% average)
   - Response times (should be <500ms p95)
   - Error rate (should be <1%)

### 12.4 Database Backups

Render automatically backs up PostgreSQL daily:
1. Go to database → **"Backups"** tab
2. Verify backups are running
3. Test restore procedure (use a test database)

---

## Troubleshooting

### Issue: Backend build fails

**Check:**
1. Dockerfile syntax in `backend/Dockerfile`
2. All dependencies in `requirements.txt`
3. Build logs for specific error

**Fix:**
```bash
# Test locally first
cd backend
docker build -t test-backend .
docker run -p 8000:8000 test-backend
```

### Issue: Database connection fails

**Check:**
1. DATABASE_URL format is correct
2. Database is in same region as backend
3. Internal URL is used (not external)

**Fix:**
- Use Render's internal URL: `postgresql://user:pass@dpg-xxx-internal/db`
- Not the external URL: `postgresql://user:pass@dpg-xxx/db`

### Issue: Worker not processing jobs

**Check:**
1. Worker logs for Celery errors
2. Redis connection
3. Task registration

**Fix:**
```bash
# In worker logs, should see:
[INFO] Connected to redis://red-xxx:6379/0
[INFO] celery@worker ready
[INFO] Registered tasks: app.workers.tasks.analyze_contract
```

### Issue: Frontend can't reach backend

**Check:**
1. NEXT_PUBLIC_API_URL is correct
2. Backend CORS allows frontend domain
3. Backend is actually running

**Fix:**
1. Update frontend env var: `NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com`
2. Update backend CORS in `app/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://daflegal-frontend.onrender.com", "https://daflegal.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Issue: Slow response times

**Check:**
1. Instance size (Starter vs Standard)
2. Database connection pooling
3. Number of worker instances

**Fix:**
1. Upgrade to Standard instance ($25/month)
2. Add more worker instances (horizontal scaling)
3. Enable Redis caching

### Issue: Stripe webhooks not working

**Check:**
1. Webhook URL is correct and accessible
2. STRIPE_WEBHOOK_SECRET matches
3. Webhook logs in Stripe dashboard

**Fix:**
1. Test webhook endpoint manually:
   ```bash
   curl -X POST https://api.daflegal.com/api/v1/billing/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'
   ```
2. Check Stripe webhook logs for errors
3. Ensure backend is deployed and running

---

## Cost Breakdown (Render)

### Starter Tier (~$28/month)
- PostgreSQL Starter: $7/month
- Redis Starter: $7/month
- Backend Web Service: $7/month
- Worker Service: $7/month
- Frontend Static Site: Free
- **Total: $28/month**

### Production Tier (~$100/month)
- PostgreSQL Standard: $20/month
- Redis Standard: $25/month
- Backend Standard: $25/month
- Worker Standard (2x): $50/month
- Frontend: Free
- **Total: $120/month**

### Additional Costs
- AWS S3: ~$5-20/month (depends on usage)
- Stripe fees: 2.9% + $0.30 per transaction
- OpenAI API: ~$10-100/month (depends on usage)
- Sentry: Free tier (up to 5k errors/month)
- Domain: ~$10-15/year

**Total First Month: $50-150** (depending on tier)

---

## Deployment Checklist

- [ ] Render account created and verified
- [ ] PostgreSQL database created
- [ ] Redis instance created
- [ ] AWS S3 bucket created with IAM user
- [ ] Stripe products created with price IDs
- [ ] Stripe API keys obtained (live mode)
- [ ] Backend service deployed
- [ ] Worker service deployed
- [ ] Frontend deployed
- [ ] All environment variables configured
- [ ] Health check passes
- [ ] Test user registered
- [ ] Test contract upload works
- [ ] Stripe webhooks configured
- [ ] Custom domain configured (optional)
- [ ] Sentry error tracking enabled
- [ ] Healthchecks monitoring enabled
- [ ] SSL certificates active (auto via Render)

---

## Post-Deployment Checklist

### Day 1
- [ ] Monitor error logs (Sentry)
- [ ] Check all services are running
- [ ] Test user signup flow
- [ ] Test contract analysis end-to-end
- [ ] Test payment flow
- [ ] Verify webhooks working

### Week 1
- [ ] Monitor performance metrics
- [ ] Check database size and growth
- [ ] Review API response times
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately

### Month 1
- [ ] Review costs and optimize
- [ ] Scale services if needed
- [ ] Implement user feedback
- [ ] Add monitoring alerts
- [ ] Plan feature roadmap

---

## Scaling Guide

### When to Scale

**Scale Backend** when:
- CPU usage consistently >80%
- Response times >1 second
- Error rate >2%

**Scale Worker** when:
- Job queue depth >100
- Processing time >5 minutes
- Jobs timing out

**Scale Database** when:
- Storage >80% full
- Connection pool exhausted
- Query times >500ms

### How to Scale

**Horizontal Scaling:**
1. Go to service → **"Settings"** → **"Scaling"**
2. Increase instance count
3. Render auto-load-balances

**Vertical Scaling:**
1. Go to service → **"Settings"** → **"Instance Type"**
2. Upgrade to next tier (Standard → Pro → Pro Plus)

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Render Community:** https://community.render.com
- **DafLegal Docs:** Check project README.md
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Stripe Docs:** https://stripe.com/docs

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use different keys for dev/staging/production
- ✅ Rotate secrets every 90 days
- ✅ Use strong passwords (64+ characters)

### API Security
- ✅ Rate limiting enabled (60 req/min default)
- ✅ API keys use cryptographic hash
- ✅ HTTPS enforced (auto via Render)
- ✅ CORS properly configured
- ✅ SQL injection protection (via SQLAlchemy)

### Data Security
- ✅ S3 encryption at rest
- ✅ Database encryption (Render default)
- ✅ Secure password hashing (bcrypt)
- ✅ API key masking in logs

### Compliance
- ✅ GDPR: Data deletion endpoints
- ✅ Privacy policy published
- ✅ Terms of service published
- ✅ Secure data handling procedures

---

## Next Steps After Deployment

1. **Marketing:** Launch on Product Hunt, Twitter, Reddit
2. **Content:** Write blog posts, create videos
3. **SEO:** Optimize landing page, submit to directories
4. **Sales:** Reach out to law firms, offer demos
5. **Features:** Build analytics dashboard, add integrations
6. **Support:** Set up help desk, create documentation

---

## You're Live! 🚀

Your DafLegal application is now running on:
- **Backend API:** `https://daflegal-backend.onrender.com`
- **Frontend:** `https://daflegal-frontend.onrender.com`
- **API Docs:** `https://daflegal-backend.onrender.com/docs`

**Time to get your first customer!** 🎯

Good luck with your launch! 💪
