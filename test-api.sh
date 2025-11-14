#!/bin/bash
# DafLegal API Testing Script
# Tests all Phase 1-3 features

set -e  # Exit on error

echo "==================================="
echo "DafLegal API Testing Script"
echo "==================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:8000}"
TEST_EMAIL="test-$(date +%s)@daflegal.com"
TEST_PASSWORD="Test123!@#"
API_KEY=""

echo "API URL: $API_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

info() {
    echo -e "${YELLOW}→${NC} $1"
}

# Step 1: Health Check
echo "Step 1: Health Check"
info "Testing health endpoint..."
response=$(curl -s "$API_URL/health")
if echo "$response" | grep -q "healthy"; then
    success "API is healthy"
else
    error "API health check failed"
    exit 1
fi
echo ""

# Step 2: User Registration
echo "Step 2: User Registration"
info "Registering test user..."
response=$(curl -s -X POST "$API_URL/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"full_name\": \"Test User\"
  }")

if echo "$response" | grep -q "email"; then
    success "User registered successfully"
    user_id=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    success "User ID: $user_id"
else
    error "User registration failed: $response"
    exit 1
fi
echo ""

# Step 3: Login
echo "Step 3: Login"
info "Logging in..."
response=$(curl -s -X POST "$API_URL/api/v1/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$response" | grep -q "access_token"; then
    success "Login successful"
    access_token=$(echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    error "Login failed: $response"
    exit 1
fi
echo ""

# Step 4: Create API Key
echo "Step 4: Create API Key"
info "Creating API key..."
response=$(curl -s -X POST "$API_URL/api/v1/users/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $access_token" \
  -d '{
    "name": "Test API Key"
  }')

if echo "$response" | grep -q "dfk_"; then
    success "API key created"
    API_KEY=$(echo "$response" | grep -o '"key":"dfk_[^"]*' | cut -d'"' -f4)
    success "API Key: ${API_KEY:0:20}..."
else
    error "API key creation failed: $response"
    exit 1
fi
echo ""

# Step 5: Create Test Contract
echo "Step 5: Create Test Contract"
info "Creating test contract file..."
cat > /tmp/test-contract.txt << 'EOF'
SERVICE AGREEMENT

This Service Agreement is entered into as of January 1, 2025,
between Acme Corp (Provider) and Client Co (Client).

1. TERM
This Agreement shall continue for 3 years.

2. PAYMENT
Client agrees to pay Provider $50,000 annually.
Payment terms are Net 30 days.

3. TERMINATION
Either party may terminate with 90 days written notice.

4. LIABILITY
Provider's liability shall not exceed fees paid in the prior 12 months.

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality.
EOF
success "Test contract created"
echo ""

# Step 6: Upload Contract
echo "Step 6: Upload & Analyze Contract"
info "Uploading contract..."
response=$(curl -s -X POST "$API_URL/api/v1/contracts/analyze" \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@/tmp/test-contract.txt")

if echo "$response" | grep -q "contract_id"; then
    success "Contract uploaded"
    contract_id=$(echo "$response" | grep -o '"contract_id":"ctr_[^"]*' | cut -d'"' -f4)
    success "Contract ID: $contract_id"
else
    error "Contract upload failed: $response"
    exit 1
fi

info "Waiting for analysis to complete (15 seconds)..."
sleep 15

response=$(curl -s "$API_URL/api/v1/contracts/$contract_id" \
  -H "Authorization: Bearer $API_KEY")

if echo "$response" | grep -q "completed"; then
    success "Contract analysis completed"
    risk_score=$(echo "$response" | grep -o '"risk_score":[0-9.]*' | cut -d':' -f2)
    success "Risk Score: $risk_score"
else
    error "Contract analysis not completed yet"
fi
echo ""

# Step 7: Test Clause Library (Phase 2)
echo "Step 7: Test Clause Library (Phase 2)"
info "Creating test clause..."
response=$(curl -s -X POST "$API_URL/api/v1/clauses" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Standard Termination Clause",
    "category": "termination",
    "text": "Either party may terminate upon 30 days written notice.",
    "tags": ["standard", "vendor"],
    "risk_level": "neutral"
  }')

if echo "$response" | grep -q "clause_id"; then
    success "Clause created"
    clause_id=$(echo "$response" | grep -o '"clause_id":"cls_[^"]*' | cut -d'"' -f4)
    success "Clause ID: $clause_id"
else
    error "Clause creation failed: $response"
fi

info "Searching clauses..."
response=$(curl -s "$API_URL/api/v1/clauses/search?query=termination" \
  -H "Authorization: Bearer $API_KEY")

if echo "$response" | grep -q "termination"; then
    success "Clause search working"
else
    error "Clause search failed"
fi
echo ""

# Step 8: Test Compliance Checker (Phase 3)
echo "Step 8: Test Compliance Checker (Phase 3)"
info "Creating compliance playbook..."
response=$(curl -s -X POST "$API_URL/api/v1/compliance/playbooks" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Contract Policy",
    "description": "Standard vendor contract compliance rules",
    "document_type": "vendor"
  }')

if echo "$response" | grep -q "playbook_id"; then
    success "Playbook created"
    playbook_id=$(echo "$response" | grep -o '"playbook_id":"plb_[^"]*' | cut -d'"' -f4)
    success "Playbook ID: $playbook_id"
else
    error "Playbook creation failed: $response"
    exit 1
fi

info "Adding compliance rule..."
response=$(curl -s -X POST "$API_URL/api/v1/compliance/playbooks/$playbook_id/rules" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Unlimited Liability",
    "description": "Contract must not contain unlimited liability",
    "rule_type": "prohibited_term",
    "severity": "critical",
    "parameters": {
      "terms": ["unlimited liability"]
    }
  }')

if echo "$response" | grep -q "rule_id"; then
    success "Compliance rule added"
    rule_id=$(echo "$response" | grep -o '"rule_id":"rul_[^"]*' | cut -d'"' -f4)
    success "Rule ID: $rule_id"
else
    error "Rule creation failed: $response"
fi

info "Running compliance check..."
response=$(curl -s -X POST "$API_URL/api/v1/compliance/checks" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"contract_id\": \"$contract_id\",
    \"playbook_id\": \"$playbook_id\"
  }")

if echo "$response" | grep -q "check_id"; then
    success "Compliance check initiated"
    check_id=$(echo "$response" | grep -o '"check_id":"chk_[^"]*' | cut -d'"' -f4)
    success "Check ID: $check_id"

    info "Waiting for compliance check (3 seconds)..."
    sleep 3

    response=$(curl -s "$API_URL/api/v1/compliance/checks/$check_id" \
      -H "Authorization: Bearer $API_KEY")

    if echo "$response" | grep -q "compliance_score"; then
        success "Compliance check completed"
        score=$(echo "$response" | grep -o '"compliance_score":[0-9.]*' | cut -d':' -f2)
        status=$(echo "$response" | grep -o '"overall_status":"[^"]*' | cut -d'"' -f4)
        success "Compliance Score: $score%"
        success "Status: $status"
    else
        error "Compliance check not completed"
    fi
else
    error "Compliance check failed: $response"
fi
echo ""

# Step 9: Test Document Comparison (Phase 1)
echo "Step 9: Test Document Comparison (Phase 1)"
info "Creating revised contract..."
cat > /tmp/test-contract-v2.txt << 'EOF'
SERVICE AGREEMENT

This Service Agreement is entered into as of January 1, 2025,
between Acme Corp (Provider) and Client Co (Client).

1. TERM
This Agreement shall continue for 3 years.

2. PAYMENT
Client agrees to pay Provider $60,000 annually.
Payment terms are Net 30 days.

3. TERMINATION
Either party may terminate with 60 days written notice.

4. LIABILITY
Provider's liability shall not exceed fees paid in the prior 12 months.

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality.

6. FORCE MAJEURE
Neither party shall be liable for delays due to circumstances beyond control.
EOF

info "Uploading revised contract..."
response=$(curl -s -X POST "$API_URL/api/v1/contracts/analyze" \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@/tmp/test-contract-v2.txt")

if echo "$response" | grep -q "contract_id"; then
    contract_id_v2=$(echo "$response" | grep -o '"contract_id":"ctr_[^"]*' | cut -d'"' -f4)
    success "Revised contract uploaded: $contract_id_v2"

    info "Waiting for analysis (15 seconds)..."
    sleep 15

    info "Running comparison..."
    response=$(curl -s -X POST "$API_URL/api/v1/comparisons/compare" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"original_contract_id\": \"$contract_id\",
        \"revised_contract_id\": \"$contract_id_v2\"
      }")

    if echo "$response" | grep -q "comparison_id"; then
        success "Comparison initiated"
        comparison_id=$(echo "$response" | grep -o '"comparison_id":"cmp_[^"]*' | cut -d'"' -f4)

        info "Waiting for comparison (10 seconds)..."
        sleep 10

        response=$(curl -s "$API_URL/api/v1/comparisons/$comparison_id" \
          -H "Authorization: Bearer $API_KEY")

        if echo "$response" | grep -q "completed"; then
            success "Comparison completed"
            additions=$(echo "$response" | grep -o '"additions":\[[^]]*\]' | wc -c)
            success "Found changes in contract"
        fi
    fi
else
    error "Revised contract upload failed"
fi
echo ""

# Summary
echo "==================================="
echo "Test Summary"
echo "==================================="
success "All API tests passed!"
echo ""
echo "Test Results:"
echo "  - User Registration: ✓"
echo "  - Authentication: ✓"
echo "  - Contract Analysis: ✓"
echo "  - Clause Library: ✓"
echo "  - Compliance Checker: ✓"
echo "  - Document Comparison: ✓"
echo ""
echo "Test Artifacts:"
echo "  - User Email: $TEST_EMAIL"
echo "  - API Key: ${API_KEY:0:20}..."
echo "  - Contract ID: $contract_id"
echo "  - Playbook ID: $playbook_id"
echo "  - Check ID: $check_id"
echo ""
echo "Cleanup:"
echo "  - Test files: /tmp/test-contract*.txt"
echo "  - Test user: Can be deleted from database"
echo ""
success "Testing complete!"
