# OpenAI Model Configuration

## Overview

The DafLegal backend now uses a **centralized, configurable OpenAI model** that can be changed via environment variable without code modifications.

## Current Setup

**Active Model:** `gpt-4o-mini`
**Why:** Works with current API quota, lower cost, proven reliability

## Supported Models

| Model | Status | Use Case |
|-------|--------|----------|
| **gpt-4o-mini** | ✅ Active | Current production model |
| **gpt-5.1** | 🔄 Ready | Upgrade when API plan supports it |
| **gpt-4o** | ✅ Available | Alternative high-quality option |
| **gpt-4-turbo** | ✅ Available | Another alternative |

## How It Works

### Central Configuration

All AI services read from a single configuration:

```python
# backend/app/core/config.py
OPENAI_MODEL: str = "gpt-4o-mini"  # Default value
```

### Services Using This Config

1. **Contract Analysis** (`ai_analyzer.py`)
2. **Document Comparison** (`comparison_analyzer.py`)
3. **Instant Analyzer** (`instant_analyzer.py`)
4. **Timeline Builder** (`timeline_builder.py`)
5. **Legal Research Chat** (`legal_research_chat.py`)
6. **Research Service** (`research_service.py`)
7. **Drafting Service** (`drafting_service.py`)

### Environment Variable

Set via `OPENAI_MODEL` environment variable:

```bash
# Development (.env file)
OPENAI_MODEL="gpt-4o-mini"

# Production (Render dashboard)
OPENAI_MODEL=gpt-4o-mini
```

## Changing Models

### Development Environment

1. Edit `backend/.env`:
   ```bash
   OPENAI_MODEL="gpt-5.1"  # or gpt-4o, gpt-4-turbo
   ```

2. Restart backend:
   ```bash
   # Will auto-reload if using uvicorn --reload
   ```

### Production Environment (Render)

1. Go to https://dashboard.render.com
2. Select `daflegal-backend` service
3. Navigate to "Environment" tab
4. Find `OPENAI_MODEL` variable
5. Change value (e.g., from `gpt-4o-mini` to `gpt-5.1`)
6. Click "Save Changes"
7. Wait for automatic redeploy (~2-3 minutes)

**That's it!** No code changes needed.

## Verification

### Test Current Model

```bash
cd backend
python test_openai.py
```

### Test GPT-5.1 Compatibility

```bash
cd backend
python test_gpt51.py
```

This will show:
- ✅ If GPT-5.1 is available on your plan
- ❌ If you need to upgrade API plan
- 💰 Current quota status

## Migration Path

### Phase 1: Current (GPT-4o-mini)
- ✅ Working now
- Low cost
- Good quality
- No action needed

### Phase 2: Upgrade to GPT-5.1
**When:** You upgrade OpenAI API plan

**Steps:**
1. Verify API plan supports GPT-5.1
2. Update `OPENAI_MODEL` in Render
3. Monitor costs and quality
4. See `UPGRADE_TO_GPT51.md` for details

### Phase 3: Hybrid (Future Enhancement)
- Use GPT-5.1 for complex analysis
- Use GPT-4o-mini for simple tasks
- Requires code modification (per-feature model selection)

## Cost Monitoring

Track usage at: https://platform.openai.com/usage

**Estimated Monthly Costs** (example):
- 1,000 contracts analyzed
- Average 2,000 tokens per analysis
- GPT-4o-mini: ~$0.30/month
- GPT-5.1: TBD (check OpenAI pricing)

## Troubleshooting

### Model Not Available Error

```
Error code: 404 - Model not found
```

**Solution:** Your API plan doesn't support this model. Use supported model:
```bash
OPENAI_MODEL="gpt-4o-mini"  # Known working
```

### Quota Exceeded Error

```
Error code: 429 - Insufficient quota
```

**Solution:**
1. Check usage: https://platform.openai.com/account/billing
2. Upgrade plan if needed
3. Or switch to cheaper model temporarily

### Rate Limit Error

```
Error code: 429 - Rate limit exceeded
```

**Solution:**
1. Implement request queuing (already has Redis)
2. Add retry logic with exponential backoff
3. Upgrade API plan for higher rate limits

## Files Modified

### Configuration
- ✅ `backend/app/core/config.py` - Added OPENAI_MODEL setting
- ✅ `backend/.env` - Added OPENAI_MODEL variable
- ✅ `render.yaml` - Added OPENAI_MODEL for backend & worker

### Services (all updated to use settings.OPENAI_MODEL)
- ✅ `backend/app/services/ai_analyzer.py`
- ✅ `backend/app/services/comparison_analyzer.py`
- ✅ `backend/app/services/instant_analyzer.py`
- ✅ `backend/app/services/timeline_builder.py`
- ✅ `backend/app/services/legal_research_chat.py`
- ✅ `backend/app/services/research_service.py`
- ✅ `backend/app/services/drafting_service.py`

## Benefits

### Before (Hardcoded)
- ❌ Model name in 8+ files
- ❌ Code changes needed to upgrade
- ❌ Inconsistent models across services
- ❌ Deployment required for model change

### After (Configurable)
- ✅ Single source of truth
- ✅ Change model without code changes
- ✅ All services use same model
- ✅ Environment-specific models
- ✅ Easy rollback
- ✅ A/B testing ready

## Advanced: Per-Feature Models

If you need different models for different features (e.g., GPT-5.1 for contracts, GPT-4o-mini for simple tasks):

1. Add feature-specific env vars:
   ```bash
   OPENAI_MODEL_CONTRACT="gpt-5.1"
   OPENAI_MODEL_DRAFTING="gpt-4o-mini"
   OPENAI_MODEL_RESEARCH="gpt-4o"
   ```

2. Update services to use specific models
3. Monitor costs and quality per feature

## Support

For questions:
1. Check OpenAI docs: https://platform.openai.com/docs/models
2. Review `UPGRADE_TO_GPT51.md`
3. Test with: `python test_openai.py` or `python test_gpt51.py`

---

**Status:** ✅ Fully Configured & Production Ready

**Current Model:** gpt-4o-mini
**Upgrade Ready:** Yes (to gpt-5.1 when API plan supports it)
**Downtime for Changes:** Zero (just env var change + redeploy)
