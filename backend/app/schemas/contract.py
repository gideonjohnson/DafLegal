from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.contract import ContractStatus, RiskLevel


class DetectedClause(BaseModel):
    """Individual clause detection result"""
    type: str  # termination, indemnity, liability, etc.
    risk_level: RiskLevel
    text: str
    explanation: str
    page_reference: Optional[int] = None


class KeyTerms(BaseModel):
    """Key contract terms"""
    parties: List[str]
    effective_date: Optional[str] = None
    term: Optional[str] = None
    payment: Optional[str] = None


class ContractUploadResponse(BaseModel):
    """Response when contract is uploaded"""
    contract_id: str
    filename: str
    status: ContractStatus
    eta_seconds: int


class ContractStatusResponse(BaseModel):
    """Contract processing status"""
    contract_id: str
    status: ContractStatus
    error_message: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None


class ContractAnalysisResponse(BaseModel):
    """Full analysis response"""
    contract_id: str
    status: ContractStatus

    # Summary
    executive_summary: List[str]

    # Key terms
    key_terms: KeyTerms

    # Detected clauses
    detected_clauses: List[DetectedClause]

    # Missing standard clauses
    missing_clauses: List[str]

    # Risk assessment
    risk_score: float  # 0-10
    overall_risk_level: RiskLevel

    # Metadata
    pages_processed: int
    processing_time_seconds: Optional[float] = None
    created_at: datetime


class TextChange(BaseModel):
    """Individual text change in comparison"""
    type: str  # addition, deletion, modification
    original_text: Optional[str] = None
    revised_text: Optional[str] = None
    location: Optional[str] = None  # section/clause reference
    is_substantive: bool = False


class ClauseChange(BaseModel):
    """Clause-level change"""
    clause_type: str
    change_type: str  # added, removed, modified
    original_clause: Optional[dict] = None
    revised_clause: Optional[dict] = None
    impact_summary: str


class ComparisonCreateRequest(BaseModel):
    """Request to compare two contracts"""
    original_contract_id: str
    revised_contract_id: str


class ComparisonUploadResponse(BaseModel):
    """Response when comparison is initiated"""
    comparison_id: str
    status: ContractStatus
    eta_seconds: int


class ContractComparisonResponse(BaseModel):
    """Full comparison response"""
    comparison_id: str
    status: ContractStatus

    # Contract references
    original_contract_id: str
    revised_contract_id: str

    # High-level summary
    summary: Optional[str] = None

    # Changes
    additions: List[TextChange]
    deletions: List[TextChange]
    modifications: List[TextChange]

    # Clause-level changes
    clause_changes: List[ClauseChange]

    # Risk analysis
    risk_delta: Optional[float] = None
    substantive_changes: List[TextChange]
    cosmetic_changes: List[TextChange]

    # Metadata
    processing_time_seconds: Optional[float] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
