from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.compliance import Playbook, ComplianceRule, ComplianceCheck, ComplianceException
from app.schemas.compliance import (
    PlaybookCreateRequest,
    PlaybookResponse,
    RuleCreateRequest,
    RuleResponse,
    RuleUpdateRequest,
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    ComplianceResultResponse,
    ViolationDetail,
    ExceptionCreateRequest,
    ExceptionResponse
)
from app.services.compliance_service import ComplianceService

router = APIRouter(prefix="/compliance", tags=["compliance"])


# Playbook Endpoints

@router.post("/playbooks", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
async def create_playbook(
    request: PlaybookCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new compliance playbook
    """
    playbook = ComplianceService.create_playbook(
        session=session,
        user_id=current_user.id,
        name=request.name,
        description=request.description,
        version=request.version,
        document_type=request.document_type,
        jurisdiction=request.jurisdiction,
        tags=request.tags
    )

    return PlaybookResponse(
        playbook_id=playbook.playbook_id,
        name=playbook.name,
        description=playbook.description,
        version=playbook.version,
        document_type=playbook.document_type,
        jurisdiction=playbook.jurisdiction,
        tags=playbook.tags,
        is_active=playbook.is_active,
        is_default=playbook.is_default,
        rule_count=playbook.rule_count,
        usage_count=playbook.usage_count,
        created_at=playbook.created_at,
        updated_at=playbook.updated_at
    )


@router.get("/playbooks", response_model=List[PlaybookResponse])
async def list_playbooks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List user's playbooks
    """
    playbooks = session.exec(
        select(Playbook).where(
            Playbook.user_id == current_user.id,
            Playbook.is_active == True
        ).order_by(Playbook.created_at.desc())
    ).all()

    return [
        PlaybookResponse(
            playbook_id=p.playbook_id,
            name=p.name,
            description=p.description,
            version=p.version,
            document_type=p.document_type,
            jurisdiction=p.jurisdiction,
            tags=p.tags,
            is_active=p.is_active,
            is_default=p.is_default,
            rule_count=p.rule_count,
            usage_count=p.usage_count,
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in playbooks
    ]


@router.get("/playbooks/{playbook_id}", response_model=PlaybookResponse)
async def get_playbook(
    playbook_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a single playbook
    """
    playbook = session.exec(
        select(Playbook).where(
            Playbook.playbook_id == playbook_id,
            Playbook.user_id == current_user.id
        )
    ).first()

    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playbook not found"
        )

    return PlaybookResponse(
        playbook_id=playbook.playbook_id,
        name=playbook.name,
        description=playbook.description,
        version=playbook.version,
        document_type=playbook.document_type,
        jurisdiction=playbook.jurisdiction,
        tags=playbook.tags,
        is_active=playbook.is_active,
        is_default=playbook.is_default,
        rule_count=playbook.rule_count,
        usage_count=playbook.usage_count,
        created_at=playbook.created_at,
        updated_at=playbook.updated_at
    )


# Rule Endpoints

@router.post("/playbooks/{playbook_id}/rules", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    playbook_id: str,
    request: RuleCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a rule to a playbook
    """
    try:
        rule = ComplianceService.add_rule_to_playbook(
            session=session,
            playbook_id=playbook_id,
            user_id=current_user.id,
            name=request.name,
            description=request.description,
            rule_type=request.rule_type,
            severity=request.severity,
            parameters=request.parameters,
            pattern=request.pattern,
            expected_value=request.expected_value,
            auto_fix=request.auto_fix,
            auto_fix_suggestion=request.auto_fix_suggestion,
            replacement_text=request.replacement_text,
            replacement_clause_id=request.replacement_clause_id,
            redline_instruction=request.redline_instruction
        )

        return RuleResponse(
            rule_id=rule.rule_id,
            name=rule.name,
            description=rule.description,
            rule_type=rule.rule_type,
            severity=rule.severity,
            parameters=rule.parameters,
            pattern=rule.pattern,
            expected_value=rule.expected_value,
            auto_fix=rule.auto_fix,
            auto_fix_suggestion=rule.auto_fix_suggestion,
            replacement_text=rule.replacement_text,
            replacement_clause_id=rule.replacement_clause_id,
            redline_instruction=rule.redline_instruction,
            is_active=rule.is_active,
            violation_count=rule.violation_count,
            created_at=rule.created_at
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/playbooks/{playbook_id}/rules", response_model=List[RuleResponse])
async def list_rules(
    playbook_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all rules in a playbook
    """
    rules = ComplianceService.get_playbook_rules(
        session, playbook_id, current_user.id
    )

    return [
        RuleResponse(
            rule_id=r.rule_id,
            name=r.name,
            description=r.description,
            rule_type=r.rule_type,
            severity=r.severity,
            parameters=r.parameters,
            pattern=r.pattern,
            expected_value=r.expected_value,
            auto_fix=r.auto_fix,
            auto_fix_suggestion=r.auto_fix_suggestion,
            is_active=r.is_active,
            violation_count=r.violation_count,
            created_at=r.created_at
        )
        for r in rules
    ]


@router.put("/rules/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: str,
    request: RuleUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a compliance rule
    """
    # Get rule and verify ownership through playbook
    rule = session.exec(
        select(ComplianceRule).where(
            ComplianceRule.rule_id == rule_id
        )
    ).first()

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found"
        )

    # Verify user owns the playbook
    playbook = session.get(Playbook, rule.playbook_id)
    if not playbook or playbook.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rule not found"
        )

    # Update fields
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rule, key, value)

    from datetime import datetime
    rule.updated_at = datetime.utcnow()

    session.add(rule)
    session.commit()
    session.refresh(rule)

    return RuleResponse(
        rule_id=rule.rule_id,
        name=rule.name,
        description=rule.description,
        rule_type=rule.rule_type,
        severity=rule.severity,
        parameters=rule.parameters,
        pattern=rule.pattern,
        expected_value=rule.expected_value,
        auto_fix=rule.auto_fix,
        auto_fix_suggestion=rule.auto_fix_suggestion,
        replacement_text=rule.replacement_text,
        replacement_clause_id=rule.replacement_clause_id,
        redline_instruction=rule.redline_instruction,
        is_active=rule.is_active,
        violation_count=rule.violation_count,
        created_at=rule.created_at
    )


# Compliance Check Endpoints

@router.post("/checks", response_model=ComplianceCheckResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_compliance_check(
    request: ComplianceCheckRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Run compliance check on a contract
    """
    try:
        check = ComplianceService.run_compliance_check(
            session=session,
            user_id=current_user.id,
            contract_id=request.contract_id,
            playbook_id=request.playbook_id
        )

        return ComplianceCheckResponse(
            check_id=check.check_id,
            status=check.status,
            eta_seconds=0  # Synchronous for now
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/checks/{check_id}", response_model=ComplianceResultResponse)
async def get_compliance_check(
    check_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get compliance check results
    """
    check = session.exec(
        select(ComplianceCheck).where(
            ComplianceCheck.check_id == check_id,
            ComplianceCheck.user_id == current_user.id
        )
    ).first()

    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance check not found"
        )

    # Get contract and playbook IDs
    from app.models.contract import Contract
    contract = session.get(Contract, check.contract_id)
    playbook = session.get(Playbook, check.playbook_id)

    violations = [ViolationDetail(**v) for v in check.violations] if check.violations else []
    warnings = [ViolationDetail(**w) for w in check.warnings] if check.warnings else []

    return ComplianceResultResponse(
        check_id=check.check_id,
        status=check.status,
        contract_id=contract.contract_id if contract else "",
        playbook_id=playbook.playbook_id if playbook else "",
        overall_status=check.overall_status,
        compliance_score=check.compliance_score,
        rules_checked=check.rules_checked,
        rules_passed=check.rules_passed,
        rules_failed=check.rules_failed,
        rules_warning=check.rules_warning,
        violations=violations,
        passed_rules=check.passed_rules or [],
        warnings=warnings,
        executive_summary=check.executive_summary,
        recommendations=check.recommendations or [],
        processing_time_seconds=check.processing_time_seconds,
        created_at=check.created_at,
        processed_at=check.processed_at
    )


# Exception Endpoints

@router.post("/exceptions", response_model=ExceptionResponse, status_code=status.HTTP_201_CREATED)
async def create_exception(
    request: ExceptionCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a compliance exception
    """
    try:
        exception = ComplianceService.create_exception(
            session=session,
            user_id=current_user.id,
            contract_id=request.contract_id,
            rule_id=request.rule_id,
            reason=request.reason,
            granted_by=request.granted_by,
            expires_at=request.expires_at,
            is_permanent=request.is_permanent
        )

        return ExceptionResponse(
            exception_id=exception.exception_id,
            contract_id=request.contract_id,
            rule_id=request.rule_id,
            reason=exception.reason,
            granted_by=exception.granted_by,
            approved_at=exception.approved_at,
            expires_at=exception.expires_at,
            is_permanent=exception.is_permanent,
            is_active=exception.is_active,
            created_at=exception.created_at
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
