# Keep-Alive Setup for Render Free Tier

The Render free tier spins down services after 15 minutes of inactivity, causing 45-second cold starts.

## Solutions

### Option 1: Upgrade Render Plan (Recommended)
- Go to https://dashboard.render.com
- Select your `daflegal-backend` service
- Click "Upgrade" and choose Starter ($7/month) or higher
- This eliminates cold starts entirely

### Option 2: External Keep-Alive Pings (Free)

Use external monitoring services to ping your backend every 5-10 minutes:

#### A. Using Healthchecks.io (Already Integrated!)

1. Go to https://healthchecks.io and create account
2. Create a new check:
   - Name: "DafLegal Backend"
   - Period: 5 minutes
   - Grace Time: 2 minutes
3. Instead of using the ping URL directly, configure it to monitor your health endpoint:
   - Click "Integrations" tab
   - Add "HTTP" integration
   - URL: `https://daflegal-backend.onrender.com/health`
   - Method: GET
   - Schedule: Every 5 minutes
4. Copy the ping URL and add to Render:
   - Go to Render dashboard > daflegal-backend > Environment
   - Set `HEALTHCHECK_URL` to your ping URL
   - Save changes (triggers redeploy)

#### B. Using UptimeRobot (Alternative, Free)

1. Go to https://uptimerobot.com and create account
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: DafLegal Backend
   - URL: `https://daflegal-backend.onrender.com/health`
   - Monitoring Interval: 5 minutes
3. This will ping your service every 5 minutes, keeping it warm

#### C. Using Cron-Job.org (Alternative, Free)

1. Go to https://cron-job.org and create account
2. Create new cron job:
   - Title: DafLegal Keep-Alive
   - URL: `https://daflegal-backend.onrender.com/health`
   - Schedule: */5 * * * * (every 5 minutes)
   - Request Method: GET

## Current Status

The application already has:
- `/health` endpoint for external monitoring
- Internal healthcheck monitoring (pings healthchecks.io from inside the app)
- The internal pinging won't prevent Render spindown on free tier

**Action Required:** Set up ONE of the external monitoring services above to prevent cold starts.

## Trade-offs

**Free Tier + Keep-Alive:**
- Pros: No cost
- Cons: Still some occasional cold starts if pings fail, uses monitoring quota

**Paid Tier:**
- Pros: No cold starts, better performance, more resources
- Cons: $7+/month cost

## Recommendation

For production use, upgrade to Render Starter plan. The $7/month is worth it for:
- No cold starts (better UX)
- Better reliability
- More CPU/memory resources
- Professional appearance
