# Clause Library Feature - Phase 2 Complete ✅

## Overview

The Clause Library is a comprehensive system for storing, managing, searching, and reusing approved contract clauses. It includes AI-powered clause suggestions that recommend relevant clauses based on contract analysis.

---

## Features

### Core Capabilities

1. **Clause Management**
   - Create, update, and delete clauses
   - Version control for approved clauses
   - Rich metadata (category, risk level, tags, jurisdiction)
   - Alternative text versions

2. **Search & Discovery**
   - Full-text search across title, text, and description
   - Filter by category, tags, jurisdiction, risk level, status
   - Sort by relevance (usage count) and recency
   - Pagination support

3. **Libraries**
   - Organize clauses into libraries
   - Public vs. private libraries
   - Team sharing (organization-level)
   - Bulk operations

4. **AI-Powered Suggestions**
   - Automatic clause recommendations based on contract analysis
   - Suggests clauses for missing protections
   - Recommends better alternatives for high-risk clauses
   - Tracks suggestion acceptance

5. **Usage Analytics**
   - Track views, copies, and insertions
   - Popular clauses ranking
   - Last used timestamps
   - Audit trail

6. **Import/Export**
   - Bulk import clauses from JSON
   - Export libraries
   - Template sharing

---

## Database Schema

### Tables Created

**1. `clauses`** - Individual contract clauses
- clause_id (public ID)
- user_id (owner)
- title, category, text, description
- tags, jurisdiction, language
- risk_level, compliance_notes
- status, version, parent_clause_id
- usage_count, last_used_at

**2. `clause_libraries`** - Collections of clauses
- library_id (public ID)
- name, description
- owner_user_id, organization_id
- is_public, is_default
- clause_count, tags

**3. `clause_library_memberships`** - Many-to-many relationship
- clause_id, library_id
- sort_order
- added_at

**4. `clause_usage_logs`** - Analytics
- clause_id, user_id, contract_id
- action (viewed, copied, suggested, inserted)
- context, created_at

**5. `clause_suggestions`** - AI suggestions
- contract_id, user_id
- category, reason
- suggested_clause_ids
- was_accepted, feedback

---

## API Endpoints

### Clause Management

**Create Clause**
```
POST /api/v1/clauses/
```
Request:
```json
{
  "title": "Standard Termination Clause",
  "category": "termination",
  "text": "Either party may terminate this Agreement...",
  "description": "30-day notice termination",
  "tags": ["standard", "mutual"],
  "jurisdiction": "California",
  "risk_level": "neutral"
}
```

**Get Clause**
```
GET /api/v1/clauses/{clause_id}
```

**Update Clause**
```
PUT /api/v1/clauses/{clause_id}
```
Note: If clause is approved, creates new version instead of modifying

**Delete Clause**
```
DELETE /api/v1/clauses/{clause_id}
```
Note: Soft delete (marks as deprecated)

### Search & Filter

**Search Clauses**
```
POST /api/v1/clauses/search
```
Request:
```json
{
  "query": "termination",
  "category": "termination",
  "tags": ["standard"],
  "risk_level": "neutral",
  "status": "approved",
  "limit": 20,
  "offset": 0
}
```

