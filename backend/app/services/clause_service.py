from typing import List, Optional, Tuple
from sqlmodel import Session, select, func, or_, and_
from datetime import datetime
import secrets

from app.models.clause import (
    Clause, ClauseLibrary, ClauseLibraryMembership, ClauseUsageLog,
    ClauseCategory, ClauseRiskLevel, ClauseStatus
)
from app.schemas.clause import ClauseSearchRequest


class ClauseService:
    """Service for managing clauses and libraries"""

    @staticmethod
    def create_clause(
        session: Session,
        user_id: int,
        title: str,
        category: ClauseCategory,
        text: str,
        **kwargs
    ) -> Clause:
        """Create a new clause"""
        clause = Clause(
            clause_id=f"cls_{secrets.token_urlsafe(16)}",
            user_id=user_id,
            title=title,
            category=category,
            text=text,
            **kwargs
        )
        session.add(clause)
        session.commit()
        session.refresh(clause)
        return clause

    @staticmethod
    def search_clauses(
        session: Session,
        user_id: int,
        search_request: ClauseSearchRequest
    ) -> Tuple[List[Clause], int]:
        """
        Search and filter clauses
        Returns: (clauses, total_count)
        """
        # Base query - user's clauses or public ones
        query = select(Clause).where(
            or_(
                Clause.user_id == user_id,
                Clause.status == ClauseStatus.APPROVED  # Public approved clauses
            )
        )

        # Apply filters
        if search_request.query:
            # Full-text search on title, text, and tags
            search_term = f"%{search_request.query}%"
            query = query.where(
                or_(
                    Clause.title.ilike(search_term),
                    Clause.text.ilike(search_term),
                    Clause.description.ilike(search_term)
                )
            )

        if search_request.category:
            query = query.where(Clause.category == search_request.category)

        if search_request.tags:
            # Match any of the tags (JSON array contains)
            for tag in search_request.tags:
                query = query.where(Clause.tags.contains([tag]))

        if search_request.jurisdiction:
            query = query.where(Clause.jurisdiction == search_request.jurisdiction)

        if search_request.risk_level:
            query = query.where(Clause.risk_level == search_request.risk_level)

        if search_request.status:
            query = query.where(Clause.status == search_request.status)

        # Only latest versions
        query = query.where(Clause.is_latest_version == True)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = session.exec(count_query).one()

        # Order by relevance (usage count) and recency
        query = query.order_by(
            Clause.usage_count.desc(),
            Clause.updated_at.desc()
        )

        # Pagination
        query = query.offset(search_request.offset).limit(search_request.limit)

        # Execute
        clauses = session.exec(query).all()

        return clauses, total

    @staticmethod
    def get_clause(session: Session, clause_id: str, user_id: int) -> Optional[Clause]:
        """Get a single clause by ID"""
        clause = session.exec(
            select(Clause).where(
                Clause.clause_id == clause_id,
                or_(
                    Clause.user_id == user_id,
                    Clause.status == ClauseStatus.APPROVED
                )
            )
        ).first()
        return clause

    @staticmethod
    def update_clause(
        session: Session,
        clause_id: str,
        user_id: int,
        **updates
    ) -> Optional[Clause]:
        """Update a clause (creates new version if approved)"""
        clause = session.exec(
            select(Clause).where(
                Clause.clause_id == clause_id,
                Clause.user_id == user_id
            )
        ).first()

        if not clause:
            return None

        # If clause is approved, create new version
        if clause.status == ClauseStatus.APPROVED and any(
            k in updates for k in ['text', 'title', 'category']
        ):
            # Mark old version as not latest
            clause.is_latest_version = False
            session.add(clause)

            # Create new version
            new_clause = Clause(
                clause_id=f"cls_{secrets.token_urlsafe(16)}",
                user_id=user_id,
                title=updates.get('title', clause.title),
                category=updates.get('category', clause.category),
                text=updates.get('text', clause.text),
                description=updates.get('description', clause.description),
                alternate_text=updates.get('alternate_text', clause.alternate_text),
                tags=updates.get('tags', clause.tags),
                jurisdiction=updates.get('jurisdiction', clause.jurisdiction),
                language=clause.language,
                risk_level=updates.get('risk_level', clause.risk_level),
                compliance_notes=updates.get('compliance_notes', clause.compliance_notes),
                status=ClauseStatus.DRAFT,
                version=clause.version + 1,
                parent_clause_id=clause.id,
                is_latest_version=True
            )
            session.add(new_clause)
            session.commit()
            session.refresh(new_clause)
            return new_clause
        else:
            # Update in place
            for key, value in updates.items():
                if hasattr(clause, key) and value is not None:
                    setattr(clause, key, value)

            clause.updated_at = datetime.utcnow()
            session.add(clause)
            session.commit()
            session.refresh(clause)
            return clause

    @staticmethod
    def delete_clause(session: Session, clause_id: str, user_id: int) -> bool:
        """Delete a clause (soft delete by marking as deprecated)"""
        clause = session.exec(
            select(Clause).where(
                Clause.clause_id == clause_id,
                Clause.user_id == user_id
            )
        ).first()

        if not clause:
            return False

        clause.status = ClauseStatus.DEPRECATED
        clause.is_latest_version = False
        session.add(clause)
        session.commit()
        return True

    @staticmethod
    def log_clause_usage(
        session: Session,
        clause_id: int,
        user_id: int,
        action: str,
        contract_id: Optional[int] = None
    ):
        """Log clause usage for analytics"""
        usage_log = ClauseUsageLog(
            clause_id=clause_id,
            user_id=user_id,
            action=action,
            contract_id=contract_id
        )
        session.add(usage_log)

        # Update clause usage count
        clause = session.get(Clause, clause_id)
        if clause:
            clause.usage_count += 1
            clause.last_used_at = datetime.utcnow()
            session.add(clause)

        session.commit()

    @staticmethod
    def get_similar_clauses(
        session: Session,
        category: ClauseCategory,
        user_id: int,
        limit: int = 5
    ) -> List[Clause]:
        """Get similar clauses by category, ordered by popularity"""
        clauses = session.exec(
            select(Clause).where(
                Clause.category == category,
                or_(
                    Clause.user_id == user_id,
                    Clause.status == ClauseStatus.APPROVED
                ),
                Clause.is_latest_version == True
            )
            .order_by(Clause.usage_count.desc())
            .limit(limit)
        ).all()

        return clauses

    @staticmethod
    def create_library(
        session: Session,
        user_id: int,
        name: str,
        description: Optional[str] = None,
        is_public: bool = False,
        tags: List[str] = []
    ) -> ClauseLibrary:
        """Create a new clause library"""
        library = ClauseLibrary(
            library_id=f"lib_{secrets.token_urlsafe(16)}",
            name=name,
            description=description,
            owner_user_id=user_id,
            is_public=is_public,
            tags=tags
        )
        session.add(library)
        session.commit()
        session.refresh(library)
        return library

    @staticmethod
    def add_clause_to_library(
        session: Session,
        library_id: str,
        clause_id: str,
        user_id: int,
        sort_order: int = 0
    ) -> bool:
        """Add a clause to a library"""
        # Get library and verify ownership
        library = session.exec(
            select(ClauseLibrary).where(
                ClauseLibrary.library_id == library_id,
                ClauseLibrary.owner_user_id == user_id
            )
        ).first()

        if not library:
            return False

        # Get clause
        clause = session.exec(
            select(Clause).where(Clause.clause_id == clause_id)
        ).first()

        if not clause:
            return False

        # Check if already in library
        existing = session.exec(
            select(ClauseLibraryMembership).where(
                ClauseLibraryMembership.clause_id == clause.id,
                ClauseLibraryMembership.library_id == library.id
            )
        ).first()

        if existing:
            return True

        # Add to library
        membership = ClauseLibraryMembership(
            clause_id=clause.id,
            library_id=library.id,
            sort_order=sort_order
        )
        session.add(membership)

        # Update library clause count
        library.clause_count += 1
        library.updated_at = datetime.utcnow()
        session.add(library)

        session.commit()
        return True

    @staticmethod
    def get_library_clauses(
        session: Session,
        library_id: str,
        user_id: int
    ) -> List[Clause]:
        """Get all clauses in a library"""
        library = session.exec(
            select(ClauseLibrary).where(
                ClauseLibrary.library_id == library_id,
                or_(
                    ClauseLibrary.owner_user_id == user_id,
                    ClauseLibrary.is_public == True
                )
            )
        ).first()

        if not library:
            return []

        # Get memberships with clauses
        memberships = session.exec(
            select(ClauseLibraryMembership)
            .where(ClauseLibraryMembership.library_id == library.id)
            .order_by(ClauseLibraryMembership.sort_order)
        ).all()

        clause_ids = [m.clause_id for m in memberships]

        clauses = session.exec(
            select(Clause).where(Clause.id.in_(clause_ids))
        ).all()

        return clauses
