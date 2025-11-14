"""
Drafting Assistant Models

Models for contract templates and AI-generated contracts.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, Text, JSON


class ContractTemplate(SQLModel, table=True):
    """Pre-defined contract templates"""
    __tablename__ = "contract_templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(unique=True, index=True)  # tpl_xxx
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    # Template details
    name: str
    description: str = Field(sa_column=Column(Text))
    category: str  # employment, nda, vendor, service, lease, etc.
    jurisdiction: str = Field(default="US")

    # Template content
    template_text: str = Field(sa_column=Column(Text))  # With {{placeholders}}
    variables: list[dict] = Field(default=[], sa_column=Column(JSON))  # [{name, type, description, required}]

    # Clauses included
    included_clauses: list[str] = Field(default=[], sa_column=Column(JSON))  # Clause IDs
    optional_clauses: list[str] = Field(default=[], sa_column=Column(JSON))

    # Metadata
    is_public: bool = Field(default=False)
    is_approved: bool = Field(default=False)
    version: int = Field(default=1)
    times_used: int = Field(default=0)

    # Tags and search
    tags: list[str] = Field(default=[], sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="contract_templates")
    generated_contracts: list["GeneratedContract"] = Relationship(back_populates="template")


class GeneratedContract(SQLModel, table=True):
    """AI-generated contracts from templates"""
    __tablename__ = "generated_contracts"

    id: Optional[int] = Field(default=None, primary_key=True)
    generated_id: str = Field(unique=True, index=True)  # gen_xxx
    user_id: int = Field(foreign_key="users.id", index=True)
    template_id: str = Field(foreign_key="contract_templates.template_id", index=True)

    # Generation details
    name: str  # e.g., "Employment Agreement - John Doe"
    category: str

    # Input data
    variable_values: dict = Field(default={}, sa_column=Column(JSON))  # User-provided values
    selected_clauses: list[str] = Field(default=[], sa_column=Column(JSON))  # Selected optional clauses

    # Generated output
    generated_text: str = Field(sa_column=Column(Text))
    status: str = Field(default="draft")  # draft, finalized, signed

    # AI enhancements
    ai_suggestions: list[dict] = Field(default=[], sa_column=Column(JSON))  # Suggested improvements
    risk_analysis: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # File management
    file_format: str = Field(default="docx")  # docx, pdf
    file_url: Optional[str] = None

    # Editing history
    edit_count: int = Field(default=0)
    last_edited_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship()
    template: ContractTemplate = Relationship(back_populates="generated_contracts")


class DraftingSession(SQLModel, table=True):
    """Track drafting sessions for analytics"""
    __tablename__ = "drafting_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True)  # ses_xxx
    user_id: int = Field(foreign_key="users.id", index=True)
    template_id: str = Field(foreign_key="contract_templates.template_id", index=True)

    # Session details
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    abandoned: bool = Field(default=False)

    # Progress tracking
    steps_completed: int = Field(default=0)
    total_steps: int = Field(default=0)

    # Output
    generated_contract_id: Optional[str] = Field(default=None, foreign_key="generated_contracts.generated_id")

    # Relationships
    user: "User" = Relationship()
