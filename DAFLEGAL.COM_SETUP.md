# daflegal.com Custom Domain Setup Guide

Congratulations on owning daflegal.com! This guide will help you set up your custom domain for DafLegal.

---

## Overview

**Current Setup:**
- Domain: daflegal.com (owned by you)
- Hosting: Railway (after deployment)
- SSL: Automatic (provided by Railway)

**What You'll Have:**
- Frontend: https://daflegal.com
- API: https://api.daflegal.com
- Docs: https://api.daflegal.com/docs

---

## Step 1: Domain DNS Configuration

### Where is your domain registered?

Common registrars:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Others

### DNS Records to Add

You'll need to add these DNS records (exact steps vary by registrar):

#### For Frontend (daflegal.com)

**Record 1: Root Domain**
- Type: `A` or `CNAME`
- Name: `@` or leave blank
- Value: (Get from Railway after deployment)
- TTL: 3600 (1 hour)

**Record 2: WWW Subdomain**
- Type: `CNAME`
- Name: `www`
- Value: (Get from Railway after deployment)
- TTL: 3600

#### For Backend API (api.daflegal.com)

**Record 3: API Subdomain**
- Type: `CNAME`
- Name: `api`
- Value: (Get from Railway after deployment)
- TTL: 3600

---

## Step 2: Railway Domain Setup

After you deploy to Railway (we'll do this together):

### For Frontend Service:

1. Go to Railway Dashboard
2. Click on your "Frontend" service
3. Click "Settings" tab
4. Scroll to "Domains" section
5. Click "+ Custom Domain"
6. Enter: `daflegal.com`
7. Railway will show you DNS records to add
8. Add these to your domain registrar
9. Click "Add" - `www.daflegal.com`
10. Railway will verify DNS (takes 5-60 minutes)

### For Backend Service:

1. Click on your "Backend" service
2. Go to "Settings" → "Domains"
3. Click "+ Custom Domain"
4. Enter: `api.daflegal.com`
5. Add the DNS records shown
6. Railway will verify and issue SSL

---

## Step 3: Update Environment Variables

Once your domains are connected, update Frontend environment variable:

**In Railway Frontend Service:**
- Variable: `NEXT_PUBLIC_API_URL`
- OLD Value: `https://backend-xxx.up.railway.app`
- NEW Value: `https://api.daflegal.com`

This tells your frontend to use the custom API domain.

---

## Step 4: SSL Certificate (Automatic)

Railway automatically provides free SSL certificates:
- SSL is issued via Let's Encrypt
- Automatically renews
- HTTPS is enforced
- No configuration needed!

✅ Your site will be secure by default!

---

## DNS Configuration by Registrar

### GoDaddy:
1. Log in to GoDaddy
2. My Products → Domain → DNS
3. Click "Add" for each record
4. Enter Type, Name, Value
5. Save

### Namecheap:
1. Log in to Namecheap
2. Domain List → Manage
3. Advanced DNS tab
4. Click "Add New Record"
5. Enter details and save

### Google Domains:
1. Log in to Google Domains
2. My Domains → DNS
3. Custom resource records
4. Add each record
5. Save

### Cloudflare:
1. Log in to Cloudflare
2. Select your domain
3. DNS tab
4. Add Record
5. Proxy status: Proxied (orange cloud)

---

## Expected Timeline

| Step | Time |
|------|------|
| Add DNS records | 5 minutes |
| DNS propagation | 5-60 minutes |
| Railway verification | 5-10 minutes |
| SSL certificate issue | 5-10 minutes |
| **Total:** | **20 minutes - 1.5 hours** |

💡 Tip: DNS changes can take up to 24 hours to propagate globally, but usually happen within 1 hour.

---

## Verification Commands

After DNS setup, verify propagation:

```bash
# Check A record
nslookup daflegal.com

# Check CNAME for www
nslookup www.daflegal.com

# Check CNAME for api
nslookup api.daflegal.com
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

---

## Production URLs After Setup

Once complete, your app will be accessible at:

**Main App:**
- https://daflegal.com ← Primary
- https://www.daflegal.com ← Redirects to main

**API:**
- https://api.daflegal.com
- https://api.daflegal.com/docs ← API Documentation

**Features:**
- https://daflegal.com/analyze ← Document Analysis
- https://daflegal.com/timeline ← Timeline Builder
- https://daflegal.com/research ← Legal Research
- https://daflegal.com/compare ← Contract Comparison
- Plus all other features!

---

## Email Setup (Optional)

Want professional emails like info@daflegal.com?

**Options:**
1. **Google Workspace** - $6/user/month
   - Professional email
   - Google Drive, Docs, etc.
   
2. **Microsoft 365** - $6/user/month
   - Outlook email
   - Office apps

3. **Zoho Mail** - Free for 5 users
   - Basic email
   - No other apps

**Setup after deployment - not required now.**

---

## Deployment Order (Updated)

With custom domain:

1. ✅ Get OpenAI API key (you're doing this now)
2. Deploy to Railway (Steps 2-9 from Railway checklist)
3. **Add custom domain in Railway**
4. **Configure DNS at your registrar**
5. **Wait for DNS propagation**
6. **Update NEXT_PUBLIC_API_URL to use api.daflegal.com**
7. Test at https://daflegal.com
8. 🎉 You're live on your own domain!

---

## Troubleshooting

**Domain not working:**
- Wait longer (DNS can take up to 24 hours)
- Check DNS records are correct
- Try accessing via https (not http)

**SSL certificate error:**
- Railway auto-issues certificates
- Can take up to 1 hour after DNS verification
- Check Railway logs for status

**Frontend can't reach API:**
- Verify NEXT_PUBLIC_API_URL is set to https://api.daflegal.com
- Check api.daflegal.com resolves correctly
- Redeploy frontend after updating env var

---

## Next Steps

Ready to proceed? Here's the plan:

1. **You finish getting OpenAI API key** ⬅️ You're doing this now
2. **I'll remind you when you're back**
3. **We'll deploy to Railway together**
4. **Then we'll connect daflegal.com!**

---

**Domain:** daflegal.com ✅ Owned by you
**Deployment:** Railway (in progress)
**SSL:** Automatic
**Cost:** $0 for domain SSL, $5/month Railway

Generated: $(date)
