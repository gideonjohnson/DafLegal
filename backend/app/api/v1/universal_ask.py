"""
Universal Ask API Endpoint

Omnipresent AI assistant accessible from every page with Cmd/Ctrl+K.
Provides context-aware, matter-specific quick answers.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.universal_assistant import UniversalAssistant
from app.core.config import settings


router = APIRouter(prefix="/universal-ask", tags=["universal-ask"])


class UniversalAskRequest(BaseModel):
    """Request model for universal ask queries"""
    query: str
    context: str = "general"  # Page context: document_analysis, timeline_builder, etc.
    matter_id: Optional[str] = None
    current_page: Optional[str] = None
    additional_context: Optional[Dict[str, Any]] = None


class UniversalAskResponse(BaseModel):
    """Response model for universal ask queries"""
    response: str
    context: str
    suggestions: list[str]


class FollowUpRequest(BaseModel):
    """Request model for follow-up questions"""
    conversation_history: list[Dict[str, str]]
    context: str = "general"


class FollowUpResponse(BaseModel):
    """Response model for follow-up questions"""
    follow_ups: list[str]


# Global assistant instance
assistant = UniversalAssistant(openai_api_key=settings.OPENAI_API_KEY)


@router.post("", response_model=UniversalAskResponse)
async def ask_question(
    request: UniversalAskRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Universal Ask - Get instant answers without leaving your current task.

    This endpoint powers the omnipresent Ask button (Cmd/Ctrl+K) that appears
    on every page. It provides context-aware answers based on:
    - Current page/feature being used
    - Matter being worked on (if applicable)
    - Additional contextual information

    Examples:
    - "Summarize this depo" (on document analysis page)
    - "What's our termination notice period?" (matter-aware)
    - "Find every case this judge cited last year on fiduciary duty" (research context)

    This is the single fastest way to get answers in DafLegal.
    """
    try:
        # Get AI response
        response = assistant.get_answer(
            query=request.query,
            context=request.context,
            matter_id=request.matter_id,
            current_page=request.current_page,
            additional_context=request.additional_context
        )

        # Get context-specific suggestions
        suggestions = assistant.get_context_suggestions(request.context)

        return UniversalAskResponse(
            response=response,
            context=request.context,
            suggestions=suggestions
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process query: {str(e)}"
        )


@router.get("/suggestions")
async def get_suggestions(
    context: str = "general",
    current_user: User = Depends(get_current_user)
):
    """Get suggested queries for a specific context"""
    suggestions = assistant.get_context_suggestions(context)

    return {
        "context": context,
        "suggestions": suggestions
    }


@router.get("/contexts")
async def get_available_contexts(
    current_user: User = Depends(get_current_user)
):
    """Get list of available contexts for the assistant"""
    return {
        "contexts": [
            {
                "key": "document_analysis",
                "name": "Document Analysis",
                "description": "Contract analysis, risk identification, clause extraction"
            },
            {
                "key": "timeline_builder",
                "name": "Timeline Builder",
                "description": "Event chronology, critical dates, document sequencing"
            },
            {
                "key": "contract_comparison",
                "name": "Contract Comparison",
                "description": "Version comparison, change tracking, clause differences"
            },
            {
                "key": "legal_research",
                "name": "Legal Research",
                "description": "Case law, statutes, legal authorities"
            },
            {
                "key": "contract_drafting",
                "name": "Contract Drafting",
                "description": "Template selection, clause suggestions, best practices"
            },
            {
                "key": "compliance_checking",
                "name": "Compliance Checking",
                "description": "Regulatory compliance, jurisdiction requirements"
            },
            {
                "key": "clause_library",
                "name": "Clause Library",
                "description": "Clause search, customization, variations"
            },
            {
                "key": "property_conveyancing",
                "name": "Property Conveyancing",
                "description": "Conveyancing process, title searches, settlements"
            },
            {
                "key": "citation_checking",
                "name": "Citation Checking",
                "description": "Citation format verification, case validity"
            },
            {
                "key": "client_intake",
                "name": "Client Intake",
                "description": "Information gathering, conflict checks, engagement"
            },
            {
                "key": "general",
                "name": "General",
                "description": "Platform navigation and general assistance"
            }
        ]
    }


@router.post("/follow-ups", response_model=FollowUpResponse)
async def get_follow_up_questions(
    request: FollowUpRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate intelligent follow-up questions based on conversation history.

    This endpoint analyzes the recent conversation and suggests 3-4 relevant
    follow-up questions the user might want to ask next. Uses GPT-4o-mini
    for fast, cost-effective generation.

    The suggestions are context-aware and adapt to the current conversation flow.
    """
    try:
        follow_ups = assistant.get_follow_up_questions(
            conversation_history=request.conversation_history,
            context=request.context
        )

        return FollowUpResponse(follow_ups=follow_ups)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate follow-up questions: {str(e)}"
        )
