# DafLegal - System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User/Developer                          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ ContractUpload│  │ContractAnalysis│ │  Dashboard   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Contracts  │  │    Users     │  │   Billing    │         │
│  │   Endpoints  │  │  Endpoints   │  │  Endpoints   │         │
│  └──────┬───────┘  └──────────────┘  └──────────────┘         │
│         │                                                        │
│         │ Queue Task                                            │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ Dependencies │  (Auth, Quota Check)                         │
│  └──────────────┘                                               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────┐          ┌─────────────┐
│PostgreSQL│          │    Redis    │
│ Database │          │   Broker    │
└──────────┘          └─────┬───────┘
                            │
                            │ Celery Queue
                            ▼
                   ┌─────────────────┐
                   │  Celery Worker  │
                   │                 │
                   │ ┌─────────────┐ │
                   │ │Document Proc││ │
                   │ └─────────────┘ │
                   │ ┌─────────────┐ │
                   │ │ AI Analyzer ││ │
                   │ └─────────────┘ │
                   │ ┌─────────────┐ │
                   │ │  S3 Storage ││ │
                   │ └─────────────┘ │
                   └────┬───────┬────┘
                        │       │
        ┌───────────────┘       └────────────────┐
        │                                        │
        ▼                                        ▼
   ┌─────────┐                            ┌──────────┐
   │   AWS   │                            │  OpenAI  │
   │   S3    │                            │   API    │
   └─────────┘                            └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Stripe  │  │  Sentry  │  │Healthchecks│ │   Email  │       │
│  │ Billing  │  │  Errors  │  │  Uptime   │  │  SMTP    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Contract Analysis

### 1. Upload Flow
```
User
  │
  ├─► [Frontend] Drag & drop PDF
  │
  ├─► [Frontend] FormData + API key
  │
  └─► [FastAPI] POST /api/v1/contracts/analyze
        │
        ├─► [Auth] Verify API key
        │
        ├─► [Quota] Check usage limits
        │
        ├─► [S3] Upload file (encrypted)
        │
        ├─► [Postgres] Create Contract record
        │
        ├─► [Celery] Queue process_contract_task
        │
        └─► [Response] 202 Accepted + contract_id
```

### 2. Processing Flow (Background)
```
Celery Worker
  │
  ├─► [Task] Receive process_contract_task(contract_id)
  │
  ├─► [Postgres] Update status = "processing"
  │
  ├─► [S3] Download file
  │
  ├─► [DocumentProcessor] Extract text
  │     ├─► pypdf (for PDF)
  │     └─► python-docx (for DOCX)
  │
  ├─► [AIAnalyzer] Analyze with OpenAI
  │     │
  │     ├─► Build prompt with rubric
  │     ├─► Call GPT-4o mini
  │     └─► Parse JSON response
  │
  ├─► [Postgres] Save ContractAnalysis
  │
  ├─► [Postgres] Update Contract status = "completed"
  │
  └─► [Postgres] Record UsageRecord + update User quotas
```

### 3. Results Retrieval
```
User
  │
  └─► [Frontend] Poll GET /api/v1/contracts/{id}
        │
        ├─► [Auth] Verify API key
        │
        ├─► [Postgres] Fetch Contract + Analysis
        │
        └─► [Response] 200 OK + full analysis JSON
```

---

## Database Schema

### Users Table
```sql
users
├── id (PK)
├── email (unique)
├── hashed_password
├── full_name
├── plan (free_trial/starter/pro/team)
├── stripe_customer_id
├── stripe_subscription_id
├── pages_used_current_period
├── files_used_current_period
├── billing_period_start
├── billing_period_end
├── is_active
├── created_at
└── updated_at
```

### API Keys Table
```sql
api_keys
├── id (PK)
├── user_id (FK → users.id)
├── key (unique, indexed)
├── name
├── is_active
├── last_used_at
└── created_at
```

### Contracts Table
```sql
contracts
├── id (PK)
├── contract_id (unique, indexed)
├── user_id (FK → users.id)
├── filename
├── file_size_bytes
├── file_type (pdf/docx)
├── s3_key
├── status (uploaded/processing/completed/failed)
├── error_message
├── page_count
├── word_count
├── created_at
├── updated_at
└── processed_at
```

### Contract Analyses Table
```sql
contract_analyses
├── id (PK)
├── contract_id (FK → contracts.id, unique)
├── executive_summary (JSON array)
├── parties (JSON array)
├── effective_date
├── term_duration
├── payment_terms
├── detected_clauses (JSON array)
├── missing_clauses (JSON array)
├── risk_score (float 0-10)
├── overall_risk_level (low/medium/high)
├── extracted_text (truncated)
├── processing_time_seconds
└── created_at
```

