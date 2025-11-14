from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.compliance import RuleType, RuleSeverity, ComplianceStatus


# Playbook Schemas

class PlaybookCreateRequest(BaseModel):
    """Request to create a playbook"""
    name: str
    description: Optional[str] = None
    version: str = "1.0"
    document_type: str = "general"
    jurisdiction: Optional[str] = None
    tags: List[str] = []


class PlaybookResponse(BaseModel):
    """Playbook response"""
    playbook_id: str
    name: str
    description: Optional[str]
    version: str
    document_type: str
    jurisdiction: Optional[str]
    tags: List[str]
    is_active: bool
    is_default: bool
    rule_count: int
    usage_count: int
    created_at: datetime
    updated_at: datetime


# Compliance Rule Schemas

class RuleCreateRequest(BaseModel):
    """Request to create a compliance rule"""
    name: str
    description: str
    rule_type: RuleType
    severity: RuleSeverity = RuleSeverity.MEDIUM
    parameters: dict = {}
    pattern: Optional[str] = None
    expected_value: Optional[str] = None
    auto_fix: bool = False
    auto_fix_suggestion: Optional[str] = None
    replacement_text: Optional[str] = None
    replacement_clause_id: Optional[str] = None
    redline_instruction: Optional[str] = None


class RuleResponse(BaseModel):
    """Compliance rule response"""
    rule_id: str
    name: str
    description: str
    rule_type: RuleType
    severity: RuleSeverity
    parameters: dict
    pattern: Optional[str]
    expected_value: Optional[str]
    auto_fix: bool
    auto_fix_suggestion: Optional[str]
    replacement_text: Optional[str]
    replacement_clause_id: Optional[str]
    redline_instruction: Optional[str]
    is_active: bool
    violation_count: int
    created_at: datetime


class RuleUpdateRequest(BaseModel):
    """Request to update a rule"""
    name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[RuleSeverity] = None
    parameters: Optional[dict] = None
    is_active: Optional[bool] = None
    replacement_text: Optional[str] = None
    replacement_clause_id: Optional[str] = None
    redline_instruction: Optional[str] = None


# Compliance Check Schemas

class ComplianceCheckRequest(BaseModel):
    """Request to run compliance check"""
    contract_id: str
    playbook_id: str


class ComplianceCheckResponse(BaseModel):
    """Compliance check initiation response"""
    check_id: str
    status: ComplianceStatus
    eta_seconds: int


class ViolationDetail(BaseModel):
    """Individual violation detail"""
    rule_id: str
    rule_name: str
    severity: RuleSeverity
    status: str  # "failed", "passed", "warning"
    message: str
    location: Optional[str] = None
    suggestion: Optional[str] = None
    auto_fixable: bool = False


class ComplianceResultResponse(BaseModel):
    """Detailed compliance check results"""
    check_id: str
    status: ComplianceStatus
    contract_id: str
    playbook_id: str

    # Summary
    overall_status: ComplianceStatus
    compliance_score: Optional[float]  # 0-100
    rules_checked: int
    rules_passed: int
    rules_failed: int
    rules_warning: int

    # Detailed results
    violations: List[ViolationDetail]
    passed_rules: List[dict]
    warnings: List[ViolationDetail]

    # Executive summary
    executive_summary: Optional[str]
    recommendations: List[str]

    # Metadata
    processing_time_seconds: Optional[float]
    created_at: datetime
    processed_at: Optional[datetime]


# Exception Schemas

class ExceptionCreateRequest(BaseModel):
    """Request to create compliance exception"""
    contract_id: str
    rule_id: str
    reason: str
    granted_by: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_permanent: bool = False


class ExceptionResponse(BaseModel):
    """Compliance exception response"""
    exception_id: str
    contract_id: str
    rule_id: str
    reason: str
    granted_by: Optional[str]
    approved_at: Optional[datetime]
    expires_at: Optional[datetime]
    is_permanent: bool
    is_active: bool
    created_at: datetime


# Template Schemas

class TemplateResponse(BaseModel):
    """Compliance template response"""
    template_id: str
    name: str
    description: str
    category: str
    rules: List[dict]
    is_public: bool
    usage_count: int
    created_at: datetime


class TemplateApplyRequest(BaseModel):
    """Request to apply template to playbook"""
    template_id: str
    playbook_id: str


# Analytics Schemas

class ComplianceAnalytics(BaseModel):
    """Compliance analytics for a playbook"""
    playbook_id: str
    playbook_name: str

    # Overall stats
    total_checks: int
    avg_compliance_score: float
    most_common_violations: List[dict]  # [{rule_name, count, severity}]

    # Trends
    compliance_trend: List[dict]  # [{date, score}]
    violation_trend: List[dict]  # [{date, count, severity}]

    # By severity
    critical_violations: int
    high_violations: int
    medium_violations: int
    low_violations: int


class ComplianceReport(BaseModel):
    """Comprehensive compliance report"""
    report_id: str
    contract_id: str
    playbook_name: str
    check_date: datetime

    # Summary
    overall_status: ComplianceStatus
    compliance_score: float
    risk_level: str  # "low", "medium", "high"

    # Key findings
    critical_issues: List[ViolationDetail]
    recommendations: List[str]

    # Full details
    all_violations: List[ViolationDetail]
    passed_rules: List[dict]

    # Metadata
    generated_at: datetime
