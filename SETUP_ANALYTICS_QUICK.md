# 📊 Analytics Setup - Quick Guide

## Overview
Set up Google Analytics 4 and Microsoft Clarity to track user behavior, conversions, and improve your product.

---

## 🎯 Google Analytics 4 (GA4)

### Step 1: Create GA4 Property (5 minutes)

1. **Go to:** https://analytics.google.com
2. **Sign in** with your Google account
3. **Click:** "Admin" (bottom left gear icon)
4. **Click:** "Create Property"
5. **Fill in:**
   - Property name: `DafLegal`
   - Time zone: Your timezone
   - Currency: Your currency
6. **Click:** "Next"
7. **Select:** Business category (Legal services)
8. **Select:** Business size (Small)
9. **Click:** "Create"
10. **Accept** terms of service

### Step 2: Create Web Data Stream

1. **Click:** "Web" platform
2. **Enter:**
   - Website URL: `https://daflegal-frontend.onrender.com`
   - Stream name: `DafLegal Production`
3. **Enable:** Enhanced measurement (recommended)
4. **Click:** "Create stream"

### Step 3: Get Measurement ID

You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)

**Copy this ID!** You'll need it for the next step.

### Step 4: Add to Frontend Environment

1. **Go to:** https://dashboard.render.com
2. **Click:** `daflegal-frontend` service
3. **Click:** "Environment" tab
4. **Add environment variable:**
   ```
   Key: NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-XXXXXXXXXX (paste your actual ID)
   ```
5. **Click:** "Save Changes"
6. **Wait** for automatic redeploy (~2 minutes)

### Step 5: Verify It's Working

1. **Visit:** https://daflegal-frontend.onrender.com
2. **In GA4:** Go to Reports → Realtime
3. **You should see:** Your visit showing up in real-time

---

## 🔍 Microsoft Clarity (Session Recordings & Heatmaps)

### Step 1: Create Clarity Project (3 minutes)

1. **Go to:** https://clarity.microsoft.com
2. **Sign in** with Microsoft account (or create one)
3. **Click:** "Add new project"
4. **Fill in:**
   - Name: `DafLegal`
   - Website URL: `https://daflegal-frontend.onrender.com`
5. **Click:** "Add new project"

### Step 2: Get Project ID

You'll see your **Project ID** on the setup page

**Copy this ID!**

### Step 3: Add to Frontend Environment

1. **Go to:** https://dashboard.render.com
2. **Click:** `daflegal-frontend` service
3. **Click:** "Environment" tab
4. **Add environment variable:**
   ```
   Key: NEXT_PUBLIC_CLARITY_PROJECT_ID
   Value: [paste your Clarity project ID]
   ```
5. **Click:** "Save Changes"
6. **Wait** for automatic redeploy (~2 minutes)

### Step 4: Verify It's Working

1. **Visit:** https://daflegal-frontend.onrender.com
2. **Browse around** for 30 seconds
3. **In Clarity:** Wait ~2 minutes, then check Recordings
4. **You should see:** Your session recorded

---

## 📊 What You'll Track

### Google Analytics 4 Metrics:
- ✅ Page views
- ✅ User sessions
- ✅ Signup events
- ✅ Login events
- ✅ Payment conversions
- ✅ User demographics
- ✅ Traffic sources
- ✅ User journey flow

### Microsoft Clarity Insights:
- 🎥 Session recordings (watch real users)
- 🔥 Heatmaps (where users click)
- 📊 Rage clicks (frustration points)
- ⏱️ Dead clicks (broken elements)
- 📱 Mobile vs desktop behavior
- 🎯 Conversion funnels

---

## 🎯 Quick Implementation Code

The frontend should already have analytics code. Verify it exists:

### Check GA4 Integration

**File:** `frontend/src/app/layout.tsx` or `frontend/src/components/Analytics.tsx`

```tsx
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
      `}
    </Script>
  </>
)}
```

### Check Clarity Integration

**File:** `frontend/src/app/layout.tsx`

```tsx
{process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
  <Script id="clarity-script" strategy="afterInteractive">
    {`
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
    `}
  </Script>
)}
```

---

## ✅ Verification Checklist

After adding environment variables and redeploying:

### Google Analytics 4:
- [ ] Measurement ID added to Render
- [ ] Frontend redeployed
- [ ] Visit website
- [ ] Check GA4 Realtime report (should show 1 active user)
- [ ] Test signup/login (should track events)

### Microsoft Clarity:
- [ ] Project ID added to Render
- [ ] Frontend redeployed
- [ ] Visit website and browse for 30 seconds
- [ ] Wait 2 minutes
- [ ] Check Clarity recordings (should see your session)

---

## 🐛 Troubleshooting

### GA4 Not Tracking

**Check:**
1. Measurement ID is correct (format: G-XXXXXXXXXX)
2. Environment variable is added to frontend (not backend)
3. Frontend has been redeployed after adding the variable
4. No ad blockers or privacy extensions blocking GA

**Test in console:**
```javascript
// Open browser console on your site
window.dataLayer
// Should show array with GA events
```

### Clarity Not Recording

**Check:**
1. Project ID is correct
2. Environment variable is added to frontend
3. Frontend has been redeployed
4. Wait at least 2 minutes after visiting site

**Test in console:**
```javascript
// Open browser console on your site
window.clarity
// Should show clarity function
```

---

## 📈 Using the Data

### Weekly Review Checklist:
1. **GA4 Reports → Acquisition**
   - Where are users coming from?
   - Which channels work best?

2. **GA4 Reports → Engagement**
   - What pages do users visit?
   - How long do they stay?

3. **GA4 Reports → Monetization**
   - How many signups?
   - How many paid conversions?

4. **Clarity → Recordings**
   - Watch 5-10 user sessions
   - Find friction points
   - Identify confusing UX

5. **Clarity → Heatmaps**
   - Are users finding the CTA?
   - Are they clicking expected elements?

---

## 🎯 Cost

**Google Analytics 4:** ✅ FREE (unlimited)
**Microsoft Clarity:** ✅ FREE (unlimited)

Both are completely free, even for commercial use!

---

## 📞 Quick Links

- **Google Analytics:** https://analytics.google.com
- **Microsoft Clarity:** https://clarity.microsoft.com
- **Render Dashboard:** https://dashboard.render.com

---

## 🚀 Next Steps After Setup

1. ✅ Verify analytics are tracking
2. 📊 Set up custom events (optional)
3. 🎯 Create conversion funnels
4. 📧 Set up weekly email reports
5. 🔔 Create alerts for drops in traffic

**Time to complete:** ~15 minutes total
**Benefit:** Invaluable insights into user behavior!
