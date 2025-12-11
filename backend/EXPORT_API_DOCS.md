# Export API Documentation

## Overview

DafLegal now supports exporting various data types in multiple formats:
- **PDF**: Contract analysis reports, compliance check reports
- **DOCX**: Clause libraries
- **CSV**: Contract lists, analytics data

## API Endpoints

All endpoints require authentication via Bearer token.

### 1. Export Contract Analysis as PDF

**GET** `/api/v1/exports/contracts/{contract_id}/pdf`

**Description**: Generate and download a formatted PDF report of contract analysis results.

**Parameters**:
- `contract_id` (path, required): UUID of the contract

**Response**:
- Content-Type: `application/pdf`
- File download: `contract_analysis_{contract_id}.pdf`

**PDF Contents**:
- Contract metadata (name, date, risk level, risk score)
- Executive summary
- Key terms
- Detected clauses (first 10)
- Identified risks
- DafLegal branding

**Example**:
```bash
curl -X GET \
  "https://api.daflegal.com/api/v1/exports/contracts/123e4567-e89b-12d3-a456-426614174000/pdf" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output contract_analysis.pdf
```

---

### 2. Export Compliance Check as PDF

**GET** `/api/v1/exports/compliance/{check_id}/pdf`

**Description**: Generate and download a formatted PDF report of compliance check results.

**Parameters**:
- `check_id` (path, required): UUID of the compliance check

**Response**:
- Content-Type: `application/pdf`
- File download: `compliance_check_{check_id}.pdf`

**PDF Contents**:
- Playbook name
- Check date
- Compliance score
- Status
- Detailed issues with severity levels

**Example**:
```bash
curl -X GET \
  "https://api.daflegal.com/api/v1/exports/compliance/123e4567-e89b-12d3-a456-426614174000/pdf" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output compliance_report.pdf
```

---

### 3. Export Clauses as DOCX

**GET** `/api/v1/exports/clauses/docx`

**Description**: Export all user's clauses as a Word document.

**Response**:
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- File download: `clauses_export_{user_id}.docx`

**DOCX Contents**:
- Title: "Clause Library Export"
- Export metadata
- All clauses with:
  - Name
  - Type
  - Category
  - Content
  - Tags

**Example**:
```bash
curl -X GET \
  "https://api.daflegal.com/api/v1/exports/clauses/docx" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output my_clauses.docx
```

---

### 4. Export Contracts List as CSV

**GET** `/api/v1/exports/contracts/csv`

**Description**: Export all user's contracts as a CSV file for analysis in Excel/Sheets.

**Response**:
- Content-Type: `text/csv`
- File download: `contracts_{user_id}.csv`

**CSV Columns**:
- ID
- Name
- Upload Date
- Risk Level
- Risk Score
- Status

**Example**:
```bash
curl -X GET \
  "https://api.daflegal.com/api/v1/exports/contracts/csv" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  --output contracts.csv
```

---

### 5. Export Analytics Data as CSV (Admin Only)

**GET** `/api/v1/exports/analytics/csv`

**Description**: Export platform analytics data (admin access required).

**Response**:
- Content-Type: `text/csv`
- File download: `analytics_data.csv`

**CSV Columns**:
- user_id
- contract_id
- upload_date
- risk_score
- risk_level
- file_size

**Example**:
```bash
curl -X GET \
  "https://api.daflegal.com/api/v1/exports/analytics/csv" \
  -H "Authorization: Bearer ADMIN_API_KEY" \
  --output analytics.csv
```

---

## Error Responses

All endpoints return standard error responses:

**404 Not Found**:
```json
{
  "detail": "Contract not found"
}
```

**403 Forbidden**:
```json
{
  "detail": "Not authorized"
}
```

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

---

## Security

- All endpoints require valid Bearer token authentication
- Users can only export their own data
- Admin endpoints require admin privileges
- Exported files are generated on-the-fly (not stored)
- Downloads use secure HTTPS

---

## Rate Limits

Export endpoints are subject to standard API rate limits:
- Free tier: 10 exports/day
- Professional: 100 exports/day
- Enterprise: Unlimited

---

## Frontend Integration

Use the provided `ExportButton` component:

```typescript
import { ExportPDFButton } from '@/components/ExportButton'

<ExportPDFButton
  endpoint="/api/v1/exports/contracts/123/pdf"
  filename="contract_analysis.pdf"
  label="Export Report"
/>
```

Or use the dropdown for multiple formats:

```typescript
import { ExportDropdown } from '@/components/ExportButton'

<ExportDropdown
  buttonLabel="Download Report"
  exports={[
    {
      type: 'pdf',
      endpoint: '/api/v1/exports/contracts/123/pdf',
      filename: 'contract_analysis.pdf',
      label: 'PDF Report'
    },
    {
      type: 'csv',
      endpoint: '/api/v1/exports/contracts/csv',
      filename: 'all_contracts.csv',
      label: 'CSV Export'
    }
  ]}
/>
```

---

## Technical Implementation

### Backend

**Libraries**:
- `reportlab` - PDF generation
- `python-docx` - DOCX generation
- `csv` (stdlib) - CSV generation

**Service**: `app/services/export_service.py`
**Routes**: `app/api/v1/exports.py`

### Frontend

**Component**: `src/components/ExportButton.tsx`
**Features**:
- Toast notifications on success/error
- Loading states
- Multiple format support
- Dropdown menu for batch exports

---

## Future Enhancements

Planned improvements:
- Customizable PDF templates
- Excel (.xlsx) support with formatting
- Scheduled exports (email delivery)
- Bulk export (multiple contracts at once)
- Custom branding for enterprise users
- Export history/tracking

---

## Support

For issues or feature requests:
- Check service code: `backend/app/services/export_service.py`
- Check API routes: `backend/app/api/v1/exports.py`
- Check frontend component: `frontend/src/components/ExportButton.tsx`
