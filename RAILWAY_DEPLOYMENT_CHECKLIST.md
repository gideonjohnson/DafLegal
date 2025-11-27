# 🚄 Railway Deployment Checklist for DafLegal

Follow these steps in order. Check each box as you complete it.

---

## STEP 1: Get Your OpenAI API Key (5 minutes)

### 1.1 Open OpenAI Platform
- [ ] Go to: https://platform.openai.com/api-keys
- [ ] Sign up or log in with your account
- [ ] Add a payment method (required for API access)

### 1.2 Create API Key
- [ ] Click "Create new secret key"
- [ ] Name it: "DafLegal Production"
- [ ] Click "Create secret key"
- [ ] **IMPORTANT**: Copy the key immediately (starts with `sk-proj-` or `sk-`)
- [ ] Save it somewhere safe (you'll need it in Step 5)

✅ You now have: `sk-proj-xxxxxxxxxxxxxxxxxxxx`

---

## STEP 2: Sign Up on Railway (2 minutes)

### 2.1 Create Account
- [ ] Go to: https://railway.app
- [ ] Click "Login with GitHub"
- [ ] Authorize Railway to access your GitHub account
- [ ] Complete the Railway signup

### 2.2 Add Payment Method (Optional for Trial)
- [ ] Railway gives $5 free credit
- [ ] Add a credit card to get an additional $5 trial
- [ ] Total: $10 free to start

✅ You're now logged into Railway!

---

## STEP 3: Deploy from GitHub (3 minutes)

### 3.1 Create New Project
- [ ] In Railway dashboard, click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Search for: `gideonjohnson/DafLegal`
- [ ] Click on your repository to select it

### 3.2 Wait for Auto-Detection
- [ ] Railway will scan your repo (takes ~30 seconds)
- [ ] It should auto-detect 3 services:
  - ✓ Backend (Python/FastAPI)
  - ✓ Frontend (Next.js)
  - ✓ Worker (Celery)
- [ ] All 3 services will appear in your project dashboard

✅ Your services are created! (Not deployed yet)

---

## STEP 4: Add Databases (2 minutes)

### 4.1 Add PostgreSQL
- [ ] Click "+ New" button in your project
- [ ] Select "Database"
- [ ] Click "Add PostgreSQL"
- [ ] Wait 30 seconds for database to provision
- [ ] You'll see "Postgres" appear in your project

### 4.2 Add Redis
- [ ] Click "+ New" button again
- [ ] Select "Database"
- [ ] Click "Add Redis"
- [ ] Wait 30 seconds for Redis to provision
- [ ] You'll see "Redis" appear in your project

✅ You now have 5 items: Backend, Frontend, Worker, Postgres, Redis

---

## STEP 5: Configure Backend Variables (3 minutes)

### 5.1 Open Backend Settings
- [ ] Click on your "Backend" service
- [ ] Click on the "Variables" tab
- [ ] Click "Add Variable" or "+ New Variable"

### 5.2 Add Environment Variables (One by one)
Copy and paste these EXACTLY:

**Variable 1:**
- [ ] Key: `DATABASE_URL`
- [ ] Value: `${{Postgres.DATABASE_URL}}`

**Variable 2:**
- [ ] Key: `REDIS_URL`
- [ ] Value: `${{Redis.REDIS_URL}}`

**Variable 3:**
- [ ] Key: `SECRET_KEY`
- [ ] Value: `hQzMfV9ppbuc6zliTQVmMVT84B9z28HId63Z5cT8FXk`

**Variable 4:**
- [ ] Key: `ENVIRONMENT`
- [ ] Value: `production`

**Variable 5 (CRITICAL):**
- [ ] Key: `OPENAI_API_KEY`
- [ ] Value: `sk-proj-your-actual-key-from-step-1`
  (Replace with YOUR key from Step 1!)

### 5.3 Save Variables
- [ ] Click "Add" or "Save" after each variable
- [ ] Verify all 5 variables are listed

✅ Backend configured!

---

## STEP 6: Configure Worker Variables (2 minutes)

### 6.1 Open Worker Settings
- [ ] Click on your "Worker" service
- [ ] Click on the "Variables" tab

### 6.2 Copy Backend Variables
**EASY WAY**: Worker needs the SAME variables as Backend!

- [ ] Add the SAME 5 variables from Step 5:
  1. `DATABASE_URL=${{Postgres.DATABASE_URL}}`
  2. `REDIS_URL=${{Redis.REDIS_URL}}`
  3. `SECRET_KEY=hQzMfV9ppbuc6zliTQVmMVT84B9z28HId63Z5cT8FXk`
  4. `ENVIRONMENT=production`
  5. `OPENAI_API_KEY=sk-proj-your-actual-key`

✅ Worker configured!

---

## STEP 7: Get Backend URL (1 minute)

### 7.1 Generate Backend URL
- [ ] Click on your "Backend" service
- [ ] Click on the "Settings" tab
- [ ] Find "Domains" section
- [ ] Click "Generate Domain" if not already generated
- [ ] Copy the URL (looks like: `https://daflegal-backend-production-xxxx.up.railway.app`)
- [ ] **SAVE THIS URL** - you need it for Step 8!

✅ Backend URL copied!

---

## STEP 8: Configure Frontend Variables (2 minutes)

### 8.1 Open Frontend Settings
- [ ] Click on your "Frontend" service
- [ ] Click on the "Variables" tab

### 8.2 Add Frontend Variable
**Variable 1 (ONLY ONE NEEDED):**
- [ ] Key: `NEXT_PUBLIC_API_URL`
- [ ] Value: `https://your-backend-url-from-step-7.up.railway.app`
  (Paste the EXACT URL you copied in Step 7)
- [ ] Make sure there's NO trailing slash at the end!

✅ Frontend configured!

---

## STEP 9: Deploy All Services (5-10 minutes)

### 9.1 Trigger Deployments
- [ ] Go back to project dashboard
- [ ] Each service should automatically start deploying
- [ ] If not, click each service and click "Deploy"

### 9.2 Monitor Deployment Progress
Watch each service:

**Backend:**
- [ ] Status changes from "Building" → "Deploying" → "Active"
- [ ] Takes ~3-5 minutes
- [ ] Check logs for "Application startup complete"

**Worker:**
- [ ] Status changes to "Active"
- [ ] Takes ~2-3 minutes
- [ ] Check logs for "celery@worker ready"

**Frontend:**
- [ ] Status changes to "Active"
- [ ] Takes ~3-5 minutes
- [ ] Check logs for "Build succeeded"

### 9.3 Wait for All Green
- [ ] All 3 services show "Active" status (green)
- [ ] No error messages in any logs
- [ ] All 5 items (3 services + 2 databases) are running

✅ All services deployed!

---

## STEP 10: Get Your Production URL (1 minute)

### 10.1 Get Frontend URL
- [ ] Click on your "Frontend" service
- [ ] Click on "Settings" tab
- [ ] Find "Domains" section
- [ ] Copy the URL (looks like: `https://daflegal-frontend-production-xxxx.up.railway.app`)

### 10.2 Test Your App
- [ ] Open the Frontend URL in a new browser tab
- [ ] You should see the DafLegal homepage!

✅ Your app is LIVE! 🎉

---

## STEP 11: Test Key Features (5 minutes)

Go to your production URL and test:

- [ ] Homepage loads correctly
- [ ] Press `Cmd/Ctrl + K` → Universal Ask Bar opens
- [ ] Navigate to `/analyze` page
- [ ] Try uploading a test document (use a small PDF)
- [ ] Check if analysis completes
- [ ] Navigate to `/research` page
- [ ] Ask a test legal question
- [ ] Try the Timeline Builder at `/timeline`

✅ All features working!

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Production URLs:
- **App**: https://your-frontend-url.up.railway.app
- **API Docs**: https://your-backend-url.up.railway.app/docs

### What to do next:
1. Add a custom domain (optional)
2. Set up monitoring and alerts
3. Share with your team!
4. Start using DafLegal in production

### Estimated Monthly Costs:
- Railway: ~$5-10/month
- OpenAI API: ~$5-50/month (based on usage)
- **Total**: ~$10-60/month

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check OPENAI_API_KEY is set correctly
- Verify it starts with `sk-proj-` or `sk-`
- Check logs for detailed error messages

**Frontend can't reach backend:**
- Verify NEXT_PUBLIC_API_URL is correct
- Make sure it uses the Backend URL, not Frontend URL
- Check there's no trailing slash

**Database connection errors:**
- Make sure DATABASE_URL uses the Railway variable syntax: `${{Postgres.DATABASE_URL}}`
- Wait 2-3 minutes after adding databases

**Still stuck?**
- Check Railway logs: Service → Deployments → View Logs
- Review DEPLOYMENT_QUICK_START.md
- Visit Railway Discord: https://discord.gg/railway

---

Generated: $(date)
