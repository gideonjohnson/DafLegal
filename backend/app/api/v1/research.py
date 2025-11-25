"""
Legal Research API Endpoints

AI-powered legal research for finding case law, statutes, and regulations.
Includes conversational research with verified citations.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from pydantic import BaseModel

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.research import (
    ResearchQueryCreate,
    ResearchQueryResponse,
    ResearchResultResponse,
    ResearchResultsListResponse,
    ResearchResultUpdate,
    CitationCreate,
    CitationUpdate,
    CitationResponse,
    ResearchTemplateResponse
)
from app.services.research_service import ResearchService
from app.services.legal_research_chat import LegalResearchChat
from app.core.config import settings


# Pydantic models for conversational research
class ChatResearchRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    jurisdiction: str = "AU"
    include_statutes: bool = True
    include_cases: bool = True
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class CitationDetail(BaseModel):
    id: str
    type: str
    title: str
    citation: str
    court: Optional[str] = None
    date: Optional[str] = None
    jurisdiction: Optional[str] = None
    relevance: str
    key_quote: Optional[str] = None
    url: Optional[str] = None
    verified: bool
    format_valid: Optional[bool] = None


class ResearchSummary(BaseModel):
    query_type: str
    jurisdiction: str
    sources_searched: List[str]
    confidence_level: str
    limitations: Optional[str] = None


class ChatResearchResponse(BaseModel):
    conversation_id: str
    response: str
    citations: List[CitationDetail]
    follow_up_questions: List[str]
    research_summary: ResearchSummary


class SuggestedQuery(BaseModel):
    category: str
    queries: List[str]


# Global instance for conversation persistence (use Redis in production)
research_chat_instance = LegalResearchChat()

router = APIRouter(prefix="/research", tags=["research"])


def get_research_service(db: Session = Depends(get_session)) -> ResearchService:
    """Dependency to get research service"""
    return ResearchService(db=db, openai_api_key=settings.OPENAI_API_KEY)


# Research Query Endpoints
@router.post("/search", response_model=ResearchQueryResponse)
async def create_research_query(
    query_data: ResearchQueryCreate,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """
    Create a new legal research query

    This endpoint creates a research query but doesn't execute it yet.
    Use /research/{query_id}/execute to run the research.
    """
    query = service.create_research_query(
        user_id=current_user.id,
        query_text=query_data.query_text,
        query_type=query_data.query_type,
        jurisdiction=query_data.jurisdiction,
        filters=query_data.filters
    )

    return ResearchQueryResponse(
        query_id=query.query_id,
        query_text=query.query_text,
        query_type=query.query_type,
        jurisdiction=query.jurisdiction,
        status=query.status,
        result_count=query.result_count,
        processing_time_seconds=query.processing_time_seconds,
        created_at=query.created_at
    )


@router.post("/{query_id}/execute", response_model=ResearchResultsListResponse)
async def execute_research(
    query_id: str,
    max_results: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """
    Execute a research query and return results

    This performs AI-powered legal research based on the query.
    Results are generated using AI and saved to the database.

    NOTE: MVP uses AI simulation. Production would integrate with
    real legal databases like Westlaw, LexisNexis, or public APIs.
    """
    try:
        # Perform research
        results = service.perform_research(
            query_id=query_id,
            max_results=max_results
        )

        # Get query details
        query, _ = service.get_query_results(query_id)

        # Convert to response format
        result_responses = [
            ResearchResultResponse(
                result_id=r.result_id,
                title=r.title,
                citation=r.citation,
                document_type=r.document_type,
                jurisdiction=r.jurisdiction,
                court=r.court,
                date_decided=r.date_decided,
                summary=r.summary,
                key_points=r.key_points,
                relevance_score=r.relevance_score,
                full_text_url=r.full_text_url,
                judges=r.judges,
                parties=r.parties,
                topics=r.topics,
                ai_summary=r.ai_summary,
                precedent_value=r.precedent_value,
                is_saved=r.is_saved,
                notes=r.notes,
                created_at=r.created_at
            )
            for r in results
        ]

        return ResearchResultsListResponse(
            query_id=query.query_id,
            query_text=query.query_text,
            results=result_responses,
            total_results=len(result_responses),
            processing_time_seconds=query.processing_time_seconds
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@router.get("/{query_id}", response_model=ResearchResultsListResponse)
async def get_research_results(
    query_id: str,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Get research results for a query"""
    try:
        query, results = service.get_query_results(query_id)

        result_responses = [
            ResearchResultResponse(
                result_id=r.result_id,
                title=r.title,
                citation=r.citation,
                document_type=r.document_type,
                jurisdiction=r.jurisdiction,
                court=r.court,
                date_decided=r.date_decided,
                summary=r.summary,
                key_points=r.key_points,
                relevance_score=r.relevance_score,
                full_text_url=r.full_text_url,
                judges=r.judges,
                parties=r.parties,
                topics=r.topics,
                ai_summary=r.ai_summary,
                precedent_value=r.precedent_value,
                is_saved=r.is_saved,
                notes=r.notes,
                created_at=r.created_at
            )
            for r in results
        ]

        return ResearchResultsListResponse(
            query_id=query.query_id,
            query_text=query.query_text,
            results=result_responses,
            total_results=len(result_responses),
            processing_time_seconds=query.processing_time_seconds
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/queries/history", response_model=list[ResearchQueryResponse])
async def get_research_history(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Get user's research query history"""
    queries = service.get_user_queries(user_id=current_user.id, limit=limit)

    return [
        ResearchQueryResponse(
            query_id=q.query_id,
            query_text=q.query_text,
            query_type=q.query_type,
            jurisdiction=q.jurisdiction,
            status=q.status,
            result_count=q.result_count,
            processing_time_seconds=q.processing_time_seconds,
            created_at=q.created_at
        )
        for q in queries
    ]


@router.patch("/results/{result_id}", response_model=ResearchResultResponse)
async def update_research_result(
    result_id: str,
    update_data: ResearchResultUpdate,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Update a research result (save, add notes)"""
    try:
        result = service.update_result(
            result_id=result_id,
            is_saved=update_data.is_saved,
            notes=update_data.notes
        )

        return ResearchResultResponse(
            result_id=result.result_id,
            title=result.title,
            citation=result.citation,
            document_type=result.document_type,
            jurisdiction=result.jurisdiction,
            court=result.court,
            date_decided=result.date_decided,
            summary=result.summary,
            key_points=result.key_points,
            relevance_score=result.relevance_score,
            full_text_url=result.full_text_url,
            judges=result.judges,
            parties=result.parties,
            topics=result.topics,
            ai_summary=result.ai_summary,
            precedent_value=result.precedent_value,
            is_saved=result.is_saved,
            notes=result.notes,
            created_at=result.created_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Citation Endpoints
@router.post("/citations", response_model=CitationResponse)
async def create_citation(
    citation_data: CitationCreate,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Save a citation for future reference"""
    citation = service.create_citation(
        user_id=current_user.id,
        citation_text=citation_data.citation_text,
        document_type=citation_data.document_type,
        title=citation_data.title,
        result_id=citation_data.result_id,
        tags=citation_data.tags,
        folder=citation_data.folder,
        notes=citation_data.notes
    )

    return CitationResponse(
        citation_id=citation.citation_id,
        citation_text=citation.citation_text,
        document_type=citation.document_type,
        title=citation.title,
        tags=citation.tags,
        folder=citation.folder,
        notes=citation.notes,
        times_used=citation.times_used,
        last_used_at=citation.last_used_at,
        created_at=citation.created_at,
        updated_at=citation.updated_at
    )


@router.get("/citations", response_model=list[CitationResponse])
async def get_citations(
    folder: Optional[str] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Get user's saved citations with optional filters"""
    tag_list = tags.split(",") if tags else None

    citations = service.get_user_citations(
        user_id=current_user.id,
        folder=folder,
        tags=tag_list
    )

    return [
        CitationResponse(
            citation_id=c.citation_id,
            citation_text=c.citation_text,
            document_type=c.document_type,
            title=c.title,
            tags=c.tags,
            folder=c.folder,
            notes=c.notes,
            times_used=c.times_used,
            last_used_at=c.last_used_at,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in citations
    ]


@router.patch("/citations/{citation_id}", response_model=CitationResponse)
async def update_citation(
    citation_id: str,
    update_data: CitationUpdate,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Update a citation"""
    try:
        citation = service.update_citation(
            citation_id=citation_id,
            tags=update_data.tags,
            folder=update_data.folder,
            notes=update_data.notes
        )

        return CitationResponse(
            citation_id=citation.citation_id,
            citation_text=citation.citation_text,
            document_type=citation.document_type,
            title=citation.title,
            tags=citation.tags,
            folder=citation.folder,
            notes=citation.notes,
            times_used=citation.times_used,
            last_used_at=citation.last_used_at,
            created_at=citation.created_at,
            updated_at=citation.updated_at
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/citations/{citation_id}")
async def delete_citation(
    citation_id: str,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Delete a citation"""
    try:
        service.delete_citation(citation_id)
        return {"message": "Citation deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Template Endpoints
@router.get("/templates", response_model=list[ResearchTemplateResponse])
async def get_research_templates(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    service: ResearchService = Depends(get_research_service)
):
    """Get pre-defined research templates"""
    templates = service.get_templates(category=category)

    return [
        ResearchTemplateResponse(
            template_id=t.template_id,
            name=t.name,
            description=t.description,
            category=t.category,
            query_type=t.query_type,
            suggested_filters=t.suggested_filters,
            jurisdictions=t.jurisdictions,
            times_used=t.times_used
        )
        for t in templates
    ]


# =============================================================================
# CONVERSATIONAL RESEARCH ENDPOINTS (ChatGPT-style with citations)
# =============================================================================

@router.post("/chat", response_model=ChatResearchResponse)
async def chat_research(
    request: ChatResearchRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Conversational legal research with verified citations.

    Features:
    - Natural language questions
    - Full citation support with links to sources
    - Follow-up question suggestions
    - Conversation history for context
    - Zero hallucination design - all citations are flagged as verified/unverified

    Supported jurisdictions: AU, UK, US, CA
    """
    try:
        result = research_chat_instance.research(
            query=request.query,
            conversation_id=request.conversation_id,
            jurisdiction=request.jurisdiction,
            include_statutes=request.include_statutes,
            include_cases=request.include_cases,
            date_from=request.date_from,
            date_to=request.date_to
        )

        # Convert citations to proper format
        citations = [
            CitationDetail(
                id=c.get("id", ""),
                type=c.get("type", "unknown"),
                title=c.get("title", ""),
                citation=c.get("citation", ""),
                court=c.get("court"),
                date=c.get("date"),
                jurisdiction=c.get("jurisdiction"),
                relevance=c.get("relevance", ""),
                key_quote=c.get("key_quote"),
                url=c.get("url"),
                verified=c.get("verified", False),
                format_valid=c.get("format_valid")
            )
            for c in result.get("citations", [])
        ]

        summary = result.get("research_summary", {})

        return ChatResearchResponse(
            conversation_id=result.get("conversation_id", ""),
            response=result.get("response", ""),
            citations=citations,
            follow_up_questions=result.get("follow_up_questions", []),
            research_summary=ResearchSummary(
                query_type=summary.get("query_type", "general"),
                jurisdiction=summary.get("jurisdiction", request.jurisdiction),
                sources_searched=summary.get("sources_searched", []),
                confidence_level=summary.get("confidence_level", "medium"),
                limitations=summary.get("limitations")
            )
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")


@router.get("/chat/{conversation_id}/history")
async def get_chat_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get conversation history for a research session"""
    history = research_chat_instance.get_conversation_history(conversation_id)

    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "role": msg["role"],
                "content": msg["content"][:500] + "..." if len(msg["content"]) > 500 else msg["content"]
            }
            for msg in history
        ],
        "message_count": len(history)
    }


@router.delete("/chat/{conversation_id}")
async def clear_chat_history(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Clear a research conversation"""
    success = research_chat_instance.clear_conversation(conversation_id)

    if success:
        return {"message": "Conversation cleared", "conversation_id": conversation_id}
    else:
        raise HTTPException(status_code=404, detail="Conversation not found")


@router.get("/chat/suggestions", response_model=List[SuggestedQuery])
async def get_suggested_queries(
    jurisdiction: str = Query("AU", description="Jurisdiction code: AU, UK, US, CA"),
    current_user: User = Depends(get_current_user)
):
    """Get suggested research queries for a jurisdiction"""
    suggestions = research_chat_instance.get_suggested_queries(jurisdiction)

    return [
        SuggestedQuery(category=s["category"], queries=s["queries"])
        for s in suggestions
    ]


@router.get("/chat/jurisdictions")
async def get_available_jurisdictions(
    current_user: User = Depends(get_current_user)
):
    """Get list of supported jurisdictions"""
    return {
        "jurisdictions": [
            {
                "code": "AU",
                "name": "Australia",
                "description": "Australian federal and state law",
                "databases": ["AustLII", "Federal Court", "High Court", "State Courts"]
            },
            {
                "code": "UK",
                "name": "United Kingdom",
                "description": "UK law including England & Wales, Scotland, Northern Ireland",
                "databases": ["BAILII", "UK Legislation", "Courts and Tribunals"]
            },
            {
                "code": "US",
                "name": "United States",
                "description": "US federal and state law",
                "databases": ["CourtListener", "Google Scholar", "Justia"]
            },
            {
                "code": "CA",
                "name": "Canada",
                "description": "Canadian federal and provincial law",
                "databases": ["CanLII", "Supreme Court of Canada"]
            }
        ]
    }
