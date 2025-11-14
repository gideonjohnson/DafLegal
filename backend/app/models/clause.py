from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from enum import Enum


class ClauseCategory(str, Enum):
    """Clause category types"""
    TERMINATION = "termination"
    INDEMNIFICATION = "indemnification"
    LIABILITY = "liability"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    CONFIDENTIALITY = "confidentiality"
    PAYMENT = "payment"
    RENEWAL = "renewal"
    FORCE_MAJEURE = "force_majeure"
    DISPUTE_RESOLUTION = "dispute_resolution"
    GOVERNING_LAW = "governing_law"
    DATA_PROTECTION = "data_protection"
    WARRANTIES = "warranties"
    ASSIGNMENT = "assignment"
    NOTICES = "notices"
    SEVERABILITY = "severability"
    ENTIRE_AGREEMENT = "entire_agreement"
    AMENDMENT = "amendment"
    WAIVER = "waiver"
    CUSTOM = "custom"


class ClauseRiskLevel(str, Enum):
    """Risk level for clause"""
    FAVORABLE = "favorable"
    NEUTRAL = "neutral"
    MODERATE = "moderate"
    UNFAVORABLE = "unfavorable"


class ClauseStatus(str, Enum):
    """Clause approval status"""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    DEPRECATED = "deprecated"


class Clause(SQLModel, table=True):
    """Reusable contract clause"""
    __tablename__ = "clauses"

    id: Optional[int] = Field(default=None, primary_key=True)
    clause_id: str = Field(unique=True, index=True)  # Public ID (cls_xxx)
    user_id: int = Field(foreign_key="users.id", index=True)  # Owner
    organization_id: Optional[int] = None  # For team sharing

    # Basic information
    title: str = Field(index=True)
    category: ClauseCategory = Field(index=True)
    description: Optional[str] = None

    # Clause content
    text: str  # The actual clause text
    alternate_text: Optional[str] = None  # Alternative version

    # Metadata
    tags: List[str] = Field(default=[], sa_column=Column(JSON))  # Searchable tags
    jurisdiction: Optional[str] = None  # e.g., "California", "New York"
    language: str = Field(default="en")

    # Risk & compliance
    risk_level: ClauseRiskLevel = Field(default=ClauseRiskLevel.NEUTRAL)
    compliance_notes: Optional[str] = None

    # Status & approval
    status: ClauseStatus = Field(default=ClauseStatus.DRAFT)
    approved_by: Optional[int] = None  # User ID who approved
    approved_at: Optional[datetime] = None

    # Version control
    version: int = Field(default=1)
    parent_clause_id: Optional[int] = Field(default=None, foreign_key="clauses.id")
    is_latest_version: bool = Field(default=True)

    # Usage tracking
    usage_count: int = Field(default=0)
    last_used_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="clauses")


class ClauseLibrary(SQLModel, table=True):
    """Shared clause library (team/organization level)"""
    __tablename__ = "clause_libraries"

    id: Optional[int] = Field(default=None, primary_key=True)
    library_id: str = Field(unique=True, index=True)  # Public ID (lib_xxx)

    # Library info
    name: str
    description: Optional[str] = None
    owner_user_id: int = Field(foreign_key="users.id", index=True)
    organization_id: Optional[int] = None

    # Settings
    is_public: bool = Field(default=False)  # Public libraries visible to all
    is_default: bool = Field(default=False)  # Default library for organization

    # Metadata
    clause_count: int = Field(default=0)
    tags: List[str] = Field(default=[], sa_column=Column(JSON))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ClauseLibraryMembership(SQLModel, table=True):
    """Many-to-many: which clauses belong to which libraries"""
    __tablename__ = "clause_library_memberships"

    id: Optional[int] = Field(default=None, primary_key=True)
    clause_id: int = Field(foreign_key="clauses.id", index=True)
    library_id: int = Field(foreign_key="clause_libraries.id", index=True)

    # Ordering within library
    sort_order: int = Field(default=0)

    # Timestamps
    added_at: datetime = Field(default_factory=datetime.utcnow)


class ClauseUsageLog(SQLModel, table=True):
    """Track when and where clauses are used"""
    __tablename__ = "clause_usage_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    clause_id: int = Field(foreign_key="clauses.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    contract_id: Optional[int] = Field(default=None, foreign_key="contracts.id")

    # Usage context
    action: str  # "viewed", "copied", "suggested", "inserted"
    context: Optional[str] = None  # Additional context

    # Timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ClauseSuggestion(SQLModel, table=True):
    """AI-generated clause suggestions for contracts"""
    __tablename__ = "clause_suggestions"

    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: int = Field(foreign_key="contracts.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    # Suggestion details
    category: ClauseCategory
    reason: str  # Why this clause is suggested
    suggested_clause_ids: List[int] = Field(default=[], sa_column=Column(JSON))

    # User feedback
    was_accepted: Optional[bool] = None
    feedback: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
