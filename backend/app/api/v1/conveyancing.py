"""
Conveyancing API Endpoints - Kenya

Property transaction management, workflow tracking, and document generation.
"""

import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.conveyancing import (
    ConveyancingTransaction, Property, TransactionParty,
    TransactionMilestone, OfficialSearch, ConveyancingDocument,
    StampDutyCalculation, ConveyancingChecklist
)
from app.schemas.conveyancing import (
    ConveyancingTransactionCreate, ConveyancingTransactionUpdate, ConveyancingTransactionResponse,
    PropertyCreate, PropertyResponse,
    TransactionPartyCreate, TransactionPartyResponse,
    TransactionMilestoneCreate, TransactionMilestoneUpdate, TransactionMilestoneResponse,
    OfficialSearchCreate, OfficialSearchUpdate, OfficialSearchResponse,
    ConveyancingDocumentCreate, ConveyancingDocumentResponse,
    StampDutyCalculationRequest, StampDutyCalculationResponse,
    ConveyancingChecklistCreate, ConveyancingChecklistUpdate, ConveyancingChecklistResponse,
    WorkflowStatusUpdate, WorkflowProgressResponse,
    ConveyancingStatistics
)
from app.services.conveyancing_service import (
    ConveyancingWorkflowService, StampDutyCalculator, DueDiligenceService
)

router = APIRouter(prefix="/conveyancing", tags=["conveyancing"])


# ===== Transaction Endpoints =====

