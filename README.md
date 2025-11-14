# DafLegal - AI Contract Intelligence for Law Firms

**Increase productivity by 10x. Review contracts in seconds, not hours.**

DafLegal is an AI-powered contract intelligence platform designed specifically for law firms and legal professionals. Focus on legal strategy while AI handles the heavy lifting. Upload a PDF or DOCX contract and receive:

- Plain-English summaries
- Risk analysis with explicit rubrics
- Clause detection (termination, indemnity, IP, etc.)
- Missing clause alerts
- Structured JSON API responses

---

## Features

### Built for Lawyers, By Lawyers

#### 🚀 **Instant Contract Review**
- Upload PDF/DOCX contracts and get AI analysis in 10-20 seconds
- Extract key terms, parties, dates, and obligations automatically
- Get plain-English summaries without legal jargon
- Support for contracts up to 25MB

#### ⚠️ **Risk Scoring & Alerts**
- Quantified risk scores (0-10) for every clause
- Identify unfavorable terms and liability exposure
- Missing clause detection (force majeure, indemnity, etc.)
- Explicit explanations for every risk identified

#### ✅ **Smart Clause Detection**
- Automatically identify 20+ clause types:
  - Termination & renewal clauses
  - Indemnity & liability limitations
  - Intellectual property provisions
  - Confidentiality & non-compete
  - Payment terms & pricing
  - And many more...
- Never miss a critical clause again

#### 🔄 **Contract Comparison**
- Compare two contract versions side-by-side
- Identify substantive changes vs. cosmetic edits
- Track revisions with risk implications
- Perfect for reviewing redlines and amendments

#### 📚 **Clause Library**
- Build your firm's knowledge base
- Store and categorize approved clauses
- Search by keyword, category, or risk level
- Get AI-powered clause suggestions based on contract context
- Standardize best practices across your team

#### 🛡️ **Compliance Playbooks** ✨ NEW
- Create custom compliance rules for your firm or clients
- Define mandatory clauses, forbidden terms, and approval workflows
- Automatically check contracts against your playbook
- Get 0-100% compliance scores with severity-weighted violations
- Ensure policy adherence at scale

### For Law Firms & Legal Teams
- **10x faster** contract review process
- **90% reduction** in manual contract analysis work
- **24/7 availability** - no more bottlenecks waiting for senior review
- **Consistent quality** - every contract gets the same thorough analysis
- **Knowledge retention** - build institutional knowledge with clause library
- **Client satisfaction** - deliver faster turnarounds without sacrificing quality

### Technical Stack
- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with SQLModel
- **Storage**: AWS S3 (encrypted at rest)
- **Background Jobs**: Celery + Redis
- **Auth**: API key-based authentication
- **Billing**: Stripe subscriptions
- **Monitoring**: Sentry + Healthchecks.io

---

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key
- AWS S3 bucket
- Stripe account

### 1. Clone and Setup

```bash
git clone <your-repo>
cd daflegal
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` and add your API keys:

```bash
OPENAI_API_KEY=sk-your-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=daflegal-contracts
STRIPE_SECRET_KEY=sk_test_your-key
# ... etc
```

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- FastAPI backend (port 8000)
- Celery worker
- Next.js frontend (port 3000)

### 4. Verify Installation

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```


---

## Pricing Plans

| Plan | Price | Pages/Month | Files/Month |
|------|-------|-------------|-------------|
| **Free Trial** | $0 | 30 | 3 |
| **Starter** | $19/mo | 50 | 20 |
| **Pro** | $49/mo | 300 | 120 |
| **Team** | $99/mo | 1,000 | 400 |



---

## Deployment

### Production Checklist

1. **Environment Variables**
   - Generate strong `SECRET_KEY`
   - Use production Stripe keys
   - Configure Sentry DSN
   - Set `ENVIRONMENT=production`

2. **Database**
   - Use managed PostgreSQL (AWS RDS, Supabase, etc.)
   - Enable automated backups
   - Set up connection pooling

3. **Storage**
   - Create production S3 bucket
   - Enable versioning
   - Configure lifecycle policies

4. **Monitoring**
   - Set up Sentry error tracking
   - Configure Healthchecks.io pings
   - Enable CloudWatch/Datadog logs

5. **Scaling**
   - Run multiple Celery workers
   - Use load balancer for API servers
   - Enable Redis persistence

### Deploy to AWS/GCP/Azure

Use the provided Dockerfiles:

```bash
# Build images
docker build -t daflegal-api -f backend/Dockerfile backend/
docker build -t daflegal-worker -f backend/Dockerfile.worker backend/

# Push to registry
docker tag daflegal-api your-registry.com/daflegal-api:latest
docker push your-registry.com/daflegal-api:latest
```

