from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.clause import Clause, ClauseLibrary
from app.schemas.clause import (
    ClauseCreateRequest,
    ClauseUpdateRequest,
    ClauseResponse,
    ClauseSearchRequest,
    ClauseListResponse,
    LibraryCreateRequest,
    LibraryResponse,
    LibraryAddClauseRequest,
    ClauseImportRequest,
    ClauseImportResponse
)
from app.services.clause_service import ClauseService

router = APIRouter(prefix="/clauses", tags=["clauses"])


@router.post("/", response_model=ClauseResponse, status_code=status.HTTP_201_CREATED)
async def create_clause(
    request: ClauseCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new clause
    """
    clause = ClauseService.create_clause(
        session=session,
        user_id=current_user.id,
        title=request.title,
        category=request.category,
        text=request.text,
        description=request.description,
        alternate_text=request.alternate_text,
        tags=request.tags,
        jurisdiction=request.jurisdiction,
        language=request.language,
        risk_level=request.risk_level,
        compliance_notes=request.compliance_notes
    )

    return ClauseResponse(
        clause_id=clause.clause_id,
        title=clause.title,
        category=clause.category,
        text=clause.text,
        description=clause.description,
        alternate_text=clause.alternate_text,
        tags=clause.tags,
        jurisdiction=clause.jurisdiction,
        language=clause.language,
        risk_level=clause.risk_level,
        compliance_notes=clause.compliance_notes,
        status=clause.status,
        version=clause.version,
        is_latest_version=clause.is_latest_version,
        usage_count=clause.usage_count,
        last_used_at=clause.last_used_at,
        created_at=clause.created_at,
        updated_at=clause.updated_at
    )


@router.get("/{clause_id}", response_model=ClauseResponse)
async def get_clause(
    clause_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a single clause by ID
    """
    clause = ClauseService.get_clause(session, clause_id, current_user.id)

    if not clause:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clause not found"
        )

    # Log view
    ClauseService.log_clause_usage(
        session, clause.id, current_user.id, "viewed"
    )

    return ClauseResponse(
        clause_id=clause.clause_id,
        title=clause.title,
        category=clause.category,
        text=clause.text,
        description=clause.description,
        alternate_text=clause.alternate_text,
        tags=clause.tags,
        jurisdiction=clause.jurisdiction,
        language=clause.language,
        risk_level=clause.risk_level,
        compliance_notes=clause.compliance_notes,
        status=clause.status,
        version=clause.version,
        is_latest_version=clause.is_latest_version,
        usage_count=clause.usage_count,
        last_used_at=clause.last_used_at,
        created_at=clause.created_at,
        updated_at=clause.updated_at
    )


