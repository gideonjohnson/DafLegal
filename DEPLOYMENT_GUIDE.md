# DafLegal Phase 3 - Deployment & Testing Guide

## Overview

This guide covers deployment and testing for the complete DafLegal system with all Phase 1-3 features:
- ✅ Phase 1: Document Comparison
- ✅ Phase 2: Clause Library
- ✅ Phase 3: Compliance Checker

**Total Implementation:**
- 30+ new API endpoints
- 15+ database models
- 8+ frontend components
- 40+ files created/modified
- ~10,000+ lines of code

---

## Prerequisites

### Required Software
- Docker Desktop (latest version)
- Docker Compose v2+
- Git
- A text editor (VS Code recommended)

### Required Accounts & API Keys
1. **OpenAI** - GPT-4o mini API key
2. **AWS S3** - Bucket + access credentials
3. **Stripe** - Test mode API keys
4. **Sentry** (optional) - Error tracking DSN
5. **Healthchecks.io** (optional) - Monitoring ping URL

---

## Step 1: Environment Setup

### 1.1 Clone Repository (if not already)
```bash
cd C:/Users/Administrator
cd daflegal
```

### 1.2 Create Environment File
```bash
cp .env.example .env
```

### 1.3 Configure .env File

Edit `.env` with your credentials:

```bash
# Database
DATABASE_URL=postgresql://daflegal:your_password@db:5432/daflegal
POSTGRES_USER=daflegal
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=daflegal

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your_generated_secret_key_min_32_chars
ENVIRONMENT=development

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=daflegal-contracts-dev

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Monitoring
SENTRY_DSN=https://your-sentry-dsn
HEALTHCHECK_PING_URL=https://hc-ping.com/your-uuid
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Step 2: Start Services

### 2.1 Start Docker Containers
```bash
cd C:/Users/Administrator/daflegal
docker compose up -d
```

This starts:
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Cache/queue
- **Backend** (port 8000) - FastAPI API
- **Worker** - Celery background tasks
- **Frontend** (port 3000) - Next.js UI

### 2.2 Verify Containers Running
```bash
docker compose ps
```

Expected output:
```
NAME                STATUS              PORTS
daflegal-db-1       Up                 5432->5432
daflegal-redis-1    Up                 6379->6379
daflegal-backend-1  Up                 8000->8000
daflegal-worker-1   Up
daflegal-frontend-1 Up                 3000->3000
```

### 2.3 Check Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Worker only
docker compose logs -f worker

# Exit logs: Ctrl+C
```

---

## Step 3: Database Verification

### 3.1 Check Database Tables

**Connect to PostgreSQL:**
```bash
docker compose exec db psql -U daflegal -d daflegal
```

**List tables:**
```sql
\dt

-- Expected tables:
-- users
-- api_keys
-- contracts
-- contract_comparisons
-- clauses
-- clause_libraries
-- clause_library_memberships
-- clause_usage_logs
-- clause_suggestions
-- playbooks
-- compliance_rules
-- compliance_checks
-- compliance_exceptions
-- compliance_templates
-- subscriptions
-- usage_records
-- invoices
```

**Verify Phase 3 tables exist:**
```sql
SELECT COUNT(*) FROM playbooks;
SELECT COUNT(*) FROM compliance_rules;
SELECT COUNT(*) FROM compliance_checks;

-- Should return 0 (tables exist but empty)
```

**Exit PostgreSQL:**
```sql
\q
```

---

## Step 4: API Testing

