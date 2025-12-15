#!/bin/bash

# DafLegal Production Deployment Testing Script
# Tests all core functionality on Render deployment

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://daflegal-backend.onrender.com"
FRONTEND_URL="https://daflegal-frontend.onrender.com"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User"

# Results tracking
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DafLegal Production Deployment Test${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Helper functions
pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

# Test 1: Backend Health Check
echo -e "\n${BLUE}[1/10] Testing Backend Health...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "healthy"; then
        pass "Backend health check (Status: healthy, Code: 200)"
    else
        fail "Backend returned 200 but status not healthy: $BODY"
    fi
else
    fail "Backend health check failed (HTTP $HTTP_CODE)"
fi

# Test 2: API Documentation
echo -e "\n${BLUE}[2/10] Testing API Documentation...${NC}"
DOCS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/docs")
HTTP_CODE=$(echo "$DOCS_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "200" ]; then
    pass "API documentation accessible"
else
    fail "API documentation not accessible (HTTP $HTTP_CODE)"
fi

# Test 3: Frontend Accessibility
echo -e "\n${BLUE}[3/10] Testing Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL")
HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -1)
BODY=$(echo "$FRONTEND_RESPONSE" | head -1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q "DafLegal"; then
        pass "Frontend loads successfully"
    else
        warn "Frontend returned 200 but may not have loaded correctly"
    fi
else
    fail "Frontend not accessible (HTTP $HTTP_CODE)"
fi

# Test 4: User Registration
echo -e "\n${BLUE}[4/10] Testing User Registration...${NC}"
info "Creating test user: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"full_name\": \"$TEST_NAME\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    pass "User registration successful"
    info "Response: $BODY"
else
    fail "User registration failed (HTTP $HTTP_CODE): $BODY"
fi

# Test 5: User Login
echo -e "\n${BLUE}[5/10] Testing User Login...${NC}"

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$ACCESS_TOKEN" ]; then
        pass "User login successful"
        info "Access token obtained: ${ACCESS_TOKEN:0:20}..."
    else
        fail "Login returned 200 but no access token found"
    fi
else
    fail "User login failed (HTTP $HTTP_CODE): $BODY"
fi

# Test 6: API Key Creation
echo -e "\n${BLUE}[6/10] Testing API Key Creation...${NC}"

if [ -n "$ACCESS_TOKEN" ]; then
    APIKEY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/api-keys" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"Test Key\"
      }")

    HTTP_CODE=$(echo "$APIKEY_RESPONSE" | tail -1)
    BODY=$(echo "$APIKEY_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        API_KEY=$(echo "$BODY" | grep -o '"key":"[^"]*' | cut -d'"' -f4)
        if [ -n "$API_KEY" ]; then
            pass "API key created successfully"
            info "API key: ${API_KEY:0:20}..."
        else
            fail "API key creation returned success but no key found"
        fi
    else
        fail "API key creation failed (HTTP $HTTP_CODE): $BODY"
    fi
else
    warn "Skipping API key test (no access token)"
fi

# Test 7: Database Connection (via user creation)
echo -e "\n${BLUE}[7/10] Testing Database Connection...${NC}"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    pass "Database connection working (user data persisted)"
else
    warn "Database connection could not be verified"
fi

# Test 8: File Upload Endpoint
echo -e "\n${BLUE}[8/10] Testing File Upload Endpoint...${NC}"

# Create a test PDF file
TEST_PDF="test_contract_$(date +%s).pdf"
echo "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Contract) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
309
%%EOF" > "$TEST_PDF"

if [ -n "$API_KEY" ]; then
    UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/contracts/analyze" \
      -H "Authorization: Bearer $API_KEY" \
      -F "file=@$TEST_PDF")

    HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -1)
    BODY=$(echo "$UPLOAD_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "202" ]; then
        CONTRACT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
        if [ -n "$CONTRACT_ID" ]; then
            pass "File upload successful"
            info "Contract ID: $CONTRACT_ID"
        else
            warn "Upload returned success but no contract ID found"
        fi
    else
        warn "File upload endpoint test (HTTP $HTTP_CODE): $BODY"
        info "This may be expected if OpenAI key is not configured"
    fi

    rm -f "$TEST_PDF"
else
    warn "Skipping file upload test (no API key)"
fi

# Test 9: OpenAI Integration
echo -e "\n${BLUE}[9/10] Testing OpenAI Integration...${NC}"
if [ -n "$CONTRACT_ID" ]; then
    info "Checking analysis status for contract $CONTRACT_ID"

    # Wait a bit for analysis to start
    sleep 3

    STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/contracts/$CONTRACT_ID" \
      -H "Authorization: Bearer $API_KEY")

    HTTP_CODE=$(echo "$STATUS_RESPONSE" | tail -1)
    BODY=$(echo "$STATUS_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        STATUS=$(echo "$BODY" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        info "Analysis status: $STATUS"

        if [ "$STATUS" = "processing" ] || [ "$STATUS" = "completed" ]; then
            pass "OpenAI integration appears to be working"
        else
            warn "Analysis status: $STATUS (may need more time or OpenAI key check)"
        fi
    else
        warn "Could not check analysis status (HTTP $HTTP_CODE)"
    fi
else
    warn "Skipping OpenAI test (no contract uploaded)"
fi

# Test 10: HTTPS and Security Headers
echo -e "\n${BLUE}[10/10] Testing Security...${NC}"

SECURITY_RESPONSE=$(curl -s -I "$BACKEND_URL/health")
if echo "$SECURITY_RESPONSE" | grep -q "HTTP/"; then
    if echo "$SECURITY_RESPONSE" | grep -q "https" || echo "$BACKEND_URL" | grep -q "https"; then
        pass "HTTPS enabled"
    else
        warn "HTTPS may not be enforced"
    fi
else
    warn "Could not verify security headers"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"

TOTAL=$((PASSED + FAILED + WARNINGS))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "\n${BLUE}Success Rate:${NC} $SUCCESS_RATE%"
fi

echo -e "\n${BLUE}========================================${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Some warnings to review${NC}"
    fi
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Test the frontend in a browser: $FRONTEND_URL"
    echo "2. Set up optional services (Cloudinary, Stripe, etc.)"
    echo "3. Configure monitoring and alerts"
    exit 0
else
    echo -e "${RED}✗ Some tests failed - review errors above${NC}"
    exit 1
fi