@router.put("/{clause_id}", response_model=ClauseResponse)
async def update_clause(
    clause_id: str,
    request: ClauseUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a clause (creates new version if approved)
    """
    updates = request.dict(exclude_unset=True)

    clause = ClauseService.update_clause(
        session, clause_id, current_user.id, **updates
    )

    if not clause:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clause not found"
        )

    return ClauseResponse(
        clause_id=clause.clause_id,
        title=clause.title,
        category=clause.category,
        text=clause.text,
        description=clause.description,
        alternate_text=clause.alternate_text,
        tags=clause.tags,
        jurisdiction=clause.jurisdiction,
        language=clause.language,
        risk_level=clause.risk_level,
        compliance_notes=clause.compliance_notes,
        status=clause.status,
        version=clause.version,
        is_latest_version=clause.is_latest_version,
        usage_count=clause.usage_count,
        last_used_at=clause.last_used_at,
        created_at=clause.created_at,
        updated_at=clause.updated_at
    )


@router.delete("/{clause_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clause(
    clause_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a clause (soft delete)
    """
    success = ClauseService.delete_clause(session, clause_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clause not found"
        )

    return None


@router.post("/search", response_model=ClauseListResponse)
async def search_clauses(
    request: ClauseSearchRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Search and filter clauses
    """
    clauses, total = ClauseService.search_clauses(
        session, current_user.id, request
    )

    clause_responses = [
        ClauseResponse(
            clause_id=c.clause_id,
            title=c.title,
            category=c.category,
            text=c.text,
            description=c.description,
            alternate_text=c.alternate_text,
            tags=c.tags,
            jurisdiction=c.jurisdiction,
            language=c.language,
            risk_level=c.risk_level,
            compliance_notes=c.compliance_notes,
            status=c.status,
            version=c.version,
            is_latest_version=c.is_latest_version,
            usage_count=c.usage_count,
            last_used_at=c.last_used_at,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in clauses
    ]

    return ClauseListResponse(
        clauses=clause_responses,
        total=total,
        limit=request.limit,
        offset=request.offset
    )


@router.get("/category/{category}/similar", response_model=List[ClauseResponse])
async def get_similar_clauses(
    category: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = 5
):
    """
    Get similar clauses by category
    """
    from app.models.clause import ClauseCategory

    try:
        clause_category = ClauseCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category: {category}"
        )

    clauses = ClauseService.get_similar_clauses(
        session, clause_category, current_user.id, limit
    )

    return [
        ClauseResponse(
            clause_id=c.clause_id,
            title=c.title,
            category=c.category,
            text=c.text,
            description=c.description,
            alternate_text=c.alternate_text,
            tags=c.tags,
            jurisdiction=c.jurisdiction,
            language=c.language,
            risk_level=c.risk_level,
            compliance_notes=c.compliance_notes,
            status=c.status,
            version=c.version,
            is_latest_version=c.is_latest_version,
            usage_count=c.usage_count,
            last_used_at=c.last_used_at,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in clauses
    ]


@router.post("/import", response_model=ClauseImportResponse)
async def import_clauses(
    request: ClauseImportRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Bulk import clauses
    """
    imported_ids = []
    errors = []

    for idx, clause_data in enumerate(request.clauses):
        try:
            clause = ClauseService.create_clause(
                session=session,
                user_id=current_user.id,
                title=clause_data.title,
                category=clause_data.category,
                text=clause_data.text,
                description=clause_data.description,
                alternate_text=clause_data.alternate_text,
                tags=clause_data.tags,
                jurisdiction=clause_data.jurisdiction,
                language=clause_data.language,
                risk_level=clause_data.risk_level,
                compliance_notes=clause_data.compliance_notes
            )
            imported_ids.append(clause.clause_id)

            # Add to library if specified
            if request.library_id:
                ClauseService.add_clause_to_library(
                    session,
                    request.library_id,
                    clause.clause_id,
                    current_user.id,
                    sort_order=idx
                )

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    return ClauseImportResponse(
        success_count=len(imported_ids),
        error_count=len(errors),
        imported_clause_ids=imported_ids,
        errors=errors
    )


# Library Endpoints

@router.post("/libraries", response_model=LibraryResponse, status_code=status.HTTP_201_CREATED)
async def create_library(
    request: LibraryCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new clause library
    """
    library = ClauseService.create_library(
        session,
        current_user.id,
        request.name,
        request.description,
        request.is_public,
        request.tags
    )

    return LibraryResponse(
        library_id=library.library_id,
        name=library.name,
        description=library.description,
        is_public=library.is_public,
        is_default=library.is_default,
        clause_count=library.clause_count,
        tags=library.tags,
        created_at=library.created_at,
        updated_at=library.updated_at
    )


@router.post("/libraries/{library_id}/clauses", status_code=status.HTTP_204_NO_CONTENT)
async def add_clause_to_library(
    library_id: str,
    request: LibraryAddClauseRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a clause to a library
    """
    success = ClauseService.add_clause_to_library(
        session,
        library_id,
        request.clause_id,
        current_user.id,
        request.sort_order or 0
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Library or clause not found"
        )

    return None


@router.get("/libraries/{library_id}/clauses", response_model=List[ClauseResponse])
async def get_library_clauses(
    library_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all clauses in a library
    """
    clauses = ClauseService.get_library_clauses(session, library_id, current_user.id)

    return [
        ClauseResponse(
            clause_id=c.clause_id,
            title=c.title,
            category=c.category,
            text=c.text,
            description=c.description,
            alternate_text=c.alternate_text,
            tags=c.tags,
            jurisdiction=c.jurisdiction,
            language=c.language,
            risk_level=c.risk_level,
            compliance_notes=c.compliance_notes,
            status=c.status,
            version=c.version,
            is_latest_version=c.is_latest_version,
            usage_count=c.usage_count,
            last_used_at=c.last_used_at,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in clauses
    ]
