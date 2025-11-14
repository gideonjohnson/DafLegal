"""
Drafting Assistant API Endpoints

Template-based contract generation with AI enhancement.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.drafting import (
    ContractTemplateCreate,
    ContractTemplateResponse,
    ContractTemplateDetail,
    GenerateContractRequest,
    GeneratedContractResponse,
    UpdateGeneratedContractRequest
)
from app.services.drafting_service import DraftingService
from app.core.config import settings

router = APIRouter(prefix="/drafting", tags=["drafting"])


def get_drafting_service(db: Session = Depends(get_session)) -> DraftingService:
    """Dependency to get drafting service"""
    return DraftingService(db=db, openai_api_key=settings.OPENAI_API_KEY)


# Template Endpoints
@router.post("/templates", response_model=ContractTemplateResponse)
async def create_template(
    template_data: ContractTemplateCreate,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Create a new contract template"""
    template = service.create_template(
        user_id=current_user.id,
        name=template_data.name,
        description=template_data.description,
        category=template_data.category,
        jurisdiction=template_data.jurisdiction,
        template_text=template_data.template_text,
        variables=template_data.variables,
        included_clauses=template_data.included_clauses,
        optional_clauses=template_data.optional_clauses,
        tags=template_data.tags
    )

    return ContractTemplateResponse(
        template_id=template.template_id,
        name=template.name,
        description=template.description,
        category=template.category,
        jurisdiction=template.jurisdiction,
        variables=template.variables,
        included_clauses=template.included_clauses,
        optional_clauses=template.optional_clauses,
        is_public=template.is_public,
        is_approved=template.is_approved,
        version=template.version,
        times_used=template.times_used,
        tags=template.tags,
        created_at=template.created_at
    )


@router.get("/templates", response_model=list[ContractTemplateResponse])
async def get_templates(
    category: Optional[str] = None,
    jurisdiction: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Get available contract templates"""
    templates = service.get_templates(
        category=category,
        jurisdiction=jurisdiction,
        is_public=True
    )

    return [
        ContractTemplateResponse(
            template_id=t.template_id,
            name=t.name,
            description=t.description,
            category=t.category,
            jurisdiction=t.jurisdiction,
            variables=t.variables,
            included_clauses=t.included_clauses,
            optional_clauses=t.optional_clauses,
            is_public=t.is_public,
            is_approved=t.is_approved,
            version=t.version,
            times_used=t.times_used,
            tags=t.tags,
            created_at=t.created_at
        )
        for t in templates
    ]


@router.get("/templates/{template_id}", response_model=ContractTemplateDetail)
async def get_template(
    template_id: str,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Get a specific template with full text"""
    try:
        template = service.get_template(template_id)

        return ContractTemplateDetail(
            template_id=template.template_id,
            name=template.name,
            description=template.description,
            category=template.category,
            jurisdiction=template.jurisdiction,
            template_text=template.template_text,
            variables=template.variables,
            included_clauses=template.included_clauses,
            optional_clauses=template.optional_clauses,
            is_public=template.is_public,
            is_approved=template.is_approved,
            version=template.version,
            times_used=template.times_used,
            tags=template.tags,
            created_at=template.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Generation Endpoints
@router.post("/generate", response_model=GeneratedContractResponse)
async def generate_contract(
    request: GenerateContractRequest,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """
    Generate a contract from a template

    This fills the template with provided values and uses AI to:
    - Enhance legal language
    - Suggest improvements
    - Analyze risks
    """
    try:
        contract = service.generate_contract(
            user_id=current_user.id,
            template_id=request.template_id,
            name=request.name,
            variable_values=request.variable_values,
            selected_clauses=request.selected_clauses,
            file_format=request.file_format
        )

        return GeneratedContractResponse(
            generated_id=contract.generated_id,
            name=contract.name,
            category=contract.category,
            template_id=contract.template_id,
            variable_values=contract.variable_values,
            selected_clauses=contract.selected_clauses,
            generated_text=contract.generated_text,
            status=contract.status,
            ai_suggestions=contract.ai_suggestions,
            risk_analysis=contract.risk_analysis,
            file_format=contract.file_format,
            file_url=contract.file_url,
            edit_count=contract.edit_count,
            last_edited_at=contract.last_edited_at,
            created_at=contract.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/contracts", response_model=list[GeneratedContractResponse])
async def get_user_contracts(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Get user's generated contracts"""
    contracts = service.get_user_contracts(
        user_id=current_user.id,
        category=category,
        status=status,
        limit=limit
    )

    return [
        GeneratedContractResponse(
            generated_id=c.generated_id,
            name=c.name,
            category=c.category,
            template_id=c.template_id,
            variable_values=c.variable_values,
            selected_clauses=c.selected_clauses,
            generated_text=c.generated_text,
            status=c.status,
            ai_suggestions=c.ai_suggestions,
            risk_analysis=c.risk_analysis,
            file_format=c.file_format,
            file_url=c.file_url,
            edit_count=c.edit_count,
            last_edited_at=c.last_edited_at,
            created_at=c.created_at
        )
        for c in contracts
    ]


@router.get("/contracts/{generated_id}", response_model=GeneratedContractResponse)
async def get_contract(
    generated_id: str,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Get a specific generated contract"""
    try:
        contract = service.get_contract(generated_id)

        return GeneratedContractResponse(
            generated_id=contract.generated_id,
            name=contract.name,
            category=contract.category,
            template_id=contract.template_id,
            variable_values=contract.variable_values,
            selected_clauses=contract.selected_clauses,
            generated_text=contract.generated_text,
            status=contract.status,
            ai_suggestions=contract.ai_suggestions,
            risk_analysis=contract.risk_analysis,
            file_format=contract.file_format,
            file_url=contract.file_url,
            edit_count=contract.edit_count,
            last_edited_at=contract.last_edited_at,
            created_at=contract.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/contracts/{generated_id}", response_model=GeneratedContractResponse)
async def update_contract(
    generated_id: str,
    update_data: UpdateGeneratedContractRequest,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Update a generated contract"""
    try:
        contract = service.update_contract(
            generated_id=generated_id,
            generated_text=update_data.generated_text,
            status=update_data.status
        )

        return GeneratedContractResponse(
            generated_id=contract.generated_id,
            name=contract.name,
            category=contract.category,
            template_id=contract.template_id,
            variable_values=contract.variable_values,
            selected_clauses=contract.selected_clauses,
            generated_text=contract.generated_text,
            status=contract.status,
            ai_suggestions=contract.ai_suggestions,
            risk_analysis=contract.risk_analysis,
            file_format=contract.file_format,
            file_url=contract.file_url,
            edit_count=contract.edit_count,
            last_edited_at=contract.last_edited_at,
            created_at=contract.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/contracts/{generated_id}")
async def delete_contract(
    generated_id: str,
    current_user: User = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service)
):
    """Delete a generated contract"""
    try:
        service.delete_contract(generated_id)
        return {"message": "Contract deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
