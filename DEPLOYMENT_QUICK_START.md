# DafLegal - Production Deployment Guide

## 🎯 You Are Here
- ✅ Code pushed to GitHub: https://github.com/gideonjohnson/DafLegal
- ✅ All features implemented and tested
- ✅ Ready to deploy!

## 🚀 Choose Your Platform

### Option A: Railway (Recommended - Easiest)
**Time: 15-20 minutes | Cost: $5/month with $5 free trial**

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select: `gideonjohnson/DafLegal`
4. Railway will auto-detect 3 services:
   - Backend (Python/FastAPI)
   - Frontend (Next.js)
   - Worker (Celery)

5. Add these databases:
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Click "+ New" → "Database" → "Add Redis"

6. Configure environment variables:
   **Backend Service:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   SECRET_KEY=hQzMfV9ppbuc6zliTQVmMVT84B9z28HId63Z5cT8FXk
   ENVIRONMENT=production
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

   **Worker Service:**
   (Same as Backend)

   **Frontend Service:**
   ```
   NEXT_PUBLIC_API_URL=https://daflegal-backend-production-xxxx.up.railway.app
   ```
   (Replace with your actual backend URL from Railway)

7. Click "Deploy" on each service
8. Wait 3-5 minutes for deployment to complete
9. Your app will be live at: `daflegal-frontend-production-xxxx.up.railway.app`

**Full details:** See `RAILWAY_ENV_VARS.txt`

---

### Option B: Render (Free for 90 days)
**Time: 45-60 minutes | Cost: Free → $21/month after trial**

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Create databases first:
   - PostgreSQL: Click "New +" → "PostgreSQL"
   - Redis: Click "New +" → "Redis"

3. Deploy Backend:
   - Click "New +" → "Web Service"
   - Connect to GitHub: `gideonjohnson/DafLegal`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables from `RENDER_ENV_VARS.txt`

4. Deploy Worker:
   - Same as Backend but:
   - Start Command: `celery -A app.workers.celery_app worker --loglevel=info`

5. Deploy Frontend:
   - Click "New +" → "Static Site"
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `out`
   - Add: `NEXT_PUBLIC_API_URL` with your backend URL

**Full details:** See `RENDER_ENV_VARS.txt`

---

## 🔑 Important: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new key → Copy it
5. Paste into deployment environment variables as `OPENAI_API_KEY`

**Estimated costs:**
- Light usage (testing): ~$5-10/month
- Medium usage (50 analyses/day): ~$30-50/month
- Heavy usage (200+ analyses/day): ~$100-200/month

---

## ✅ After Deployment

1. **Test the app:**
   - Visit your deployed URL
   - Upload a test contract to /analyze
   - Try the Universal Ask Bar (Cmd/Ctrl+K)
   - Test timeline builder

2. **Monitor logs:**
   - Railway: Click service → "Deployments" → "View Logs"
   - Render: Click service → "Logs" tab

3. **Set up custom domain (optional):**
   - Railway: Service Settings → "Domains" → Add custom domain
   - Render: Service → "Settings" → "Custom Domains"

4. **Enable HTTPS (auto-enabled):**
   - Both platforms provide free SSL certificates

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check OPENAI_API_KEY is set correctly
- Verify DATABASE_URL is connected
- Check logs for errors

**Frontend can't reach backend:**
- Verify NEXT_PUBLIC_API_URL points to correct backend URL
- Check CORS settings in backend
- Ensure backend is deployed first

**Database connection errors:**
- Use "Internal" database URLs, not "External"
- Wait 2-3 minutes after database creation

---

## 📊 Current Deployment Status

- ✅ GitHub: https://github.com/gideonjohnson/DafLegal
- ✅ Latest commit: 98ac056
- ✅ Features: 10 major features + Universal Ask Bar
- ✅ Code: 6,788 lines of production-ready code

**You're ready to deploy! Choose Railway or Render above and follow the steps.**

---

Generated: $(date)
