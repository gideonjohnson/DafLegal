"""
Drafting Assistant Schemas

Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Template Schemas
class ContractTemplateCreate(BaseModel):
    name: str
    description: str
    category: str
    jurisdiction: str = "US"
    template_text: str
    variables: list[dict]  # [{name, type, description, required}]
    included_clauses: list[str] = []
    optional_clauses: list[str] = []
    tags: list[str] = []


class ContractTemplateResponse(BaseModel):
    template_id: str
    name: str
    description: str
    category: str
    jurisdiction: str
    variables: list[dict]
    included_clauses: list[str]
    optional_clauses: list[str]
    is_public: bool
    is_approved: bool
    version: int
    times_used: int
    tags: list[str]
    created_at: datetime


class ContractTemplateDetail(ContractTemplateResponse):
    template_text: str


# Generation Schemas
class GenerateContractRequest(BaseModel):
    template_id: str
    name: str
    variable_values: dict  # {variable_name: value}
    selected_clauses: list[str] = []
    file_format: str = "docx"  # docx, pdf


class GeneratedContractResponse(BaseModel):
    generated_id: str
    name: str
    category: str
    template_id: str
    variable_values: dict
    selected_clauses: list[str]
    generated_text: str
    status: str
    ai_suggestions: list[dict]
    risk_analysis: Optional[dict]
    file_format: str
    file_url: Optional[str]
    edit_count: int
    last_edited_at: Optional[datetime]
    created_at: datetime


class UpdateGeneratedContractRequest(BaseModel):
    generated_text: Optional[str] = None
    status: Optional[str] = None
