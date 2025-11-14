"""
Intake Triage Schemas

Request/response schemas for client intake and matter categorization.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from decimal import Decimal


# ===== Client Intake Schemas =====

class ClientIntakeCreate(BaseModel):
    """Create new client intake"""
    client_name: str
    client_email: EmailStr
    client_phone: Optional[str] = None
    company: Optional[str] = None
    is_existing_client: bool = False

    # Matter details
    matter_title: str
    matter_description: str
    matter_type: str
    practice_area: str

    # Priority
    urgency: str = "medium"
    complexity: str = "moderate"
    estimated_value: Optional[float] = None
    deadline: Optional[datetime] = None
    deadline_description: Optional[str] = None

    # Additional info
    source: str = "web_form"
    referral_source: Optional[str] = None
    attached_contract_ids: list[str] = []


class ClientIntakeUpdate(BaseModel):
    """Update existing intake"""
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    urgency: Optional[str] = None
    complexity: Optional[str] = None
    priority_score: Optional[float] = None
    internal_notes: Optional[str] = None
    conflict_check_status: Optional[str] = None
    conflict_check_passed: Optional[bool] = None


class ClientIntakeResponse(BaseModel):
    """Client intake response"""
    id: int
    intake_id: str
    user_id: int

    # Client info
    client_name: str
    client_email: str
    client_phone: Optional[str]
    company: Optional[str]
    is_existing_client: bool

    # Matter details
    matter_title: str
    matter_description: str
    matter_type: str
    practice_area: str

    # Classification
    urgency: str
    complexity: str
    estimated_value: Optional[float]
    deadline: Optional[datetime]
    priority_score: float

    # AI analysis
    ai_category: Optional[str]
    ai_practice_area: Optional[str]
    ai_complexity: Optional[str]
    ai_urgency: Optional[str]
    confidence_score: Optional[float]
    ai_recommendations: list[str]
    recommended_lawyers: list[dict]
    risk_factors: list[str]

    # Status
    status: str
    assigned_to: Optional[int]
    assigned_by: Optional[int]

    # Conflict check
    conflict_check_status: str
    conflict_check_required: bool
    conflict_check_passed: Optional[bool]

    # Processing
    processing_time_seconds: Optional[float]

    # Timestamps
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime]
    assigned_at: Optional[datetime]
    accepted_at: Optional[datetime]


class IntakeAnalysisResponse(BaseModel):
    """AI analysis results for intake"""
    intake_id: str

    # AI categorization
    suggested_category: str
    suggested_practice_area: str
    suggested_urgency: str
    suggested_complexity: str
    confidence_score: float

    # Risk assessment
    risk_level: str
    risk_factors: list[str]
    risk_notes: str

    # Recommendations
    recommended_actions: list[str]
    recommended_lawyers: list[dict]
    estimated_duration_days: Optional[int]
    estimated_fee_range: Optional[dict]

    # Priority calculation
    calculated_priority: float
    priority_factors: dict

    processing_time_seconds: float


class IntakeAssignRequest(BaseModel):
    """Assign intake to lawyer"""
    assigned_to: int
    assignment_reason: str
    priority_override: Optional[int] = None
    deadline_override: Optional[datetime] = None
    notes: Optional[str] = None


class IntakeAssignResponse(BaseModel):
    """Assignment response"""
    assignment_id: str
    intake_id: str
    assigned_to: int
    assigned_by: int
    assignment_reason: str
    status: str
    created_at: datetime


# ===== Matter Type Schemas =====

class MatterTypeCreate(BaseModel):
    """Create new matter type"""
    name: str
    display_name: str
    description: str
    category: str
    typical_urgency: str = "medium"
    typical_complexity: str = "moderate"
    average_duration_days: Optional[int] = None
    keywords: list[str] = []
    required_documents: list[str] = []
    standard_checklist: list[str] = []
    typical_workflow_stages: list[str] = []
    estimated_fee_range_min: Optional[float] = None
    estimated_fee_range_max: Optional[float] = None
    fee_structure: Optional[str] = None
    requires_specialization: bool = False
    specialization_required: Optional[str] = None


class MatterTypeResponse(BaseModel):
    """Matter type response"""
    id: int
    type_id: str
    name: str
    display_name: str
    description: str
    category: str
    typical_urgency: str
    typical_complexity: str
    average_duration_days: Optional[int]
    keywords: list[str]
    required_documents: list[str]
    standard_checklist: list[str]
    typical_workflow_stages: list[str]
    estimated_fee_range_min: Optional[float]
    estimated_fee_range_max: Optional[float]
    fee_structure: Optional[str]
    requires_specialization: bool
    specialization_required: Optional[str]
    intake_count: int
    is_active: bool
    created_at: datetime


# ===== Lawyer Specialization Schemas =====

class LawyerSpecializationCreate(BaseModel):
    """Create lawyer specialization profile"""
    specialization: str
    proficiency_level: str = "intermediate"
    years_experience: Optional[int] = None
    max_capacity: int = 10
    is_accepting_new_matters: bool = True
    preferred_matter_types: list[str] = []
    preferred_client_types: list[str] = []
    minimum_matter_value: Optional[float] = None
    availability_notes: Optional[str] = None


class LawyerSpecializationUpdate(BaseModel):
    """Update lawyer specialization"""
    proficiency_level: Optional[str] = None
    years_experience: Optional[int] = None
    current_workload: Optional[int] = None
    max_capacity: Optional[int] = None
    is_accepting_new_matters: Optional[bool] = None
    is_available: Optional[bool] = None
    availability_notes: Optional[str] = None


class LawyerSpecializationResponse(BaseModel):
    """Lawyer specialization response"""
    id: int
    user_id: int
    specialization: str
    proficiency_level: str
    years_experience: Optional[int]
    current_workload: int
    max_capacity: int
    is_accepting_new_matters: bool
    preferred_matter_types: list[str]
    preferred_client_types: list[str]
    minimum_matter_value: Optional[float]
    matters_handled: int
    average_rating: Optional[float]
    completion_rate: Optional[float]
    is_available: bool
    availability_notes: Optional[str]
    created_at: datetime
    updated_at: datetime


# ===== Routing Rule Schemas =====

class RoutingRuleCreate(BaseModel):
    """Create routing rule"""
    name: str
    description: str
    priority: int = 100
    conditions: dict
    action: str
    action_params: dict
    is_active: bool = True


class RoutingRuleResponse(BaseModel):
    """Routing rule response"""
    id: int
    rule_id: str
    user_id: int
    name: str
    description: str
    priority: int
    conditions: dict
    action: str
    action_params: dict
    is_active: bool
    created_at: datetime


# ===== Intake Note Schemas =====

class IntakeNoteCreate(BaseModel):
    """Create intake note"""
    note_text: str
    note_type: str = "general"


class IntakeNoteResponse(BaseModel):
    """Intake note response"""
    id: int
    note_id: str
    intake_id: str
    user_id: int
    note_text: str
    note_type: str
    created_at: datetime


# ===== List/Filter Schemas =====

class IntakeListFilters(BaseModel):
    """Filters for listing intakes"""
    status: Optional[str] = None
    matter_type: Optional[str] = None
    practice_area: Optional[str] = None
    urgency: Optional[str] = None
    complexity: Optional[str] = None
    assigned_to: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0


class IntakeListResponse(BaseModel):
    """Paginated intake list"""
    intakes: list[ClientIntakeResponse]
    total: int
    limit: int
    offset: int


# ===== Statistics Schemas =====

class IntakeStatistics(BaseModel):
    """Intake statistics"""
    total_intakes: int
    pending_intakes: int
    assigned_intakes: int
    completed_intakes: int
    declined_intakes: int

    by_matter_type: dict[str, int]
    by_practice_area: dict[str, int]
    by_urgency: dict[str, int]
    by_complexity: dict[str, int]

    average_processing_time_seconds: float
    average_response_time_hours: float

    conflict_checks_required: int
    conflict_checks_passed: int
    conflict_checks_failed: int
