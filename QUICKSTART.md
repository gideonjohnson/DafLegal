# DafLegal - Quick Start Guide

Get your AI contract analyzer running in 5 minutes!

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- AWS account with S3 bucket created
- Stripe account ([sign up here](https://stripe.com))

---

## Step 1: Clone and Configure

```bash
# Navigate to the project
cd daflegal

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

**Required credentials:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET_NAME` - Your S3 bucket name
- `STRIPE_SECRET_KEY` - Stripe secret key (use test key: `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_*_PRICE_ID` - Create 3 products in Stripe for each plan

---

## Step 2: Start Services

```bash
# Start all services (backend, worker, postgres, redis, frontend)
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

**Services will start on:**
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- Postgres: localhost:5432
- Redis: localhost:6379

---

## Step 3: Test the API

### Register a User

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User"
  }'
```

### Create API Key

```bash
# First, you need to authenticate (for MVP, use a simple flow)
# For now, we'll use the user ID to create a key directly

# Create an API key via the database or use the endpoint
curl -X POST http://localhost:8000/api/v1/users/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEMP_TOKEN" \
  -d '{
    "name": "Test Key"
  }'

# Save the returned API key (dfk_...)
```

### Upload a Contract

```bash
curl -X POST http://localhost:8000/api/v1/contracts/analyze \
  -H "Authorization: Bearer dfk_YOUR_API_KEY" \
  -F "file=@sample_contract.pdf"
```

**Response:**
```json
{
  "contract_id": "ctr_abc123",
  "filename": "sample_contract.pdf",
  "status": "uploaded",
  "eta_seconds": 15
}
```

### Get Analysis Results

```bash
# Wait 10-20 seconds, then:
curl http://localhost:8000/api/v1/contracts/ctr_abc123 \
  -H "Authorization: Bearer dfk_YOUR_API_KEY"
```

---

## Step 4: Use the Frontend

1. Open http://localhost:3000
2. Enter your API key (dfk_...)
3. Drag and drop a PDF or DOCX contract
4. View the analysis in 10-20 seconds!

---

## Common Issues

### Issue: "Connection refused" error
**Solution:** Make sure Docker Desktop is running

### Issue: "Invalid API key"
**Solution:** Double-check your OpenAI API key in `.env`

### Issue: "S3 upload failed"
**Solution:**
- Verify AWS credentials in `.env`
- Ensure S3 bucket exists and region is correct
- Check IAM permissions for S3 put/get/delete

### Issue: Worker not processing
**Solution:** Check worker logs:
```bash
docker-compose logs -f worker
```

### Issue: Frontend can't connect to backend
**Solution:** Ensure backend is running on port 8000:
```bash
curl http://localhost:8000/health
```

---

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

---

## Next Steps

1. **Set up Stripe Products**
   - Go to https://dashboard.stripe.com/test/products
   - Create 3 recurring products: Starter ($19), Pro ($49), Team ($99)
   - Copy price IDs to `.env`

2. **Configure Stripe Webhooks**
   - Go to https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://your-domain.com/api/v1/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy signing secret to `.env`

3. **Set up Sentry (Optional)**
   - Create project at https://sentry.io
   - Copy DSN to `.env`

4. **Deploy to Production**
   - See README.md deployment section
   - Use managed Postgres (AWS RDS, Supabase)
   - Deploy to AWS ECS, GCP Cloud Run, or Railway

---

## Testing with Sample Data

Create a sample contract to test:

```bash
# Create a simple test PDF (requires pdfkit or similar)
# Or download a sample contract from:
# https://www.lawdepot.com/contracts/sample/

# Upload it via API or frontend
```

---

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Support

- Read full docs: README.md
- Check logs: `docker-compose logs`
- GitHub issues: [your-repo]/issues
- Email: support@daflegal.com

---

**You're ready to ship! 🚀**

Start analyzing contracts and building your micro-SaaS business!