### 4.1 Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development"
}
```

### 4.2 API Documentation
Open in browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Verify these endpoint groups exist:
- `/api/v1/users/*` - User management
- `/api/v1/contracts/*` - Contract analysis
- `/api/v1/comparisons/*` - Phase 1 (Document comparison)
- `/api/v1/clauses/*` - Phase 2 (Clause library)
- `/api/v1/compliance/*` - Phase 3 (Compliance checker)
- `/api/v1/billing/*` - Stripe integration

### 4.3 Register Test User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@daflegal.com",
    "password": "Test123!@#",
    "full_name": "Test User"
  }'
```

Expected response:
```json
{
  "id": 1,
  "email": "test@daflegal.com",
  "full_name": "Test User",
  "plan": "free_trial",
  "is_active": true,
  "created_at": "2025-10-18T12:00:00"
}
```

### 4.4 Login & Get API Key
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@daflegal.com",
    "password": "Test123!@#"
  }'
```

Response includes access_token. Then create API key:
```bash
curl -X POST http://localhost:8000/api/v1/users/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token_from_login>" \
  -d '{
    "name": "Test API Key"
  }'
```

**Save the API key (dfk_...)** - it's only shown once!

---

## Step 5: Feature Testing

### 5.1 Test Contract Upload & Analysis

**Create a test contract (test-contract.txt):**
```
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of January 1, 2025,
between Acme Corp ("Provider") and Client Co ("Client").

1. TERM
This Agreement shall commence on January 1, 2025 and continue for a period
of 3 years, unless terminated earlier in accordance with Section 5.

2. PAYMENT
Client agrees to pay Provider $50,000 annually, payable quarterly.
Payment terms are Net 30 days.

3. TERMINATION
Either party may terminate this Agreement with 90 days written notice.

4. LIABILITY
Provider's total liability under this Agreement shall not exceed the
total fees paid by Client in the 12 months preceding the claim.

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.
```

**Upload for analysis:**
```bash
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_your_api_key" \
  -F "file=@test-contract.txt"
```

**Poll for results:**
```bash
# Use contract_id from upload response
curl http://localhost:8000/api/v1/contracts/ctr_xyz \
  -H "Authorization: Bearer dfk_your_api_key"
```

Expected: Status changes from "uploaded" → "processing" → "completed"

### 5.2 Test Phase 1: Document Comparison

**Create revised version (test-contract-v2.txt):**
```
[Same as above but with changes:]
- Change payment to $60,000 annually
- Change termination to 60 days notice
- Add force majeure clause
```

**Upload revised contract:**
```bash
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_your_api_key" \
  -F "file=@test-contract-v2.txt"
```

**Compare versions:**
```bash
curl -X POST http://localhost:8000/api/v1/comparisons/compare \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "original_contract_id": "ctr_original_id",
    "revised_contract_id": "ctr_revised_id"
  }'
```

**Get comparison results:**
```bash
curl http://localhost:8000/api/v1/comparisons/cmp_xyz \
  -H "Authorization: Bearer dfk_your_api_key"
```

Expected: Shows additions, deletions, modifications, risk delta

### 5.3 Test Phase 2: Clause Library

**Create a clause:**
```bash
curl -X POST http://localhost:8000/api/v1/clauses \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Standard Termination Clause",
    "category": "termination",
    "text": "Either party may terminate this Agreement upon 30 days written notice to the other party.",
    "tags": ["standard", "vendor"],
    "risk_level": "neutral",
    "jurisdiction": "US"
  }'
```

**Search clauses:**
```bash
curl "http://localhost:8000/api/v1/clauses/search?query=termination&category=termination" \
  -H "Authorization: Bearer dfk_your_api_key"
```

**Get clause suggestions for contract:**
```bash
curl http://localhost:8000/api/v1/clauses/suggest/ctr_xyz \
  -H "Authorization: Bearer dfk_your_api_key"
```

Expected: AI suggests clauses for missing protections

### 5.4 Test Phase 3: Compliance Checker

**Create a playbook:**
```bash
curl -X POST http://localhost:8000/api/v1/compliance/playbooks \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Contract Policy",
    "description": "Standard compliance rules for vendor contracts",
    "document_type": "vendor",
    "jurisdiction": "US"
  }'
```

**Add compliance rules:**
```bash
# Rule 1: No unlimited liability
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/plb_xyz/rules \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Unlimited Liability",
    "description": "Contract must not contain unlimited liability",
    "rule_type": "prohibited_term",
    "severity": "critical",
    "parameters": {
      "terms": ["unlimited liability", "unlimited damages"]
    }
  }'

# Rule 2: Required termination clause
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/plb_xyz/rules \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "30-Day Termination Required",
    "description": "Must have 30-day termination clause",
    "rule_type": "required_clause",
    "severity": "high",
    "parameters": {
      "category": "termination",
      "must_contain": "30 days"
    }
  }'

# Rule 3: Payment terms
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/plb_xyz/rules \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Net 30 Payment Terms",
    "description": "Payment must be Net 30 or better",
    "rule_type": "required_term",
    "severity": "medium",
    "parameters": {
      "terms": ["Net 30", "payment within 30 days"]
    }
  }'
```

**Run compliance check:**
```bash
curl -X POST http://localhost:8000/api/v1/compliance/checks \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "ctr_xyz",
    "playbook_id": "plb_xyz"
  }'
```

**Get compliance results:**
```bash
curl http://localhost:8000/api/v1/compliance/checks/chk_xyz \
  -H "Authorization: Bearer dfk_your_api_key"
```

Expected response structure:
```json
{
  "check_id": "chk_xyz",
  "status": "completed",
  "compliance_score": 85.5,
  "overall_status": "partial_compliant",
  "rules_checked": 3,
  "rules_passed": 2,
  "rules_failed": 1,
  "violations": [
    {
      "rule_id": "rul_abc",
      "rule_name": "30-Day Termination Required",
      "severity": "high",
      "violation_type": "missing",
      "details": "Contract has 90-day termination instead of 30 days",
      "auto_fix_suggestion": "Change termination notice to 30 days"
    }
  ],
  "executive_summary": "Contract is partially compliant...",
  "recommendations": ["Update termination clause to 30 days..."]
}
```

---

## Step 6: Frontend Testing

### 6.1 Access Frontend
Open browser: http://localhost:3000

### 6.2 Test Contract Analysis Page
1. Navigate to contract upload page
2. Upload test-contract.txt
3. Wait for analysis (15-30 seconds)
4. Verify results display:
   - Executive summary
   - Key terms extracted
   - Detected clauses
   - Missing clauses
   - Risk score

### 6.3 Test Comparison Page
1. Navigate to http://localhost:3000/comparison
2. Enter API key: `dfk_your_api_key`
3. Select two contract versions
4. Run comparison
5. Verify diff visualization:
   - Green highlights (additions)
   - Red highlights (deletions)
   - Yellow highlights (modifications)
   - Substantive vs. cosmetic changes
   - Risk delta display

### 6.4 Test Clause Library Page
1. Navigate to http://localhost:3000/clauses
2. Enter API key
3. Create new clause
4. Search clauses by category/tags
5. Copy clause to clipboard
6. Create clause library
7. Add clauses to library
8. Test import/export functionality

### 6.5 Test Compliance Pages

**Playbook Management:**
1. Navigate to http://localhost:3000/compliance/playbooks
2. Enter API key
3. Create new playbook "Vendor Policy"
4. Add rules:
   - Critical: No unlimited liability
   - High: 30-day termination required
   - Medium: Net 30 payment terms
   - Low: Include force majeure
5. View playbook with all rules
6. Edit rule severity

**Compliance Check:**
1. Navigate to http://localhost:3000/compliance/check
2. Enter API key
3. Select contract (from uploaded contracts)
4. Select playbook
5. Run compliance check
6. View results:
   - Compliance score (0-100%)
   - Overall status badge
   - Violations list (color-coded by severity)
   - Passed rules
   - Executive summary
   - Recommendations

---

## Step 7: Performance Verification

### 7.1 Monitor Resource Usage
```bash
# CPU and memory usage
docker stats

# Should show:
# - backend: ~200-500MB RAM, <10% CPU (idle)
# - worker: ~150-300MB RAM, <5% CPU (idle)
# - frontend: ~100-200MB RAM, <5% CPU (idle)
# - db: ~50-100MB RAM
# - redis: ~10-20MB RAM
```

### 7.2 Check API Response Times
```bash
# Health check (should be <50ms)
time curl http://localhost:8000/health

# Contract list (should be <200ms)
time curl http://localhost:8000/api/v1/contracts \
  -H "Authorization: Bearer dfk_your_api_key"

# Playbook list (should be <200ms)
time curl http://localhost:8000/api/v1/compliance/playbooks \
  -H "Authorization: Bearer dfk_your_api_key"
```

### 7.3 Check Background Job Processing
```bash
# View Celery worker logs
docker compose logs -f worker

# Should see:
# - Task received: analyze_contract_task
# - Task succeeded: analyze_contract_task
# - Processing time: 5-15 seconds per contract
```

---

## Step 8: Error Testing

### 8.1 Test Invalid API Key
```bash
curl http://localhost:8000/api/v1/contracts \
  -H "Authorization: Bearer invalid_key"

# Expected: 401 Unauthorized
```

### 8.2 Test Missing Required Fields
```bash
curl -X POST http://localhost:8000/api/v1/compliance/playbooks \
  -H "Authorization: Bearer dfk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 422 Validation Error
```

### 8.3 Test Quota Limits
```bash
# Upload 4 files (free trial limit is 3)
# Expected: 429 Quota Exceeded on 4th file
```

---

## Step 9: Database Inspection

### 9.1 Verify Data Persistence
```bash
docker compose exec db psql -U daflegal -d daflegal
```

```sql
-- Check users
SELECT id, email, full_name, plan FROM users;

-- Check contracts
SELECT contract_id, filename, status, risk_score FROM contracts LIMIT 5;

-- Check playbooks
SELECT playbook_id, name, rule_count, usage_count FROM playbooks;

-- Check compliance rules
SELECT r.rule_id, r.name, r.severity, p.name as playbook_name
FROM compliance_rules r
JOIN playbooks p ON r.playbook_id = p.id;

-- Check compliance checks
SELECT check_id, compliance_score, overall_status, rules_checked, rules_passed
FROM compliance_checks
ORDER BY created_at DESC
LIMIT 5;

-- Check clauses
SELECT clause_id, title, category, version, usage_count FROM clauses LIMIT 5;

\q
```

---

## Step 10: Production Deployment Checklist

Before deploying to production:

### 10.1 Environment Variables
- [ ] Change `ENVIRONMENT=production`
- [ ] Generate new strong `SECRET_KEY`
- [ ] Use production Stripe keys (sk_live_...)
- [ ] Use production AWS S3 bucket
- [ ] Configure production database (AWS RDS, Supabase, etc.)
- [ ] Set up Redis persistence
- [ ] Configure Sentry DSN for error tracking
- [ ] Set up Healthchecks.io monitoring

### 10.2 Security
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Configure CORS properly
- [ ] Set rate limiting (60 req/min per API key)
- [ ] Enable database backups (daily)
- [ ] Rotate API keys regularly
- [ ] Set up firewall rules
- [ ] Enable S3 encryption at rest
- [ ] Configure VPC/network security

### 10.3 Scaling
- [ ] Run multiple backend instances (load balancer)
- [ ] Run multiple Celery workers (4-8 recommended)
- [ ] Enable Redis persistence (AOF + RDB)
- [ ] Configure database connection pooling
- [ ] Set up CDN for frontend
- [ ] Enable container auto-restart
- [ ] Configure log rotation

### 10.4 Monitoring
- [ ] Set up Sentry error tracking
- [ ] Configure Healthchecks.io pings
- [ ] Enable Docker container monitoring
- [ ] Set up CloudWatch/Datadog logs
- [ ] Configure alert thresholds
- [ ] Monitor API response times
- [ ] Track background job success rates

### 10.5 Backups
- [ ] Daily database backups (7-day retention)
- [ ] Weekly full system backups
- [ ] S3 versioning enabled
- [ ] Test restore procedure
- [ ] Document backup locations

### 10.6 Documentation
- [ ] Update README with production URLs
- [ ] Create API client documentation
- [ ] Write troubleshooting guide
- [ ] Document deployment process
- [ ] Create runbook for common issues

---

## Troubleshooting

### Issue: Containers won't start
```bash
# Check Docker is running
docker version

# Check for port conflicts
netstat -an | grep 8000
netstat -an | grep 3000
netstat -an | grep 5432

# Restart Docker Desktop
# Then retry: docker compose up -d
```

### Issue: Database connection failed
```bash
# Check DB container is running
docker compose ps db

# Check DB logs
docker compose logs db

# Verify connection string in .env matches docker-compose.yml
# Restart backend: docker compose restart backend
```

### Issue: Frontend can't reach API
```bash
# Check NEXT_PUBLIC_API_URL in .env
# Should be: http://localhost:8000

# Rebuild frontend
docker compose build frontend
docker compose restart frontend
```

### Issue: Background jobs not processing
```bash
# Check worker logs
docker compose logs -f worker

# Check Redis is running
docker compose ps redis

# Restart worker
docker compose restart worker
```

### Issue: OpenAI API errors
```bash
# Verify API key is valid
# Check OpenAI account has credits
# Check rate limits (tier 1: 3 RPM, 200 RPD)
# Reduce concurrent analysis jobs
```

---

## Next Steps

### Phase 4: Admin Dashboard (Planned)
- Usage metrics visualization
- Accuracy tracking
- User analytics
- Revenue dashboards
- System health monitoring

### Phase 5-6: Advanced Features (Future)
- Legal research assistant
- Drafting assistant
- Citation checker
- Intake triage

---

## Support & Resources

- **Documentation**: See `COMPLIANCE_CHECKER_FEATURE.md`, `CLAUSE_LIBRARY_FEATURE.md`, `COMPARISON_FEATURE.md`
- **API Docs**: http://localhost:8000/docs
- **Architecture**: See `ARCHITECTURE.md`
- **Project Summary**: See `PHASE_1_COMPLETE.md`, `PHASE_2_COMPLETE.md`, `PHASE_3_COMPLETE.md`

---

## Success Metrics

Track these metrics after deployment:

**Technical:**
- API uptime: >99.9%
- Average response time: <200ms
- Background job success rate: >98%
- Error rate: <0.1%

**Business:**
- Active users
- Contracts analyzed per day
- Compliance checks run per day
- Average compliance scores
- Most used playbooks
- Clause library usage
- Upgrade conversion rate

---

**Deployment Status:** ✅ Ready for staging/production
**Phase 3 Status:** ✅ Complete
**Total Features:** 6/11 core features (55% complete)
**Last Updated:** 2025-10-18

---

**Happy deploying! 🚀**
