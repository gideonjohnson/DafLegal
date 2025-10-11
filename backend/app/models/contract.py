from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON
from enum import Enum


class ContractStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Contract(SQLModel, table=True):
    """Uploaded contract document"""
    __tablename__ = "contracts"

    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: str = Field(unique=True, index=True)  # Public ID (ctr_xxx)
    user_id: int = Field(foreign_key="users.id", index=True)

    # File information
    filename: str
    file_size_bytes: int
    file_type: str  # pdf, docx
    s3_key: str

    # Processing status
    status: ContractStatus = Field(default=ContractStatus.UPLOADED)
    error_message: Optional[str] = None

    # Extracted metadata
    page_count: Optional[int] = None
    word_count: Optional[int] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

    # Relationships
    from sqlmodel import Relationship
    user: "User" = Relationship(back_populates="contracts")
    analysis: Optional["ContractAnalysis"] = Relationship(back_populates="contract")


class ContractAnalysis(SQLModel, table=True):
    """AI analysis results for a contract"""
    __tablename__ = "contract_analyses"

    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: int = Field(foreign_key="contracts.id", unique=True, index=True)

    # Summary
    executive_summary: list = Field(sa_column=Column(JSON))  # List of bullet points

    # Key terms
    parties: list = Field(sa_column=Column(JSON))
    effective_date: Optional[str] = None
    term_duration: Optional[str] = None
    payment_terms: Optional[str] = None

    # Detected clauses
    detected_clauses: list = Field(sa_column=Column(JSON))  # List of clause objects

    # Missing clauses
    missing_clauses: list = Field(sa_column=Column(JSON))

    # Risk assessment
    risk_score: float = Field(default=0.0)  # 0-10 scale
    overall_risk_level: RiskLevel = Field(default=RiskLevel.LOW)

    # Full extracted text (for reference)
    extracted_text: Optional[str] = None

    # Metadata
    processing_time_seconds: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    from sqlmodel import Relationship
    contract: Contract = Relationship(back_populates="analysis")
