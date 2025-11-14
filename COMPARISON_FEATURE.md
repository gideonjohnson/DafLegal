# Contract Comparison Feature

## Overview

The Contract Comparison feature allows users to compare two versions of a contract to identify changes, assess risk impact, and distinguish between substantive and cosmetic modifications.

## Features

### What It Does

1. **Text-level Diff**: Identifies additions, deletions, and modifications
2. **Clause Analysis**: Tracks changes to specific contract clauses
3. **Risk Assessment**: Calculates the change in risk score between versions
4. **Semantic Understanding**: AI-powered classification of substantive vs. cosmetic changes
5. **Impact Summary**: Provides plain-English explanations of changes

### Key Capabilities

- **Substantive Changes**: Identifies changes that affect legal obligations, rights, money, dates, or terms
- **Cosmetic Changes**: Detects formatting, punctuation, capitalization changes
- **Clause Tracking**: Monitors additions, removals, and modifications to standard clauses
- **Risk Delta**: Shows whether the revised contract is more or less risky

---

## API Usage

### Prerequisites

Both contracts must be:
1. Uploaded and analyzed first
2. Have `status: "completed"`
3. Belong to the same user

### 1. Create Comparison

**Endpoint**: `POST /api/v1/comparisons/`

**Request**:
```json
{
  "original_contract_id": "ctr_abc123",
  "revised_contract_id": "ctr_xyz789"
}
```

**Response** (202 Accepted):
```json
{
  "comparison_id": "cmp_def456",
  "status": "uploaded",
  "eta_seconds": 20
}
```

### 2. Get Comparison Results

**Endpoint**: `GET /api/v1/comparisons/{comparison_id}`

**Response** (200 OK):
```json
{
  "comparison_id": "cmp_def456",
  "status": "completed",
  "original_contract_id": "ctr_abc123",
  "revised_contract_id": "ctr_xyz789",
  "summary": "The revised contract reduces the liability cap from $1M to $500k and adds a new termination clause allowing 30-day notice.",
  "additions": [
    {
      "type": "addition",
      "original_text": null,
      "revised_text": "Either party may terminate with 30 days written notice",
      "location": "Section 9.2",
      "is_substantive": true
    }
  ],
  "deletions": [
    {
      "type": "deletion",
      "original_text": "This agreement is perpetual",
      "revised_text": null,
      "location": "Section 2",
      "is_substantive": true
    }
  ],
  "modifications": [
    {
      "type": "modification",
      "original_text": "liability shall not exceed $1,000,000",
      "revised_text": "liability shall not exceed $500,000",
      "location": "Section 8.3",
      "is_substantive": true
    }
  ],
  "clause_changes": [
    {
      "clause_type": "termination",
      "change_type": "added",
      "original_clause": null,
      "revised_clause": {
        "type": "termination",
        "risk_level": "medium",
        "text": "Either party may terminate with 30 days notice",
        "explanation": "Allows either party to exit with reasonable notice"
      },
      "impact_summary": "New termination clause added"
    },
    {
      "clause_type": "liability",
      "change_type": "modified",
      "original_clause": {
        "type": "liability",
        "risk_level": "low",
        "text": "Capped at $1M"
      },
      "revised_clause": {
        "type": "liability",
        "risk_level": "medium",
        "text": "Capped at $500k"
      },
      "impact_summary": "Liability clause modified - cap reduced by 50%"
    }
  ],
  "risk_delta": 1.5,
  "substantive_changes": [
    {
      "type": "modification",
      "original_text": "$1,000,000",
      "revised_text": "$500,000",
      "location": "Section 8.3",
      "is_substantive": true
    }
  ],
  "cosmetic_changes": [
    {
      "type": "modification",
      "original_text": "Company",
      "revised_text": "the Company",
      "location": "Throughout",
      "is_substantive": false
    }
  ],
  "processing_time_seconds": 12.3,
  "created_at": "2025-01-15T10:30:00Z",
  "processed_at": "2025-01-15T10:30:12Z"
}
```

### 3. List User's Comparisons

**Endpoint**: `GET /api/v1/comparisons/`

**Query Parameters**:
- `limit` (default: 20)
- `offset` (default: 0)

