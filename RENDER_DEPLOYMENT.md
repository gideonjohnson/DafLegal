# 🚀 Render Deployment Guide for DafLegal

Complete guide to deploying DafLegal on Render with full infrastructure including PostgreSQL, Redis, ClamAV, and Celery workers.

## 📋 Prerequisites

- [Render account](https://render.com) (free tier available)
- GitHub repository connected to Render
- API keys for:
  - OpenAI (GPT-4)
  - Cloudinary (file storage)
  - Stripe (payments)

## 🏗️ Architecture on Render

```
┌─────────────────────────────────────────────────────────┐
│                     Render Services                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐        ┌──────────────┐              │
│  │   Frontend   │───────►│   Backend    │              │
│  │  (Next.js)   │        │  (FastAPI)   │              │
│  └──────────────┘        └──────┬───────┘              │
│                                 │                        │
│         ┌───────────────────────┼────────────┐          │
│         ▼                       ▼            ▼          │
│  ┌──────────┐          ┌──────────┐  ┌──────────┐      │
│  │PostgreSQL│          │  Redis   │  │  ClamAV  │      │
│  │(Private) │          │(Private) │  │(Private) │      │
│  └──────────┘          └──────────┘  └──────────┘      │
│                                                          │
│                        ┌──────────────┐                 │
│                        │Celery Worker │                 │
│                        │  (Worker)    │                 │
│                        └──────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 One-Click Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code** (already done ✅):
   ```bash
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub repository: `gideonjohnson/DafLegal`
   - Render will auto-detect `render.yaml`

3. **Configure Environment Variables**:
   Render will create all services and prompt for environment variables.

### Option 2: Manual Service Creation

If automatic blueprint doesn't work, create services manually:

#### Step 1: Create PostgreSQL Database
1. Dashboard → **New** → **PostgreSQL**
2. Name: `daflegal-postgres`
3. Database: `daflegal`
4. User: `daflegal`
5. Region: Choose closest to your users
6. Plan: **Free** (or Starter for production)
7. Click **Create Database**
8. Save the **Internal Database URL** (for backend connection)

#### Step 2: Create Redis Instance
1. Dashboard → **New** → **Redis**
2. Name: `daflegal-redis`
3. Region: Same as PostgreSQL
4. Plan: **Free** (or Starter for production)
5. Click **Create Redis**
6. Save the **Internal Redis URL**

#### Step 3: Create ClamAV Private Service
1. Dashboard → **New** → **Private Service**
2. Name: `daflegal-clamav`
3. Environment: **Docker**
4. Build Command: (leave empty)
5. Dockerfile Path: `./Dockerfile.clamav`
6. Region: Same as others
7. Instance Type: **Standard** (512MB minimum for ClamAV)
8. Click **Create Private Service**

#### Step 4: Create Backend Web Service
1. Dashboard → **New** → **Web Service**
2. Connect repository: `gideonjohnson/DafLegal`
3. Name: `daflegal-backend`
4. Environment: **Docker**
5. Dockerfile Path: `./backend/Dockerfile`
6. Docker Context: `./backend`
7. Region: Same as others
8. Instance Type: **Starter** (recommended)

**Environment Variables:**
```bash
# Required
DATABASE_URL=<from PostgreSQL service>
REDIS_URL=<from Redis service>
SECRET_KEY=<generate strong random key>
ENVIRONMENT=production

# OpenAI
OPENAI_API_KEY=sk-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...

# ClamAV
CLAMAV_ENABLED=true
CLAMAV_HOST=daflegal-clamav
CLAMAV_PORT=3310
CLAMAV_USE_TCP=true
CLAMAV_TIMEOUT=30

# Optional
SENTRY_DSN=https://...
```

9. Health Check Path: `/health`
10. Click **Create Web Service**

#### Step 5: Create Celery Worker
1. Dashboard → **New** → **Background Worker**
2. Connect repository: `gideonjohnson/DafLegal`
3. Name: `daflegal-worker`
4. Environment: **Docker**
5. Dockerfile Path: `./backend/Dockerfile.worker`
6. Docker Context: `./backend`
7. Region: Same as others
8. Instance Type: **Starter**

**Environment Variables:** (same as backend, copy from backend)

9. Click **Create Background Worker**

#### Step 6: Create Frontend Web Service
1. Dashboard → **New** → **Web Service**
2. Connect repository: `gideonjohnson/DafLegal`
3. Name: `daflegal-frontend`
4. Environment: **Node**
5. Build Command: `cd frontend && npm install && npm run build`
6. Start Command: `cd frontend && npm start`
7. Region: Same as others
8. Instance Type: **Starter**

**Environment Variables:**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://daflegal-backend.onrender.com

# NextAuth
NEXTAUTH_URL=https://daflegal-frontend.onrender.com
NEXTAUTH_SECRET=<generate strong random key>

# Optional - Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_CLARITY_PROJECT_ID=...

# Optional - Live Chat
NEXT_PUBLIC_CRISP_WEBSITE_ID=...

# Optional - Email Marketing
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...
```

9. Click **Create Web Service**

## ⚙️ Environment Variable Configuration

### Required Variables

#### Backend Service
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Auto-populated | PostgreSQL connection |
| `REDIS_URL` | Auto-populated | Redis connection |
| `SECRET_KEY` | `openssl rand -hex 32` | Django secret key |
| `OPENAI_API_KEY` | `sk-proj-...` | OpenAI API key |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud` | Cloudinary account |
| `CLOUDINARY_API_KEY` | `123456789` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `abc...` | Cloudinary secret |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook |
| `STRIPE_STARTER_PRICE_ID` | `price_...` | Starter plan ID |
| `STRIPE_PRO_PRICE_ID` | `price_...` | Pro plan ID |
| `STRIPE_TEAM_PRICE_ID` | `price_...` | Team plan ID |
| `CLAMAV_ENABLED` | `true` | Enable virus scanning |
| `CLAMAV_HOST` | `daflegal-clamav` | ClamAV service name |

#### Frontend Service
| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL | API endpoint |
| `NEXTAUTH_URL` | Frontend URL | NextAuth callback |
| `NEXTAUTH_SECRET` | Random string | NextAuth secret |

### Generate Secrets

```bash
# For SECRET_KEY and NEXTAUTH_SECRET
openssl rand -hex 32
# or
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🔍 Deployment Verification

### 1. Check Service Status
All services should show **"Live"** status:
- ✅ daflegal-postgres
- ✅ daflegal-redis
- ✅ daflegal-clamav (may take 2-3 min on first start)
- ✅ daflegal-backend
- ✅ daflegal-worker
- ✅ daflegal-frontend

### 2. Test Backend Health
```bash
curl https://daflegal-backend.onrender.com/health
# Expected: {"status": "healthy"}
```

### 3. Test Frontend
Open: `https://daflegal-frontend.onrender.com`
- Should load landing page
- Check browser console for errors

### 4. Test Virus Scanning
```bash
# Create EICAR test file
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt

# Try uploading (should be rejected)
curl -X POST https://daflegal-backend.onrender.com/api/v1/contracts/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@eicar.txt"

# Expected: {"detail": "File rejected: Virus detected - Eicar-Signature"}
```

### 5. Check Logs
For each service in Render dashboard:
- Click service → **Logs** tab
- Look for errors (red)
- Verify ClamAV shows "Virus database is up to date"

## 🔧 Post-Deployment Configuration

### 1. Run Database Migrations
```bash
# Render will run these automatically via Dockerfile
# But you can trigger manually if needed:

# In Render Shell for backend service
alembic upgrade head
```

### 2. Configure Custom Domain
1. Go to Frontend service → **Settings**
2. Scroll to **Custom Domains**
3. Add your domain: `app.daflegal.com`
4. Update DNS:
   - Type: `CNAME`
   - Name: `app`
   - Value: `daflegal-frontend.onrender.com`

5. Update environment variables:
   ```bash
   # Frontend
   NEXTAUTH_URL=https://app.daflegal.com

   # Backend (if using custom domain)
   NEXT_PUBLIC_API_URL=https://api.daflegal.com
   ```

### 3. Configure Stripe Webhooks
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://daflegal-backend.onrender.com/api/v1/billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret → Update `STRIPE_WEBHOOK_SECRET`

### 4. Setup Monitoring
- **Sentry**: Add `SENTRY_DSN` to backend
- **Healthchecks.io**: Point to `/health` endpoint
- **Render Alerts**: Enable in service settings

## 💰 Cost Estimation

### Free Tier
- PostgreSQL: Free (limited to 1GB)
- Redis: Free (limited to 25MB)
- ClamAV: **$7/month** (Private Service - 512MB)
- Backend: Free (750 hours/month)
- Worker: Free (750 hours/month)
- Frontend: Free (750 hours/month)

**Monthly Cost: ~$7** (just ClamAV)

### Production Tier
- PostgreSQL Starter: $7/month (10GB)
- Redis Starter: $10/month (100MB)
- ClamAV Private: $7/month (512MB)
- Backend Starter: $7/month (512MB)
- Worker Starter: $7/month (512MB)
- Frontend Starter: $7/month (512MB)

**Monthly Cost: ~$45/month**

## 🐛 Troubleshooting

### ClamAV Takes Forever to Start
**Cause**: Downloading virus definitions (~200MB)
**Solution**: Wait 3-5 minutes on first deployment

### Backend Can't Connect to ClamAV
**Cause**: ClamAV not fully initialized
**Solution**:
```bash
# Check ClamAV logs
# Wait for: "Virus database is up to date"
# Backend will auto-reconnect
```

### Database Connection Errors
**Cause**: Wrong `DATABASE_URL` or database not ready
**Solution**:
1. Verify `DATABASE_URL` in backend env vars
2. Check PostgreSQL service is "Live"
3. Restart backend service

### Frontend Can't Reach Backend
**Cause**: Wrong `NEXT_PUBLIC_API_URL`
**Solution**:
1. Get backend URL from Render dashboard
2. Update frontend env var: `NEXT_PUBLIC_API_URL`
3. Redeploy frontend

### Celery Worker Not Processing
**Cause**: Redis connection issue or worker not started
**Solution**:
1. Check `REDIS_URL` in worker env vars
2. Verify Redis service is "Live"
3. Check worker logs for errors
4. Restart worker service

## 🔄 Continuous Deployment

### Automatic Deployments
Render will auto-deploy when you push to `main`:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

All services will update automatically ✅

### Manual Deployments
In Render dashboard:
1. Go to service
2. Click **Manual Deploy** → **Deploy latest commit**

## 📊 Monitoring & Logs

### View Logs
1. Render Dashboard → Select service
2. **Logs** tab
3. Filter by:
   - All logs
   - Errors only
   - Search keywords

### Metrics
1. Service → **Metrics** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request rate
   - Response time

### Alerts
1. Service → **Settings**
2. Scroll to **Alerts**
3. Enable:
   - Deploy failures
   - Health check failures
   - High resource usage

## 🎉 Success Checklist

- [ ] All 6 services show "Live" status
- [ ] Backend `/health` endpoint returns 200
- [ ] Frontend loads without console errors
- [ ] Can create account and login
- [ ] EICAR test file is rejected (virus scanning works)
- [ ] Custom domain configured (optional)
- [ ] Stripe webhooks configured
- [ ] Monitoring/alerts enabled
- [ ] SSL certificates active (automatic with Render)

## 📞 Support

### Render Support
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Email Support](mailto:support@render.com)

### DafLegal Issues
- Check `DEPLOYMENT_READY.md`
- Check `VIRUS_SCANNING_SETUP.md`
- Review service logs in Render
- Check GitHub Issues

---

**Deployment Time**: ~15-20 minutes (first time)
**Status**: ✅ Ready to Deploy
**Last Updated**: December 13, 2025
