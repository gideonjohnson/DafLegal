# Analytics Setup Guide

This guide will help you set up Google Analytics 4 and Microsoft Clarity for DafLegal.

## 📊 Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Enter property name: `DafLegal`
5. Select timezone and currency
6. Click **Next**
7. Fill in business information
8. Click **Create**

### Step 2: Set up Data Stream

1. Click **Web** under Data Streams
2. Enter website URL: `https://daflegal.com`
3. Enter stream name: `DafLegal Production`
4. Click **Create stream**
5. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 3: Add to Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## 🔥 Microsoft Clarity Setup

### Step 1: Create Clarity Project

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Sign in with Microsoft account
3. Click **Add new project**
4. Enter project name: `DafLegal`
5. Enter website URL: `https://daflegal.com`
6. Click **Get tracking code**
7. Copy your **Project ID** from the tracking code

### Step 2: Add to Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
```

## 📈 Events Being Tracked

### Automatic Events
- **Page views**: Every page navigation
- **Session start**: When user lands on site
- **Session duration**: How long users stay

### Custom Events

#### Dark Mode
- `dark_mode_toggle`: When user toggles dark/light mode
  - Label: `dark` or `light`

#### CTA Interactions
- `cta_click`: When user clicks any CTA
  - Label format: `{cta_type}: {cta_text}`
  - Examples:
    - `floating_cta: Start Free Trial`
    - `floating_cta: expand`

#### Exit Intent
- `exit_intent`: Exit intent popup interactions
  - Labels: `shown`, `clicked`, `dismissed`

#### Form Submissions
- `form_submit`: When forms are submitted
  - Label: Form name

#### Button Clicks
- `button_click`: Generic button interactions
  - Label: `{button_name} - {location}`

#### Feature Views
- `feature_view`: When users view specific features
  - Label: Feature name

#### Engagement
- `scroll_depth`: How far users scroll (25%, 50%, 75%, 100%)
- `time_on_page`: How long users spend on pages

## 🎯 Conversion Goals to Set Up in GA4

1. **Sign Up Started**
   - Event: `form_submit`
   - Label: `signup_form`

2. **Free Trial Started**
   - Event: `cta_click`
   - Label contains: `Free Trial`

3. **Feature Engagement**
   - Event: `feature_view`
   - Any label

4. **Deep Scroll**
   - Event: `scroll_depth`
   - Value: `>= 75`

5. **High Time on Site**
   - Event: `time_on_page`
   - Value: `>= 60` (seconds)

## 📱 Verifying Installation

### Google Analytics
1. Go to GA4 **Realtime** report
2. Open your website in a new tab
3. You should see yourself in the Realtime view
4. Click around and verify events are firing

### Microsoft Clarity
1. Go to Clarity dashboard
2. Wait 2-3 minutes after visiting site
3. Click **Recordings** in left sidebar
4. You should see recent sessions
5. Click to watch recording

## 🔧 Testing Events

Open browser console and test events manually:

```javascript
// Test dark mode toggle
trackDarkModeToggle('dark')

// Test CTA click
trackCTAClick('test_cta', 'Test Button')

// Test exit intent
trackExitIntent('shown')

// Test form submit
trackFormSubmit('test_form')

// Test button click
trackButtonClick('test_button', 'header')
```

## 📊 Key Metrics to Monitor

### Acquisition
- **Traffic sources**: Where visitors come from
- **Landing pages**: First pages visited
- **Device types**: Mobile vs Desktop

### Engagement
- **Page views**: Most viewed pages
- **Scroll depth**: Content engagement
- **Time on page**: Content quality indicator
- **Feature views**: Which features interest users

### Conversion
- **Exit intent triggers**: How often shown
- **Exit intent conversions**: Click-through rate
- **CTA clicks**: Which CTAs perform best
- **Form submissions**: Lead generation

### Behavior
- **Dark mode usage**: % users preferring dark mode
- **Session duration**: User engagement
- **Bounce rate**: % leaving after one page

## 🚨 Privacy & GDPR Compliance

The analytics implementation:
- ✅ Loads scripts only after user consent (if needed)
- ✅ Uses `anonymize_ip` for privacy
- ✅ Respects Do Not Track
- ✅ Session-based, not cookie-based tracking

To add cookie consent banner, install:
```bash
npm install react-cookie-consent
```

## 📈 Advanced Features to Enable

### In Google Analytics:
1. **Enhanced measurement**: Enable scroll, outbound clicks, site search
2. **User properties**: Set up custom dimensions for user segments
3. **Audiences**: Create remarketing lists
4. **Funnel analysis**: Set up conversion funnels

### In Microsoft Clarity:
1. **Heatmaps**: Analyze click patterns
2. **Rage clicks**: Find UX frustrations
3. **Dead clicks**: Identify broken elements
4. **Excessive scrolling**: Find confusing content

## 🎓 Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Clarity Documentation](https://docs.microsoft.com/en-us/clarity/)
- [Next.js Analytics](https://nextjs.org/analytics)
