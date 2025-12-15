# Cloudinary Setup Guide for DafLegal

## What is Cloudinary?

Cloudinary provides cloud-based file storage and image/document management. For DafLegal, it will:
- Store uploaded contracts persistently
- Provide fast CDN access to files
- Handle file transformations and optimizations
- Offer better reliability than local filesystem

## Time Required: 15 minutes

---

## Step 1: Create Cloudinary Account (5 min)

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email or Google account
3. Choose the **Free plan** (includes 25GB storage, 25GB bandwidth)
4. Verify your email address
5. Complete the onboarding wizard

---

## Step 2: Get API Credentials (2 min)

1. After login, you'll be on the Dashboard
2. Look for the **Account Details** section (top right)
3. Click on "Account Details" or go to: https://console.cloudinary.com/settings/account

You'll see these credentials:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: your_api_secret_here
```

**Important:** Keep the API Secret private!

---

## Step 3: Configure Environment Variables on Render (5 min)

1. Go to: https://dashboard.render.com
2. Click on your **daflegal-backend** service
3. Click **Environment** tab
4. Add these environment variables:

### Required Variables

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Optional Variables (Recommended)

```bash
# Upload settings
CLOUDINARY_FOLDER=daflegal/contracts
CLOUDINARY_UPLOAD_PRESET=daflegal_upload

# File size limits (in bytes)
CLOUDINARY_MAX_FILE_SIZE=52428800  # 50MB

# Resource types allowed
CLOUDINARY_ALLOWED_FORMATS=pdf,doc,docx,txt
```

4. Click **Save Changes**
5. Render will automatically redeploy your service

---

## Step 4: Create Upload Preset (Optional but Recommended) (3 min)

Upload presets define how files are handled when uploaded.

1. In Cloudinary console, go to: **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure:
   - **Preset name:** `daflegal_upload`
   - **Signing mode:** Signed
   - **Folder:** `daflegal/contracts`
   - **Allowed formats:** pdf, doc, docx, txt
   - **Max file size:** 50 MB (52428800 bytes)
   - **Access mode:** Private
4. Click **Save**

---

## Step 5: Test the Integration

Once your backend redeploys, test file upload:

```bash
# Create a test PDF
echo "Test contract content" > test.txt

# Upload via API (replace with your actual API key)
curl -X POST https://daflegal-backend.onrender.com/api/v1/contracts/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@test.txt"
```

### Check Cloudinary Dashboard

1. Go to: https://console.cloudinary.com/console/media_library
2. Navigate to the `daflegal/contracts` folder
3. You should see your uploaded file

---

## Environment Variables Summary

Add these to your **daflegal-backend** service on Render:

```bash
# Required
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional (recommended)
CLOUDINARY_FOLDER=daflegal/contracts
CLOUDINARY_UPLOAD_PRESET=daflegal_upload
CLOUDINARY_MAX_FILE_SIZE=52428800
CLOUDINARY_ALLOWED_FORMATS=pdf,doc,docx,txt
```

---

## Troubleshooting

### "Invalid API credentials"
- Verify you copied the credentials exactly (no extra spaces)
- Make sure you're using the correct Cloud Name, API Key, and API Secret
- Check that the variables are saved in Render

### "Upload failed"
- Check file size (must be < 50MB for free plan)
- Verify file format is allowed (pdf, doc, docx, txt)
- Check Cloudinary console for error messages

### "File not found after upload"
- Check the folder path in Cloudinary Media Library
- Verify CLOUDINARY_FOLDER environment variable
- Files may be in root if folder isn't specified

### Rate Limits (Free Plan)
- 25GB storage
- 25GB bandwidth per month
- 500 transformations per month
- For production, consider upgrading to a paid plan

---

## Benefits After Setup

Once Cloudinary is configured:

✅ **Persistent Storage** - Files survive server restarts
✅ **Fast Access** - Global CDN delivers files quickly
✅ **Automatic Backups** - Cloudinary handles redundancy
✅ **Better Performance** - Optimized file delivery
✅ **Scalability** - Handle thousands of files easily

---

## Next Steps

After Cloudinary is working:

1. Test file upload through the frontend
2. Verify files appear in Cloudinary dashboard
3. Check file URLs are working
4. Set up Stripe for payments
5. Configure Google OAuth for social login

---

## Cost Information

**Free Forever Plan:**
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations
- Perfect for development and small-scale production

**Paid Plans Start at $99/month:**
- 250 GB storage
- 250 GB bandwidth
- 250,000 transformations
- Priority support

For most early-stage applications, the free plan is sufficient!

---

**Setup Complete!** 🎉

Your DafLegal backend now has professional file storage with Cloudinary.
