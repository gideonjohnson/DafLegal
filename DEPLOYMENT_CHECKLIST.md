# 🚀 DafLegal Deployment Checklist

## Current Status

| Service | Status | URL | Notes |
|---------|--------|-----|-------|
| Frontend | ✅ LIVE | https://daflegal-frontend.onrender.com | Returns 200 OK |
| Backend | ❌ DOWN | https://daflegal-backend.onrender.com | Needs env vars |
| PostgreSQL | ❓ Unknown | Internal only | Check in Render |
| Redis | ❓ Unknown | Internal only | Check in Render |

## 🔴 CRITICAL: Must Do First

### 1. Set Backend Environment Variables

**Required variables that are missing:**

Go to: [Render Dashboard](https://dashboard.render.com) → `daflegal-backend` → Environment

```bash
SECRET_KEY=8490cb8c1e9092484e0b653bf9d2f3208e07a6e3e73cf1da2f48ca484530c6c4
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

**Verify these exist (auto-populated):**
- DATABASE_URL
- REDIS_URL

### 2. Set Frontend Environment Variable

Go to: `daflegal-frontend` → Environment

```bash
NEXTAUTH_SECRET=e38f094d2d51d1306489874dcf8e806b489036b63a66ebbe1df4ea685a5c90c8
```

### 3. Manual Deploy Both Services

After adding env vars:
1. `daflegal-backend` → Manual Deploy → Deploy latest commit
2. `daflegal-frontend` → Manual Deploy → Deploy latest commit (if needed)

**Wait 3-5 minutes for build completion**

---

## ✅ Phase 1: Basic Deployment (30 min)

- [x] Backend code pushed to GitHub
- [x] Frontend code pushed to GitHub
- [x] Render.yaml configured
- [x] PostgreSQL service created
- [x] Redis service created
- [x] Backend service created
- [x] Frontend service created
- [x] Celery worker service created
- [x] Secrets generated
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend health check passes
- [ ] Frontend loads in browser

**Current Progress: 8/12 (67%)**

---

## ✅ Phase 2: Core Functionality Testing (1 hour)

### Database & Redis
- [ ] Database connection works
- [ ] Database tables created (migrations ran)
- [ ] Redis connection works
- [ ] Can create test user in database

### Authentication
- [ ] Signup page loads
- [ ] Can create new account
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] Session persists after refresh
- [ ] Logout works

### File Upload
- [ ] Upload form appears
- [ ] Can select PDF file
- [ ] Upload starts
- [ ] Upload completes without errors
- [ ] File saved (check logs)

### AI Features
- [ ] OpenAI API key valid
- [ ] Contract analysis triggers
- [ ] Analysis completes
- [ ] Results display correctly

---

## ✅ Phase 3: Optional Services (2 hours)

### Cloudinary (File Storage)
- [ ] Account created
- [ ] API credentials obtained
- [ ] Environment variables set
- [ ] Test upload to Cloudinary
- [ ] Files accessible via URL

### Stripe (Payments)
- [ ] Account created (use test mode first)
- [ ] API credentials obtained
- [ ] Price IDs created
- [ ] Environment variables set
- [ ] Test checkout flow
- [ ] Webhooks configured

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth credentials obtained
- [ ] Authorized redirect URIs set
- [ ] Environment variables set
- [ ] Test Google login

### Analytics
- [ ] Google Analytics account created
- [ ] Measurement ID obtained
- [ ] Environment variable set
- [ ] Clarity account created (optional)
- [ ] Tracking verified in browser

### Email Marketing
- [ ] Mailchimp account created
- [ ] List created
- [ ] API key obtained
- [ ] Environment variables set
- [ ] Test newsletter signup

---

## ✅ Phase 4: Production Readiness (1 hour)

### Security
- [ ] HTTPS enforced (automatic with Render)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] File size limits set
- [ ] API authentication working
- [ ] Secrets not exposed in logs

### Performance
- [ ] Frontend loads in <3 seconds
- [ ] Backend response time <500ms
- [ ] Database queries optimized
- [ ] Redis caching working
- [ ] No console errors
- [ ] No memory leaks

### Monitoring
- [ ] Sentry configured (optional)
- [ ] Error logging working
- [ ] Health checks configured
- [ ] Uptime monitoring setup
- [ ] Alerts configured

### Documentation
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] API endpoints documented
- [ ] User guide created
- [ ] Admin guide created

---

## 🐛 Troubleshooting Guide

### Backend Won't Start

**Error:** `ValidationError: OPENAI_API_KEY`
**Fix:** Add OPENAI_API_KEY in Render environment variables

**Error:** `Connection refused` to database
**Fix:** Wait for PostgreSQL service to be fully running (2-3 min)

**Error:** `Module not found`
**Fix:** Check requirements.txt, may need to rebuild

### Frontend Can't Connect to Backend

**Error:** `Network Error` or `Failed to fetch`
**Fix:** Verify NEXT_PUBLIC_API_URL is correct

**Error:** CORS error in browser console
**Fix:** Check backend CORS settings in main.py

### Database Issues

**Error:** `relation does not exist`
**Fix:** Migrations didn't run - check backend startup logs

**Error:** `password authentication failed`
**Fix:** DATABASE_URL is incorrect

### File Upload Fails

**Error:** `413 Payload Too Large`
**Fix:** Increase MAX_FILE_SIZE_MB in backend config

**Error:** File not saved
**Fix:** Check Cloudinary credentials or use local storage

---

## 📞 Quick Reference

### URLs
- Frontend: https://daflegal-frontend.onrender.com
- Backend: https://daflegal-backend.onrender.com
- Backend Health: https://daflegal-backend.onrender.com/health
- API Docs: https://daflegal-backend.onrender.com/docs

### Commands

**Test Backend:**
```bash
curl https://daflegal-backend.onrender.com/health
```

**Test Database:**
```bash
# Check Render logs for: "Database tables created"
```

**Test OpenAI:**
```bash
curl -X POST https://daflegal-backend.onrender.com/api/v1/contracts/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf"
```

### Files
- Secrets: `SECRETS.txt` (DO NOT COMMIT)
- Setup Guide: `RENDER_ENV_SETUP.md`
- This Checklist: `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Priority Order

1. **NOW** - Set backend environment variables (5 min)
2. **NOW** - Verify backend starts successfully (10 min)
3. **NEXT** - Test authentication (15 min)
4. **NEXT** - Test file upload (15 min)
5. **LATER** - Add Cloudinary (30 min)
6. **LATER** - Add Stripe (1 hour)
7. **LATER** - Add optional services (2 hours)

---

**Last Updated:** December 13, 2025
**Next Step:** Set backend environment variables in Render dashboard
