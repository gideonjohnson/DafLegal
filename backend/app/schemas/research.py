"""
Legal Research Schemas

Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Research Query Schemas
class ResearchQueryCreate(BaseModel):
    query_text: str
    query_type: str  # case_law, statute, regulation, treaty
    jurisdiction: Optional[str] = None
    filters: dict = {}


class ResearchQueryResponse(BaseModel):
    query_id: str
    query_text: str
    query_type: str
    jurisdiction: Optional[str]
    status: str
    result_count: int
    processing_time_seconds: Optional[float]
    created_at: datetime


# Research Result Schemas
class ResearchResultResponse(BaseModel):
    result_id: str
    title: str
    citation: str
    document_type: str
    jurisdiction: Optional[str]
    court: Optional[str]
    date_decided: Optional[str]
    summary: str
    key_points: list[str]
    relevance_score: float
    full_text_url: Optional[str]
    judges: Optional[list[str]]
    parties: Optional[list[str]]
    topics: list[str]
    ai_summary: Optional[str]
    precedent_value: Optional[str]
    is_saved: bool
    notes: Optional[str]
    created_at: datetime


class ResearchResultsListResponse(BaseModel):
    query_id: str
    query_text: str
    results: list[ResearchResultResponse]
    total_results: int
    processing_time_seconds: Optional[float]


class ResearchResultUpdate(BaseModel):
    is_saved: Optional[bool] = None
    notes: Optional[str] = None


# Citation Schemas
class CitationCreate(BaseModel):
    result_id: Optional[str] = None
    citation_text: str
    document_type: str
    title: str
    tags: list[str] = []
    folder: Optional[str] = None
    notes: Optional[str] = None


class CitationUpdate(BaseModel):
    tags: Optional[list[str]] = None
    folder: Optional[str] = None
    notes: Optional[str] = None


class CitationResponse(BaseModel):
    citation_id: str
    citation_text: str
    document_type: str
    title: str
    tags: list[str]
    folder: Optional[str]
    notes: Optional[str]
    times_used: int
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# Template Schemas
class ResearchTemplateResponse(BaseModel):
    template_id: str
    name: str
    description: str
    category: str
    query_type: str
    suggested_filters: dict
    jurisdictions: list[str]
    times_used: int