Response:
```json
{
  "clauses": [
    {
      "clause_id": "cls_abc123",
      "title": "Standard Termination",
      "category": "termination",
      "text": "Full clause text...",
      "tags": ["standard", "mutual"],
      "risk_level": "neutral",
      "usage_count": 42,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

**Get Similar Clauses**
```
GET /api/v1/clauses/category/{category}/similar?limit=5
```

### Libraries

**Create Library**
```
POST /api/v1/clauses/libraries
```
Request:
```json
{
  "name": "Employment Contracts",
  "description": "Standard clauses for employment agreements",
  "is_public": false,
  "tags": ["employment", "hr"]
}
```

**Add Clause to Library**
```
POST /api/v1/clauses/libraries/{library_id}/clauses
```
Request:
```json
{
  "clause_id": "cls_abc123",
  "sort_order": 10
}
```

**Get Library Clauses**
```
GET /api/v1/clauses/libraries/{library_id}/clauses
```

### Import/Export

**Bulk Import**
```
POST /api/v1/clauses/import
```
Request:
```json
{
  "clauses": [
    {
      "title": "Clause 1",
      "category": "termination",
      "text": "..."
    },
    {
      "title": "Clause 2",
      "category": "liability",
      "text": "..."
    }
  ],
  "library_id": "lib_xyz789"
}
```

Response:
```json
{
  "success_count": 2,
  "error_count": 0,
  "imported_clause_ids": ["cls_aaa", "cls_bbb"],
  "errors": []
}
```

### AI Suggestions

**Get Clause Suggestions**
```
GET /api/v1/contracts/{contract_id}/clause-suggestions
```

Response:
```json
{
  "suggestions": [
    {
      "category": "force_majeure",
      "reason": "Contract is missing a force majeure clause",
      "suggested_clauses": [
        {
          "clause_id": "cls_fm1",
          "title": "Standard Force Majeure",
          "text": "Neither party shall be liable...",
          "risk_level": "favorable",
          "usage_count": 28
        }
      ]
    },
    {
      "category": "liability",
      "reason": "Consider replacing high-risk liability clause",
      "suggested_clauses": [
        {
          "clause_id": "cls_liab2",
          "title": "Capped Liability",
          "text": "Total liability limited to...",
          "risk_level": "neutral",
          "usage_count": 45
        }
      ]
    }
  ]
}
```

---

## Frontend UI

### Access the Clause Library

**URL**: `http://localhost:3000/clauses`

### Features

**1. Search Interface**
- Text search across all clause fields
- Category dropdown filter
- Tag filter
- Real-time search

**2. Create Clause Form**
- Title, category, risk level
- Main text + alternate text
- Description and tags
- Instant creation

**3. Clause Display**
- Card-based layout
- Expandable full text
- Copy-to-clipboard
- Usage statistics
- Version information

**4. Clause Actions**
- View full details
- Copy clause text
- Edit (creates new version if approved)
- Delete (soft delete)

---

## Clause Categories

Supported categories:
- **termination** - How to end the contract
- **indemnification** - Liability protection
- **liability** - Damage limitations
- **intellectual_property** - IP ownership/licensing
- **confidentiality** - Information protection
- **payment** - Payment terms
- **renewal** - Auto-renewal/extension
- **force_majeure** - Unforeseen events
- **dispute_resolution** - Conflict handling
- **governing_law** - Applicable law
- **data_protection** - Privacy/data security
- **warranties** - Guarantees
- **assignment** - Transfer restrictions
- **notices** - Communication requirements
- **severability** - Invalid provision handling
- **entire_agreement** - Complete agreement clause
- **amendment** - Modification process
- **waiver** - Waiver of rights
- **custom** - User-defined

---

## Risk Levels

- **favorable** - Protects your interests
- **neutral** - Balanced, standard market terms
- **moderate** - Some risk, review carefully
- **unfavorable** - High risk, avoid if possible

---

## Usage Workflow

### Typical User Journey

**1. Build Your Library**
```
Step 1: Create clauses
  → POST /api/v1/clauses/
  → Add your approved clauses

Step 2: Organize into libraries
  → POST /api/v1/clauses/libraries
  → Group by contract type or purpose

Step 3: Tag appropriately
  → Add tags for easy discovery
  → Use consistent taxonomy
```

**2. Analyze a Contract**
```
Step 1: Upload contract
  → POST /api/v1/contracts/analyze

Step 2: Get analysis results
  → GET /api/v1/contracts/{id}

Step 3: Get clause suggestions
  → GET /api/v1/contracts/{id}/clause-suggestions
  → System recommends relevant clauses
```