@router.post("/transactions", response_model=ConveyancingTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: ConveyancingTransactionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create new conveyancing transaction
    """
    transaction_id = f"cvt_{secrets.token_urlsafe(16)}"

    # Calculate initial workflow info
    workflow_service = ConveyancingWorkflowService()
    estimated_days = workflow_service.calculate_estimated_duration(
        transaction.transaction_type,
        transaction.land_control_consent_required
    )

    # Get required searches
    due_diligence = DueDiligenceService()
    required_searches = due_diligence.get_required_searches(
        transaction.transaction_type,
        "unknown",  # Would need property details
        is_leasehold=False,
        has_structures=True
    )

    new_transaction = ConveyancingTransaction(
        transaction_id=transaction_id,
        user_id=current_user.id,
        transaction_type=transaction.transaction_type,
        transaction_title=transaction.transaction_title,
        reference_number=transaction.reference_number,
        property_id=transaction.property_id,
        client_role=transaction.client_role,
        other_party_name=transaction.other_party_name,
        other_party_email=transaction.other_party_email,
        other_party_lawyer=transaction.other_party_lawyer,
        purchase_price=transaction.purchase_price,
        deposit_amount=transaction.deposit_amount,
        target_completion_date=transaction.target_completion_date,
        land_control_consent_required=transaction.land_control_consent_required,
        client_instructions=transaction.client_instructions,
        status="instruction",
        current_stage="instruction",
        progress_percentage=0,
        instruction_date=datetime.utcnow(),
        searches_total=len(required_searches)
    )

    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)

    # Create initial milestones
    stages = workflow_service.get_workflow_stages(transaction.transaction_type)
    for index, stage in enumerate(stages):
        milestone_id = f"mls_{secrets.token_urlsafe(16)}"
        milestone = TransactionMilestone(
            milestone_id=milestone_id,
            transaction_id=new_transaction.id,
            name=stage["name"],
            description=stage["description"],
            stage=stage["stage"],
            sequence_order=index + 1,
            is_critical=True if index < 3 else False,
            status="in_progress" if index == 0 else "pending"
        )
        session.add(milestone)

    session.commit()
    session.refresh(new_transaction)

    return new_transaction


@router.get("/transactions", response_model=List[ConveyancingTransactionResponse])
async def list_transactions(
    status: Optional[str] = None,
    transaction_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List conveyancing transactions
    """
    query = select(ConveyancingTransaction).where(
        ConveyancingTransaction.user_id == current_user.id
    )

    if status:
        query = query.where(ConveyancingTransaction.status == status)
    if transaction_type:
        query = query.where(ConveyancingTransaction.transaction_type == transaction_type)

    query = query.offset(offset).limit(limit)
    query = query.order_by(ConveyancingTransaction.created_at.desc())

    transactions = session.exec(query).all()
    return transactions


@router.get("/transactions/{transaction_id}", response_model=ConveyancingTransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get transaction details
    """
    transaction = session.exec(
        select(ConveyancingTransaction).where(
            ConveyancingTransaction.transaction_id == transaction_id,
            ConveyancingTransaction.user_id == current_user.id
        )
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return transaction


@router.patch("/transactions/{transaction_id}", response_model=ConveyancingTransactionResponse)
async def update_transaction(
    transaction_id: str,
    updates: ConveyancingTransactionUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update transaction
    """
    transaction = session.exec(
        select(ConveyancingTransaction).where(
            ConveyancingTransaction.transaction_id == transaction_id,
            ConveyancingTransaction.user_id == current_user.id
        )
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(transaction, key, value)

    transaction.updated_at = datetime.utcnow()

    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return transaction


@router.post("/transactions/{transaction_id}/workflow", response_model=WorkflowProgressResponse)
async def update_workflow_status(
    transaction_id: str,
    workflow_update: WorkflowStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update transaction workflow status
    """
    transaction = session.exec(
        select(ConveyancingTransaction).where(
            ConveyancingTransaction.transaction_id == transaction_id,
            ConveyancingTransaction.user_id == current_user.id
        )
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Update status
    transaction.status = workflow_update.new_status
    transaction.current_stage = workflow_update.new_stage

    # Calculate progress
    workflow_service = ConveyancingWorkflowService()
    progress = workflow_service.calculate_progress_percentage(
        workflow_update.new_stage,
        transaction.transaction_type
    )
    transaction.progress_percentage = progress

    if workflow_update.notes:
        if transaction.internal_notes:
            transaction.internal_notes += f"\n\n{datetime.utcnow().isoformat()}: {workflow_update.notes}"
        else:
            transaction.internal_notes = workflow_update.notes

    transaction.updated_at = datetime.utcnow()

    if workflow_update.new_status == "completion":
        transaction.completed_at = datetime.utcnow()

    session.add(transaction)
    session.commit()

    # Get workflow progress
    stages = workflow_service.get_workflow_stages(transaction.transaction_type)
    milestones = session.exec(
        select(TransactionMilestone).where(TransactionMilestone.transaction_id == transaction.id)
    ).all()

    milestones_completed = len([m for m in milestones if m.status == "completed"])
    milestones_overdue = len([m for m in milestones if m.target_date and m.target_date < datetime.utcnow() and m.status != "completed"])

    return WorkflowProgressResponse(
        transaction_id=transaction_id,
        status=transaction.status,
        current_stage=transaction.current_stage,
        progress_percentage=transaction.progress_percentage,
        stages=[{"stage": s["stage"], "name": s["name"], "status": "completed" if s["stage"] in transaction.milestones_completed else "pending"} for s in stages],
        milestones_completed=milestones_completed,
        milestones_total=len(milestones),
        milestones_overdue=milestones_overdue,
        pending_tasks=transaction.pending_tasks,
        critical_issues=transaction.critical_issues,
        estimated_completion_date=transaction.target_completion_date,
        days_to_completion=(transaction.target_completion_date - datetime.utcnow()).days if transaction.target_completion_date else None
    )


# ===== Property Endpoints =====

@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create property record
    """
    property_id = f"prp_{secrets.token_urlsafe(16)}"

    new_property = Property(
        property_id=property_id,
        county=property_data.county,
        sub_county=property_data.sub_county,
        physical_address=property_data.physical_address,
        plot_number=property_data.plot_number,
        lr_number=property_data.lr_number,
        title_number=property_data.title_number,
        title_type=property_data.title_type,
        land_tenure=property_data.land_tenure,
        registration_date=property_data.registration_date,
        property_type=property_data.property_type,
        property_description=property_data.property_description,
        land_area=property_data.land_area,
        land_area_sqm=property_data.land_area_sqm,
        land_use=property_data.land_use,
        is_leasehold=property_data.is_leasehold,
        lease_term_years=property_data.lease_term_years,
        lease_expiry_date=property_data.lease_expiry_date,
        ground_rent_annual=property_data.ground_rent_annual,
        current_owner_name=property_data.current_owner_name,
        current_owner_id_number=property_data.current_owner_id_number,
        current_owner_kra_pin=property_data.current_owner_kra_pin,
        has_encumbrances=property_data.has_encumbrances,
        encumbrances=property_data.encumbrances,
        market_value=property_data.market_value
    )

    session.add(new_property)
    session.commit()
    session.refresh(new_property)

    return new_property


@router.get("/properties", response_model=List[PropertyResponse])
async def list_properties(
    county: Optional[str] = None,
    property_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session)
):
    """
    List properties
    """
    query = select(Property)

    if county:
        query = query.where(Property.county == county)
    if property_type:
        query = query.where(Property.property_type == property_type)

    query = query.offset(offset).limit(limit)
    properties = session.exec(query).all()

    return properties


@router.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    session: Session = Depends(get_session)
):
    """
    Get property details
    """
    property_obj = session.exec(
        select(Property).where(Property.property_id == property_id)
    ).first()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    return property_obj


# ===== Official Search Endpoints =====

@router.post("/transactions/{transaction_id}/searches", response_model=OfficialSearchResponse, status_code=status.HTTP_201_CREATED)
async def create_search(
    transaction_id: str,
    search_data: OfficialSearchCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create official search record for transaction
    """
    # Verify transaction exists
    transaction = session.exec(
        select(ConveyancingTransaction).where(
            ConveyancingTransaction.transaction_id == transaction_id,
            ConveyancingTransaction.user_id == current_user.id
        )
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    search_id = f"srch_{secrets.token_urlsafe(16)}"

    new_search = OfficialSearch(
        search_id=search_id,
        transaction_id=transaction.id,
        search_type=search_data.search_type,
        search_name=search_data.search_name,
        description=search_data.description,
        issuing_authority=search_data.issuing_authority,
        authority_location=search_data.authority_location,
        status="pending"
    )

    session.add(new_search)
    session.commit()
    session.refresh(new_search)

    return new_search


@router.patch("/searches/{search_id}", response_model=OfficialSearchResponse)
async def update_search(
    search_id: str,
    updates: OfficialSearchUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update search record
    """
    search = session.exec(
        select(OfficialSearch).where(OfficialSearch.search_id == search_id)
    ).first()

    if not search:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Search not found"
        )

    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(search, key, value)

    search.updated_at = datetime.utcnow()

    # Update transaction search counts
    transaction = session.exec(
        select(ConveyancingTransaction).where(ConveyancingTransaction.id == search.transaction_id)
    ).first()

    if transaction and updates.status == "received":
        transaction.searches_completed += 1
        if updates.has_issues and updates.severity in ["critical", "high"]:
            transaction.issues_identified += 1
            if updates.severity == "critical":
                transaction.critical_issues += 1

        session.add(transaction)

    session.add(search)
    session.commit()
    session.refresh(search)

    return search


# ===== Milestone Endpoints =====

@router.get("/transactions/{transaction_id}/milestones", response_model=List[TransactionMilestoneResponse])
async def list_milestones(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List transaction milestones
    """
    transaction = session.exec(
        select(ConveyancingTransaction).where(
            ConveyancingTransaction.transaction_id == transaction_id,
            ConveyancingTransaction.user_id == current_user.id
        )
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    milestones = session.exec(
        select(TransactionMilestone).where(TransactionMilestone.transaction_id == transaction.id)
        .order_by(TransactionMilestone.sequence_order)
    ).all()

    return milestones


@router.patch("/milestones/{milestone_id}", response_model=TransactionMilestoneResponse)
async def update_milestone(
    milestone_id: str,
    updates: TransactionMilestoneUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update milestone status
    """
    milestone = session.exec(
        select(TransactionMilestone).where(TransactionMilestone.milestone_id == milestone_id)
    ).first()

    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )

    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(milestone, key, value)

    milestone.updated_at = datetime.utcnow()

    session.add(milestone)
    session.commit()
    session.refresh(milestone)

    return milestone


# ===== Stamp Duty Calculator =====

@router.post("/calculate-stamp-duty", response_model=StampDutyCalculationResponse)
async def calculate_stamp_duty(
    calculation_request: StampDutyCalculationRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Calculate stamp duty and government fees for property transaction
    """
    calculator = StampDutyCalculator()

    # Calculate stamp duty
    stamp_duty_result = calculator.calculate_stamp_duty(
        property_value=calculation_request.property_value,
        property_type=calculation_request.property_type,
        is_first_time_buyer=calculation_request.is_first_time_buyer,
        is_affordable_housing=calculation_request.is_affordable_housing
    )

    # Calculate legal fees
    legal_fees_result = calculator.calculate_legal_fees(
        property_value=calculation_request.property_value
    )

    # Calculate CGT if required
    cgt_amount = Decimal("0.00")
    cgt_rate = None
    if calculation_request.requires_cgt:
        cgt_rate = calculator.CGT_RATE
        # Would need purchase price to calculate actual CGT
        # For now, setting to 0

    # Create calculation record (optional - for audit trail)
    # Not implementing full DB storage for now

    return StampDutyCalculationResponse(
        id=0,  # Placeholder
        calculation_id=f"sdc_{secrets.token_urlsafe(16)}",
        transaction_id=0,  # Would link to transaction
        property_value=calculation_request.property_value,
        property_type=calculation_request.property_type,
        property_location=calculation_request.property_location,
        is_first_time_buyer=calculation_request.is_first_time_buyer,
        is_affordable_housing=calculation_request.is_affordable_housing,
        stamp_duty_rate=stamp_duty_result["stamp_duty_rate"],
        stamp_duty_amount=stamp_duty_result["stamp_duty_amount"],
        registration_fee=stamp_duty_result["registration_fee"],
        search_fees=stamp_duty_result["search_fees"],
        consent_fees=Decimal("0.00"),
        requires_cgt=calculation_request.requires_cgt,
        cgt_rate=cgt_rate,
        cgt_amount=cgt_amount,
        total_government_charges=stamp_duty_result["total_government_charges"],
        total_legal_fees=legal_fees_result["total_with_vat"],
        total_cost=stamp_duty_result["total_government_charges"] + legal_fees_result["total_with_vat"],
        stamp_duty_paid=False,
        payment_date=None,
        payment_reference=None,
        calculated_at=datetime.utcnow()
    )


# ===== Statistics =====

@router.get("/statistics/summary", response_model=ConveyancingStatistics)
async def get_conveyancing_statistics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get conveyancing statistics
    """
    transactions = session.exec(
        select(ConveyancingTransaction).where(ConveyancingTransaction.user_id == current_user.id)
    ).all()

    total = len(transactions)
    active = len([t for t in transactions if t.is_active and t.status not in ["completion", "cancelled"]])
    completed = len([t for t in transactions if t.status == "completion"])
    cancelled = len([t for t in transactions if t.status == "cancelled"])

    # By transaction type
    by_type = {}
    by_status = {}
    by_stage = {}
    total_value = Decimal("0.00")

    for t in transactions:
        by_type[t.transaction_type] = by_type.get(t.transaction_type, 0) + 1
        by_status[t.status] = by_status.get(t.status, 0) + 1
        by_stage[t.current_stage] = by_stage.get(t.current_stage, 0) + 1
        if t.purchase_price:
            total_value += t.purchase_price

    # Calculate averages
    completed_trans = [t for t in transactions if t.completed_at]
    if completed_trans:
        durations = [(t.completed_at - t.instruction_date).days for t in completed_trans]
        avg_days = sum(durations) / len(durations)
    else:
        avg_days = 0.0

    # Search and document stats
    all_searches = session.exec(select(OfficialSearch)).all()
    searches_pending = len([s for s in all_searches if s.status in ["pending", "applied"]])
    searches_with_issues = len([s for s in all_searches if s.has_issues])

    all_docs = session.exec(select(ConveyancingDocument)).all()
    docs_pending = len([d for d in all_docs if d.status in ["draft", "review"]])

    return ConveyancingStatistics(
        total_transactions=total,
        active_transactions=active,
        completed_transactions=completed,
        cancelled_transactions=cancelled,
        by_transaction_type=by_type,
        by_status=by_status,
        by_stage=by_stage,
        total_property_value=total_value,
        average_transaction_days=avg_days,
        average_completion_rate=100.0 * completed / total if total > 0 else 0.0,
        searches_pending=searches_pending,
        searches_with_issues=searches_with_issues,
        documents_pending_execution=docs_pending,
        stamp_duty_collected=Decimal("0.00"),  # Would sum from calculations
        legal_fees_collected=Decimal("0.00")  # Would sum from transactions
    )
