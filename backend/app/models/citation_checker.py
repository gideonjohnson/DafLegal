"""
Citation Checker Models

Models for validating and managing legal citations in documents.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, Text, JSON


class CitationCheck(SQLModel, table=True):
    """Track citation validation checks on documents"""
    __tablename__ = "citation_checks"

    id: Optional[int] = Field(default=None, primary_key=True)
    check_id: str = Field(unique=True, index=True)  # chk_xxx
    user_id: int = Field(foreign_key="users.id", index=True)
    contract_id: Optional[str] = Field(default=None, foreign_key="contracts.contract_id", index=True)

    # Document details
    document_text: str = Field(sa_column=Column(Text))
    document_name: str
    citation_format: str = Field(default="bluebook")  # bluebook, alwd, chicago, etc.

    # Check results
    status: str = Field(default="pending")  # pending, completed, failed
    total_citations_found: int = Field(default=0)
    valid_citations: int = Field(default=0)
    invalid_citations: int = Field(default=0)
    warnings: int = Field(default=0)

    # Analysis
    processing_time_seconds: Optional[float] = None
    overall_score: float = Field(default=0.0)  # 0-100% accuracy score

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship()
    contract: Optional["Contract"] = Relationship()
    issues: list["CitationIssue"] = Relationship(back_populates="check")


class CitationIssue(SQLModel, table=True):
    """Individual citation issues found in documents"""
    __tablename__ = "citation_issues"

    id: Optional[int] = Field(default=None, primary_key=True)
    issue_id: str = Field(unique=True, index=True)  # iss_xxx
    check_id: str = Field(foreign_key="citation_checks.check_id", index=True)

    # Citation details
    citation_text: str = Field(sa_column=Column(Text))
    citation_type: str  # case, statute, regulation, article, book
    location_start: int  # Character position in document
    location_end: int

    # Issue classification
    severity: str  # critical, high, medium, low, info
    issue_type: str  # format_error, missing_element, broken_link, outdated, style_issue
    issue_description: str = Field(sa_column=Column(Text))

    # Validation details
    expected_format: Optional[str] = Field(default=None, sa_column=Column(Text))
    actual_format: Optional[str] = Field(default=None, sa_column=Column(Text))
    suggested_fix: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Verification
    is_verified: bool = Field(default=False)  # Whether citation was verified to exist
    verification_url: Optional[str] = None
    verification_status: Optional[str] = None  # valid, not_found, uncertain

    # Context
    surrounding_text: Optional[str] = Field(default=None, sa_column=Column(Text))

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    check: CitationCheck = Relationship(back_populates="issues")


class CitationFormat(SQLModel, table=True):
    """Citation format rules and patterns"""
    __tablename__ = "citation_formats"

    id: Optional[int] = Field(default=None, primary_key=True)
    format_id: str = Field(unique=True, index=True)  # fmt_xxx

    # Format details
    name: str  # Bluebook, ALWD, Chicago, etc.
    citation_type: str  # case, statute, regulation, etc.
    pattern: str = Field(sa_column=Column(Text))  # Regex pattern
    example: str = Field(sa_column=Column(Text))
    description: str = Field(sa_column=Column(Text))

    # Rules
    rules: dict = Field(default={}, sa_column=Column(JSON))  # Format-specific rules
    required_elements: list[str] = Field(default=[], sa_column=Column(JSON))

    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
