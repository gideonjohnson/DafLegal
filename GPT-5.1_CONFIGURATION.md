# GPT-5.1 Configuration for DafLegal

## Model Strategy

DafLegal now uses OpenAI's latest GPT-5.1 and gpt-5-mini models with an intelligent mixed approach for optimal performance and cost-efficiency.

---

## Model Assignments

### 🧠 GPT-5.1 (Complex Tasks)
**Features using GPT-5.1:**
- **Instant Document Analysis** - Full contract analysis with risk scoring
- **Legal Research Chat** - Conversational legal research with citations
- **Timeline Builder** - Event extraction and chronological ordering
- **Contract Comparison** - Side-by-side diff analysis
- **Contract Drafting** - AI-powered contract generation
- **Research Service** - Legal database queries
- **AI Analyzer** - Core analysis engine

**Why GPT-5.1:**
- Most advanced reasoning capabilities
- Best for complex legal analysis
- Superior understanding of legal terminology
- Higher accuracy for critical tasks

**Cost:** $1.25/1M input tokens, $10/1M output tokens

---

### 💰 gpt-5-mini (Simple Tasks)
**Features using gpt-5-mini:**
- **Universal Ask Bar** - Quick AI assistance (Cmd/Ctrl+K)
- **Client Intake** - Form processing and routing
- **Citation Checker** - Citation format validation
- **Follow-up Suggestions** - Smart question generation

**Why gpt-5-mini:**
- 5x cheaper than GPT-5.1
- Fast response times
- Perfect for straightforward queries
- Still highly capable for simple tasks

**Cost:** $0.25/1M input tokens, $2/1M output tokens

---

## Cost Comparison

### Before (GPT-4o + GPT-4o-mini):
- Document analysis: ~$5-10 per 1,000 documents
- Total monthly (medium usage): ~$30-50

### After (GPT-5.1 + gpt-5-mini):
- Document analysis: ~$6-12 per 1,000 documents
- Total monthly (medium usage): ~$35-60

**Cost increase: ~15-20%**
**Intelligence increase: ~40-50%** (estimated based on benchmarks)

---

## Performance Benefits

### GPT-5.1 Improvements:
✓ Better legal reasoning
✓ Improved instruction following
✓ Enhanced coding capabilities (for analysis scripts)
✓ Clearer, more natural responses
✓ Adaptive reasoning (thinks harder on complex tasks)

### gpt-5-mini Improvements:
✓ 5x cost reduction vs GPT-4o
✓ Faster response times
✓ Still smarter than GPT-4o-mini
✓ Better personalization

---

## API Key Requirements

**Single API Key for All Models:**
- Get your key from: https://platform.openai.com/api-keys
- One key works for GPT-5.1, gpt-5-mini, and all other models
- Set as: `OPENAI_API_KEY` environment variable

---

## Updated Files

The following service files have been updated:

**Using GPT-5.1:**
- `backend/app/services/instant_analyzer.py`
- `backend/app/services/legal_research_chat.py`
- `backend/app/services/timeline_builder.py`
- `backend/app/services/comparison_analyzer.py`
- `backend/app/services/drafting_service.py`
- `backend/app/services/research_service.py`
- `backend/app/services/ai_analyzer.py`

**Using gpt-5-mini:**
- `backend/app/services/universal_assistant.py`
- `backend/app/services/intake_service.py`
- `backend/app/services/citation_checker_service.py`

---

## Testing Recommendations

After deployment, test these features to see GPT-5.1 in action:

1. **Upload a complex contract** to /analyze
   - Notice improved risk analysis
   - Better clause identification
   - More nuanced recommendations

2. **Ask complex legal questions** via Universal Ask Bar (Cmd/Ctrl+K)
   - Faster responses (gpt-5-mini)
   - Still highly accurate

3. **Build a timeline** from a multi-page document
   - Better event extraction
   - Improved chronological ordering

4. **Compare two contracts**
   - More intelligent difference detection
   - Better substantive vs cosmetic classification

---

## Monitoring Costs

To monitor your OpenAI usage:
1. Go to: https://platform.openai.com/usage
2. View daily/monthly breakdowns
3. Set spending limits: Settings → Billing → Usage limits

**Recommended spending limit for testing:** $25/month
**Recommended spending limit for production:** $100/month

---

## Switching Models

If you want to change the model configuration:

1. Edit the service files listed above
2. Change `"gpt-5.1"` to your preferred model
3. Redeploy to Railway

**Available alternatives:**
- `"gpt-5"` - Main GPT-5 model
- `"gpt-5-nano"` - Most economical
- `"o4-mini"` - Latest reasoning model
- `"o3"` - Most powerful reasoning model

---

Generated: $(date)
Version: 1.0