### Usage Records Table
```sql
usage_records
├── id (PK)
├── user_id (FK → users.id)
├── resource_type (contract_analysis)
├── pages_consumed
├── files_consumed
├── contract_id (FK → contracts.id)
├── billing_period_start
├── billing_period_end
└── created_at
```

---

## API Endpoints Map

### Authentication Flow
```
POST /api/v1/users/register
  → Creates User (plan: free_trial)
  → Returns user profile

POST /api/v1/users/api-keys
  → Requires: Authorization header
  → Creates APIKey
  → Returns key (shown once only)

All subsequent requests require:
  Authorization: Bearer dfk_...
```

### Contract Analysis Flow
```
POST /api/v1/contracts/analyze
  ├─ Headers: Authorization, Content-Type: multipart/form-data
  ├─ Body: file (PDF/DOCX)
  ├─ Response: 202 Accepted
  └─ Returns: { contract_id, status, eta_seconds }

GET /api/v1/contracts/{contract_id}
  ├─ Headers: Authorization
  ├─ Response: 200 OK (if completed) or 202 Accepted (if processing)
  └─ Returns: Full analysis JSON

GET /api/v1/contracts
  ├─ Headers: Authorization
  ├─ Query: limit, offset
  └─ Returns: List of user's contracts
```

### Billing Flow
```
POST /api/v1/billing/create-checkout-session
  ├─ Body: { plan: "starter" }
  └─ Returns: { checkout_url }

POST /api/v1/billing/portal-session
  └─ Returns: { portal_url }

POST /api/v1/billing/webhook (Stripe only)
  ├─ Events: checkout.session.completed, customer.subscription.deleted
  └─ Updates user plan and quotas
```

---

## Security Architecture

### Authentication
- **API Keys**: Format `dfk_<32_random_chars>`
- **Storage**: Hashed in database (not encrypted - keys are not reversible)
- **Transmission**: Bearer token in Authorization header
- **Validation**: Every request checks APIKey.is_active

### Authorization
- **User Isolation**: All queries filtered by user_id
- **Quota Enforcement**: Checked before processing
- **Rate Limiting**: 60 req/min per API key (configurable)

### Data Protection
- **S3 Encryption**: AES256 server-side encryption
- **HTTPS**: All traffic encrypted in transit
- **Database**: Passwords hashed with bcrypt
- **Secrets**: Environment variables (never committed)

### OWASP Top 10 Mitigations
1. **Injection**: SQLModel parameterized queries
2. **Broken Auth**: API key + quota checks
3. **Sensitive Data**: Passwords hashed, S3 encrypted
4. **XML External Entities**: Not applicable (JSON only)
5. **Broken Access Control**: user_id filtering
6. **Security Misconfiguration**: Explicit CORS, no debug in prod
7. **XSS**: Next.js escapes by default
8. **Insecure Deserialization**: Pydantic validation
9. **Components with Known Vulnerabilities**: Dependabot alerts
10. **Insufficient Logging**: Sentry + structured logs

---

## Scalability Strategy

### Current Limits (MVP)
- **1 Celery worker** → ~60 contracts/hour
- **Single backend instance** → ~100 req/sec
- **Postgres** → 100 concurrent connections
- **Redis** → 10k ops/sec

### Scaling Path

#### To 100 Users
- ✅ Current setup sufficient

#### To 1,000 Users
- **Backend**: 2-3 instances behind load balancer
- **Workers**: 5 Celery workers
- **Database**: Connection pooling (PgBouncer)
- **Redis**: Redis cluster

#### To 10,000 Users
- **Backend**: Auto-scaling (5-20 instances)
- **Workers**: Auto-scaling (10-50 workers)
- **Database**: Read replicas, vertical scaling
- **Redis**: Redis Cluster with sharding
- **S3**: CloudFront CDN
- **Caching**: Redis cache for frequent queries

#### To 100,000 Users
- **Backend**: Kubernetes cluster
- **Workers**: Separate Celery queues by priority
- **Database**: Partitioning by user_id, Citus for sharding
- **Redis**: Dedicated Redis per service
- **S3**: Multi-region replication
- **AI**: Consider caching common clauses

---

## Cost Breakdown (Monthly)

### MVP (0-100 users, ~500 contracts/month)
- **OpenAI API**: $25 (~$0.05 per contract)
- **AWS S3**: $5 (storage + bandwidth)
- **Hosting**: $50 (Railway/Render/DigitalOcean)
- **Postgres**: $15 (Supabase free tier + backup)
- **Redis**: $10 (Upstash free tier + overage)
- **Stripe**: $0 (percentage-based)
- **Sentry**: $0 (free tier)
- **Total**: ~$105/month

