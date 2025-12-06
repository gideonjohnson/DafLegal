# Render Auto-Deploy Setup Guide

## Problem
Render is not automatically deploying when you push to GitHub.

## Permanent Solution

### Step 1: Get Render Deploy Hook URLs

1. Go to **https://dashboard.render.com**
2. Click on your **daflegal-frontend** service
3. Go to **Settings** tab
4. Scroll down to **"Deploy Hook"**
5. Click **"Create Deploy Hook"**
6. Copy the URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)
7. Repeat for **daflegal-backend** service

### Step 2: Add Deploy Hooks to GitHub Secrets

1. Go to **https://github.com/gideonjohnson/DafLegal/settings/secrets/actions**
2. Click **"New repository secret"**
3. Add these two secrets:

   **Secret 1:**
   - Name: `RENDER_FRONTEND_DEPLOY_HOOK`
   - Value: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy` (your frontend deploy hook)

   **Secret 2:**
   - Name: `RENDER_BACKEND_DEPLOY_HOOK`
   - Value: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy` (your backend deploy hook)

### Step 3: Push to GitHub

Once the secrets are added, the GitHub Action will automatically:
- Trigger on every push to `main` branch
- Call Render's deploy hooks
- Start deployments for both frontend and backend

## How It Works

- `.github/workflows/deploy.yml` runs on every push to main
- Calls Render's Deploy Hook API
- Render starts building and deploying your services
- No manual intervention needed ever again

## Test It

After adding the secrets:
1. Make any small change to any file
2. Commit and push to main
3. Check GitHub Actions tab - you'll see the workflow running
4. Check Render dashboard - deployments should start automatically

## Verify

Check if it's working:
```bash
# Check latest workflow runs
# Go to: https://github.com/gideonjohnson/DafLegal/actions
```
