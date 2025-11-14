# DafLegal - Render Deployment Guide (FREE TIER)

**Platform:** Render.com
**Cost:** 100% FREE for staging (with some limitations)
**Time:** ~45-60 minutes

---

## 🎯 Why Render?

✅ **Genuinely Free Tier:**
- Free PostgreSQL for 90 days
- Free Redis (512MB)
- Free Web Services (with spin-down after 15min inactivity)
- No credit card required initially

✅ **Easy Deployment:**
- Deploy from GitHub
- Auto-builds on push
- Built-in SSL
- Good for staging/testing

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity (first request takes ~30s to wake up)
- PostgreSQL free for 90 days only
- 512MB Redis limit
- **Perfect for staging, not ideal for production**

---

## 📋 Prerequisites

- [x] OpenAI API key (you have this!)
- [x] GitHub account with DafLegal repo
- [x] Code pushed to GitHub
- [ ] Render account (we'll create this now)

---

## Step 1: Sign Up for Render (2 minutes)

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Click **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. You'll be redirected to Render dashboard

✅ **Logged in to Render?** Continue to Step 2

---

## Step 2: Create PostgreSQL Database (3 minutes)

1. **In Render Dashboard:**
   - Click **"New +"** (top right)
   - Select **"PostgreSQL"**

2. **Configure Database:**
   - **Name:** `daflegal-staging-db`
   - **Database:** `daflegal`
   - **User:** `daflegal` (auto-filled)
   - **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
   - **PostgreSQL Version:** 16 (latest)
   - **Plan:** Select **"Free"** (90 days free)

3. **Click "Create Database"**

4. **Wait ~2 minutes** for provisioning

5. **Get Connection Details:**
   - Once created, click on your database
   - You'll see "Connections" section
   - **Copy "Internal Database URL"** - save this!
   - Format: `postgresql://user:pass@hostname/dbname`

✅ **PostgreSQL created?** Continue to Step 3

---

## Step 3: Create Redis Instance (3 minutes)

1. **In Render Dashboard:**
   - Click **"New +"**
   - Select **"Redis"**

2. **Configure Redis:**
   - **Name:** `daflegal-staging-redis`
   - **Region:** Same as your PostgreSQL (important!)
   - **Plan:** Select **"Free"** (512 MB)
   - **Maxmemory Policy:** `allkeys-lru` (recommended)

3. **Click "Create Redis"**

4. **Wait ~1 minute** for provisioning

5. **Get Connection Details:**
   - Click on your Redis instance
   - Find "Connections" section
   - **Copy "Internal Redis URL"** - save this!
   - Format: `redis://hostname:port`

✅ **Redis created?** Continue to Step 4

---

## Step 4: Deploy Backend Service (10 minutes)

1. **In Render Dashboard:**
   - Click **"New +"**
   - Select **"Web Service"**

2. **Connect Repository:**
   - Click **"Build and deploy from a Git repository"**
   - Click **"Next"**
   - Find and select **"gideonjohnson/DafLegal"**
   - Click **"Connect"**

3. **Configure Service:**
   - **Name:** `daflegal-backend`
   - **Region:** Same as database/Redis
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
   - **Plan:** Select **"Free"**

4. **Advanced Settings (click "Advanced"):**

   **Dockerfile Path:** `Dockerfile`

   **Docker Build Context Directory:** `backend`

5. **Add Environment Variables:**

   Click **"Add Environment Variable"** for each:

   ```
   DATABASE_URL = [PASTE YOUR INTERNAL DATABASE URL FROM STEP 2]

   REDIS_URL = [PASTE YOUR INTERNAL REDIS URL FROM STEP 3]

   SECRET_KEY = hQzMfV9ppbuc6zliTQVmMVT84B9z28HId63Z5cT8FXk

   ENVIRONMENT = staging

   OPENAI_API_KEY = [PASTE YOUR OPENAI API KEY]
   ```

   **Important:** Use the **Internal** URLs, not External!

6. **Click "Create Web Service"**

7. **Wait for Build:**
   - Initial build takes ~5-8 minutes
   - Watch the logs in real-time
   - Service turns green when ready

8. **Get Backend URL:**
   - Once deployed, copy the URL at the top
   - Format: `https://daflegal-backend-xxx.onrender.com`
   - **Save this URL!**

✅ **Backend deployed?** Continue to Step 5

---

## Step 5: Deploy Worker Service (Background Worker) (8 minutes)

1. **In Render Dashboard:**
   - Click **"New +"**
   - Select **"Background Worker"**

2. **Connect Repository:**
   - Find and select **"gideonjohnson/DafLegal"**
   - Click **"Connect"**

3. **Configure Worker:**
   - **Name:** `daflegal-worker`
   - **Region:** Same as others
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
   - **Plan:** Select **"Free"**

4. **Advanced Settings:**

   **Dockerfile Path:** `Dockerfile.worker`

   **Docker Build Context Directory:** `backend`

   **Start Command:** (leave as default - Dockerfile handles it)

5. **Add Environment Variables:**

   Add the **EXACT SAME** variables as Backend:

   ```
   DATABASE_URL = [SAME AS BACKEND]
   REDIS_URL = [SAME AS BACKEND]
   SECRET_KEY = hQzMfV9ppbuc6zliTQVmMVT84B9z28HId63Z5cT8FXk
   ENVIRONMENT = staging
   OPENAI_API_KEY = [YOUR OPENAI KEY]
   ```

6. **Click "Create Background Worker"**

7. **Wait for Build:**
   - Build takes ~5-8 minutes
   - Watch logs for "celery@worker ready"

✅ **Worker deployed?** Continue to Step 6

---

## Step 6: Deploy Frontend Service (10 minutes)

1. **In Render Dashboard:**
   - Click **"New +"**
   - Select **"Web Service"**

2. **Connect Repository:**
   - Select **"gideonjohnson/DafLegal"**
   - Click **"Connect"**

3. **Configure Frontend:**
   - **Name:** `daflegal-frontend`
   - **Region:** Same as others
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Select **"Free"**

4. **Add Environment Variable:**

   ```
   NEXT_PUBLIC_API_URL = [PASTE YOUR BACKEND URL FROM STEP 4]
   ```

   **Example:** `https://daflegal-backend-xxx.onrender.com`

   **Note:** NO trailing slash!

5. **Click "Create Web Service"**

6. **Wait for Build:**
   - Build takes ~6-10 minutes (Next.js takes time)
   - Watch the build logs
   - Service turns green when ready

7. **Get Frontend URL:**
   - Copy the URL: `https://daflegal-frontend-xxx.onrender.com`
   - **This is your staging site!**

✅ **Frontend deployed?** Continue to Step 7

---

## Step 7: Test Your Deployment (10 minutes)

### Test 1: Check Backend Health

Open browser:
```
https://your-backend-xxx.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

⚠️ **Note:** If this is the first request in 15+ minutes, the service will wake up (takes ~30 seconds). Refresh if needed.

✅ **Health check passed?** Continue

---

### Test 2: Check API Documentation

Visit:
```
https://your-backend-xxx.onrender.com/docs
```

**You should see:**
- Swagger UI with 100+ endpoints
- All feature groups listed
- Interactive API documentation

✅ **API docs accessible?** Continue

---

### Test 3: Check Frontend

Visit:
```
https://your-frontend-xxx.onrender.com
```

**Expected:**
- DafLegal landing page loads
- Navigation menu visible
- No errors in browser console (F12)

⚠️ **Note:** First load may take 30s if service was sleeping.

✅ **Frontend loads?** Continue

---

### Test 4: Create Test User

**Using API Documentation:**

1. Go to: `https://your-backend.onrender.com/docs`
2. Find `POST /api/v1/users/register`
3. Click **"Try it out"**
4. Enter:
   ```json
   {
     "email": "admin@test.com",
     "password": "TestPassword123!",
     "full_name": "Test Admin"
   }
   ```
5. Click **"Execute"**

**Expected:** HTTP 201 Created

✅ **User created?** Continue

---

### Test 5: Upload Test Contract

1. Visit your frontend: `https://your-frontend.onrender.com`
2. Navigate to contract upload
3. Upload a sample PDF/DOCX
4. Wait for analysis (15-30 seconds)

**Expected:**
- File uploads successfully
- AI analysis completes
- Results display with risks, clauses, summary

⚠️ **Note:** First analysis may be slower due to service wake-up.

✅ **Contract analysis works?** Continue

---

### Test 6: Quick Feature Check

Test a few key features:

1. **Intake Triage** (`/intake`)
   - Submit test intake
   - Verify AI categorization works

2. **Stamp Duty Calculator** (`/conveyancing/calculator`)
   - Enter property value: 10,000,000
   - Verify calculation shows correct 4% stamp duty

3. **Citation Checker** (`/citations`)
   - Enter test citation
   - Verify validation works

✅ **All features working?** DEPLOYMENT SUCCESSFUL! 🎉

---

## Step 8: Understand Free Tier Limitations

### Service Spin-Down

**What happens:**
- Free services spin down after 15 minutes of no activity
- First request wakes them up (~30 seconds delay)
- Subsequent requests are fast

**Impact:**
- Perfect for staging/demos
- Not ideal for production
- Good for showing to beta testers

### PostgreSQL 90-Day Limit

**What happens:**
- Free PostgreSQL expires after 90 days
- You'll get reminder emails before expiration
- Can upgrade to paid plan ($7/month) or export data

**For now:**
- 90 days is plenty for staging testing!

### Redis 512MB Limit

**What happens:**
- Free Redis has 512MB memory
- Plenty for staging workload
- Tasks are cleared after completion

---

## 💰 Cost After Free Tier

If you need to upgrade later:

**Render Paid Plans:**
- Web Service: $7/month each
  - Backend: $7/month
  - Frontend: $7/month
  - Worker: $7/month
- PostgreSQL: $7/month
- Redis: $10/month

**Total if all paid:** ~$38/month

**Alternatives:**
- Host frontend on Vercel (free)
- Use Supabase for database (free tier)
- Reduce to ~$15-20/month

---

## 🔧 Managing Your Deployment

### View Logs

1. Click on any service
2. Go to "Logs" tab
3. See real-time logs

### Redeploy

1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Or click "Manual Deploy" → "Deploy latest commit"

### Monitoring

1. **Service Status:**
   - Dashboard shows all services
   - Green = healthy, Red = error

2. **Set Up Alerts:**
   - Service → "Notifications"
   - Add email for deploy notifications

### Environment Variables

1. Click service → "Environment"
2. Add/edit variables
3. Click "Save Changes"
4. Service redeploys automatically

---

## 🐛 Common Issues

### Issue: Service won't start

**Check logs:**
1. Click service → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Database connection failed
   - OpenAI API key invalid

### Issue: Database connection failed

**Solution:**
1. Verify you used **Internal** database URL (not External)
2. Check DATABASE_URL format: `postgresql://user:pass@host/db`
3. Ensure all services are in same region

### Issue: Frontend can't reach backend

**Solution:**
1. Check NEXT_PUBLIC_API_URL in Frontend
2. Must be: `https://your-backend.onrender.com`
3. No trailing slash
4. Must include `https://`

### Issue: Services keep sleeping

**This is normal for free tier!**
- First request wakes up service
- Takes ~30 seconds
- Subsequent requests are fast
- Upgrade to paid plan ($7/month) to prevent sleep

---

## 🎉 Deployment Complete!

### Your Staging Environment:

**Frontend:** `https://daflegal-frontend-xxx.onrender.com`
**Backend:** `https://daflegal-backend-xxx.onrender.com`
**API Docs:** `https://daflegal-backend-xxx.onrender.com/docs`

### What You Deployed:

✅ All 11 features (100% complete)
✅ PostgreSQL database (39+ tables)
✅ Redis cache/queue
✅ AI-powered contract analysis
✅ Client intake triage
✅ Kenya conveyancing workflows
✅ Citation checker
✅ And 7 more features!

### Cost: $0/month

(Free for 90 days, then can upgrade or migrate)

---

## 📝 Next Steps

1. **Share with team:**
   - Send frontend URL
   - Provide test credentials
   - Gather feedback

2. **Beta testing:**
   - Invite 5-10 users
   - Monitor usage
   - Track bugs

3. **Monitor:**
   - Check Render dashboard daily
   - Review logs for errors
   - Watch OpenAI costs

4. **Plan for 90-day expiration:**
   - Decide: upgrade Render ($7/month) or migrate
   - Export data if migrating
   - Set calendar reminder

---

## ✅ Success Checklist

- [ ] All 5 services deployed (Backend, Worker, Frontend, PostgreSQL, Redis)
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads and displays correctly
- [ ] API docs accessible at /docs
- [ ] Test user created successfully
- [ ] Contract upload and analysis works
- [ ] All features accessible
- [ ] No critical errors in logs

---

**🎉 You're live on Render! Time to test and iterate!**

**Deployment Time:** ~45-60 minutes
**Monthly Cost:** $0 (90 days free)
**Features:** 11/11 (100%)
**Status:** Production ready, staging deployed

---

**Last Updated:** January 26, 2025
**Platform:** Render.com
**Tier:** Free (with limitations)
