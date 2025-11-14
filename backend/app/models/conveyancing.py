"""
Conveyancing Models - Kenya Jurisdiction

Comprehensive models for property conveyancing transactions in Kenya,
including workflow management, due diligence, and document generation.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column, JSON, Relationship
from sqlalchemy import Text
from enum import Enum
from decimal import Decimal


class TransactionType(str, Enum):
    """Type of property transaction"""
    SALE = "sale"  # Sale of property
    PURCHASE = "purchase"  # Purchase of property
    TRANSFER = "transfer"  # Transfer (gift, inheritance)
    LEASE = "lease"  # Lease agreement
    MORTGAGE = "mortgage"  # Mortgage registration
    CHARGE = "charge"  # Charge registration
    SUBDIVISION = "subdivision"  # Land subdivision
    AMALGAMATION = "amalgamation"  # Land amalgamation


class TransactionStatus(str, Enum):
    """Status of conveyancing transaction"""
    INSTRUCTION = "instruction"  # Initial instruction received
    DUE_DILIGENCE = "due_diligence"  # Conducting searches and checks
    DRAFTING = "drafting"  # Drafting documents
    REVIEW = "review"  # Documents under review
    NEGOTIATION = "negotiation"  # Terms being negotiated
    APPROVAL = "approval"  # Awaiting approvals
    EXECUTION = "execution"  # Documents being executed
    PAYMENT = "payment"  # Payment processing
    REGISTRATION = "registration"  # Submitting for registration
    COMPLETION = "completion"  # Transaction completed
    ON_HOLD = "on_hold"  # Temporarily on hold
    CANCELLED = "cancelled"  # Transaction cancelled


class PropertyType(str, Enum):
    """Type of property in Kenya"""
    FREEHOLD = "freehold"  # Freehold title
    LEASEHOLD = "leasehold"  # Leasehold title
    AGRICULTURAL = "agricultural"  # Agricultural land
    RESIDENTIAL = "residential"  # Residential property
    COMMERCIAL = "commercial"  # Commercial property
    INDUSTRIAL = "industrial"  # Industrial property
    MIXED_USE = "mixed_use"  # Mixed use property


class LandTenure(str, Enum):
    """Land tenure type in Kenya"""
    FREEHOLD = "freehold"
    LEASEHOLD = "leasehold"
    CUSTOMARY = "customary"


class SearchType(str, Enum):
    """Types of official searches in Kenya"""
    OFFICIAL_SEARCH = "official_search"  # Land Registry official search
    RATES_CLEARANCE = "rates_clearance"  # County rates clearance
    LAND_RENT = "land_rent"  # Land rent clearance
    LAND_CONTROL = "land_control"  # Land Control Board consent
    NEMA = "nema"  # NEMA environmental clearance
    PHYSICAL_PLANNING = "physical_planning"  # County physical planning approval
    KRA_PIN = "kra_pin"  # KRA PIN verification
    TITLE_DEED = "title_deed"  # Title deed verification


class ConveyancingTransaction(SQLModel, table=True):
    """Main conveyancing transaction"""
    __tablename__ = "conveyancing_transactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    transaction_id: str = Field(unique=True, index=True)  # cvt_xxx
    user_id: int = Field(foreign_key="users.id", index=True)  # Lawyer/firm handling

    # Transaction basics
    transaction_type: str = Field(index=True)  # sale, purchase, transfer, etc.
    transaction_title: str
    reference_number: Optional[str] = Field(default=None, index=True)  # Internal ref

    # Property details
    property_id: Optional[int] = Field(default=None, foreign_key="properties.id", index=True)

    # Parties
    client_id: Optional[int] = Field(default=None, foreign_key="users.id")  # Our client
    client_role: str  # buyer, seller, transferor, transferee, lessee, lessor
    other_party_name: Optional[str] = None
    other_party_email: Optional[str] = None
    other_party_lawyer: Optional[str] = None

    # Financial details
    purchase_price: Optional[Decimal] = Field(default=None)
    deposit_amount: Optional[Decimal] = Field(default=None)
    balance_amount: Optional[Decimal] = Field(default=None)
    stamp_duty_amount: Optional[Decimal] = Field(default=None)
    legal_fees: Optional[Decimal] = Field(default=None)
    disbursements: Optional[Decimal] = Field(default=None)
    total_cost: Optional[Decimal] = Field(default=None)

    # Workflow status
    status: str = Field(default="instruction", index=True)
    current_stage: str = Field(default="instruction")
    progress_percentage: int = Field(default=0)  # 0-100

    # Important dates
    instruction_date: datetime = Field(default_factory=datetime.utcnow)
    target_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None

    # Milestones completed
    milestones_completed: list[str] = Field(default=[], sa_column=Column(JSON))
    pending_tasks: list[str] = Field(default=[], sa_column=Column(JSON))

    # Due diligence
    due_diligence_status: str = Field(default="pending")  # pending, in_progress, complete, issues_found
    searches_completed: int = Field(default=0)
    searches_total: int = Field(default=0)
    issues_identified: int = Field(default=0)
    critical_issues: int = Field(default=0)

    # Documents
    documents_generated: int = Field(default=0)
    documents_executed: int = Field(default=0)
    documents_pending: list[str] = Field(default=[], sa_column=Column(JSON))

    # Compliance (Kenya-specific)
    land_control_consent_required: bool = Field(default=False)
    land_control_consent_obtained: bool = Field(default=False)
    stamp_duty_paid: bool = Field(default=False)
    capital_gains_tax_cleared: bool = Field(default=False)
    rates_clearance_obtained: bool = Field(default=False)
    land_rent_cleared: bool = Field(default=False)

    # Risk assessment
    risk_level: str = Field(default="low")  # low, medium, high, critical
    risk_factors: list[str] = Field(default=[], sa_column=Column(JSON))
    risk_notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Notes and communications
    internal_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    client_instructions: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Metadata
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    # Relationships
    user: "User" = Relationship(sa_relationship_kwargs={"foreign_keys": "[ConveyancingTransaction.user_id]"})
    property: Optional["Property"] = Relationship(back_populates="transactions")
    milestones: list["TransactionMilestone"] = Relationship(back_populates="transaction")
    searches: list["OfficialSearch"] = Relationship(back_populates="transaction")
    parties: list["TransactionParty"] = Relationship(back_populates="transaction")


class Property(SQLModel, table=True):
    """Property details"""
    __tablename__ = "properties"

    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: str = Field(unique=True, index=True)  # prp_xxx

    # Location
    county: str = Field(index=True)  # e.g., Nairobi, Mombasa, Kiambu
    sub_county: Optional[str] = None
    location: Optional[str] = None
    sub_location: Optional[str] = None
    physical_address: str
    plot_number: Optional[str] = Field(default=None, index=True)
    lr_number: Optional[str] = Field(default=None, index=True)  # Land Registry Number

    # Title information
    title_number: str = Field(unique=True, index=True)  # e.g., NAIROBI/BLOCK123/456
    title_type: str  # freehold, leasehold
    land_tenure: str  # freehold, leasehold, customary
    registration_date: Optional[datetime] = None

    # Property details
    property_type: str  # residential, commercial, agricultural, industrial, mixed_use
    property_description: str = Field(sa_column=Column(Text))
    land_area: Optional[str] = None  # e.g., "0.5 acres", "1000 sqm"
    land_area_sqm: Optional[float] = None
    land_use: Optional[str] = None  # residential, commercial, agricultural, etc.

    # Leasehold specific
    is_leasehold: bool = Field(default=False)
    lease_term_years: Optional[int] = None
    lease_start_date: Optional[datetime] = None
    lease_expiry_date: Optional[datetime] = None
    ground_rent_annual: Optional[Decimal] = Field(default=None)

    # Current owner
    current_owner_name: Optional[str] = None
    current_owner_id_number: Optional[str] = None
    current_owner_kra_pin: Optional[str] = None

    # Encumbrances
    has_encumbrances: bool = Field(default=False)
    encumbrances: list[dict] = Field(default=[], sa_column=Column(JSON))
    # [{"type": "mortgage", "holder": "ABC Bank", "amount": 5000000, "date": "2020-01-01"}]

    # Restrictions
    has_restrictions: bool = Field(default=False)
    restrictions: list[str] = Field(default=[], sa_column=Column(JSON))

    # Valuation
    last_valuation_amount: Optional[Decimal] = Field(default=None)
    last_valuation_date: Optional[datetime] = None
    market_value: Optional[Decimal] = Field(default=None)

    # Rates and charges
    annual_rates: Optional[Decimal] = Field(default=None)
    rates_arrears: Optional[Decimal] = Field(default=None)
    land_rent_arrears: Optional[Decimal] = Field(default=None)

    # Status
    is_verified: bool = Field(default=False)
    verification_date: Optional[datetime] = None
    is_active: bool = Field(default=True)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    transactions: list[ConveyancingTransaction] = Relationship(back_populates="property")


class TransactionParty(SQLModel, table=True):
    """Parties involved in the transaction"""
    __tablename__ = "transaction_parties"

    id: Optional[int] = Field(default=None, primary_key=True)
    party_id: str = Field(unique=True, index=True)  # pty_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Party details
    party_type: str  # individual, company, trust, estate
    party_role: str  # buyer, seller, transferor, transferee, lessor, lessee, mortgagor, mortgagee
    is_our_client: bool = Field(default=False)

    # Individual details
    full_name: str
    id_number: Optional[str] = None  # National ID / Passport
    kra_pin: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    postal_address: Optional[str] = None
    physical_address: Optional[str] = None

    # Company details (if applicable)
    company_name: Optional[str] = None
    company_registration_number: Optional[str] = None
    company_kra_pin: Optional[str] = None

    # Legal representation
    has_lawyer: bool = Field(default=False)
    lawyer_name: Optional[str] = None
    lawyer_firm: Optional[str] = None
    lawyer_email: Optional[str] = None
    lawyer_phone: Optional[str] = None

    # Status
    kyc_completed: bool = Field(default=False)
    documents_submitted: bool = Field(default=False)
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    transaction: ConveyancingTransaction = Relationship(back_populates="parties")


class TransactionMilestone(SQLModel, table=True):
    """Transaction workflow milestones"""
    __tablename__ = "transaction_milestones"

    id: Optional[int] = Field(default=None, primary_key=True)
    milestone_id: str = Field(unique=True, index=True)  # mls_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Milestone details
    name: str
    description: str = Field(sa_column=Column(Text))
    stage: str  # instruction, due_diligence, drafting, execution, registration, completion
    sequence_order: int  # Order in workflow

    # Status
    status: str = Field(default="pending")  # pending, in_progress, completed, skipped, blocked
    is_critical: bool = Field(default=False)  # Critical path milestone
    is_blocking: bool = Field(default=False)  # Blocks other milestones

    # Dependencies
    depends_on: list[str] = Field(default=[], sa_column=Column(JSON))  # List of milestone_ids
    blocks: list[str] = Field(default=[], sa_column=Column(JSON))  # List of milestone_ids it blocks

    # Dates
    target_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    days_to_complete: Optional[int] = None

    # Assignment
    assigned_to: Optional[int] = Field(default=None, foreign_key="users.id")

    # Progress
    progress_percentage: int = Field(default=0)  # 0-100
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    transaction: ConveyancingTransaction = Relationship(back_populates="milestones")


class OfficialSearch(SQLModel, table=True):
    """Official searches and clearances (Kenya-specific)"""
    __tablename__ = "official_searches"

    id: Optional[int] = Field(default=None, primary_key=True)
    search_id: str = Field(unique=True, index=True)  # srch_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Search details
    search_type: str = Field(index=True)  # official_search, rates_clearance, land_rent, etc.
    search_name: str
    description: str = Field(sa_column=Column(Text))

    # Authority
    issuing_authority: str  # e.g., "Lands Registry", "Nairobi County", "Land Control Board"
    authority_location: Optional[str] = None

    # Application
    application_date: Optional[datetime] = None
    application_reference: Optional[str] = None

    # Status
    status: str = Field(default="pending")  # pending, applied, received, cleared, issues_found, expired

    # Results
    result_received_date: Optional[datetime] = None
    result_summary: Optional[str] = Field(default=None, sa_column=Column(Text))
    issues_found: list[str] = Field(default=[], sa_column=Column(JSON))
    has_issues: bool = Field(default=False)
    severity: Optional[str] = None  # critical, high, medium, low, info

    # Documents
    search_certificate_url: Optional[str] = None  # S3 URL
    supporting_documents: list[str] = Field(default=[], sa_column=Column(JSON))

    # Costs
    official_fee: Optional[Decimal] = Field(default=None)
    paid_date: Optional[datetime] = None
    receipt_number: Optional[str] = None

    # Validity
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_expired: bool = Field(default=False)

    # Notes
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    transaction: ConveyancingTransaction = Relationship(back_populates="searches")


class ConveyancingDocument(SQLModel, table=True):
    """Generated conveyancing documents"""
    __tablename__ = "conveyancing_documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: str = Field(unique=True, index=True)  # cvd_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Document details
    document_type: str = Field(index=True)  # sale_agreement, transfer_cr11, consent_form, etc.
    document_name: str
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    template_id: Optional[str] = None  # Template used

    # Content
    document_url: Optional[str] = None  # S3 URL for generated document
    document_format: str = Field(default="pdf")  # pdf, docx, both
    version: int = Field(default=1)
    is_final: bool = Field(default=False)

    # Status
    status: str = Field(default="draft")  # draft, review, approved, executed, registered
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None

    # Execution
    requires_execution: bool = Field(default=True)
    executed_by: list[str] = Field(default=[], sa_column=Column(JSON))  # List of parties who executed
    execution_date: Optional[datetime] = None
    witness_names: list[str] = Field(default=[], sa_column=Column(JSON))

    # Registration
    requires_registration: bool = Field(default=False)
    registration_date: Optional[datetime] = None
    registration_number: Optional[str] = None

    # Metadata
    generated_by: int = Field(foreign_key="users.id")
    file_size_bytes: Optional[int] = None
    page_count: Optional[int] = None

    # Notes
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class StampDutyCalculation(SQLModel, table=True):
    """Stamp duty calculations for Kenya"""
    __tablename__ = "stamp_duty_calculations"

    id: Optional[int] = Field(default=None, primary_key=True)
    calculation_id: str = Field(unique=True, index=True)  # sdc_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Property details
    property_value: Decimal = Field()
    property_type: str  # residential, commercial, agricultural, etc.
    property_location: str  # County
    is_first_time_buyer: bool = Field(default=False)
    is_affordable_housing: bool = Field(default=False)

    # Stamp duty rates (Kenya Stamp Duty Act)
    # Residential property stamp duty is 4% of property value (or 2% for affordable housing)
    # Commercial property stamp duty is 4% of property value
    stamp_duty_rate: Decimal = Field()  # Percentage
    stamp_duty_amount: Decimal = Field()

    # Additional fees
    registration_fee: Decimal = Field(default=0)
    search_fees: Decimal = Field(default=0)
    consent_fees: Decimal = Field(default=0)

    # Capital gains tax (if applicable)
    requires_cgt: bool = Field(default=False)
    cgt_rate: Optional[Decimal] = Field(default=None)  # 5% in Kenya
    cgt_amount: Optional[Decimal] = Field(default=None)

    # Totals
    total_government_charges: Decimal = Field()
    total_legal_fees: Decimal = Field()
    total_cost: Decimal = Field()

    # Payment status
    stamp_duty_paid: bool = Field(default=False)
    payment_date: Optional[datetime] = None
    payment_reference: Optional[str] = None
    receipt_number: Optional[str] = None

    # Calculation metadata
    calculated_at: datetime = Field(default_factory=datetime.utcnow)
    calculated_by: int = Field(foreign_key="users.id")
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ConveyancingChecklist(SQLModel, table=True):
    """Due diligence and process checklists"""
    __tablename__ = "conveyancing_checklists"

    id: Optional[int] = Field(default=None, primary_key=True)
    checklist_id: str = Field(unique=True, index=True)  # chk_xxx
    transaction_id: int = Field(foreign_key="conveyancing_transactions.id", index=True)

    # Checklist details
    checklist_type: str  # due_diligence, pre_completion, post_completion
    name: str
    description: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Items
    items: list[dict] = Field(default=[], sa_column=Column(JSON))
    # [{"item": "Verify title deed", "status": "completed", "completed_at": "2024-01-01", "notes": "..."}]

    # Progress
    total_items: int = Field(default=0)
    completed_items: int = Field(default=0)
    progress_percentage: int = Field(default=0)  # 0-100

    # Status
    status: str = Field(default="in_progress")  # pending, in_progress, completed, issues_found
    completed_at: Optional[datetime] = None

    # Issues
    issues_identified: list[str] = Field(default=[], sa_column=Column(JSON))
    critical_issues_count: int = Field(default=0)

    # Assignment
    assigned_to: Optional[int] = Field(default=None, foreign_key="users.id")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
