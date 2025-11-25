"""
Instant Document Analysis API
Upload a document and get obligations, risks, summary, and suggested revisions in seconds.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import time

from app.api.dependencies import get_current_user, get_session
from app.models.user import User
from app.services.document_processor import DocumentProcessor
from app.services.instant_analyzer import InstantDocumentAnalyzer

router = APIRouter(prefix="/instant-analysis", tags=["instant-analysis"])


class Obligation(BaseModel):
    party: str
    description: str
    deadline: Optional[str] = None
    type: str  # payment, delivery, performance, compliance, notification, etc.
    criticality: str  # low, medium, high, critical


class RiskFlag(BaseModel):
    severity: str  # low, medium, high, critical
    title: str
    description: str
    location: Optional[str] = None
    recommendation: str


class SuggestedRevision(BaseModel):
    section: str
    issue: str
    current_text: str
    suggested_text: str
    reason: str
    priority: str  # low, medium, high


class InstantAnalysisResponse(BaseModel):
    analysis_id: str
    filename: str
    document_type: str
    page_count: int
    word_count: int
    processing_time_seconds: float

    # Core analysis
    summary: str
    key_findings: List[str]

    # Detailed extraction
    obligations: List[Obligation]
    risk_flags: List[RiskFlag]
    suggested_revisions: List[SuggestedRevision]

    # Scores
    overall_risk_score: float  # 0-10
    compliance_score: float  # 0-100
    clarity_score: float  # 0-100

    created_at: datetime


@router.post("/analyze", response_model=InstantAnalysisResponse)
async def analyze_document_instant(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a document and get instant AI analysis with:
    - Plain-English summary
    - Obligations extraction (who owes what to whom, when)
    - Risk flags with severity and recommendations
    - Suggested revisions to improve the document

    Supports: PDF, DOCX, DOC, TXT
    Max size: 25MB
    Target response: <30 seconds
    """
    start_time = time.time()

    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, DOCX, DOC, TXT"
        )

    # Read file content
    content = await file.read()

    # Check file size (25MB max)
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 25MB."
        )

    # Determine file type
    file_type = "pdf" if "pdf" in file.content_type else "docx" if "document" in file.content_type else "txt"

    try:
        # Extract text from document
        extracted_text, page_count, word_count = DocumentProcessor.process_file(content, file_type)

        if not extracted_text or len(extracted_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the document. Please ensure it contains readable text."
            )

        # Perform instant AI analysis
        analyzer = InstantDocumentAnalyzer()
        analysis_result = analyzer.analyze(extracted_text, file.filename)

        processing_time = time.time() - start_time

        # Build response
        return InstantAnalysisResponse(
            analysis_id=f"ana_{int(time.time() * 1000)}_{current_user.id}",
            filename=file.filename,
            document_type=analysis_result.get("document_type", "Unknown"),
            page_count=page_count,
            word_count=word_count,
            processing_time_seconds=round(processing_time, 2),

            summary=analysis_result.get("summary", ""),
            key_findings=analysis_result.get("key_findings", []),

            obligations=[Obligation(**o) for o in analysis_result.get("obligations", [])],
            risk_flags=[RiskFlag(**r) for r in analysis_result.get("risk_flags", [])],
            suggested_revisions=[SuggestedRevision(**s) for s in analysis_result.get("suggested_revisions", [])],

            overall_risk_score=analysis_result.get("overall_risk_score", 5.0),
            compliance_score=analysis_result.get("compliance_score", 70.0),
            clarity_score=analysis_result.get("clarity_score", 70.0),

            created_at=datetime.utcnow()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
