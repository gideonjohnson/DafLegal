# DafLegal - AI Contract Intelligence API

**Upload contracts. Get intelligence. Simple API, powerful insights.**

DafLegal is a micro-SaaS that transforms legal contracts into actionable intelligence using AI. Upload a PDF or DOCX contract and receive:

- Plain-English summaries
- Risk analysis with explicit rubrics
- Clause detection (termination, indemnity, IP, etc.)
- Missing clause alerts
- Structured JSON API responses

---

## Features

### Core Functionality
- **Document Upload**: PDF and DOCX support
- **AI Analysis**: Powered by OpenAI GPT-4o mini
- **Clause Detection**: Automatically identify key contract clauses
- **Risk Scoring**: 0-10 risk assessment with explanations
- **Missing Clause Detection**: Identify absent standard protections
- **Usage Metering**: Track pages and files per billing period

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

## API Usage

### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe"
  }'
```

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "plan": "free_trial",
  "pages_used_current_period": 0,
  "files_used_current_period": 0,
  "created_at": "2025-01-15T10:00:00"
}
```

### 2. Create API Key

```bash
curl -X POST http://localhost:8000/api/v1/users/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "name": "My API Key"
  }'
```

Response:
```json
{
  "id": 1,
  "key": "dfk_abc123...",
  "name": "My API Key",
  "is_active": true,
  "created_at": "2025-01-15T10:05:00"
}
```

**⚠️ Save this key! It's only shown once.**

### 3. Upload Contract for Analysis

```bash
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_abc123..." \
  -F "file=@contract.pdf"
```

Response:
```json
{
  "contract_id": "ctr_xyz789",
  "filename": "contract.pdf",
  "status": "uploaded",
  "eta_seconds": 15
}
```

### 4. Get Analysis Results

```bash
curl http://localhost:8000/api/v1/contracts/ctr_xyz789 \
  -H "Authorization: Bearer dfk_abc123..."
```

Response:
```json
{
  "contract_id": "ctr_xyz789",
  "status": "completed",
  "executive_summary": [
    "3-year SaaS agreement with ABC Corp for $50k/year",
    "Auto-renews unless cancelled 90 days before end date",
    "Liability capped at 12 months of fees paid"
  ],
  "key_terms": {
    "parties": ["Your Company Inc.", "ABC Corp"],
    "effective_date": "2024-01-15",
    "term": "3 years",
    "payment": "$50,000 annually"
  },
  "detected_clauses": [
    {
      "type": "termination",
      "risk_level": "medium",
      "text": "Either party may terminate with 90 days notice",
      "explanation": "Long notice period may delay exit"
    }
  ],
  "missing_clauses": ["force_majeure", "data_protection"],
  "risk_score": 6.5,
  "overall_risk_level": "medium",
  "pages_processed": 12,
  "processing_time_seconds": 8.3,
  "created_at": "2025-01-15T10:10:00"
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

All plans include full API access and JSON responses.

---

## Development

### Project Structure

```
daflegal/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API endpoints
│   │   ├── core/            # Config, security, database
│   │   ├── models/          # SQLModel database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── workers/         # Celery tasks
│   ├── tests/               # Pytest tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── (Next.js app)
└── docker-compose.yml
```

### Running Locally

```bash
# Backend only
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

### Running Tests

```bash
cd backend
pytest
```

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

---

## API Reference

Full interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Authentication

All API requests require an API key in the `Authorization` header:

```
Authorization: Bearer dfk_your_api_key_here
```

### Rate Limits

- 60 requests/minute per API key
- Quota limits enforced per plan

### Error Responses

```json
{
  "detail": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `202` - Accepted (processing)
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `429` - Quota exceeded
- `500` - Server error

---

## Roadmap

**MVP (Current)**
- ✅ Contract summarization
- ✅ Clause detection
- ✅ Risk analysis
- ✅ Usage metering
- ✅ Stripe billing

**Q2 2025**
- [ ] Contract comparison (diff two versions)
- [ ] Webhooks for async notifications
- [ ] Batch processing API

**Q3 2025**
- [ ] Custom risk rubrics
- [ ] Multi-language support
- [ ] Zapier integration

**Q4 2025**
- [ ] Redlining assistant
- [ ] Clause library search
- [ ] Obligation tracker

---

## Support

- **Documentation**: https://docs.daflegal.com
- **API Status**: https://status.daflegal.com
- **Email**: support@daflegal.com
- **Discord**: https://discord.gg/daflegal

---

## License

Proprietary - All Rights Reserved

---

## Contributing

This is a commercial product. Contributions are welcome for:
- Bug fixes
- Documentation improvements
- Feature suggestions

Please open an issue before submitting a PR.

---

**Built with ❤️ for legal professionals and developers**
