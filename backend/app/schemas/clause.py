from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.clause import ClauseCategory, ClauseRiskLevel, ClauseStatus


# Clause Schemas

class ClauseCreateRequest(BaseModel):
    """Request to create a new clause"""
    title: str
    category: ClauseCategory
    text: str
    description: Optional[str] = None
    alternate_text: Optional[str] = None
    tags: List[str] = []
    jurisdiction: Optional[str] = None
    language: str = "en"
    risk_level: ClauseRiskLevel = ClauseRiskLevel.NEUTRAL
    compliance_notes: Optional[str] = None


class ClauseUpdateRequest(BaseModel):
    """Request to update an existing clause"""
    title: Optional[str] = None
    category: Optional[ClauseCategory] = None
    text: Optional[str] = None
    description: Optional[str] = None
    alternate_text: Optional[str] = None
    tags: Optional[List[str]] = None
    jurisdiction: Optional[str] = None
    risk_level: Optional[ClauseRiskLevel] = None
    compliance_notes: Optional[str] = None
    status: Optional[ClauseStatus] = None


class ClauseResponse(BaseModel):
    """Clause response"""
    clause_id: str
    title: str
    category: ClauseCategory
    text: str
    description: Optional[str]
    alternate_text: Optional[str]
    tags: List[str]
    jurisdiction: Optional[str]
    language: str
    risk_level: ClauseRiskLevel
    compliance_notes: Optional[str]
    status: ClauseStatus
    version: int
    is_latest_version: bool
    usage_count: int
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class ClauseSearchRequest(BaseModel):
    """Search/filter clauses"""
    query: Optional[str] = None  # Full-text search
    category: Optional[ClauseCategory] = None
    tags: Optional[List[str]] = None
    jurisdiction: Optional[str] = None
    risk_level: Optional[ClauseRiskLevel] = None
    status: Optional[ClauseStatus] = None
    limit: int = Field(default=20, le=100)
    offset: int = 0


class ClauseListResponse(BaseModel):
    """List of clauses with pagination"""
    clauses: List[ClauseResponse]
    total: int
    limit: int
    offset: int


# Clause Library Schemas

class LibraryCreateRequest(BaseModel):
    """Create a new clause library"""
    name: str
    description: Optional[str] = None
    is_public: bool = False
    tags: List[str] = []


class LibraryResponse(BaseModel):
    """Clause library response"""
    library_id: str
    name: str
    description: Optional[str]
    is_public: bool
    is_default: bool
    clause_count: int
    tags: List[str]
    created_at: datetime
    updated_at: datetime


class LibraryAddClauseRequest(BaseModel):
    """Add clause to library"""
    clause_id: str
    sort_order: Optional[int] = None


# Clause Suggestion Schemas

class ClauseSuggestionResponse(BaseModel):
    """AI-suggested clause for a contract"""
    category: ClauseCategory
    reason: str
    suggested_clauses: List[ClauseResponse]
    created_at: datetime


class SuggestionFeedbackRequest(BaseModel):
    """User feedback on suggestion"""
    was_accepted: bool
    feedback: Optional[str] = None


# Import/Export Schemas

class ClauseImportRequest(BaseModel):
    """Bulk import clauses"""
    clauses: List[ClauseCreateRequest]
    library_id: Optional[str] = None  # Add to library after import


class ClauseImportResponse(BaseModel):
    """Import results"""
    success_count: int
    error_count: int
    imported_clause_ids: List[str]
    errors: List[str]


class ClauseExportFormat(str):
    """Export format options"""
    JSON = "json"
    CSV = "csv"
    DOCX = "docx"


# Analytics Schemas

class ClauseAnalytics(BaseModel):
    """Usage analytics for a clause"""
    clause_id: str
    title: str
    usage_count: int
    view_count: int
    copy_count: int
    insert_count: int
    last_used_at: Optional[datetime]


class LibraryAnalytics(BaseModel):
    """Analytics for entire library"""
    total_clauses: int
    by_category: dict  # {category: count}
    by_risk_level: dict  # {risk_level: count}
    by_status: dict  # {status: count}
    most_used_clauses: List[ClauseAnalytics]
    recent_additions: List[ClauseResponse]
