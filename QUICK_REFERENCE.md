# DafLegal Quick Reference Card

**Version:** 1.3.0 (Phase 3 Complete)
**Last Updated:** October 18, 2025

---

## 🚀 Quick Start (30 seconds)

```bash
cd daflegal
docker compose up -d
```

**Access:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

---

## 🔑 Get API Key (3 steps)

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Pass123!","full_name":"Your Name"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Pass123!"}'
```
→ Copy `access_token` from response

### 3. Create API Key
```bash
curl -X POST http://localhost:8000/api/v1/users/api-keys \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Key"}'
```
→ Save `key` (starts with `dfk_`)

---

## 📄 Analyze Contract

```bash
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -F "file=@contract.pdf"
```
→ Returns `contract_id`

**Get Results:**
```bash
curl http://localhost:8000/api/v1/contracts/ctr_YOUR_ID \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

---

## 🔍 Compare Contracts (Phase 1)

```bash
curl -X POST http://localhost:8000/api/v1/comparisons/compare \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "original_contract_id": "ctr_abc",
    "revised_contract_id": "ctr_xyz"
  }'
```

---

## 📚 Clause Library (Phase 2)

### Create Clause
```bash
curl -X POST http://localhost:8000/api/v1/clauses \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Termination Clause",
    "category": "termination",
    "text": "Either party may terminate with 30 days notice.",
    "tags": ["standard"]
  }'
```

### Search Clauses
```bash
curl "http://localhost:8000/api/v1/clauses/search?query=termination&category=termination" \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

### Get AI Suggestions
```bash
curl http://localhost:8000/api/v1/clauses/suggest/ctr_YOUR_ID \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

---

## ✅ Compliance Checker (Phase 3)

### 1. Create Playbook
```bash
curl -X POST http://localhost:8000/api/v1/compliance/playbooks \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Policy",
    "document_type": "vendor"
  }'
```
→ Save `playbook_id`

### 2. Add Rule
```bash
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/plb_YOUR_ID/rules \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Unlimited Liability",
    "rule_type": "prohibited_term",
    "severity": "critical",
    "parameters": {"terms": ["unlimited liability"]}
  }'
```

### 3. Run Compliance Check
```bash
curl -X POST http://localhost:8000/api/v1/compliance/checks \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_id": "ctr_abc",
    "playbook_id": "plb_xyz"
  }'
```

### 4. Get Results
```bash
curl http://localhost:8000/api/v1/compliance/checks/chk_YOUR_ID \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

---

## 📊 Rule Types & Examples

### 1. `required_clause`
Contract must contain specific clause category
```json
{
  "rule_type": "required_clause",
  "parameters": {
    "category": "termination",
    "must_contain": "30 days"
  }
}
```

### 2. `prohibited_clause`
Contract must NOT contain specific clause category
```json
{
  "rule_type": "prohibited_clause",
  "parameters": {
    "category": "unlimited_liability"
  }
}
```

### 3. `required_term`
Contract must contain specific terms/phrases
```json
{
  "rule_type": "required_term",
  "parameters": {
    "terms": ["Net 30", "payment within 30 days"]
  }
}
```

### 4. `prohibited_term`
Contract must NOT contain specific terms/phrases
```json
{
  "rule_type": "prohibited_term",
  "parameters": {
    "terms": ["unlimited liability", "perpetual license"]
  }
}
```

### 5. `numeric_threshold`
Numeric values must meet thresholds
```json
{
  "rule_type": "numeric_threshold",
  "parameters": {
    "field": "liability_cap",
    "operator": ">=",
    "threshold": 1000000
  }
}
```

### 6. `date_requirement`
Date-related requirements
```json
{
  "rule_type": "date_requirement",
  "parameters": {
    "field": "expiration_date",
    "operator": ">",
    "threshold_days": 365
  }
}
```

### 7. `party_requirement`
Party-related requirements
```json
{
  "rule_type": "party_requirement",
  "parameters": {
    "party_type": "vendor",
    "must_be": "Approved Vendor Inc."
  }
}
```

### 8. `custom_pattern`
Custom regex pattern matching
```json
{
  "rule_type": "custom_pattern",
  "pattern": "indemnif(y|ication)",
  "parameters": {
    "match_type": "must_exist"
  }
}
```

---

## 🎯 Severity Levels

| Level | Weight | Use When |
|-------|--------|----------|
| `critical` | 10 | Deal breakers, legal violations |
| `high` | 5 | Significant risks, major missing clauses |
| `medium` | 2 | Important protections, business preferences |
| `low` | 1 | Nice-to-haves, minor issues |
| `info` | 0.5 | Informational, style preferences |

---

## 📈 Compliance Scoring

```
Score = 100 - (total_penalty / max_penalty * 100)

