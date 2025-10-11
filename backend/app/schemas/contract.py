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
