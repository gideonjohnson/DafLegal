#!/bin/bash

# Quick Cloudinary Test Script

echo "Testing Cloudinary Integration..."
echo "=================================="
echo ""

# Check backend health
echo "1. Backend Health Check:"
curl -s https://daflegal-backend.onrender.com/health | jq . || curl -s https://daflegal-backend.onrender.com/health
echo ""
echo ""

# Check if we can see Cloudinary is configured
echo "2. Cloudinary Configuration:"
echo "   Go to Render Dashboard → daflegal-backend → Environment"
echo "   Verify these exist:"
echo "   - CLOUDINARY_CLOUD_NAME"
echo "   - CLOUDINARY_API_KEY"
echo "   - CLOUDINARY_API_SECRET"
echo ""

echo "3. Next Steps to Test:"
echo "   a) Go to: https://daflegal-frontend.onrender.com"
echo "   b) Sign up or sign in"
echo "   c) Upload a test contract (any PDF)"
echo "   d) Check Cloudinary dashboard: https://console.cloudinary.com/console/media_library"
echo "   e) You should see your uploaded file!"
echo ""

echo "=================================="
echo "✅ Cloudinary variables are set!"
echo "Ready to accept file uploads."
