"""
Intake Triage Models

Models for client intake, matter categorization, and assignment routing.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, Text, JSON
from enum import Enum


class IntakeStatus(str, Enum):
    """Status of intake submission"""
    PENDING = "pending"
    PROCESSING = "processing"
    CATEGORIZED = "categorized"
    ASSIGNED = "assigned"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"


class UrgencyLevel(str, Enum):
    """Urgency level of matter"""
    CRITICAL = "critical"  # Immediate attention (court deadline < 3 days)
    HIGH = "high"  # Urgent (deadline < 1 week)
    MEDIUM = "medium"  # Normal (deadline 1-4 weeks)
    LOW = "low"  # Non-urgent (deadline > 4 weeks)


class ComplexityLevel(str, Enum):
    """Complexity level of matter"""
    SIMPLE = "simple"  # Routine matter, junior lawyer
    MODERATE = "moderate"  # Standard matter, mid-level lawyer
    COMPLEX = "complex"  # Complex matter, senior lawyer
    HIGHLY_COMPLEX = "highly_complex"  # Very complex, partner/specialist


class ClientIntake(SQLModel, table=True):
    """Client intake submission"""
    __tablename__ = "client_intakes"

    id: Optional[int] = Field(default=None, primary_key=True)
    intake_id: str = Field(unique=True, index=True)  # int_xxx
    user_id: int = Field(foreign_key="users.id", index=True)  # Assigned lawyer/firm

    # Client information
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    company: Optional[str] = None
    is_existing_client: bool = Field(default=False)

    # Matter details
    matter_title: str
    matter_description: str = Field(sa_column=Column(Text))
    matter_type: str  # litigation, transactional, advisory, compliance, ip, employment, etc.
    practice_area: str  # contract, corporate, real_estate, family, criminal, etc.

    # Urgency and priority
    urgency: str = Field(default="medium")  # critical, high, medium, low
    complexity: str = Field(default="moderate")  # simple, moderate, complex, highly_complex
    estimated_value: Optional[float] = None  # Estimated matter value
    deadline: Optional[datetime] = None
    deadline_description: Optional[str] = None

    # Status and routing
    status: str = Field(default="pending")  # pending, processing, categorized, assigned, accepted, declined, completed
    priority_score: float = Field(default=50.0)  # 0-100 calculated priority
    assigned_to: Optional[int] = Field(default=None, foreign_key="users.id")  # Assigned lawyer
    assigned_by: Optional[int] = Field(default=None, foreign_key="users.id")  # Who assigned

    # AI analysis
    ai_category: Optional[str] = None  # AI-suggested category
    ai_practice_area: Optional[str] = None
    ai_complexity: Optional[str] = None  # AI-suggested complexity
    ai_urgency: Optional[str] = None  # AI-suggested urgency
    ai_risk_assessment: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    ai_recommendations: list[str] = Field(default=[], sa_column=Column(JSON))
    recommended_lawyers: list[dict] = Field(default=[], sa_column=Column(JSON))
    # [{"user_id": 123, "name": "John Doe", "specialization": "Conveyancing", "match_score": 85}]
    confidence_score: Optional[float] = None  # 0-100 AI confidence
    risk_factors: list[str] = Field(default=[], sa_column=Column(JSON))

    # Conflict checking
    conflict_check_status: str = Field(default="pending")  # pending, clear, conflict_found
    conflict_check_required: bool = Field(default=True)
    conflict_check_passed: Optional[bool] = None
    conflict_details: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Additional information
    source: str = Field(default="web_form")  # web_form, email, phone, referral
    referral_source: Optional[str] = None
    attachments: list[str] = Field(default=[], sa_column=Column(JSON))  # File URLs
    attached_contract_ids: list[str] = Field(default=[], sa_column=Column(JSON))

    # Processing
    processing_time_seconds: Optional[float] = None
    ai_analysis: Optional[str] = Field(default=None, sa_column=Column(Text))  # Full AI analysis
    internal_notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    assigned_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None

    # Relationships
    user: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "[ClientIntake.user_id]"})  # Firm/intake recipient
    notes: list["IntakeNote"] = Relationship(back_populates="intake")


class IntakeNote(SQLModel, table=True):
    """Notes on intake submissions"""
    __tablename__ = "intake_notes"

    id: Optional[int] = Field(default=None, primary_key=True)
    note_id: str = Field(unique=True, index=True)  # note_xxx
    intake_id: str = Field(foreign_key="client_intakes.intake_id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    note_text: str = Field(sa_column=Column(Text))
    note_type: str = Field(default="general")  # general, conflict, risk, follow_up

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    intake: ClientIntake = Relationship(back_populates="notes")
    user: "User" = Relationship()


class RoutingRule(SQLModel, table=True):
    """Automated routing rules for intake assignment"""
    __tablename__ = "routing_rules"

    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(unique=True, index=True)  # rule_xxx
    user_id: int = Field(foreign_key="users.id", index=True)  # Firm owner

    # Rule details
    name: str
    description: str = Field(sa_column=Column(Text))
    priority: int = Field(default=100)  # Lower number = higher priority

    # Conditions (all must match)
    conditions: dict = Field(default={}, sa_column=Column(JSON))
    # Example: {"matter_type": "litigation", "practice_area": "contract", "urgency": ["critical", "high"]}

    # Action
    action: str  # assign_to, notify, reject, tag
    action_params: dict = Field(default={}, sa_column=Column(JSON))
    # Example: {"assign_to": user_id, "notify": [email1, email2]}

    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship()


class MatterType(SQLModel, table=True):
    """Pre-defined matter types for categorization"""
    __tablename__ = "matter_types"

    id: Optional[int] = Field(default=None, primary_key=True)
    type_id: str = Field(unique=True, index=True)  # mtp_xxx

    # Type information
    name: str = Field(unique=True, index=True)
    display_name: str
    description: str = Field(sa_column=Column(Text))
    category: str = Field(index=True)  # e.g., "real_estate", "corporate", "litigation"

    # Classification defaults
    typical_urgency: str = Field(default="medium")
    typical_complexity: str = Field(default="moderate")
    average_duration_days: Optional[int] = None

    # Detection keywords
    keywords: list[str] = Field(default=[], sa_column=Column(JSON))
    patterns: list[str] = Field(default=[], sa_column=Column(JSON))

    # Requirements
    required_documents: list[str] = Field(default=[], sa_column=Column(JSON))
    standard_checklist: list[str] = Field(default=[], sa_column=Column(JSON))

    # Workflow
    typical_workflow_stages: list[str] = Field(default=[], sa_column=Column(JSON))

    # Pricing
    estimated_fee_range_min: Optional[float] = None
    estimated_fee_range_max: Optional[float] = None
    fee_structure: Optional[str] = None  # "fixed", "hourly", "percentage"

    # Metadata
    is_active: bool = Field(default=True)
    requires_specialization: bool = Field(default=False)
    specialization_required: Optional[str] = None
    intake_count: int = Field(default=0)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class LawyerSpecialization(SQLModel, table=True):
    """Lawyer specializations and availability for intelligent routing"""
    __tablename__ = "lawyer_specializations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    # Specialization
    specialization: str = Field(index=True)  # e.g., "conveyancing", "corporate", "litigation"
    proficiency_level: str = Field(default="intermediate")  # junior, intermediate, senior, expert
    years_experience: Optional[int] = None

    # Capacity
    current_workload: int = Field(default=0)  # Number of active matters
    max_capacity: int = Field(default=10)  # Maximum concurrent matters
    is_accepting_new_matters: bool = Field(default=True)

    # Preferences
    preferred_matter_types: list[str] = Field(default=[], sa_column=Column(JSON))
    preferred_client_types: list[str] = Field(default=[], sa_column=Column(JSON))
    minimum_matter_value: Optional[float] = None

    # Performance metrics
    matters_handled: int = Field(default=0)
    average_rating: Optional[float] = None
    completion_rate: Optional[float] = None

    # Availability
    is_available: bool = Field(default=True)
    availability_notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IntakeAssignment(SQLModel, table=True):
    """Assignment history tracking"""
    __tablename__ = "intake_assignments"

    id: Optional[int] = Field(default=None, primary_key=True)
    assignment_id: str = Field(unique=True, index=True)  # asn_xxx

    # References
    intake_id: str = Field(foreign_key="client_intakes.intake_id", index=True)
    assigned_to: int = Field(foreign_key="users.id", index=True)  # Lawyer
    assigned_by: int = Field(foreign_key="users.id", index=True)  # Admin/system

    # Assignment details
    assignment_reason: str = Field(sa_column=Column(Text))
    priority_override: Optional[int] = None
    deadline_override: Optional[datetime] = None

    # Response
    status: str = Field(default="pending")  # pending, accepted, declined, reassigned
    accepted_at: Optional[datetime] = None
    declined_at: Optional[datetime] = None
    decline_reason: Optional[str] = Field(default=None, sa_column=Column(Text))
    response_time_hours: Optional[float] = None

    # Status
    is_active: bool = Field(default=True)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