### Growth (1,000 users, ~10,000 contracts/month)
- **OpenAI API**: $500
- **AWS S3**: $50
- **Hosting**: $200 (3 backend + 5 workers)
- **Postgres**: $100 (managed RDS)
- **Redis**: $50 (ElastiCache)
- **Stripe**: ~$150 (fees on $5k MRR)
- **Sentry**: $50 (paid plan)
- **Total**: ~$1,100/month

### Scale (10,000 users, ~100,000 contracts/month)
- **OpenAI API**: $5,000
- **AWS**: $1,000 (S3 + CloudFront)
- **Hosting**: $1,500 (auto-scaling)
- **Postgres**: $500 (multi-AZ, replicas)
- **Redis**: $200 (cluster)
- **Stripe**: ~$1,500 (fees on $50k MRR)
- **Monitoring**: $200 (Sentry + Datadog)
- **Total**: ~$9,900/month

**Note**: At $50k MRR, gross profit = $40k (80% margin)

---

## Deployment Environments

### Development (localhost)
- **docker-compose**: All services local
- **Hot reload**: Enabled for backend + frontend
- **Test mode**: Stripe test keys, fake S3 (LocalStack optional)
- **Debug**: Full stack traces, verbose logging

### Staging (pre-production)
- **Hosting**: Render/Railway staging env
- **Database**: Managed Postgres (small instance)
- **S3**: Separate staging bucket
- **Stripe**: Test mode
- **Purpose**: Integration testing, client demos

### Production
- **Hosting**: AWS ECS / GCP Cloud Run / Kubernetes
- **Database**: Multi-AZ Postgres with replicas
- **S3**: Production bucket with lifecycle rules
- **Stripe**: Live mode
- **Monitoring**: Full observability stack
- **Backup**: Daily automated backups

---

## Monitoring & Alerts

### Health Checks
- **Endpoint**: `GET /health`
- **Frequency**: Every 5 minutes (Healthchecks.io)
- **Alert if**: Down for >2 checks

### Error Tracking (Sentry)
- **Backend errors**: Python exceptions
- **Frontend errors**: JavaScript errors
- **Alert if**: >10 errors/hour

### Performance Metrics
- **API latency**: p50, p95, p99
- **Worker queue length**: Alert if >100
- **Database connections**: Alert if >80% used
- **OpenAI API latency**: Alert if >30 sec

### Business Metrics (Dashboard)
- **Daily signups**
- **Daily contracts analyzed**
- **MRR (Monthly Recurring Revenue)**
- **Churn rate**
- **Average processing time**

---

## Disaster Recovery

### Backups
- **Postgres**: Daily snapshots (7-day retention)
- **S3**: Versioning enabled
- **Code**: Git + GitHub

### Recovery Procedures

#### Database Failure
1. Switch to read replica (if available)
2. Restore from latest snapshot
3. Update DNS/connection string
4. Verify data integrity
5. Resume operations

#### S3 Outage
1. Switch to backup bucket (if multi-region)
2. Queue uploads for retry
3. Notify users of delays
4. Resume when S3 recovers

#### OpenAI API Outage
1. Queue analysis jobs in Celery
2. Show "delayed processing" message
3. Auto-retry when API recovers
4. Alternative: Use Anthropic Claude as backup

#### Complete Infrastructure Loss
1. Provision new infrastructure (Terraform/manual)
2. Restore Postgres from backup
3. Redeploy Docker images
4. Update DNS
5. Restore service (RTO: 4 hours)

---

## Future Enhancements

### Immediate (Month 2-3)
- [ ] Contract comparison (diff two versions)
- [ ] Webhooks (notify on completion)
- [ ] Bulk upload API

### Short-term (Month 4-6)
- [ ] Custom risk rubrics
- [ ] Multi-language support
- [ ] Client SDKs (Python, Node.js)

### Long-term (Month 7-12)
- [ ] Redlining assistant
- [ ] Obligation tracker
- [ ] Clause library search
- [ ] White-label solution

---

## Tech Debt & Maintenance

### Current Known Limitations
- Single Celery worker (bottleneck at scale)
- No caching layer (Redis used only for Celery)
- No CDN for frontend assets
- Basic error handling (needs improvement)
- Limited test coverage (~30%)

### Quarterly Maintenance Tasks
- Update dependencies (security patches)
- Review and optimize database queries
- Clean up old S3 files (lifecycle policies)
- Review Sentry errors and fix recurring issues
- Update AI prompts based on user feedback

---

This architecture is designed to scale from 0 to 10,000 users without major rewrites. The foundation is solid, modular, and uses proven technologies.

**Ready to deploy and grow! 🚀**
