# Analytics Setup Guide for DafLegal

## Why Analytics?

Analytics help you understand:
- How users find your app
- What features they use
- Where they drop off
- How to improve conversion
- Business growth metrics

We'll set up:
1. **Google Analytics 4** - Full analytics platform
2. **Microsoft Clarity** - Session recordings & heatmaps

## Time Required: 25 minutes

---

# Part 1: Google Analytics 4 (15 min)

## Step 1: Create Google Analytics Account (5 min)

1. Go to: https://analytics.google.com
2. Click **Start measuring**
3. Configure **Account**:
   - **Account name:** DafLegal
   - **Account data sharing:** (select preferences)
   - Click **Next**

4. Configure **Property**:
   - **Property name:** DafLegal Production
   - **Reporting time zone:** Your timezone
   - **Currency:** USD (or your currency)
   - Click **Next**

5. **Business Information**:
   - **Industry category:** Legal Services
   - **Business size:** Small (1-10 employees) or as applicable
   - **How you plan to use Analytics:** All options
   - Click **Create**

6. Accept **Terms of Service**

---

## Step 2: Set Up Data Stream (3 min)

1. Click **Web** (for website tracking)
2. Configure:
   - **Website URL:** https://daflegal-frontend.onrender.com
   - **Stream name:** DafLegal Frontend
   - Click **Create stream**

3. You'll see **Measurement ID**: `G-XXXXXXXXXX`
4. **Copy this ID** - you'll need it!

---

## Step 3: Enable Enhanced Measurement (2 min)

Enhanced measurement automatically tracks:
- Page views
- Scrolls
- Outbound clicks
- Site search
- Video engagement
- File downloads

1. In your stream, scroll to **Enhanced measurement**
2. Toggle it **ON** (should be on by default)
3. Click the gear icon to customize:
   - ✅ Page views (automatic)
   - ✅ Scrolls (90% depth)
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ File downloads
4. Click **Save**

---

## Step 4: Set Up Custom Events (Optional) (2 min)

Custom events help track specific actions:

### Recommended Events for DafLegal

```javascript
// User signs up
gtag('event', 'sign_up', {
  method: 'email'  // or 'google'
})

// Contract uploaded
gtag('event', 'contract_uploaded', {
  file_type: 'pdf',
  file_size_kb: 1024
})

// Analysis completed
gtag('event', 'analysis_completed', {
  contract_id: 'ctr_xxx',
  duration_seconds: 15
})

// Subscription purchased
gtag('event', 'purchase', {
  transaction_id: 'txn_xxx',
  value: 99.00,
  currency: 'USD',
  items: [{
    item_name: 'Pro Plan',
    price: 99.00
  }]
})
```

These will be implemented in your frontend code.

---

## Step 5: Add to Render Frontend (3 min)

1. Go to: https://dashboard.render.com
2. Click **daflegal-frontend**
3. Go to **Environment** tab
4. Add:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

5. Click **Save Changes**
6. Service will redeploy

---

# Part 2: Microsoft Clarity (10 min)

Microsoft Clarity provides:
- Session recordings (watch user interactions)
- Heatmaps (see where users click)
- Rage clicks detection
- Dead clicks detection
- All **FREE** with unlimited sessions!

## Step 1: Create Clarity Account (3 min)

1. Go to: https://clarity.microsoft.com
2. Click **Sign up**
3. Sign in with Microsoft, Google, or Facebook
4. Accept terms

---

## Step 2: Create Project (2 min)

1. Click **Add new project**
2. Configure:
   - **Name:** DafLegal
   - **Website URL:** https://daflegal-frontend.onrender.com
   - **Category:** Legal Services
3. Click **Add**

---

## Step 3: Get Tracking Code (2 min)

1. You'll see **Setup** instructions
2. Copy the **Project ID**: `abcdefghij`
3. Or click **Install manually** to see tracking code:

```javascript
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

---

## Step 4: Add to Render Frontend (3 min)

1. Go to: https://dashboard.render.com
2. Click **daflegal-frontend**
3. Go to **Environment** tab
4. Add:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
```

5. Click **Save Changes**

---

# Environment Variables Summary

Add these to **daflegal-frontend** on Render:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
```

---

# Verification & Testing (5 min)

## Verify Google Analytics

1. Go to: https://analytics.google.com
2. Click **Realtime** report
3. Open your site: https://daflegal-frontend.onrender.com
4. You should see yourself in the **Realtime** view
5. Navigate around and watch the data update

## Verify Microsoft Clarity

1. Go to: https://clarity.microsoft.com
2. Click on your project
3. Click **Recordings** (may take 2-3 minutes for first recording)
4. Navigate your site for 30 seconds
5. Refresh Clarity - you should see your session

---

# Key Metrics to Track

## User Acquisition

Track where users come from:
- **Source/Medium:** google/organic, facebook/social, etc.
- **Landing pages:** Which pages bring users in
- **Conversion rate:** Visitors → Sign-ups

## User Engagement

Track how users interact:
- **Active users:** Daily, weekly, monthly
- **Session duration:** How long users stay
- **Pages per session:** How many pages they view
- **Bounce rate:** % who leave immediately

## User Behavior (Clarity)

Watch session recordings to see:
- Where users get confused
- What features they use most
- Where they drop off in sign-up flow
- Technical issues (errors, slow loading)

## Conversion Funnel

Track the complete user journey:

```
Landing Page → Sign Up → Upload Contract → Analysis → Upgrade
```

Set up events for each step to measure drop-off.

---

# Custom Events Implementation

Add these to your frontend code:

## 1. Page Views (Automatic with GA4)

```javascript
// Already tracked by default
```

## 2. User Sign-Up

```javascript
// In sign-up success handler
gtag('event', 'sign_up', {
  method: 'email'
})

