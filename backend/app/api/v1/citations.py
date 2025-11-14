"""
Citation Checker API Endpoints

Validate legal citations in documents.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.citation_checker import (
    CitationCheckCreate,
    CitationCheckResponse,
    CitationCheckDetailResponse,
    CitationIssueResponse,
    CitationFormatResponse
)
from app.services.citation_checker_service import CitationCheckerService
from app.core.config import settings

router = APIRouter(prefix="/citations", tags=["citations"])


def get_citation_service(db: Session = Depends(get_session)) -> CitationCheckerService:
    """Dependency to get citation checker service"""
    return CitationCheckerService(db=db, openai_api_key=settings.OPENAI_API_KEY)


@router.post("/check", response_model=CitationCheckResponse)
async def check_citations(
    check_data: CitationCheckCreate,
    current_user: User = Depends(get_current_user),
    service: CitationCheckerService = Depends(get_citation_service)
):
    """
    Check all citations in a document

    Validates citations against the specified format (e.g., Bluebook, ALWD)
    and identifies format errors, missing elements, and broken citations.
    """
    try:
        check = service.check_citations(
            user_id=current_user.id,
            document_text=check_data.document_text,
            document_name=check_data.document_name,
            citation_format=check_data.citation_format,
            contract_id=check_data.contract_id
        )

        return CitationCheckResponse(
            check_id=check.check_id,
            document_name=check.document_name,
            citation_format=check.citation_format,
            status=check.status,
            total_citations_found=check.total_citations_found,
            valid_citations=check.valid_citations,
            invalid_citations=check.invalid_citations,
            warnings=check.warnings,
            overall_score=check.overall_score,
            processing_time_seconds=check.processing_time_seconds,
            created_at=check.created_at
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation check failed: {str(e)}")


@router.get("/{check_id}", response_model=CitationCheckDetailResponse)
async def get_citation_check(
    check_id: str,
    current_user: User = Depends(get_current_user),
    service: CitationCheckerService = Depends(get_citation_service)
):
    """Get detailed citation check results with all issues"""
    try:
        check, issues = service.get_check(check_id)

        issue_responses = [
            CitationIssueResponse(
                issue_id=i.issue_id,
                citation_text=i.citation_text,
                citation_type=i.citation_type,
                location_start=i.location_start,
                location_end=i.location_end,
                severity=i.severity,
                issue_type=i.issue_type,
                issue_description=i.issue_description,
                expected_format=i.expected_format,
                actual_format=i.actual_format,
                suggested_fix=i.suggested_fix,
                is_verified=i.is_verified,
                verification_status=i.verification_status,
                surrounding_text=i.surrounding_text
            )
            for i in issues
        ]

        return CitationCheckDetailResponse(
            check_id=check.check_id,
            document_name=check.document_name,
            citation_format=check.citation_format,
            status=check.status,
            total_citations_found=check.total_citations_found,
            valid_citations=check.valid_citations,
            invalid_citations=check.invalid_citations,
            warnings=check.warnings,
            overall_score=check.overall_score,
            processing_time_seconds=check.processing_time_seconds,
            created_at=check.created_at,
            issues=issue_responses
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/checks/history", response_model=list[CitationCheckResponse])
async def get_check_history(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: CitationCheckerService = Depends(get_citation_service)
):
    """Get user's citation check history"""
    checks = service.get_user_checks(user_id=current_user.id, limit=limit)

    return [
        CitationCheckResponse(
            check_id=c.check_id,
            document_name=c.document_name,
            citation_format=c.citation_format,
            status=c.status,
            total_citations_found=c.total_citations_found,
            valid_citations=c.valid_citations,
            invalid_citations=c.invalid_citations,
            warnings=c.warnings,
            overall_score=c.overall_score,
            processing_time_seconds=c.processing_time_seconds,
            created_at=c.created_at
        )
        for c in checks
    ]


@router.get("/formats/list", response_model=list[CitationFormatResponse])
async def get_citation_formats(
    current_user: User = Depends(get_current_user),
    service: CitationCheckerService = Depends(get_citation_service)
):
    """Get available citation formats"""
    formats = service.get_formats()

    return [
        CitationFormatResponse(
            format_id=f.format_id,
            name=f.name,
            citation_type=f.citation_type,
            example=f.example,
            description=f.description
        )
        for f in formats
    ]
