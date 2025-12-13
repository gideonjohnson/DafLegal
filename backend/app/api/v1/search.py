"""
Search and Filter API Endpoints
"""

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, or_, col
from typing import Optional, List
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.contract import Contract
from app.models.clause import Clause
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/search", tags=["search"])


class SearchResult(BaseModel):
    """Search result item"""
    id: str
    type: str  # 'contract', 'clause', etc.
    title: str
    description: Optional[str]
    created_at: datetime
    score: Optional[float] = None


class ContractFilters(BaseModel):
    """Contract filter parameters"""
    search: Optional[str] = None
    risk_level: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    status: Optional[List[str]] = None
    min_risk_score: Optional[int] = None
    max_risk_score: Optional[int] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 20


@router.get("/contracts")
async def search_contracts(
    # Query parameters
    q: Optional[str] = Query(None, description="Search query"),
    risk_level: Optional[str] = Query(None, description="Comma-separated risk levels (low,medium,high,critical)"),
    date_from: Optional[str] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter to date (ISO format)"),
    status: Optional[str] = Query(None, description="Comma-separated statuses"),
    min_risk_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum risk score"),
    max_risk_score: Optional[int] = Query(None, ge=0, le=100, description="Maximum risk score"),
    sort_by: str = Query("created_at", description="Sort field (created_at, risk_score, file_name)"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    # Dependencies
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter contracts with pagination
    """
    # Base query
    statement = select(Contract).where(Contract.user_id == current_user.id)

    # Apply search filter
    if q:
        search_pattern = f"%{q}%"
        statement = statement.where(
            or_(
                col(Contract.file_name).ilike(search_pattern),
                col(Contract.summary).ilike(search_pattern) if hasattr(Contract, 'summary') else False
            )
        )

    # Apply risk level filter
    if risk_level:
        levels = [level.strip().lower() for level in risk_level.split(',')]
        statement = statement.where(col(Contract.risk_level).in_(levels))

    # Apply date range filter
    if date_from:
        try:
            from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            statement = statement.where(Contract.created_at >= from_date)
        except ValueError:
            pass

    if date_to:
        try:
            to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            statement = statement.where(Contract.created_at <= to_date)
        except ValueError:
            pass

    # Apply status filter
    if status:
        statuses = [s.strip() for s in status.split(',')]
        if hasattr(Contract, 'status'):
            statement = statement.where(col(Contract.status).in_(statuses))

    # Apply risk score range
    if min_risk_score is not None:
        statement = statement.where(Contract.risk_score >= min_risk_score)

    if max_risk_score is not None:
        statement = statement.where(Contract.risk_score <= max_risk_score)

    # Apply sorting
    sort_column = {
        'created_at': Contract.created_at,
        'risk_score': Contract.risk_score,
        'file_name': Contract.file_name
    }.get(sort_by, Contract.created_at)

    if sort_order.lower() == 'asc':
        statement = statement.order_by(sort_column.asc())
    else:
        statement = statement.order_by(sort_column.desc())

    # Get total count (before pagination)
    count_statement = select(Contract).where(Contract.user_id == current_user.id)
    total_count = len(db.exec(count_statement).all())

    # Apply pagination
    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)

    # Execute query
    contracts = db.exec(statement).all()

    # Calculate pagination metadata
    total_pages = (total_count + page_size - 1) // page_size

    return {
        "results": [
            {
                "id": str(contract.id),
                "contract_id": contract.contract_id if hasattr(contract, 'contract_id') else str(contract.id),
                "file_name": contract.file_name,
                "risk_level": contract.risk_level,
                "risk_score": contract.risk_score,
                "summary": contract.summary if hasattr(contract, 'summary') else None,
                "created_at": contract.created_at.isoformat() if contract.created_at else None,
                "status": contract.status if hasattr(contract, 'status') else 'completed'
            }
            for contract in contracts
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@router.get("/clauses")
async def search_clauses(
    q: Optional[str] = Query(None, description="Search query"),
    type: Optional[str] = Query(None, description="Clause type"),
    category: Optional[str] = Query(None, description="Clause category"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter clauses
    """
    # Base query
    statement = select(Clause).where(Clause.user_id == current_user.id)

    # Apply search
    if q:
        search_pattern = f"%{q}%"
        statement = statement.where(
            or_(
                col(Clause.name).ilike(search_pattern),
                col(Clause.text).ilike(search_pattern)
            )
        )

    # Apply type filter
    if type:
        statement = statement.where(Clause.type == type)

    # Apply category filter
    if category:
        statement = statement.where(Clause.category == category)

    # Apply tags filter (simplified - exact match for now)
    if tags:
        tag_list = [t.strip() for t in tags.split(',')]
        # This requires JSONB operators in production
        # For now, filter in Python after fetch
        pass

    # Get total count
    total_count = len(db.exec(select(Clause).where(Clause.user_id == current_user.id)).all())

    # Pagination
    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)

    clauses = db.exec(statement).all()

    # Filter by tags if specified (post-query filter)
    if tags:
        tag_list = [t.strip().lower() for t in tags.split(',')]
        clauses = [
            clause for clause in clauses
            if clause.tags and any(tag in [t.lower() for t in clause.tags] for tag in tag_list)
        ]

    total_pages = (total_count + page_size - 1) // page_size

    return {
        "results": [
            {
                "id": str(clause.id),
                "name": clause.name,
                "type": clause.type,
                "category": clause.category,
                "text": clause.text[:200] + '...' if len(clause.text) > 200 else clause.text,
                "tags": clause.tags,
                "created_at": clause.created_at.isoformat() if clause.created_at else None
            }
            for clause in clauses
        ],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@router.get("/quick")
async def quick_search(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    limit: int = Query(5, ge=1, le=20, description="Maximum results per type"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Quick search across contracts and clauses (for autocomplete/suggestions)
    """
    search_pattern = f"%{q}%"
    results = {"contracts": [], "clauses": []}

    # Search contracts
    contract_statement = (
        select(Contract)
        .where(Contract.user_id == current_user.id)
        .where(col(Contract.file_name).ilike(search_pattern))
        .limit(limit)
    )
    contracts = db.exec(contract_statement).all()
    results["contracts"] = [
        {
            "id": str(contract.id),
            "title": contract.file_name,
            "type": "contract",
            "risk_level": contract.risk_level
        }
        for contract in contracts
    ]

    # Search clauses
    clause_statement = (
        select(Clause)
        .where(Clause.user_id == current_user.id)
        .where(
            or_(
                col(Clause.name).ilike(search_pattern),
                col(Clause.text).ilike(search_pattern)
            )
        )
        .limit(limit)
    )
    clauses = db.exec(clause_statement).all()
    results["clauses"] = [
        {
            "id": str(clause.id),
            "title": clause.name,
            "type": "clause",
            "category": clause.category
        }
        for clause in clauses
    ]

    return results
