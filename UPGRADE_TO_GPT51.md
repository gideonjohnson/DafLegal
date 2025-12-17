# Upgrade to GPT-5.1

This guide explains how to upgrade from GPT-4o-mini to GPT-5.1 when you're ready.

## Current Setup

Your application is currently configured to use **GPT-4o-mini**:
- ✅ Works with current OpenAI API quota
- ✅ Lower cost per request
- ✅ Fast response times
- ✅ Good quality for most legal tasks

## Why Upgrade to GPT-5.1?

GPT-5.1 (released December 2025) offers:
- 🚀 Better legal reasoning
- 📊 More accurate contract analysis
- 🎯 Improved understanding of complex clauses
- 💡 Better citation accuracy
- ⚡ Enhanced multi-document processing

## Prerequisites

Before upgrading, ensure:
1. **OpenAI API Plan:** GPT-5.1 requires a higher-tier plan
2. **API Quota:** Check your usage limits at https://platform.openai.com/account/billing
3. **Budget:** GPT-5.1 costs more per token than GPT-4o-mini

## Upgrade Steps

### Option 1: Production Only (Recommended)

Upgrade production while keeping development on GPT-4o-mini:

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Select `daflegal-backend` service
   - Go to "Environment" tab

2. **Update OPENAI_MODEL Variable**
   - Find `OPENAI_MODEL`
   - Change value from `gpt-4o-mini` to `gpt-5.1`
   - Click "Save Changes"

3. **Verify Deployment**
   - Wait for automatic redeploy (2-3 minutes)
   - Check logs for errors
   - Test an AI feature

### Option 2: All Environments

Upgrade both development and production:

1. **Update Local Environment**
   ```bash
   # Edit backend/.env
   OPENAI_MODEL="gpt-5.1"
   ```

2. **Update Production (Render)**
   - Follow Option 1 steps above

3. **Test Locally**
   ```bash
   cd backend
   python test_gpt51.py
   ```

## Verification

### Test AI Features

1. **Contract Analysis**
   - Upload a test contract
   - Verify analysis quality
   - Check response times

2. **Check Logs**
   ```bash
   # In Render dashboard, check logs for:
   - No OpenAI API errors
   - Successful completions
   - Model name in responses
   ```

3. **Monitor Costs**
   - Go to https://platform.openai.com/usage
   - Monitor token usage
   - Compare costs vs GPT-4o-mini

## Rollback Plan

If you encounter issues:

1. **Revert Environment Variable**
   - In Render: Change `OPENAI_MODEL` back to `gpt-4o-mini`
   - Save changes (triggers redeploy)

2. **Clear Cache (if needed)**
   - Restart backend service
   - Clear Redis cache

## Cost Comparison

Approximate costs per 1000 tokens (check OpenAI pricing for latest):

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| gpt-4o-mini | $0.00015 | $0.0006 | Development, testing, basic analysis |
| gpt-5.1 | TBD | TBD | Production, complex legal analysis |
| gpt-4o | $0.005 | $0.015 | Alternative high-quality option |

## Gradual Migration Strategy

For large production deployments:

1. **A/B Testing**
   - Run 10% of requests on GPT-5.1
   - Monitor quality and costs
   - Gradually increase percentage

2. **Feature-Specific Upgrade**
   - Use GPT-5.1 for complex features only
   - Keep GPT-4o-mini for simple tasks
   - (Requires code modification)

## Troubleshooting

### Error: "Model not found"
- **Solution:** Verify your OpenAI account has access to GPT-5.1
- Check: https://platform.openai.com/docs/models

### Error: "Insufficient quota"
- **Solution:** Upgrade your OpenAI plan
- Go to: https://platform.openai.com/account/billing

### High Costs
- **Solution:** Implement request caching
- Monitor usage patterns
- Consider hybrid approach (5.1 for complex, 4o-mini for simple)

## Performance Tuning

After upgrading, optimize for GPT-5.1:

1. **Adjust Prompts**
   - GPT-5.1 may understand shorter prompts
   - Test with different prompt styles

2. **Temperature Settings**
   - Legal work: 0.3 (current)
   - Consider: 0.2 for more consistency

3. **Token Limits**
   - Increase max_tokens if needed
   - GPT-5.1 may generate longer responses

## Current Configuration

The model is centrally configured in:
- **Config File:** `backend/app/core/config.py`
- **Environment:** `OPENAI_MODEL` variable
- **Default:** `gpt-4o-mini`

All AI services automatically use the configured model:
- Contract Analysis
- Document Comparison
- Timeline Builder
- Legal Research Chat
- Drafting Service
- Research Service
- Instant Analyzer

## Support

For issues:
1. Check OpenAI status: https://status.openai.com
2. Review API logs in Render dashboard
3. Test with `backend/test_gpt51.py`
4. Contact OpenAI support if billing/access issues

---

**Note:** This upgrade can be done instantly with zero downtime. The change takes effect on next API request after redeployment.