// For Google OAuth
gtag('event', 'sign_up', {
  method: 'google'
})
```

## 3. Contract Upload

```javascript
// After successful upload
gtag('event', 'contract_uploaded', {
  file_type: fileExtension,
  file_size_kb: Math.round(fileSize / 1024),
  contract_id: contractId
})
```

## 4. Analysis Completed

```javascript
// When analysis finishes
gtag('event', 'analysis_completed', {
  contract_id: contractId,
  duration_seconds: analysisTime,
  clauses_found: clauseCount
})
```

## 5. Subscription Purchase

```javascript
// After successful Stripe checkout
gtag('event', 'purchase', {
  transaction_id: subscriptionId,
  value: 99.00,
  currency: 'USD',
  items: [{
    item_id: 'pro_plan',
    item_name: 'Pro Plan',
    price: 99.00
  }]
})
```

## 6. Feature Usage

```javascript
// Track feature usage
gtag('event', 'feature_used', {
  feature_name: 'clause_library',
  action: 'search'
})

gtag('event', 'feature_used', {
  feature_name: 'comparison',
  contracts_compared: 2
})
```

---

# Clarity Heatmaps

After collecting data, Clarity generates:

## Click Heatmaps
See where users click most:
- Hot spots (red) = many clicks
- Cold spots (blue) = few clicks
- Identify popular features
- Find confusing UI elements

## Scroll Heatmaps
See how far users scroll:
- % of users who reach bottom
- Where users stop scrolling
- Optimize content placement

## Rage Clicks
Detect frustrated users:
- Rapid repeated clicks
- Usually indicates broken functionality
- Fix high rage-click areas immediately

---

# Privacy & Compliance

## GDPR Compliance

Add cookie consent banner:

```javascript
// Basic consent implementation
if (userConsent === true) {
  // Initialize GA
  gtag('config', 'G-XXXXXXXXXX')

  // Initialize Clarity
  clarity('start', 'YOUR_PROJECT_ID')
}
```

## Cookie Policy Page

Create: `/privacy` and `/cookies` pages explaining:
- What data you collect
- Why you collect it
- How users can opt out
- How long data is retained

## IP Anonymization (GA4)

GA4 anonymizes IPs by default, but verify:

1. Go to: Admin → Data Settings → Data Collection
2. Ensure **IP anonymization** is enabled

---

# Advanced Analytics Setup (Optional)

## Google Tag Manager

For easier tag management:

1. Create GTM account: https://tagmanager.google.com
2. Install GTM container
3. Add GA4 and Clarity via GTM
4. Manage all tracking in one place

## Conversion Goals

Set up goals in GA4:

1. **Admin** → **Events** → **Create event**
2. Common goals:
   - Sign-up completed
   - First contract uploaded
   - Subscription purchased
   - API key created

## Audience Segmentation

Create audiences:

1. **Admin** → **Audiences** → **New audience**
2. Useful segments:
   - Active users (used app in last 7 days)
   - Paying customers
   - Free trial users
   - High-value users (10+ contracts)

---

# Monitoring Dashboard

Create a custom dashboard to track:

## Daily Metrics
- Active users
- New sign-ups
- Contracts analyzed
- Revenue (from Stripe)

## Weekly Metrics
- User retention rate
- Feature adoption
- Conversion funnel
- Top pages

## Monthly Metrics
- MRR (Monthly Recurring Revenue)
- Churn rate
- Customer lifetime value
- Growth rate

---

# Troubleshooting

## "No data in Google Analytics"

**Checks:**
1. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
2. Check Measurement ID is correct (starts with G-)
3. Look for script in page source
4. Check browser console for errors
5. Disable ad blockers
6. Wait 24-48 hours for full reporting

## "Clarity not recording"

**Checks:**
1. Verify `NEXT_PUBLIC_CLARITY_PROJECT_ID` is set
2. Check Project ID is correct
3. Look for Clarity script in page source
4. Wait 2-3 minutes for first recording
5. Refresh Clarity dashboard

## "Events not showing"

**Checks:**
1. Verify gtag is loaded before event fires
2. Check event syntax is correct
3. Use GA4 DebugView to see real-time events
4. Check browser console for errors

---

# Cost Information

## Google Analytics 4
- **100% FREE**
- 10 million events per month (plenty for most apps)
- Unlimited properties
- Unlimited users
- If you exceed limits, data is sampled

## Microsoft Clarity
- **100% FREE**
- Unlimited sessions
- Unlimited recordings
- Unlimited heatmaps
- No limits, ever!

---

# Next Steps

After analytics is set up:

1. ✅ Verify tracking is working
2. ✅ Set up conversion goals
3. ✅ Implement custom events
4. ✅ Create monitoring dashboard
5. ✅ Watch session recordings weekly
6. ✅ Review heatmaps monthly
7. ✅ Optimize based on data

---

**Analytics Setup Complete!** 📊

You can now track user behavior, optimize conversion, and grow your business with data!
