import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.contract import Contract, ContractStatus, ContractComparison, ContractAnalysis
from app.schemas.contract import (
    ComparisonCreateRequest,
    ComparisonUploadResponse,
    ContractComparisonResponse,
    TextChange,
    ClauseChange
)
from app.workers.tasks import process_comparison_task

router = APIRouter(prefix="/comparisons", tags=["comparisons"])


@router.post("/", response_model=ComparisonUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_comparison(
    request: ComparisonCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Compare two contract versions
    """
    # Get both contracts
    original_contract = session.exec(
        select(Contract).where(
            Contract.contract_id == request.original_contract_id,
            Contract.user_id == current_user.id
        )
    ).first()

    revised_contract = session.exec(
        select(Contract).where(
            Contract.contract_id == request.revised_contract_id,
            Contract.user_id == current_user.id
        )
    ).first()

    if not original_contract or not revised_contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both contracts not found"
        )

    # Ensure both contracts are completed
    if original_contract.status != ContractStatus.COMPLETED or \
       revised_contract.status != ContractStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both contracts must be fully analyzed before comparison"
        )

    # Generate comparison ID
    comparison_id = f"cmp_{secrets.token_urlsafe(16)}"

    # Create comparison record
    comparison = ContractComparison(
        comparison_id=comparison_id,
        user_id=current_user.id,
        original_contract_id=original_contract.id,
        revised_contract_id=revised_contract.id,
        status=ContractStatus.UPLOADED
    )

    session.add(comparison)
    session.commit()
    session.refresh(comparison)

    # Queue background processing
    process_comparison_task.delay(comparison.id)

    return ComparisonUploadResponse(
        comparison_id=comparison.comparison_id,
        status=comparison.status,
        eta_seconds=20
    )


@router.get("/{comparison_id}", response_model=ContractComparisonResponse)
async def get_comparison(
    comparison_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get comparison results
    """
    comparison = session.exec(
        select(ContractComparison).where(
            ContractComparison.comparison_id == comparison_id,
            ContractComparison.user_id == current_user.id
        )
    ).first()

    if not comparison:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparison not found"
        )

    # Get contract references
    original_contract = session.get(Contract, comparison.original_contract_id)
    revised_contract = session.get(Contract, comparison.revised_contract_id)

    if comparison.status == ContractStatus.PROCESSING:
        return ContractComparisonResponse(
            comparison_id=comparison.comparison_id,
            status=comparison.status,
            original_contract_id=original_contract.contract_id,
            revised_contract_id=revised_contract.contract_id,
            summary=None,
            additions=[],
            deletions=[],
            modifications=[],
            clause_changes=[],
            risk_delta=None,
            substantive_changes=[],
            cosmetic_changes=[],
            processing_time_seconds=None,
            created_at=comparison.created_at,
            processed_at=None
        )

    if comparison.status == ContractStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=comparison.error_message or "Comparison failed"
        )

    # Return completed comparison
    return ContractComparisonResponse(
        comparison_id=comparison.comparison_id,
        status=comparison.status,
        original_contract_id=original_contract.contract_id,
        revised_contract_id=revised_contract.contract_id,
        summary=comparison.summary,
        additions=[TextChange(**change) for change in comparison.additions],
        deletions=[TextChange(**change) for change in comparison.deletions],
        modifications=[TextChange(**change) for change in comparison.modifications],
        clause_changes=[ClauseChange(**change) for change in comparison.clause_changes],
        risk_delta=comparison.risk_delta,
        substantive_changes=[TextChange(**change) for change in comparison.substantive_changes],
        cosmetic_changes=[TextChange(**change) for change in comparison.cosmetic_changes],
        processing_time_seconds=comparison.processing_time_seconds,
        created_at=comparison.created_at,
        processed_at=comparison.processed_at
    )


@router.get("/", response_model=List[ContractComparisonResponse])
async def list_comparisons(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = 20,
    offset: int = 0
):
    """
    List user's comparisons
    """
    comparisons = session.exec(
        select(ContractComparison)
        .where(ContractComparison.user_id == current_user.id)
        .order_by(ContractComparison.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    results = []
    for comparison in comparisons:
        original_contract = session.get(Contract, comparison.original_contract_id)
        revised_contract = session.get(Contract, comparison.revised_contract_id)

        results.append(
            ContractComparisonResponse(
                comparison_id=comparison.comparison_id,
                status=comparison.status,
                original_contract_id=original_contract.contract_id,
                revised_contract_id=revised_contract.contract_id,
                summary=comparison.summary,
                additions=[TextChange(**change) for change in comparison.additions] if comparison.additions else [],
                deletions=[TextChange(**change) for change in comparison.deletions] if comparison.deletions else [],
                modifications=[TextChange(**change) for change in comparison.modifications] if comparison.modifications else [],
                clause_changes=[ClauseChange(**change) for change in comparison.clause_changes] if comparison.clause_changes else [],
                risk_delta=comparison.risk_delta,
                substantive_changes=[TextChange(**change) for change in comparison.substantive_changes] if comparison.substantive_changes else [],
                cosmetic_changes=[TextChange(**change) for change in comparison.cosmetic_changes] if comparison.cosmetic_changes else [],
                processing_time_seconds=comparison.processing_time_seconds,
                created_at=comparison.created_at,
                processed_at=comparison.processed_at
            )
        )

    return results
