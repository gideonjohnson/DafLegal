import secrets
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlmodel import Session, select
from typing import List
from datetime import datetime

from app.core.database import get_session
from app.api.dependencies import get_current_user, check_quota
from app.models.user import User
from app.models.contract import Contract, ContractStatus, ContractAnalysis
from app.schemas.contract import (
    ContractUploadResponse,
    ContractStatusResponse,
    ContractAnalysisResponse,
    KeyTerms,
    DetectedClause
)
from app.services.storage import S3Storage
from app.services.virus_scanner import get_virus_scanner
from app.workers.tasks import process_contract_task
from app.middleware.rate_limit import limiter

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/analyze", response_model=ContractUploadResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("10/minute")  # Limit file uploads to prevent abuse
async def upload_contract(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Upload a contract for analysis
    Rate limit: 10 uploads per minute
    """
    # Check quota
    check_quota(current_user)

    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported"
        )

    # Validate file size (25MB limit)
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)

    from app.core.config import settings
    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Scan for viruses
    scanner = get_virus_scanner()
    is_clean, virus_name = scanner.scan_bytes(file_content, file.filename)

    if not is_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File rejected: Virus detected - {virus_name}"
        )

    # Determine file type
    file_type = "pdf" if file.content_type == "application/pdf" else "docx"

    # Generate contract ID
    contract_id = f"ctr_{secrets.token_urlsafe(16)}"

    # Upload to S3
    s3_key = f"contracts/{current_user.id}/{contract_id}.{file_type}"
    storage = S3Storage()

    try:
        storage.upload_file(file_content, s3_key, file.content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

    # Create contract record
    contract = Contract(
        contract_id=contract_id,
        user_id=current_user.id,
        filename=file.filename,
        file_size_bytes=len(file_content),
        file_type=file_type,
        s3_key=s3_key,
        status=ContractStatus.UPLOADED
    )

    session.add(contract)
    session.commit()
    session.refresh(contract)

    # Queue background processing
    process_contract_task.delay(contract.id)

    return ContractUploadResponse(
        contract_id=contract.contract_id,
        filename=contract.filename,
        status=contract.status,
        eta_seconds=15
    )


@router.get("/{contract_id}", response_model=ContractAnalysisResponse)
async def get_contract_analysis(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get contract analysis results
    """
    # Find contract
    statement = select(Contract).where(
        Contract.contract_id == contract_id,
        Contract.user_id == current_user.id
    )
    contract = session.exec(statement).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )

    # If not completed, return status
    if contract.status != ContractStatus.COMPLETED:
        if contract.status == ContractStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Processing failed: {contract.error_message}"
            )

        # Still processing
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail=f"Contract is still {contract.status.value}. Please poll again."
        )

    # Get analysis
    analysis = session.exec(
        select(ContractAnalysis).where(ContractAnalysis.contract_id == contract.id)
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )

    # Build response
    return ContractAnalysisResponse(
        contract_id=contract.contract_id,
        status=contract.status,
        executive_summary=analysis.executive_summary,
        key_terms=KeyTerms(
            parties=analysis.parties,
            effective_date=analysis.effective_date,
            term=analysis.term_duration,
            payment=analysis.payment_terms
        ),
        detected_clauses=[DetectedClause(**clause) for clause in analysis.detected_clauses],
        missing_clauses=analysis.missing_clauses,
        risk_score=analysis.risk_score,
        overall_risk_level=analysis.overall_risk_level,
        pages_processed=contract.page_count or 0,
        processing_time_seconds=analysis.processing_time_seconds,
        created_at=contract.created_at
    )


@router.get("/", response_model=List[ContractStatusResponse])
async def list_contracts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = 20,
    offset: int = 0
):
    """
    List user's contracts
    """
    statement = select(Contract).where(
        Contract.user_id == current_user.id
    ).order_by(Contract.created_at.desc()).offset(offset).limit(limit)

    contracts = session.exec(statement).all()

    return [
        ContractStatusResponse(
            contract_id=c.contract_id,
            status=c.status,
            error_message=c.error_message,
            created_at=c.created_at,
            processed_at=c.processed_at
        )
        for c in contracts
    ]


@router.get("/{contract_id}/clause-suggestions")
async def get_clause_suggestions(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get clause suggestions for a contract based on its analysis
    """
    from app.services.clause_suggester import ClauseSuggester

    # Find contract
    statement = select(Contract).where(
        Contract.contract_id == contract_id,
        Contract.user_id == current_user.id
    )
    contract = session.exec(statement).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )

    # Get existing suggestions if any
    suggestions = ClauseSuggester.get_suggestions_for_contract(
        session, contract.id, current_user.id
    )

    # If no suggestions exist and contract is completed, generate them
    if not suggestions and contract.status == ContractStatus.COMPLETED:
        analysis = session.exec(
            select(ContractAnalysis).where(
                ContractAnalysis.contract_id == contract.id
            )
        ).first()

        if analysis:
            suggestions = ClauseSuggester.suggest_clauses_for_contract(
                session, contract.id, current_user.id, analysis
            )

    return {"suggestions": suggestions}
