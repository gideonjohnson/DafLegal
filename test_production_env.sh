#!/bin/bash

# Production Environment Check Script
# Tests daflegal.com and backend services

echo "=================================="
echo "DafLegal Production Environment Check"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Health
echo "1. Testing Backend Health..."
response=$(curl -s -w "\n%{http_code}" https://daflegal-backend.onrender.com/health)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
    echo "  Response: $body"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 2: Backend Root
echo "2. Testing Backend Root..."
response=$(curl -s https://daflegal-backend.onrender.com/)
if echo "$response" | grep -q "DafLegal API"; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
    echo "  Response: $response"
else
    echo -e "${RED}✗ Backend root endpoint failed${NC}"
fi
echo ""

# Test 3: Frontend
echo "3. Testing Frontend (daflegal.com)..."
response=$(curl -s -w "\n%{http_code}" https://daflegal.com)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
    echo "  HTTP Status: $http_code"
else
    echo -e "${RED}✗ Frontend check failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 4: API Documentation
echo "4. Testing API Docs..."
response=$(curl -s -w "\n%{http_code}" https://daflegal-backend.onrender.com/docs)
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ API documentation is accessible${NC}"
    echo "  URL: https://daflegal-backend.onrender.com/docs"
else
    echo -e "${RED}✗ API docs check failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 5: Check if OpenAI is configured (via signup test)
echo "5. Testing User Registration (checks if backend env is configured)..."
random_email="test$(date +%s)@example.com"
response=$(curl -s -w "\n%{http_code}" -X POST \
  https://daflegal-backend.onrender.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$random_email\",
    \"password\": \"TestPass123!\",
    \"full_name\": \"Test User\"
  }")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ User registration working${NC}"
    echo "  Created user: $random_email"
elif echo "$body" | grep -q "error"; then
    echo -e "${YELLOW}⚠ Registration returned an error${NC}"
    echo "  Response: $body"
else
    echo -e "${RED}✗ Registration failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 6: CORS Check
echo "6. Testing CORS Configuration..."
response=$(curl -s -I -H "Origin: https://daflegal.com" https://daflegal-backend.onrender.com/health)
if echo "$response" | grep -q "access-control-allow-origin"; then
    echo -e "${GREEN}✓ CORS is configured${NC}"
else
    echo -e "${YELLOW}⚠ CORS headers not found${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
echo ""
echo "Production URLs:"
echo "  Frontend: https://daflegal.com"
echo "  Backend:  https://daflegal-backend.onrender.com"
echo "  API Docs: https://daflegal-backend.onrender.com/docs"
echo ""
echo "Next Steps:"
echo "1. Check PRODUCTION_ENV_CHECKLIST.md for required environment variables"
echo "2. Add missing variables in Render Dashboard"
echo "3. Test authentication flow on daflegal.com"
echo ""
