"""
Citation Checker Schemas

Pydantic schemas for citation validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Citation Check Schemas
class CitationCheckCreate(BaseModel):
    document_text: str
    document_name: str
    contract_id: Optional[str] = None
    citation_format: str = "bluebook"


class CitationIssueResponse(BaseModel):
    issue_id: str
    citation_text: str
    citation_type: str
    location_start: int
    location_end: int
    severity: str
    issue_type: str
    issue_description: str
    expected_format: Optional[str]
    actual_format: Optional[str]
    suggested_fix: Optional[str]
    is_verified: bool
    verification_status: Optional[str]
    surrounding_text: Optional[str]


class CitationCheckResponse(BaseModel):
    check_id: str
    document_name: str
    citation_format: str
    status: str
    total_citations_found: int
    valid_citations: int
    invalid_citations: int
    warnings: int
    overall_score: float
    processing_time_seconds: Optional[float]
    created_at: datetime


class CitationCheckDetailResponse(CitationCheckResponse):
    issues: list[CitationIssueResponse]


class CitationFormatResponse(BaseModel):
    format_id: str
    name: str
    citation_type: str
    example: str
    description: str