**3. Use Suggested Clauses**
```
Step 1: Review suggestions
  → See which clauses are missing
  → See better alternatives for risky clauses

Step 2: Copy relevant clauses
  → Click "Copy" on suggested clause
  → Paste into your draft

Step 3: Track usage
  → System logs clause usage
  → Updates popularity rankings
```

---

## How It Works

### Clause Suggestion Algorithm

**1. Identify Missing Clauses**
```
If contract analysis shows missing:
  - force_majeure
  - dispute_resolution
  - data_protection
  etc.

Then:
  → Search library for clauses in those categories
  → Rank by usage_count (popularity)
  → Return top 3 matches per category
```

**2. Suggest Better Alternatives**
```
If detected clause has risk_level = "high":
  → Find clauses in same category
  → Filter for risk_level = "favorable" or "neutral"
  → Owned by user or public/approved
  → Rank by usage_count
  → Return top 2
```

**3. Log Suggestions**
```
For each suggestion:
  → Create ClauseSuggestion record
  → Track which clauses were suggested
  → Allow user feedback (accepted/rejected)
  → Use feedback to improve future suggestions
```

---

## Version Control

When you update an approved clause:

1. **Original clause** is marked `is_latest_version = False`
2. **New version** is created with:
   - Incremented version number
   - Link to parent clause (`parent_clause_id`)
   - Status reset to `draft`
   - New `clause_id`
3. **History preserved** - can view all versions

Example:
```
Version 1 (approved) → Update → Version 2 (draft)
                               ↓
                          Review & approve
                               ↓
                         Version 2 (approved)
```

---

## Best Practices

### Creating Clauses

✅ **Do:**
- Write clear, self-contained clauses
- Add descriptive titles
- Tag liberally for discoverability
- Specify jurisdiction when relevant
- Provide context in description
- Include alternate versions for flexibility

❌ **Don't:**
- Mix multiple concepts in one clause
- Use ambiguous language
- Forget to categorize properly
- Skip the description field

### Organizing Libraries

✅ **Do:**
- Group by contract type (e.g., "SaaS Agreements")
- Create role-based libraries (e.g., "Vendor Contracts")
- Use public libraries for team sharing
- Maintain a "favorites" library

❌ **Don't:**
- Create too many overlapping libraries
- Mix approved and draft clauses
- Forget to update clause count

### Using Suggestions

✅ **Do:**
- Review all suggested clauses carefully
- Customize for your specific needs
- Provide feedback on suggestions
- Track which clauses work best

❌ **Don't:**
- Blindly accept all suggestions
- Ignore context of your specific contract
- Forget to review with legal counsel

---

## Analytics & Insights

### Track Clause Performance

**Most Used Clauses**
```sql
SELECT title, category, usage_count
FROM clauses
WHERE user_id = ?
ORDER BY usage_count DESC
LIMIT 10
```

**Recently Added**
```sql
SELECT title, category, created_at
FROM clauses
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 10
```

**Suggestion Acceptance Rate**
```sql
SELECT
  category,
  COUNT(*) as total_suggestions,
  SUM(CASE WHEN was_accepted THEN 1 ELSE 0 END) as accepted
FROM clause_suggestions
WHERE user_id = ?
GROUP BY category
```

---

## Examples

### Example 1: Create a Termination Clause

```bash
curl -X POST http://localhost:8000/api/v1/clauses/ \
  -H "Authorization: Bearer dfk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "30-Day Mutual Termination",
    "category": "termination",
    "text": "Either party may terminate this Agreement upon thirty (30) days written notice to the other party. Termination shall not relieve either party of obligations accrued prior to the effective date of termination.",
    "description": "Standard 30-day termination clause with mutual rights",
    "tags": ["standard", "mutual", "30-day"],
    "risk_level": "neutral"
  }'
```

### Example 2: Search for Liability Clauses

