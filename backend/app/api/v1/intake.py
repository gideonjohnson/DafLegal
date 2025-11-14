"""
Intake Triage API Endpoints

Client intake submission, AI categorization, and lawyer assignment.
"""

import secrets
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.intake import (
    ClientIntake, MatterType, LawyerSpecialization,
    IntakeAssignment, IntakeNote, RoutingRule
)
from app.schemas.intake import (
    ClientIntakeCreate, ClientIntakeUpdate, ClientIntakeResponse,
    IntakeAnalysisResponse, IntakeAssignRequest, IntakeAssignResponse,
    MatterTypeCreate, MatterTypeResponse,
    LawyerSpecializationCreate, LawyerSpecializationUpdate, LawyerSpecializationResponse,
    RoutingRuleCreate, RoutingRuleResponse,
    IntakeNoteCreate, IntakeNoteResponse,
    IntakeListFilters, IntakeListResponse,
    IntakeStatistics
)
from app.services.intake_service import IntakeTriageService

router = APIRouter(prefix="/intake", tags=["intake"])


# ===== Client Intake Endpoints =====

@router.post("/submit", response_model=ClientIntakeResponse, status_code=status.HTTP_201_CREATED)
async def submit_intake(
    intake: ClientIntakeCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Submit new client intake for AI categorization and routing
    """
    start_time = time.time()

    # Generate intake ID
    intake_id = f"int_{secrets.token_urlsafe(16)}"

    # Create intake record
    new_intake = ClientIntake(
        intake_id=intake_id,
        user_id=current_user.id,
        client_name=intake.client_name,
        client_email=intake.client_email,
        client_phone=intake.client_phone,
        company=intake.company,
        is_existing_client=intake.is_existing_client,
        matter_title=intake.matter_title,
        matter_description=intake.matter_description,
        matter_type=intake.matter_type,
        practice_area=intake.practice_area,
        urgency=intake.urgency,
        complexity=intake.complexity,
        estimated_value=intake.estimated_value,
        deadline=intake.deadline,
        deadline_description=intake.deadline_description,
        source=intake.source,
        referral_source=intake.referral_source,
        attached_contract_ids=intake.attached_contract_ids,
        status="pending"
    )

    session.add(new_intake)
    session.commit()
    session.refresh(new_intake)

    # Trigger AI analysis (async in production, sync for MVP)
    try:
        triage_service = IntakeTriageService()
        analysis = triage_service.analyze_intake(
            matter_title=intake.matter_title,
            matter_description=intake.matter_description,
            matter_type=intake.matter_type,
            practice_area=intake.practice_area,
            urgency=intake.urgency,
            complexity=intake.complexity,
            estimated_value=intake.estimated_value,
            deadline=intake.deadline
        )

        # Update intake with AI analysis
        new_intake.status = "categorized"
        new_intake.ai_category = analysis["categorization"]["suggested_category"]
        new_intake.ai_practice_area = analysis["categorization"]["suggested_practice_area"]
        new_intake.ai_urgency = analysis["categorization"]["suggested_urgency"]
        new_intake.ai_complexity = analysis["categorization"]["suggested_complexity"]
        new_intake.confidence_score = analysis["categorization"]["confidence_score"]
        new_intake.ai_risk_assessment = analysis["risk_assessment"]
        new_intake.ai_recommendations = analysis["recommendations"]["immediate_actions"]
        new_intake.risk_factors = analysis["risk_assessment"]["risk_factors"]
        new_intake.conflict_check_required = analysis["conflict_check"]["requires_conflict_check"]

        # Calculate priority score
        priority_score = triage_service.calculate_priority_score(
            urgency=analysis["categorization"]["suggested_urgency"],
            complexity=analysis["categorization"]["suggested_complexity"],
            estimated_value=intake.estimated_value,
            risk_level=analysis["risk_assessment"]["risk_level"],
            deadline=intake.deadline,
            is_existing_client=intake.is_existing_client
        )
        new_intake.priority_score = priority_score

        # Store full AI analysis
        import json
        new_intake.ai_analysis = json.dumps(analysis)

        new_intake.processed_at = datetime.utcnow()
        new_intake.processing_time_seconds = time.time() - start_time

        session.add(new_intake)
        session.commit()
        session.refresh(new_intake)

    except Exception as e:
        # If AI analysis fails, continue with basic intake
        new_intake.status = "pending"
        new_intake.internal_notes = f"AI analysis failed: {str(e)}"
        session.add(new_intake)
        session.commit()
        session.refresh(new_intake)

    return new_intake


@router.get("/list", response_model=IntakeListResponse)
async def list_intakes(
    status: Optional[str] = None,
    matter_type: Optional[str] = None,
    practice_area: Optional[str] = None,
    urgency: Optional[str] = None,
    assigned_to: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List client intakes with filters
    """
    query = select(ClientIntake).where(ClientIntake.user_id == current_user.id)

    # Apply filters
    if status:
        query = query.where(ClientIntake.status == status)
    if matter_type:
        query = query.where(ClientIntake.matter_type == matter_type)
    if practice_area:
        query = query.where(ClientIntake.practice_area == practice_area)
    if urgency:
        query = query.where(ClientIntake.urgency == urgency)
    if assigned_to:
        query = query.where(ClientIntake.assigned_to == assigned_to)

    # Count total
    count_query = query
    total = len(session.exec(count_query).all())

    # Apply pagination
    query = query.offset(offset).limit(limit)
    query = query.order_by(ClientIntake.created_at.desc())

    intakes = session.exec(query).all()

    return IntakeListResponse(
        intakes=intakes,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{intake_id}", response_model=ClientIntakeResponse)
async def get_intake(
    intake_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get intake details by ID
    """
    intake = session.exec(
        select(ClientIntake).where(
            ClientIntake.intake_id == intake_id,
            ClientIntake.user_id == current_user.id
        )
    ).first()

    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )

    return intake


@router.patch("/{intake_id}", response_model=ClientIntakeResponse)
async def update_intake(
    intake_id: str,
    updates: ClientIntakeUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update intake status or details
    """
    intake = session.exec(
        select(ClientIntake).where(
            ClientIntake.intake_id == intake_id,
            ClientIntake.user_id == current_user.id
        )
    ).first()

    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )

    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(intake, key, value)

    intake.updated_at = datetime.utcnow()

    session.add(intake)
    session.commit()
    session.refresh(intake)

    return intake


@router.post("/{intake_id}/assign", response_model=IntakeAssignResponse)
async def assign_intake(
    intake_id: str,
    assignment: IntakeAssignRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Assign intake to a lawyer
    """
    intake = session.exec(
        select(ClientIntake).where(
            ClientIntake.intake_id == intake_id,
            ClientIntake.user_id == current_user.id
        )
    ).first()

    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )

    # Create assignment record
    assignment_id = f"asn_{secrets.token_urlsafe(16)}"

    new_assignment = IntakeAssignment(
        assignment_id=assignment_id,
        intake_id=intake.intake_id,
        assigned_to=assignment.assigned_to,
        assigned_by=current_user.id,
        assignment_reason=assignment.assignment_reason,
        priority_override=assignment.priority_override,
        deadline_override=assignment.deadline_override,
        notes=assignment.notes,
        status="pending"
    )

    # Update intake
    intake.assigned_to = assignment.assigned_to
    intake.assigned_by = current_user.id
    intake.assigned_at = datetime.utcnow()
    intake.status = "assigned"

    session.add(new_assignment)
    session.add(intake)
    session.commit()
    session.refresh(new_assignment)

    return new_assignment


@router.post("/{intake_id}/notes", response_model=IntakeNoteResponse)
async def add_intake_note(
    intake_id: str,
    note: IntakeNoteCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add note to intake
    """
    intake = session.exec(
        select(ClientIntake).where(ClientIntake.intake_id == intake_id)
    ).first()

    if not intake:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intake not found"
        )

    # Create note
    note_id = f"note_{secrets.token_urlsafe(16)}"

    new_note = IntakeNote(
        note_id=note_id,
        intake_id=intake_id,
        user_id=current_user.id,
        note_text=note.note_text,
        note_type=note.note_type
    )

    session.add(new_note)
    session.commit()
    session.refresh(new_note)

    return new_note


@router.get("/statistics/summary", response_model=IntakeStatistics)
async def get_intake_statistics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get intake statistics for user's firm
    """
    intakes = session.exec(
        select(ClientIntake).where(ClientIntake.user_id == current_user.id)
    ).all()

    # Calculate statistics
    total = len(intakes)
    pending = len([i for i in intakes if i.status == "pending"])
    assigned = len([i for i in intakes if i.status == "assigned"])
    completed = len([i for i in intakes if i.status == "completed"])
    declined = len([i for i in intakes if i.status == "declined"])

    # By matter type
    by_matter_type = {}
    by_practice_area = {}
    by_urgency = {}
    by_complexity = {}

    for intake in intakes:
        by_matter_type[intake.matter_type] = by_matter_type.get(intake.matter_type, 0) + 1
        by_practice_area[intake.practice_area] = by_practice_area.get(intake.practice_area, 0) + 1
        by_urgency[intake.urgency] = by_urgency.get(intake.urgency, 0) + 1
        by_complexity[intake.complexity] = by_complexity.get(intake.complexity, 0) + 1

    # Processing times
    processing_times = [i.processing_time_seconds for i in intakes if i.processing_time_seconds]
    avg_processing = sum(processing_times) / len(processing_times) if processing_times else 0

    # Conflict checks
    conflict_required = len([i for i in intakes if i.conflict_check_required])
    conflict_passed = len([i for i in intakes if i.conflict_check_passed == True])
    conflict_failed = len([i for i in intakes if i.conflict_check_passed == False])

    return IntakeStatistics(
        total_intakes=total,
        pending_intakes=pending,
        assigned_intakes=assigned,
        completed_intakes=completed,
        declined_intakes=declined,
        by_matter_type=by_matter_type,
        by_practice_area=by_practice_area,
        by_urgency=by_urgency,
        by_complexity=by_complexity,
        average_processing_time_seconds=avg_processing,
        average_response_time_hours=0.0,  # Would calculate from assignment records
        conflict_checks_required=conflict_required,
        conflict_checks_passed=conflict_passed,
        conflict_checks_failed=conflict_failed
    )


# ===== Matter Type Endpoints =====

@router.post("/matter-types", response_model=MatterTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_matter_type(
    matter_type: MatterTypeCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create new matter type definition
    """
    type_id = f"mtp_{secrets.token_urlsafe(16)}"

    new_type = MatterType(
        type_id=type_id,
        name=matter_type.name,
        display_name=matter_type.display_name,
        description=matter_type.description,
        category=matter_type.category,
        typical_urgency=matter_type.typical_urgency,
        typical_complexity=matter_type.typical_complexity,
        average_duration_days=matter_type.average_duration_days,
        keywords=matter_type.keywords,
        required_documents=matter_type.required_documents,
        standard_checklist=matter_type.standard_checklist,
        typical_workflow_stages=matter_type.typical_workflow_stages,
        estimated_fee_range_min=matter_type.estimated_fee_range_min,
        estimated_fee_range_max=matter_type.estimated_fee_range_max,
        fee_structure=matter_type.fee_structure,
        requires_specialization=matter_type.requires_specialization,
        specialization_required=matter_type.specialization_required
    )

    session.add(new_type)
    session.commit()
    session.refresh(new_type)

    return new_type


@router.get("/matter-types", response_model=List[MatterTypeResponse])
async def list_matter_types(
    category: Optional[str] = None,
    is_active: bool = True,
    session: Session = Depends(get_session)
):
    """
    List all matter types
    """
    query = select(MatterType).where(MatterType.is_active == is_active)

    if category:
        query = query.where(MatterType.category == category)

    matter_types = session.exec(query).all()
    return matter_types


# ===== Lawyer Specialization Endpoints =====

@router.post("/specializations", response_model=LawyerSpecializationResponse, status_code=status.HTTP_201_CREATED)
async def create_specialization(
    specialization: LawyerSpecializationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create or update lawyer specialization profile
    """
    new_spec = LawyerSpecialization(
        user_id=current_user.id,
        specialization=specialization.specialization,
        proficiency_level=specialization.proficiency_level,
        years_experience=specialization.years_experience,
        max_capacity=specialization.max_capacity,
        is_accepting_new_matters=specialization.is_accepting_new_matters,
        preferred_matter_types=specialization.preferred_matter_types,
        preferred_client_types=specialization.preferred_client_types,
        minimum_matter_value=specialization.minimum_matter_value,
        availability_notes=specialization.availability_notes
    )

    session.add(new_spec)
    session.commit()
    session.refresh(new_spec)

    return new_spec


@router.get("/specializations/me", response_model=List[LawyerSpecializationResponse])
async def get_my_specializations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get current user's specializations
    """
    specs = session.exec(
        select(LawyerSpecialization).where(LawyerSpecialization.user_id == current_user.id)
    ).all()

    return specs
