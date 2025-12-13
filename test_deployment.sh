#!/bin/bash

# DafLegal Deployment Verification Script
# Run this after setting environment variables in Render

echo "🚀 DafLegal Deployment Verification"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL="https://daflegal-backend.onrender.com"
FRONTEND_URL="https://daflegal-frontend.onrender.com"

# Test 1: Backend Health
echo "1. Testing Backend Health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health" --max-time 10)

if [ "$HEALTH_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Backend is LIVE${NC}"
    HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health")
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend is DOWN (Status: $HEALTH_STATUS)${NC}"
    echo "   Fix: Check Render logs for errors"
    echo "   Likely missing: SECRET_KEY or OPENAI_API_KEY"
fi
echo ""

# Test 2: Backend API Docs
echo "2. Testing Backend API Documentation..."
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/docs" --max-time 10)

if [ "$DOCS_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ API Docs accessible${NC}"
    echo "   URL: ${BACKEND_URL}/docs"
else
    echo -e "${YELLOW}⚠️  API Docs not accessible (Status: $DOCS_STATUS)${NC}"
fi
echo ""

# Test 3: Frontend
echo "3. Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" --max-time 10)

if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Frontend is LIVE${NC}"
    echo "   URL: ${FRONTEND_URL}"
else
    echo -e "${RED}❌ Frontend is DOWN (Status: $FRONTEND_STATUS)${NC}"
fi
echo ""

# Test 4: CORS Headers
echo "4. Testing CORS Configuration..."
CORS_HEADERS=$(curl -s -I "${BACKEND_URL}/health" | grep -i "access-control")

if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$CORS_HEADERS"
else
    echo -e "${YELLOW}⚠️  No CORS headers found${NC}"
    echo "   This may cause frontend connection issues"
fi
echo ""

# Test 5: API Root
echo "5. Testing Backend API Root..."
API_ROOT=$(curl -s "${BACKEND_URL}/" | head -c 100)

if [ -n "$API_ROOT" ]; then
    echo -e "${GREEN}✅ Backend API responding${NC}"
    echo "   Response: ${API_ROOT}..."
else
    echo -e "${RED}❌ Backend API not responding${NC}"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Summary"
echo "===================================="

if [ "$HEALTH_STATUS" == "200" ] && [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ All core services are LIVE!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test authentication (signup/login)"
    echo "2. Test file upload"
    echo "3. Test contract analysis"
    echo "4. Add optional services (Cloudinary, Stripe, etc.)"
else
    echo -e "${RED}❌ Some services are DOWN${NC}"
    echo ""
    echo "Action required:"
    echo "1. Check Render dashboard for error logs"
    echo "2. Verify environment variables are set"
    echo "3. Trigger manual deploy if needed"
    echo ""
    echo "See RENDER_ENV_SETUP.md for detailed instructions"
fi

echo ""
echo "Detailed checklist: See DEPLOYMENT_CHECKLIST.md"
echo "Environment setup: See RENDER_ENV_SETUP.md"
echo "Secrets reference: See SECRETS.txt (DO NOT COMMIT)"