**Response**:
```json
[
  {
    "comparison_id": "cmp_def456",
    "status": "completed",
    "original_contract_id": "ctr_abc123",
    "revised_contract_id": "ctr_xyz789",
    "summary": "Brief summary...",
    "risk_delta": 1.5,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

## Frontend Usage

### Access the Comparison Tool

Navigate to `/compare` in the frontend:

```
http://localhost:3000/compare
```

### Steps

1. **Enter API Key**: Your authentication token
2. **Enter Contract IDs**:
   - Original Contract ID (from upload)
   - Revised Contract ID (from upload)
3. **Click Compare**: Initiates async comparison
4. **View Results**: Automatically polls and displays results

### UI Features

- **Summary Card**: High-level overview of changes
- **Risk Delta**: Visual indicator of risk increase/decrease
- **Substantive Changes**: Highlighted in orange, sorted by importance
- **Clause Changes**: Color-coded (added=green, removed=red, modified=yellow)
- **Cosmetic Changes**: Collapsible section for minor changes

---

## Database Schema

### `contract_comparisons` Table

```sql
CREATE TABLE contract_comparisons (
  id SERIAL PRIMARY KEY,
  comparison_id VARCHAR UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  original_contract_id INTEGER REFERENCES contracts(id),
  revised_contract_id INTEGER REFERENCES contracts(id),
  status VARCHAR,
  error_message TEXT,
  summary TEXT,
  additions JSONB,
  deletions JSONB,
  modifications JSONB,
  clause_changes JSONB,
  risk_delta FLOAT,
  substantive_changes JSONB,
  cosmetic_changes JSONB,
  processing_time_seconds FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

---

## How It Works

### Processing Pipeline

1. **User submits comparison request** with two contract IDs
2. **API validates** both contracts exist and are completed
3. **Creates comparison record** with status `uploaded`
4. **Queues Celery task** `process_comparison_task`
5. **Background worker**:
   - Fetches both contract analyses
   - Runs text-level diff using Python's `difflib`
   - Compares detected clauses
   - Calculates risk delta
   - Calls OpenAI to classify changes as substantive/cosmetic
   - Saves results to database
6. **User polls API** to get results

### AI Analysis

The comparison service uses GPT-4o mini to:
- Generate a summary of key changes
- Identify the location of each change (section/clause)
- Classify changes as substantive or cosmetic
- Explain the impact of each change

**Prompt Focus**:
- Substantive = affects legal obligations, rights, money, dates
- Cosmetic = formatting, punctuation, minor wording

### Cost Estimate

- **OpenAI API cost**: ~$0.03-0.08 per comparison
- **Processing time**: 15-30 seconds
- **Storage**: ~5-20 KB per comparison record

---

## Error Handling

### Common Errors

**400 Bad Request**:
```json
{
  "detail": "Both contracts must be fully analyzed before comparison"
}
```

**404 Not Found**:
```json
{
  "detail": "One or both contracts not found"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Comparison failed: OpenAI API timeout"
}
```

### Retry Logic

If comparison fails:
1. Check both contracts have `status: "completed"`
2. Ensure contracts belong to the user
3. Retry comparison request
4. Check Celery worker logs: `docker logs daflegal-worker`

---

## Use Cases

### 1. Contract Negotiation

Track changes between:
- Initial draft → Client redlines
- Vendor proposal → Final agreement

### 2. Compliance Review

Compare:
- Old agreement → Updated terms
- Template v1 → Template v2

### 3. Risk Assessment

Identify:
- Increased liability exposure
- Reduced protections
- New unfavorable terms

### 4. Audit Trail

Document:
- What changed and when
- Impact of each modification
- Version history

---

## Limitations (Current Version)

1. **Two-way comparison only**: Cannot compare 3+ versions simultaneously
2. **No visual redlines**: Text-based diff, not PDF markup
3. **English only**: AI analysis works best with English contracts
4. **10k character limit**: Only first 10k characters analyzed by AI (full text diff still runs)

---

## Future Enhancements

### Phase 2 (Planned)
- [ ] Visual PDF redlines (strike-through + underline)
- [ ] Multi-version comparison (track changes across 3+ versions)
- [ ] Change approval workflow
- [ ] Export to DOCX with track changes
- [ ] Email notifications when comparison completes

### Phase 3 (Potential)
- [ ] Custom clause library integration
- [ ] Playbook compliance checking
- [ ] Suggested language improvements
- [ ] Version control system (Git-like for contracts)

---

## Testing

### Manual Test

1. Upload two versions of a contract
2. Wait for both to complete analysis
3. Create comparison:
   ```bash
   curl -X POST http://localhost:8000/api/v1/comparisons/ \
     -H "Authorization: Bearer dfk_your_key" \
     -H "Content-Type: application/json" \
     -d '{
       "original_contract_id": "ctr_abc",
       "revised_contract_id": "ctr_xyz"
     }'
   ```
4. Poll for results:
   ```bash
   curl http://localhost:8000/api/v1/comparisons/cmp_xxx \
     -H "Authorization: Bearer dfk_your_key"
   ```

### Automated Tests

```python
# tests/test_comparison.py
def test_create_comparison(client, api_key, contracts):
    response = client.post(
        "/api/v1/comparisons/",
        json={
            "original_contract_id": contracts[0].contract_id,
            "revised_contract_id": contracts[1].contract_id
        },
        headers={"Authorization": f"Bearer {api_key}"}
    )
    assert response.status_code == 202
    assert "comparison_id" in response.json()
```

---

## Deployment

The comparison feature is automatically deployed when you:

1. **Restart backend**: Tables auto-created on startup
2. **Restart Celery worker**: New task registered
3. **Deploy frontend**: New `/compare` route available

No additional configuration required beyond existing env vars.

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/daflegal/issues
- Email: support@daflegal.com
- Docs: See `README.md` and `ARCHITECTURE.md`

---

**Feature Status**: ✅ Production Ready (Phase 1 Complete)

**Last Updated**: 2025-10-18
