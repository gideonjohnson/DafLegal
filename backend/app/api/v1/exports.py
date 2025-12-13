"""
Export API Endpoints - PDF, DOCX, CSV exports
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.contract import Contract
from app.models.user import User
from app.models.clause import Clause
from app.models.compliance import ComplianceCheck
from app.services.export_service import ExportService

router = APIRouter()


@router.get("/contracts/{contract_id}/pdf")
async def export_contract_pdf(
    contract_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export contract analysis as PDF"""
    # Get contract
    contract = db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Prepare contract data
    contract_data = {
        'contract_name': contract.file_name,
        'risk_level': contract.risk_level,
        'risk_score': contract.risk_score,
        'summary': contract.summary,
        'key_terms': contract.key_terms or [],
        'clauses': [
            {
                'type': c.get('type', 'Unknown'),
                'text': c.get('text', ''),
                'risk_level': c.get('risk_level', 'Low')
            }
            for c in (contract.clauses or [])
        ],
        'risks': contract.risks or []
    }

    # Generate PDF
    pdf_buffer = ExportService.generate_contract_pdf(contract_data)

    # Return as downloadable file
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=contract_analysis_{contract_id}.pdf"
        }
    )


@router.get("/compliance/{check_id}/pdf")
async def export_compliance_pdf(
    check_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export compliance check as PDF"""
    # Get compliance check
    check = db.get(ComplianceCheck, check_id)
    if not check:
        raise HTTPException(status_code=404, detail="Compliance check not found")

    if check.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Prepare compliance data
    compliance_data = {
        'playbook_name': check.playbook_name if hasattr(check, 'playbook_name') else 'Unknown',
        'score': check.score,
        'status': check.status,
        'issues': check.issues or []
    }

    # Generate PDF
    pdf_buffer = ExportService.generate_compliance_pdf(compliance_data)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=compliance_check_{check_id}.pdf"
        }
    )


@router.get("/clauses/docx")
async def export_clauses_docx(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export user's clauses as DOCX"""
    # Get user's clauses
    statement = select(Clause).where(Clause.user_id == current_user.id)
    clauses = db.exec(statement).all()

    if not clauses:
        raise HTTPException(status_code=404, detail="No clauses found")

    # Prepare clause data
    clause_data = [
        {
            'name': clause.name,
            'type': clause.type,
            'category': clause.category,
            'text': clause.text,
            'tags': clause.tags or []
        }
        for clause in clauses
    ]

    # Generate DOCX
    docx_buffer = ExportService.generate_clauses_docx(clause_data)

    return StreamingResponse(
        docx_buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=clauses_export_{current_user.id}.docx"
        }
    )


@router.get("/contracts/csv")
async def export_contracts_csv(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export contracts list as CSV"""
    # Get user's contracts
    statement = select(Contract).where(Contract.user_id == current_user.id)
    contracts = db.exec(statement).all()

    if not contracts:
        raise HTTPException(status_code=404, detail="No contracts found")

    # Prepare contract data
    contract_data = [
        {
            'id': str(contract.id),
            'contract_name': contract.file_name,
            'created_at': contract.created_at.isoformat() if contract.created_at else '',
            'risk_level': contract.risk_level,
            'risk_score': contract.risk_score,
            'status': contract.status if hasattr(contract, 'status') else 'completed'
        }
        for contract in contracts
    ]

    # Generate CSV
    csv_buffer = ExportService.generate_contracts_csv(contract_data)

    return StreamingResponse(
        csv_buffer,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=contracts_{current_user.id}.csv"
        }
    )


@router.get("/analytics/csv")
async def export_analytics_csv(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Export analytics data as CSV (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    # Get analytics data (example - customize based on your analytics model)
    statement = select(Contract)
    contracts = db.exec(statement).all()

    analytics_data = [
        {
            'user_id': str(contract.user_id),
            'contract_id': str(contract.id),
            'upload_date': contract.created_at.isoformat() if contract.created_at else '',
            'risk_score': contract.risk_score,
            'risk_level': contract.risk_level,
            'file_size': contract.file_size if hasattr(contract, 'file_size') else 0
        }
        for contract in contracts
    ]

    # Generate CSV
    csv_buffer = ExportService.generate_analytics_csv(analytics_data)

    return StreamingResponse(
        csv_buffer,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=analytics_data.csv"
        }
    )