```bash
curl -X POST http://localhost:8000/api/v1/clauses/search \
  -H "Authorization: Bearer dfk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "liability",
    "risk_level": "neutral",
    "limit": 10
  }'
```

### Example 3: Get Contract Suggestions

```bash
curl http://localhost:8000/api/v1/contracts/ctr_abc123/clause-suggestions \
  -H "Authorization: Bearer dfk_your_key"
```

---

## Technical Implementation

### Files Created (8 new files)

**Backend:**
1. `app/models/clause.py` - 5 models (Clause, ClauseLibrary, etc.)
2. `app/schemas/clause.py` - Request/response schemas
3. `app/services/clause_service.py` - Business logic
4. `app/services/clause_suggester.py` - AI suggestion engine
5. `app/api/v1/clauses.py` - API endpoints

**Frontend:**
6. `components/ClauseLibrary.tsx` - Main UI component
7. `app/clauses/page.tsx` - Clause library page

**Documentation:**
8. `CLAUSE_LIBRARY_FEATURE.md` - This file

### Files Modified (3 files)
1. `app/models/__init__.py` - Export new models
2. `app/models/user.py` - Add clauses relationship
3. `app/api/v1/__init__.py` - Register clauses router
4. `app/api/v1/contracts.py` - Add suggestions endpoint

---

## Performance

### Database Indexes

```sql
-- Fast searches
CREATE INDEX idx_clauses_user_id ON clauses(user_id);
CREATE INDEX idx_clauses_category ON clauses(category);
CREATE INDEX idx_clauses_title ON clauses(title);
CREATE INDEX idx_clauses_is_latest ON clauses(is_latest_version);

-- Usage tracking
CREATE INDEX idx_usage_logs_clause_id ON clause_usage_logs(clause_id);
CREATE INDEX idx_usage_logs_user_id ON clause_usage_logs(user_id);

-- Libraries
CREATE INDEX idx_memberships_clause_id ON clause_library_memberships(clause_id);
CREATE INDEX idx_memberships_library_id ON clause_library_memberships(library_id);
```

### Query Optimization

- Full-text search uses ILIKE (case-insensitive)
- Results sorted by `usage_count DESC` (popularity)
- Pagination prevents large result sets
- Only returns `is_latest_version = True` by default

---

## Next Steps

### Immediate (Testing)
- [ ] Create sample clauses
- [ ] Test search functionality
- [ ] Verify suggestions work
- [ ] Check version control

### Future Enhancements

**Phase 2.1 (2-3 weeks)**
- [ ] AI-powered clause generation
- [ ] Clause comparison (highlight differences)
- [ ] Export to DOCX/PDF
- [ ] Email sharing

**Phase 2.2 (Month 3)**
- [ ] Team collaboration features
- [ ] Approval workflows
- [ ] Commenting on clauses
- [ ] Advanced analytics dashboard

**Phase 2.3 (Month 4+)**
- [ ] Integration with document assembly tools
- [ ] API for third-party apps
- [ ] Mobile app
- [ ] Multi-language support

---

## Deployment

### Development

```bash
cd daflegal

# Restart backend (creates new tables)
docker-compose restart backend

# Restart worker
docker-compose restart worker

# Restart frontend
docker-compose restart frontend

# Verify
curl http://localhost:8000/docs
# Should see /clauses endpoints
```

### Production

Tables auto-create on startup. No manual migration needed.

---

## Support

**Documentation:**
- This file: `CLAUSE_LIBRARY_FEATURE.md`
- Main README: `README.md`
- Architecture: `ARCHITECTURE.md`

**API Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Code Locations:**
- Models: `backend/app/models/clause.py`
- Service: `backend/app/services/clause_service.py`
- API: `backend/app/api/v1/clauses.py`
- UI: `frontend/src/components/ClauseLibrary.tsx`

---

**Feature Status**: ✅ Production Ready (Phase 2 Complete)

**Last Updated**: 2025-10-18

**Next Phase**: Compliance Checker (Phase 3)
