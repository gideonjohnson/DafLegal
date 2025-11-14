# DafLegal - Railway Deployment Steps

**Interactive Guide for Deploying to Railway**

---

## 📝 Pre-Deployment Checklist

Before we start, make sure you have:

- [x] Git repository with all code committed
- [x] GitHub account (for Railway authentication)
- [ ] OpenAI API key (get from https://platform.openai.com/api-keys)
- [ ] Railway account (we'll create this together)

**Cost:** Free to start ($5/month credit), then ~$13-21/month if exceeded

---

## Step 1: Get OpenAI API Key (5 minutes)

**Why:** Required for all AI features (contract analysis, intake triage, etc.)

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Name it: "DafLegal Staging"
5. Copy the key (starts with `sk-proj-...`)
6. **Save it somewhere safe** - you'll need it soon!

**Cost:** ~$0.50-5/month for staging testing

✅ **Done? Continue to Step 2**

---

## Step 2: Sign Up for Railway (2 minutes)

1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Click "Login with GitHub"
4. Authorize Railway to access your GitHub account
5. You'll be redirected to the Railway dashboard

**You should see:** Railway dashboard with "$5.00" credit shown

✅ **Logged in to Railway? Continue to Step 3**

---

## Step 3: Push Code to GitHub (if not already done)

Your code is already committed locally. Now push to GitHub:

```bash
# Create a new repository on GitHub first
# Go to github.com → New Repository → Name it "daflegal"

# Then in your terminal:
git remote add origin https://github.com/YOUR_USERNAME/daflegal.git
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username

✅ **Code pushed to GitHub? Continue to Step 4**

---

## Step 4: Create Railway Project (3 minutes)

1. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select Repository:**
   - Find and click "daflegal"
   - Railway will scan your repository

3. **Railway will detect:**
   - `docker-compose.yml` file
   - Multiple services
   - You'll see a deployment preview

4. **Click "Deploy Now"**

Railway will start setting up your project!

✅ **Project created? Continue to Step 5**

---

## Step 5: Add PostgreSQL Database (2 minutes)

1. **In your Railway project:**
   - Click "+ New"
   - Select "Database"
   - Click "PostgreSQL"

2. **Railway will:**
   - Provision a PostgreSQL database
   - Generate a `DATABASE_URL`
   - Automatically connect it to your services

3. **Verify:**
   - You should see a new "PostgreSQL" service card
   - Status should turn green after ~30 seconds

✅ **PostgreSQL added? Continue to Step 6**

---

## Step 6: Add Redis Database (2 minutes)

1. **In your Railway project:**
   - Click "+ New"
   - Select "Database"
   - Click "Redis"

2. **Railway will:**
   - Provision a Redis instance
   - Generate a `REDIS_URL`
   - Automatically connect it to your services

3. **Verify:**
   - You should see a new "Redis" service card
   - Status should turn green after ~30 seconds

✅ **Redis added? Continue to Step 7**

---

## Step 7: Configure Backend Service (10 minutes)

1. **Find the Backend service card** (should be auto-created from docker-compose.yml)

2. **Click on the Backend service**

3. **Go to "Variables" tab**

4. **Add these environment variables:**

   Click "+ New Variable" for each:

   ```bash
   # Database (auto-filled by Railway)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # Redis (auto-filled by Railway)
   REDIS_URL=${{Redis.REDIS_URL}}

   # Security - Generate this!
   SECRET_KEY=YOUR_GENERATED_SECRET_KEY_HERE

   # Environment
   ENVIRONMENT=staging

   # OpenAI - Paste your key from Step 1
   OPENAI_API_KEY=sk-proj-your-openai-key-here

   # AWS S3 (Optional - skip for now)
   # AWS_ACCESS_KEY_ID=your_key
   # AWS_SECRET_ACCESS_KEY=your_secret
   # AWS_REGION=us-east-1
   # S3_BUCKET_NAME=daflegal-staging

   # Stripe (Optional - skip for now)
   # STRIPE_SECRET_KEY=sk_test_xxx
   # STRIPE_WEBHOOK_SECRET=whsec_xxx
   # STRIPE_STARTER_PRICE_ID=price_xxx
   # STRIPE_PRO_PRICE_ID=price_xxx
   # STRIPE_TEAM_PRICE_ID=price_xxx
   ```

5. **Generate SECRET_KEY:**

   Open a terminal and run:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

   Copy the output and paste it as the value for `SECRET_KEY`

6. **Click "Deploy"** (top right)

✅ **Backend variables configured? Continue to Step 8**

---

## Step 8: Configure Worker Service (5 minutes)

1. **Find the Worker service card**

2. **Click on the Worker service**

3. **Go to "Variables" tab**

4. **Add the SAME variables as the Backend:**

   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   SECRET_KEY=SAME_AS_BACKEND
   ENVIRONMENT=staging
   OPENAI_API_KEY=sk-proj-your-openai-key-here
   ```

   **Important:** Use the exact same values as Backend!

5. **Click "Deploy"**

✅ **Worker variables configured? Continue to Step 9**

---

## Step 9: Configure Frontend Service (5 minutes)

1. **Find the Frontend service card**

2. **Click on the Frontend service**

3. **Go to "Variables" tab**

4. **Add ONE variable:**

   ```bash
   NEXT_PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   ```

   **Note:** Railway will auto-fill the Backend domain!

5. **Click "Deploy"**

✅ **Frontend variables configured? Continue to Step 10**

---

## Step 10: Wait for Deployment (5-10 minutes)

Railway will now deploy all services. You'll see build logs in real-time.

**What's happening:**
- Building Docker images for Backend, Worker, Frontend
- Connecting to PostgreSQL and Redis
- Creating database tables automatically
- Starting all services

**Watch the logs:**
- Click on each service card
- Go to "Deployments" tab
- Click on the latest deployment
- Watch the build/deploy logs

**Expected timeline:**
- Backend: 3-5 minutes
- Worker: 3-5 minutes
- Frontend: 4-6 minutes
- PostgreSQL: 30 seconds (already done)
- Redis: 30 seconds (already done)

**Success indicators:**
- All service cards show green status
- No errors in deployment logs
- Each service shows "Active" status

✅ **All services deployed successfully? Continue to Step 11**

---

## Step 11: Get Your Staging URLs (2 minutes)

1. **Click on Backend service**
   - Go to "Settings" tab
   - Find "Domains" section
   - Click "Generate Domain"
   - Copy the URL: `https://daflegal-backend-xxx.up.railway.app`
   - **Save this URL!**

2. **Click on Frontend service**
   - Go to "Settings" tab
   - Find "Domains" section
   - Click "Generate Domain"
   - Copy the URL: `https://daflegal-frontend-xxx.up.railway.app`
   - **Save this URL!**

3. **Update Frontend Environment Variable:**
   - Go back to Frontend service
   - Go to "Variables" tab
   - Update `NEXT_PUBLIC_API_URL` with the actual Backend URL
   - Click "Deploy" again

✅ **URLs generated? Continue to Step 12**

---

## Step 12: Test the Deployment (10 minutes)

### Test 1: Backend Health Check

Open your browser:
```
https://your-backend-xxx.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

✅ **Passed? Continue**

---

### Test 2: API Documentation

Open:
```
https://your-backend-xxx.up.railway.app/docs
```

**You should see:**
- Swagger UI with all API endpoints
- 100+ endpoints listed
- All 11 feature groups (contracts, intake, conveyancing, etc.)

✅ **Passed? Continue**

---

### Test 3: Frontend

Open:
```
https://your-frontend-xxx.up.railway.app
```

**You should see:**
- DafLegal landing page
- Navigation menu
- No errors in browser console

✅ **Passed? Continue**

---

### Test 4: Create Test User

Use the API documentation:

1. Go to: `https://your-backend.railway.app/docs`
2. Find `POST /api/v1/users/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "admin@test.com",
     "password": "TestPassword123!",
     "full_name": "Test Admin"
   }
   ```
5. Click "Execute"

**Expected response:** HTTP 201 Created with user details

✅ **User created? Continue**

---

### Test 5: Generate API Key

1. In the API docs, find `POST /api/v1/users/login`
2. Login with your test user credentials
3. Copy the returned access token
4. Click "Authorize" (top right in Swagger UI)
5. Enter: `Bearer YOUR_ACCESS_TOKEN`
6. Find `POST /api/v1/users/api-keys`
7. Create a new API key

**Save this API key!** You'll use it for testing.

✅ **API key created? Continue**

---

### Test 6: Upload Test Contract

1. In the frontend (`https://your-frontend.railway.app`)
2. Navigate to the upload page
3. Upload a sample PDF or DOCX contract
4. Wait for AI analysis (15-30 seconds)
5. Verify results display correctly

**Expected:**
- File uploads successfully
- Analysis completes
- Results show summary, risks, clauses

✅ **Contract analysis works? Continue**

---

### Test 7: Test Other Features

Quickly test each feature:

1. **Document Comparison** (`/compare`)
   - Upload two versions
   - Verify diff shows

2. **Clause Library** (`/clauses`)
   - Create a test clause
   - Verify it appears in list

3. **Compliance Checker** (`/compliance`)
   - Create a test playbook
   - Add a rule
   - Verify it saves

4. **Intake Triage** (`/intake`)
   - Submit a test intake
   - Verify AI categorization works
   - Check priority score appears

5. **Conveyancing** (`/conveyancing/calculator`)
   - Test stamp duty calculator
   - Enter property value
   - Verify calculation is correct

6. **Citation Checker** (`/citations`)
   - Enter a test citation
   - Verify validation works

✅ **All features working? DEPLOYMENT SUCCESSFUL! 🎉**

---

## Step 13: Monitor Your Deployment

### Check Resource Usage

1. **In Railway Dashboard:**
   - Click on your project
   - Go to "Usage" tab
   - See your current usage vs. $5 credit

**Typical staging usage:**
- Backend: ~$2-4/month
- Worker: ~$1-2/month
- Frontend: ~$2-4/month
- PostgreSQL: Included
- Redis: Included
- **Total: Usually within $5 free tier for light testing**

### Set Up Alerts

1. **In Railway:**
   - Go to Project Settings
   - Find "Notifications"
   - Enable deployment notifications
   - Add your email

✅ **Monitoring configured? You're all set!**

---

## 🎉 Deployment Complete!

### Your Staging URLs:

- **Frontend:** `https://your-frontend-xxx.up.railway.app`
- **Backend API:** `https://your-backend-xxx.up.railway.app`
- **API Docs:** `https://your-backend-xxx.up.railway.app/docs`

### What You've Deployed:

✅ Full-stack application with 11 features
✅ PostgreSQL database (39+ tables)
✅ Redis cache/queue
✅ AI-powered contract analysis
✅ Client intake triage
✅ Kenya conveyancing workflows
✅ Citation checker
✅ And 7 more features!

### Next Steps:

1. **Share with team:**
   - Send them the frontend URL
   - Give them test account credentials
   - Ask for feedback

2. **Beta testing:**
   - Invite 5-10 beta users
   - Monitor usage and errors
   - Collect feedback

3. **Monitor:**
   - Check Railway logs daily
   - Watch for errors in Sentry (if configured)
   - Monitor OpenAI usage/costs

4. **Iterate:**
   - Fix bugs as they're reported
   - Improve UX based on feedback
   - Optimize performance

---

## 🐛 Troubleshooting

### If Backend won't start:

1. **Check logs:**
   - Click Backend service → Deployments → Latest deployment → View logs
   - Look for error messages

2. **Common issues:**
   - Missing environment variables → Add them in Variables tab
   - Database connection failed → Verify `DATABASE_URL` is correct
   - OpenAI key invalid → Check your API key

### If Frontend can't reach Backend:

1. **Verify NEXT_PUBLIC_API_URL:**
   - Should be: `https://your-backend-xxx.up.railway.app`
   - Must include `https://`
   - No trailing slash

2. **Check CORS:**
   - Already configured in backend
   - If issues persist, check backend logs

### If Worker isn't processing:

1. **Check Redis connection:**
   - Verify `REDIS_URL` in Worker variables
   - Should match Backend's Redis URL

2. **Check worker logs:**
   - Look for Celery startup messages
   - Should see "celery@worker ready"

---

## 💰 Cost Management

### Keep costs low:

1. **Monitor usage:**
   - Check Railway usage tab weekly
   - Set up usage alerts

2. **Optimize:**
   - Scale down services when not testing
   - Use Railway's sleep feature for non-critical services

3. **Free tier tips:**
   - $5/month is usually enough for staging
   - Light testing stays within free tier
   - Only heavy usage exceeds it

---

## 📞 Need Help?

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app
- Status: https://status.railway.app

**DafLegal Resources:**
- See `STAGING_DEPLOYMENT.md` for detailed troubleshooting
- Check `STATUS.md` for feature documentation
- Review API docs at `/docs` endpoint

---

**🚀 Congratulations! Your staging environment is live!**

**Time to completion:** ~45-60 minutes
**Monthly cost:** $0-21 (usually within free $5 tier)
**Features deployed:** 11/11 (100%)

---

**Last Updated:** January 26, 2025
**Deployment Platform:** Railway
**Status:** Production Ready
