#!/bin/bash

# DafLegal Complete Setup Test Script
# Tests all components after environment variables are added

echo "🧪 DafLegal Complete Setup Test"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected, got $response)"
        ((FAILED++))
        return 1
    fi
}

# Function to test JSON response
test_json() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "status"; then
        echo -e "${GREEN}✓ PASS${NC}"
        echo "  Response: $response"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo "=== Backend Tests ==="
echo ""

test_json "Backend Health" "https://daflegal-backend.onrender.com/health"
test_endpoint "Backend API Docs" "https://daflegal-backend.onrender.com/docs" "200"
test_endpoint "Backend API" "https://daflegal-backend.onrender.com/api/v1" "404"

echo ""
echo "=== Frontend Tests ==="
echo ""

test_endpoint "Frontend Home" "https://daflegal-frontend.onrender.com" "200"
test_endpoint "Frontend Signup" "https://daflegal-frontend.onrender.com/auth/signup" "200"
test_endpoint "Frontend Login" "https://daflegal-frontend.onrender.com/auth/signin" "200"
test_endpoint "Frontend Pricing" "https://daflegal-frontend.onrender.com/pricing" "200"
test_endpoint "Frontend Dashboard" "https://daflegal-frontend.onrender.com/dashboard" "200"

echo ""
echo "=== Analytics Check ==="
echo ""

echo -n "Checking GA4 integration... "
if curl -s "https://daflegal-frontend.onrender.com" | grep -q "gtag"; then
    echo -e "${GREEN}✓ PASS${NC} (GA4 script found)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (GA4 script not found - add NEXT_PUBLIC_GA_MEASUREMENT_ID)"
fi

echo -n "Checking Clarity integration... "
if curl -s "https://daflegal-frontend.onrender.com" | grep -q "clarity"; then
    echo -e "${GREEN}✓ PASS${NC} (Clarity script found)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Clarity script not found - add NEXT_PUBLIC_CLARITY_PROJECT_ID)"
fi

echo ""
echo "=== Summary ==="
echo ""
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test user signup: https://daflegal-frontend.onrender.com/auth/signup"
    echo "2. Test user login"
    echo "3. Test dashboard features"
    echo "4. Test payment (if Paystack configured)"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check:${NC}"
    echo "1. Environment variables are added to Render"
    echo "2. Services have been redeployed"
    echo "3. Check Render logs for errors"
    echo ""
    echo "Guides:"
    echo "- COMPLETE_ENV_SETUP.md"
    echo "- ACTION_REQUIRED.md"
    echo ""
    exit 1
fi
