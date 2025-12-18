# Quick Setup Card - Copy & Paste Values

**Time:** 15 minutes for critical setup
**Date:** December 18, 2024

---

## 🔴 CRITICAL - Add These First (15 min)

### Frontend (daflegal-frontend)

Go to: https://dashboard.render.com → **daflegal-frontend** → **Environment**

```
Key:   NEXTAUTH_SECRET
Value: XNXrhujdylNPVfFYmxIRQhNTvV5tiwWxYH4tiBvH8qc=
```

**✅ This value is ready to copy-paste!**

---

### Backend (daflegal-backend)

Go to: https://dashboard.render.com → **daflegal-backend** → **Environment**

#### 1. OpenAI API Key (Required)
```
Key:   OPENAI_API_KEY
Value: [Get from https://platform.openai.com/api-keys]
```

**Steps:**
1. Visit: https://platform.openai.com/api-keys
2. Click: "Create new secret key"
3. Name: "DafLegal Production"
4. Copy the key (starts with `sk-`)
5. Paste above

---

#### 2. Sentry DSN (Required)
```
Key:   SENTRY_DSN
Value: [Get from https://sentry.io]
```

**Steps:**
1. Visit: https://sentry.io
2. Create project: Platform = Python, Name = DafLegal
3. Copy DSN (format: `https://abc@o123.ingest.sentry.io/456`)
4. Paste above

---

## 🟡 RECOMMENDED - Add These Next (15 min)

### Frontend (daflegal-frontend)

#### Google Analytics
```
Key:   NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: [Get from https://analytics.google.com]
```

**Steps:**
1. Visit: https://analytics.google.com
2. Create property: "DafLegal"
3. Add data stream: Web → `https://daflegal.com`
4. Copy Measurement ID (format: `G-XXXXXXXXXX`)

---

#### Microsoft Clarity
```
Key:   NEXT_PUBLIC_CLARITY_PROJECT_ID
Value: [Get from https://clarity.microsoft.com]
```

**Steps:**
1. Visit: https://clarity.microsoft.com
2. Add project: Name = DafLegal, Website = `https://daflegal.com`
3. Copy Project ID

---

### Backend (daflegal-backend)

#### Healthchecks.io
```
Key:   HEALTHCHECK_URL
Value: [Get from https://healthchecks.io]
```

**Steps:**
1. Visit: https://healthchecks.io
2. Add check: Name = DafLegal, Period = 5 min
3. Copy ping URL (format: `https://hc-ping.com/uuid`)

---

## ✅ Verification

After adding variables, run:

```bash
# Test production
./test_production_env.sh

# Test E2E flow
./test_production_flow.sh
```

**Check:**
- ✅ https://daflegal.com loads
- ✅ Can signup/login
- ✅ No console errors
- ✅ Sentry shows "Waiting for events"

---

## 📋 Checklist

### Critical (Do First)
- [ ] NEXTAUTH_SECRET → Frontend
- [ ] OPENAI_API_KEY → Backend
- [ ] SENTRY_DSN → Backend

### Recommended (Do Next)
- [ ] NEXT_PUBLIC_GA_MEASUREMENT_ID → Frontend
- [ ] NEXT_PUBLIC_CLARITY_PROJECT_ID → Frontend
- [ ] HEALTHCHECK_URL → Backend

---

## 🔗 Quick Links

**Render Dashboard:** https://dashboard.render.com

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Sentry: https://sentry.io
- Analytics: https://analytics.google.com
- Clarity: https://clarity.microsoft.com
- Healthchecks: https://healthchecks.io

**Test Production:**
- Frontend: https://daflegal.com
- Backend: https://daflegal-backend.onrender.com/health
- API Docs: https://daflegal-backend.onrender.com/docs

---

**Total Time:** ~30 minutes
**Result:** Production-ready at 10/10 🚀
