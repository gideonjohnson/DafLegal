from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from enum import Enum


class RuleType(str, Enum):
    """Type of compliance rule"""
    REQUIRED_CLAUSE = "required_clause"
    PROHIBITED_CLAUSE = "prohibited_clause"
    REQUIRED_TERM = "required_term"
    PROHIBITED_TERM = "prohibited_term"
    NUMERIC_THRESHOLD = "numeric_threshold"
    DATE_REQUIREMENT = "date_requirement"
    PARTY_REQUIREMENT = "party_requirement"
    CUSTOM_PATTERN = "custom_pattern"


class RuleSeverity(str, Enum):
    """Severity of rule violation"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ComplianceStatus(str, Enum):
    """Compliance check status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIAL_COMPLIANT = "partial_compliant"
    FAILED = "failed"


class Playbook(SQLModel, table=True):
    """Company policy/playbook document"""
    __tablename__ = "playbooks"

    id: Optional[int] = Field(default=None, primary_key=True)
    playbook_id: str = Field(unique=True, index=True)  # Public ID (plb_xxx)
    user_id: int = Field(foreign_key="users.id", index=True)
    organization_id: Optional[int] = None

    # Basic information
    name: str = Field(index=True)
    description: Optional[str] = None
    version: str = Field(default="1.0")

    # Document storage
    s3_key: Optional[str] = None  # Original document in S3
    extracted_text: Optional[str] = None  # Extracted policy text

    # Metadata
    document_type: str = Field(default="general")  # e.g., "vendor", "employment", "nda"
    jurisdiction: Optional[str] = None
    effective_date: Optional[datetime] = None
    tags: List[str] = Field(default=[], sa_column=Column(JSON))

    # Status
    is_active: bool = Field(default=True)
    is_default: bool = Field(default=False)  # Default playbook for organization

    # Statistics
    rule_count: int = Field(default=0)
    usage_count: int = Field(default=0)
    last_used_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="playbooks")
    rules: List["ComplianceRule"] = Relationship(back_populates="playbook")


class ComplianceRule(SQLModel, table=True):
    """Individual compliance rule within a playbook"""
    __tablename__ = "compliance_rules"

    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(unique=True, index=True)  # Public ID (rul_xxx)
    playbook_id: int = Field(foreign_key="playbooks.id", index=True)

    # Rule definition
    name: str
    description: str
    rule_type: RuleType = Field(index=True)
    severity: RuleSeverity = Field(default=RuleSeverity.MEDIUM)

    # Rule parameters (JSON for flexibility)
    parameters: dict = Field(default={}, sa_column=Column(JSON))
    # Examples:
    # - required_clause: {"category": "termination", "must_contain": "30 days notice"}
    # - prohibited_term: {"terms": ["perpetual", "unlimited liability"]}
    # - numeric_threshold: {"field": "liability_cap", "min": 100000, "max": 1000000}

    # Validation
    pattern: Optional[str] = None  # Regex pattern for custom rules
    expected_value: Optional[str] = None

    # Actions
    auto_fix: bool = Field(default=False)
    auto_fix_suggestion: Optional[str] = None
    replacement_text: Optional[str] = None  # Specific text to replace violating segment
    replacement_clause_id: Optional[str] = None  # ID of a clause from Clause Library to insert
    redline_instruction: Optional[str] = None  # Natural language instruction for AI to generate a fix

    # Status
    is_active: bool = Field(default=True)

    # Usage tracking
    violation_count: int = Field(default=0)
    last_triggered_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    playbook: Playbook = Relationship(back_populates="rules")


class ComplianceCheck(SQLModel, table=True):
    """Compliance check run on a contract"""
    __tablename__ = "compliance_checks"

    id: Optional[int] = Field(default=None, primary_key=True)
    check_id: str = Field(unique=True, index=True)  # Public ID (chk_xxx)
    user_id: int = Field(foreign_key="users.id", index=True)

    # References
    contract_id: int = Field(foreign_key="contracts.id", index=True)
    playbook_id: int = Field(foreign_key="playbooks.id", index=True)

    # Status
    status: ComplianceStatus = Field(default=ComplianceStatus.PENDING)
    error_message: Optional[str] = None

    # Results summary
    overall_status: ComplianceStatus = Field(default=ComplianceStatus.PENDING)
    compliance_score: Optional[float] = None  # 0-100 percentage
    rules_checked: int = Field(default=0)
    rules_passed: int = Field(default=0)
    rules_failed: int = Field(default=0)
    rules_warning: int = Field(default=0)

    # Detailed results
    violations: List[dict] = Field(default=[], sa_column=Column(JSON))
    # [{
    #   "rule_id": "rul_xxx",
    #   "rule_name": "Required Termination Clause",
    #   "severity": "high",
    #   "status": "failed",
    #   "message": "Contract missing termination clause",
    #   "location": "Section 5",
    #   "suggestion": "Add termination clause with 30 days notice"
    # }]

    passed_rules: List[dict] = Field(default=[], sa_column=Column(JSON))
    warnings: List[dict] = Field(default=[], sa_column=Column(JSON))

    # Summary
    executive_summary: Optional[str] = None
    recommendations: List[str] = Field(default=[], sa_column=Column(JSON))

    # Metadata
    processing_time_seconds: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

    # Relationships
    user: "User" = Relationship()


class ComplianceException(SQLModel, table=True):
    """Exceptions granted for specific rule violations"""
    __tablename__ = "compliance_exceptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    exception_id: str = Field(unique=True, index=True)  # Public ID (exc_xxx)

    # References
    user_id: int = Field(foreign_key="users.id", index=True)
    contract_id: int = Field(foreign_key="contracts.id", index=True)
    rule_id: int = Field(foreign_key="compliance_rules.id", index=True)

    # Exception details
    reason: str
    granted_by: Optional[str] = None  # Name/email of approver
    approved_at: Optional[datetime] = None

    # Expiration
    expires_at: Optional[datetime] = None
    is_permanent: bool = Field(default=False)

    # Status
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceTemplate(SQLModel, table=True):
    """Pre-built compliance rule templates"""
    __tablename__ = "compliance_templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: str = Field(unique=True, index=True)  # Public ID (tpl_xxx)

    # Template information
    name: str
    description: str
    category: str = Field(index=True)  # e.g., "vendor", "employment", "data_privacy"

    # Template rules
    rules: List[dict] = Field(default=[], sa_column=Column(JSON))
    # Pre-defined rules that can be applied to a playbook

    # Metadata
    is_public: bool = Field(default=True)
    created_by: Optional[int] = Field(default=None, foreign_key="users.id")
    usage_count: int = Field(default=0)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
