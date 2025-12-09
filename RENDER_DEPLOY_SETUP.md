# Automated Render Deployment Setup

GitHub Actions workflow created to automatically deploy to Render on every push to main.

## Setup Instructions

### Step 1: Get Render Deploy Hook

1. Go to https://dashboard.render.com/web/daflegal-frontend
2. Go to **Settings** tab
3. Scroll to **Deploy Hook** section
4. Click **"Create Deploy Hook"**
5. Copy the URL - it will look like:
   ```
   https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyy
   ```

### Step 2: Extract Values

From the deploy hook URL, extract:
- **Service ID**: The part after `srv-` (e.g., `srv-xxxxxxxxxxxxx`)
- **Deploy Key**: The part after `key=` (e.g., `yyyyyyyyyyy`)

### Step 3: Add GitHub Secrets

1. Go to https://github.com/gideonjohnson/DafLegal/settings/secrets/actions
2. Click **"New repository secret"**
3. Add two secrets:

   **Secret 1:**
   - Name: `RENDER_SERVICE_ID`
   - Value: `srv-xxxxxxxxxxxxx` (just the service ID part)

   **Secret 2:**
   - Name: `RENDER_DEPLOY_HOOK_KEY`
   - Value: `yyyyyyyyyyy` (just the key part)

4. Click **"Add secret"** for each

### Step 4: Test

1. Push any change to main branch:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin main
   ```

2. Check GitHub Actions: https://github.com/gideonjohnson/DafLegal/actions
3. Verify Render deploys: https://dashboard.render.com/web/daflegal-frontend

## How It Works

The workflow triggers on every push to `main` that affects:
- `frontend/**` files
- `backend/**` files
- `render.yaml`

It sends a POST request to Render's deploy hook, triggering an automatic deployment.

## Troubleshooting

**If deployment doesn't trigger:**
1. Check GitHub Actions logs
2. Verify secrets are correctly set
3. Ensure deploy hook URL is valid in Render dashboard

**If you see "404" or "Unauthorized":**
- Double-check the Service ID and Deploy Hook Key values

## Alternative: Manual Deployment

Until secrets are configured, manually deploy at:
https://dashboard.render.com/web/daflegal-frontend

Click **"Manual Deploy"** → **"Deploy latest commit"**
