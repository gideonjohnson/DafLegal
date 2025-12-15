#!/bin/bash

# Quick Paystack Deployment Test

echo "🧪 Testing Paystack Integration..."
echo "=================================="
echo ""

# Test 1: Backend Health
echo "1️⃣ Backend Health Check:"
curl -s https://daflegal-backend.onrender.com/health || curl -s https://daflegal.com/api/health
echo ""
echo ""

# Test 2: Frontend loads
echo "2️⃣ Frontend Status:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://daflegal-frontend.onrender.com)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Frontend is live (HTTP 200)"
else
    echo "⚠️  Frontend returned HTTP $HTTP_CODE"
fi
echo ""

# Test 3: Manual verification steps
echo "3️⃣ Manual Tests:"
echo ""
echo "   a) Go to: https://daflegal-frontend.onrender.com/pricing"
echo "      OR: https://daflegal.com/pricing"
echo ""
echo "   b) Click 'Upgrade to Pro' button"
echo ""
echo "   c) You should see Paystack payment modal"
echo ""
echo "   d) Test with these credentials:"
echo "      Card: 4084 0840 8408 4081"
echo "      Expiry: 12/25"
echo "      CVV: 123"
echo "      PIN: 0000 (if prompted)"
echo "      OTP: 123456 (if prompted)"
echo ""
echo "   e) Verify payment appears in Paystack dashboard"
echo ""

echo "=================================="
echo "✅ Deployment tests ready!"
echo ""
echo "Wait for deployment to complete, then test manually."