Status:
- COMPLIANT: score ≥ 90 AND no critical/high violations
- PARTIAL_COMPLIANT: 70 ≤ score < 90
- NON_COMPLIANT: score < 70 OR critical violations > 0
```

---

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f worker
```

### Restart Service
```bash
docker compose restart backend
docker compose restart worker
```

### Database Access
```bash
docker compose exec db psql -U daflegal -d daflegal
```

### Run API Tests
```bash
./test-api.sh
```

### Stop All Services
```bash
docker compose down
```

### Clean Restart
```bash
docker compose down -v  # WARNING: Deletes data
docker compose up -d
```

---

## 🌐 Frontend Pages

| URL | Description |
|-----|-------------|
| http://localhost:3000/ | Landing page |
| http://localhost:3000/dashboard | User dashboard |
| http://localhost:3000/upload | Upload contracts |
| http://localhost:3000/contracts | Contract list |
| http://localhost:3000/comparison | Compare contracts (Phase 1) |
| http://localhost:3000/clauses | Clause library (Phase 2) |
| http://localhost:3000/compliance/playbooks | Manage playbooks (Phase 3) |
| http://localhost:3000/compliance/check | Run compliance checks (Phase 3) |

---

## 📋 Sample Playbook: Vendor Contracts

```bash
# 1. Create playbook
curl -X POST http://localhost:8000/api/v1/compliance/playbooks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendor Contract Policy",
    "document_type": "vendor"
  }'

# 2. Add rules
PLAYBOOK_ID="plb_xyz"

# Critical: No unlimited liability
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/$PLAYBOOK_ID/rules \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Unlimited Liability",
    "rule_type": "prohibited_term",
    "severity": "critical",
    "parameters": {"terms": ["unlimited liability"]}
  }'

# High: 30-day termination
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/$PLAYBOOK_ID/rules \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "30-Day Termination",
    "rule_type": "required_clause",
    "severity": "high",
    "parameters": {"category": "termination", "must_contain": "30 days"}
  }'

# Medium: Net 30 payment
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/$PLAYBOOK_ID/rules \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Net 30 Payment",
    "rule_type": "required_term",
    "severity": "medium",
    "parameters": {"terms": ["Net 30"]}
  }'

# Low: Force majeure
curl -X POST http://localhost:8000/api/v1/compliance/playbooks/$PLAYBOOK_ID/rules \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Force Majeure Clause",
    "rule_type": "required_clause",
    "severity": "low",
    "parameters": {"category": "force_majeure"}
  }'
```

---

## 🐛 Troubleshooting

### Can't connect to API
1. Check Docker: `docker compose ps`
2. Check logs: `docker compose logs backend`
3. Restart: `docker compose restart backend`

### 401 Unauthorized
- Verify API key starts with `dfk_`
- Check header: `Authorization: Bearer dfk_...`
- Create new key if needed

### 429 Quota Exceeded
- Check plan limits (Free: 3 files, 30 pages)
- Upgrade plan or wait for period reset

### Analysis Taking Too Long
- Normal: 15-30 seconds for contracts
- Check worker logs: `docker compose logs worker`
- Check OpenAI rate limits

### Database Error
```bash
# Check DB is running
docker compose ps db

# Restart
docker compose restart db backend
```

---

## 📞 Getting Help

1. **Documentation**: See `DEPLOYMENT_GUIDE.md`
2. **API Docs**: http://localhost:8000/docs
3. **Status**: See `STATUS.md`
4. **Feature Docs**: See `COMPLIANCE_CHECKER_FEATURE.md`

---

## ⚡ Pro Tips

1. **Save your API key** - it's only shown once!
2. **Wait for analysis** - contracts take 15-30 seconds
3. **Use playbooks** - create reusable compliance policies
4. **Start with critical rules** - then add medium/low
5. **Test with sample contracts** - before production use
6. **Monitor worker logs** - for background job status
7. **Use severity wisely** - critical = deal breakers only

---

## 📊 Quick Status Check

```bash
# Health check
curl http://localhost:8000/health

# Container status
docker compose ps

# Resource usage
docker stats --no-stream

# Recent logs
docker compose logs --tail=20 backend
```

---

**Quick Reference v1.3.0**
**Phase 3 Complete - Ready to Use! 🚀**

Print this page for easy reference during development!
