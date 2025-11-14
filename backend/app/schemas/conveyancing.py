"""
Conveyancing Schemas

Request/response schemas for property conveyancing transactions in Kenya.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


# ===== Transaction Schemas =====

class ConveyancingTransactionCreate(BaseModel):
    """Create new conveyancing transaction"""
    transaction_type: str
    transaction_title: str
    reference_number: Optional[str] = None

    # Property
    property_id: Optional[int] = None

    # Parties
    client_role: str  # buyer, seller, transferor, transferee
    other_party_name: Optional[str] = None
    other_party_email: Optional[str] = None
    other_party_lawyer: Optional[str] = None

    # Financial
    purchase_price: Optional[Decimal] = None
    deposit_amount: Optional[Decimal] = None

    # Dates
    target_completion_date: Optional[datetime] = None

    # Compliance
    land_control_consent_required: bool = False

    # Notes
    client_instructions: Optional[str] = None


class ConveyancingTransactionUpdate(BaseModel):
    """Update transaction"""
    status: Optional[str] = None
    current_stage: Optional[str] = None
    progress_percentage: Optional[int] = None
    purchase_price: Optional[Decimal] = None
    target_completion_date: Optional[datetime] = None
    internal_notes: Optional[str] = None


class ConveyancingTransactionResponse(BaseModel):
    """Transaction response"""
    id: int
    transaction_id: str
    user_id: int

    # Basics
    transaction_type: str
    transaction_title: str
    reference_number: Optional[str]

    # Property
    property_id: Optional[int]

    # Parties
    client_role: str
    other_party_name: Optional[str]
    other_party_lawyer: Optional[str]

    # Financial
    purchase_price: Optional[Decimal]
    deposit_amount: Optional[Decimal]
    balance_amount: Optional[Decimal]
    stamp_duty_amount: Optional[Decimal]
    legal_fees: Optional[Decimal]
    total_cost: Optional[Decimal]

    # Workflow
    status: str
    current_stage: str
    progress_percentage: int

    # Dates
    instruction_date: datetime
    target_completion_date: Optional[datetime]
    actual_completion_date: Optional[datetime]

    # Progress tracking
    milestones_completed: list[str]
    pending_tasks: list[str]

    # Due diligence
    due_diligence_status: str
    searches_completed: int
    searches_total: int
    issues_identified: int
    critical_issues: int

    # Documents
    documents_generated: int
    documents_executed: int
    documents_pending: list[str]

    # Compliance
    land_control_consent_required: bool
    land_control_consent_obtained: bool
    stamp_duty_paid: bool
    capital_gains_tax_cleared: bool
    rates_clearance_obtained: bool
    land_rent_cleared: bool

    # Risk
    risk_level: str
    risk_factors: list[str]

    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]


# ===== Property Schemas =====

class PropertyCreate(BaseModel):
    """Create property record"""
    # Location
    county: str
    sub_county: Optional[str] = None
    physical_address: str
    plot_number: Optional[str] = None
    lr_number: Optional[str] = None

    # Title
    title_number: str
    title_type: str
    land_tenure: str
    registration_date: Optional[datetime] = None

    # Details
    property_type: str
    property_description: str
    land_area: Optional[str] = None
    land_area_sqm: Optional[float] = None
    land_use: Optional[str] = None

    # Leasehold specific
    is_leasehold: bool = False
    lease_term_years: Optional[int] = None
    lease_expiry_date: Optional[datetime] = None
    ground_rent_annual: Optional[Decimal] = None

    # Owner
    current_owner_name: Optional[str] = None
    current_owner_id_number: Optional[str] = None
    current_owner_kra_pin: Optional[str] = None

    # Encumbrances
    has_encumbrances: bool = False
    encumbrances: list[dict] = []

    # Valuation
    market_value: Optional[Decimal] = None


class PropertyResponse(BaseModel):
    """Property response"""
    id: int
    property_id: str

    # Location
    county: str
    sub_county: Optional[str]
    physical_address: str
    plot_number: Optional[str]
    lr_number: Optional[str]

    # Title
    title_number: str
    title_type: str
    land_tenure: str
    registration_date: Optional[datetime]

    # Details
    property_type: str
    property_description: str
    land_area: Optional[str]
    land_area_sqm: Optional[float]
    land_use: Optional[str]

    # Leasehold
    is_leasehold: bool
    lease_term_years: Optional[int]
    lease_expiry_date: Optional[datetime]
    ground_rent_annual: Optional[Decimal]

    # Owner
    current_owner_name: Optional[str]
    current_owner_kra_pin: Optional[str]

    # Encumbrances
    has_encumbrances: bool
    encumbrances: list[dict]
    has_restrictions: bool
    restrictions: list[str]

    # Valuation
    last_valuation_amount: Optional[Decimal]
    market_value: Optional[Decimal]

    # Rates
    annual_rates: Optional[Decimal]
    rates_arrears: Optional[Decimal]
    land_rent_arrears: Optional[Decimal]

    # Verification
    is_verified: bool
    verification_date: Optional[datetime]

    # Timestamps
    created_at: datetime
    updated_at: datetime


# ===== Party Schemas =====

class TransactionPartyCreate(BaseModel):
    """Add party to transaction"""
    party_type: str
    party_role: str
    is_our_client: bool = False

    full_name: str
    id_number: Optional[str] = None
    kra_pin: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    postal_address: Optional[str] = None

    # Company (if applicable)
    company_name: Optional[str] = None
    company_registration_number: Optional[str] = None

    # Lawyer
    has_lawyer: bool = False
    lawyer_name: Optional[str] = None
    lawyer_firm: Optional[str] = None


class TransactionPartyResponse(BaseModel):
    """Party response"""
    id: int
    party_id: str
    transaction_id: int

    party_type: str
    party_role: str
    is_our_client: bool

    full_name: str
    id_number: Optional[str]
    kra_pin: Optional[str]
    email: Optional[str]
    phone: Optional[str]

    company_name: Optional[str]

    has_lawyer: bool
    lawyer_name: Optional[str]
    lawyer_firm: Optional[str]

    kyc_completed: bool
    documents_submitted: bool

    created_at: datetime


# ===== Milestone Schemas =====

class TransactionMilestoneCreate(BaseModel):
    """Create milestone"""
    name: str
    description: str
    stage: str
    sequence_order: int
    is_critical: bool = False
    target_date: Optional[datetime] = None
    assigned_to: Optional[int] = None


class TransactionMilestoneUpdate(BaseModel):
    """Update milestone"""
    status: Optional[str] = None
    progress_percentage: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionMilestoneResponse(BaseModel):
    """Milestone response"""
    id: int
    milestone_id: str
    transaction_id: int

    name: str
    description: str
    stage: str
    sequence_order: int

    status: str
    is_critical: bool
    is_blocking: bool

    target_date: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    days_to_complete: Optional[int]

    assigned_to: Optional[int]
    progress_percentage: int
    notes: Optional[str]

    created_at: datetime
    updated_at: datetime


# ===== Official Search Schemas =====

class OfficialSearchCreate(BaseModel):
    """Create official search record"""
    search_type: str
    search_name: str
    description: str
    issuing_authority: str
    authority_location: Optional[str] = None


class OfficialSearchUpdate(BaseModel):
    """Update search record"""
    status: Optional[str] = None
    application_date: Optional[datetime] = None
    application_reference: Optional[str] = None
    result_received_date: Optional[datetime] = None
    result_summary: Optional[str] = None
    issues_found: Optional[list[str]] = None
    has_issues: Optional[bool] = None
    severity: Optional[str] = None
    official_fee: Optional[Decimal] = None


class OfficialSearchResponse(BaseModel):
    """Search response"""
    id: int
    search_id: str
    transaction_id: int

    search_type: str
    search_name: str
    description: str
    issuing_authority: str

    status: str
    application_date: Optional[datetime]
    application_reference: Optional[str]
    result_received_date: Optional[datetime]
    result_summary: Optional[str]

    issues_found: list[str]
    has_issues: bool
    severity: Optional[str]

    search_certificate_url: Optional[str]
    official_fee: Optional[Decimal]
    paid_date: Optional[datetime]

    valid_from: Optional[datetime]
    valid_until: Optional[datetime]
    is_expired: bool

    created_at: datetime
    updated_at: datetime


# ===== Document Schemas =====

class ConveyancingDocumentCreate(BaseModel):
    """Generate conveyancing document"""
    document_type: str
    document_name: str
    description: Optional[str] = None
    template_id: Optional[str] = None
    document_format: str = "pdf"


class ConveyancingDocumentResponse(BaseModel):
    """Document response"""
    id: int
    document_id: str
    transaction_id: int

    document_type: str
    document_name: str
    description: Optional[str]
    document_url: Optional[str]
    document_format: str
    version: int
    is_final: bool

    status: str
    generated_at: datetime
    approved_at: Optional[datetime]
    executed_at: Optional[datetime]

    requires_execution: bool
    executed_by: list[str]
    witness_names: list[str]

    requires_registration: bool
    registration_date: Optional[datetime]
    registration_number: Optional[str]

    file_size_bytes: Optional[int]
    page_count: Optional[int]

    created_at: datetime


# ===== Stamp Duty Schemas =====

class StampDutyCalculationRequest(BaseModel):
    """Calculate stamp duty"""
    property_value: Decimal
    property_type: str
    property_location: str
    is_first_time_buyer: bool = False
    is_affordable_housing: bool = False
    requires_cgt: bool = False


class StampDutyCalculationResponse(BaseModel):
    """Stamp duty calculation result"""
    id: int
    calculation_id: str
    transaction_id: int

    property_value: Decimal
    property_type: str
    property_location: str
    is_first_time_buyer: bool
    is_affordable_housing: bool

    stamp_duty_rate: Decimal
    stamp_duty_amount: Decimal

    registration_fee: Decimal
    search_fees: Decimal
    consent_fees: Decimal

    requires_cgt: bool
    cgt_rate: Optional[Decimal]
    cgt_amount: Optional[Decimal]

    total_government_charges: Decimal
    total_legal_fees: Decimal
    total_cost: Decimal

    stamp_duty_paid: bool
    payment_date: Optional[datetime]
    payment_reference: Optional[str]

    calculated_at: datetime


# ===== Checklist Schemas =====

class ConveyancingChecklistCreate(BaseModel):
    """Create checklist"""
    checklist_type: str
    name: str
    description: Optional[str] = None
    items: list[dict]
    assigned_to: Optional[int] = None


class ConveyancingChecklistUpdate(BaseModel):
    """Update checklist"""
    items: Optional[list[dict]] = None
    status: Optional[str] = None
    issues_identified: Optional[list[str]] = None


class ConveyancingChecklistResponse(BaseModel):
    """Checklist response"""
    id: int
    checklist_id: str
    transaction_id: int

    checklist_type: str
    name: str
    description: Optional[str]

    items: list[dict]
    total_items: int
    completed_items: int
    progress_percentage: int

    status: str
    completed_at: Optional[datetime]

    issues_identified: list[str]
    critical_issues_count: int

    assigned_to: Optional[int]

    created_at: datetime
    updated_at: datetime


# ===== Workflow Schemas =====

class WorkflowStatusUpdate(BaseModel):
    """Update workflow status"""
    new_status: str
    new_stage: str
    notes: Optional[str] = None


class WorkflowProgressResponse(BaseModel):
    """Workflow progress overview"""
    transaction_id: str
    status: str
    current_stage: str
    progress_percentage: int

    stages: list[dict]
    # [{"stage": "instruction", "status": "completed", "completed_at": "..."}]

    milestones_completed: int
    milestones_total: int
    milestones_overdue: int

    pending_tasks: list[str]
    critical_issues: int

    estimated_completion_date: Optional[datetime]
    days_to_completion: Optional[int]


# ===== Statistics Schemas =====

class ConveyancingStatistics(BaseModel):
    """Conveyancing statistics"""
    total_transactions: int
    active_transactions: int
    completed_transactions: int
    cancelled_transactions: int

    by_transaction_type: dict[str, int]
    by_status: dict[str, int]
    by_stage: dict[str, int]

    total_property_value: Decimal
    average_transaction_days: float
    average_completion_rate: float

    searches_pending: int
    searches_with_issues: int
    documents_pending_execution: int

    stamp_duty_collected: Decimal
    legal_fees_collected: Decimal
