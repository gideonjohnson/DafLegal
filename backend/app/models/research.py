"""
Legal Research Models

Models for tracking legal research queries, results, and citations.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, Text, JSON


class ResearchQuery(SQLModel, table=True):
    """Track legal research queries by users"""
    __tablename__ = "research_queries"

    id: Optional[int] = Field(default=None, primary_key=True)
    query_id: str = Field(unique=True, index=True)  # req_xxx
    user_id: int = Field(foreign_key="users.id", index=True)

    # Query details
    query_text: str = Field(sa_column=Column(Text))
    query_type: str = Field(index=True)  # case_law, statute, regulation, treaty
    jurisdiction: Optional[str] = None  # US, UK, Kenya, etc.
    filters: dict = Field(default={}, sa_column=Column(JSON))

    # Results
    status: str = Field(default="pending")  # pending, completed, failed
    result_count: int = Field(default=0)
    processing_time_seconds: Optional[float] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="research_queries")
    results: list["ResearchResult"] = Relationship(back_populates="query")


class ResearchResult(SQLModel, table=True):
    """Individual legal research results (cases, statutes, etc.)"""
    __tablename__ = "research_results"

    id: Optional[int] = Field(default=None, primary_key=True)
    result_id: str = Field(unique=True, index=True)  # res_xxx
    query_id: str = Field(foreign_key="research_queries.query_id", index=True)

    # Document details
    title: str = Field(sa_column=Column(Text))
    citation: str  # e.g., "Brown v. Board of Ed., 347 U.S. 483 (1954)"
    document_type: str  # case, statute, regulation, treaty, article
    jurisdiction: Optional[str] = None
    court: Optional[str] = None  # For cases
    date_decided: Optional[str] = None

    # Content
    summary: str = Field(sa_column=Column(Text))
    key_points: list[str] = Field(default=[], sa_column=Column(JSON))
    relevance_score: float = Field(default=0.0)  # 0-10
    full_text_url: Optional[str] = None

    # Metadata
    judges: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    parties: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    topics: list[str] = Field(default=[], sa_column=Column(JSON))

    # AI analysis
    ai_summary: Optional[str] = Field(default=None, sa_column=Column(Text))
    precedent_value: Optional[str] = None  # binding, persuasive, informational

    # User actions
    is_saved: bool = Field(default=False)
    is_cited: bool = Field(default=False)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    query: ResearchQuery = Relationship(back_populates="results")
    citations: list["Citation"] = Relationship(back_populates="result")


class Citation(SQLModel, table=True):
    """Saved citations for future reference"""
    __tablename__ = "citations"

    id: Optional[int] = Field(default=None, primary_key=True)
    citation_id: str = Field(unique=True, index=True)  # cit_xxx
    user_id: int = Field(foreign_key="users.id", index=True)
    result_id: Optional[str] = Field(default=None, foreign_key="research_results.result_id", index=True)

    # Citation details
    citation_text: str  # Formatted citation
    document_type: str
    title: str = Field(sa_column=Column(Text))

    # Organization
    tags: list[str] = Field(default=[], sa_column=Column(JSON))
    folder: Optional[str] = None  # For organization
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Usage tracking
    times_used: int = Field(default=0)
    last_used_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="citations")
    result: Optional[ResearchResult] = Relationship(back_populates="citations")


class ResearchTemplate(SQLModel, table=True):
    """Pre-defined research query templates for common scenarios"""
    __tablename__ = "research_templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(unique=True, index=True)  # rtp_xxx

    # Template details
    name: str
    description: str = Field(sa_column=Column(Text))
    category: str  # contract_law, employment, ip, corporate, etc.
    query_type: str

    # Template parameters
    query_template: str = Field(sa_column=Column(Text))
    suggested_filters: dict = Field(default={}, sa_column=Column(JSON))
    jurisdictions: list[str] = Field(default=[], sa_column=Column(JSON))

    # Usage
    is_public: bool = Field(default=True)
    times_used: int = Field(default=0)

    created_at: datetime = Field(default_factory=datetime.utcnow)
