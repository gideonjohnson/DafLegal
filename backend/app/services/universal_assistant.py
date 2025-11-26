"""
Universal Assistant Service

Context-aware AI assistant that provides quick answers to user queries
based on the current page context and matter information.
"""

from typing import Optional, Dict, Any
import openai
from datetime import datetime


class UniversalAssistant:
    """
    Universal AI assistant for context-aware help across all pages.

    This is the single fastest way to get answers without leaving the current task.
    Similar to CoCounsel or Harvey's omnipresent assistant.
    """

    def __init__(self, openai_api_key: str):
        self.client = openai.OpenAI(api_key=openai_api_key)

        # Context-specific system prompts
        self.context_prompts = {
            "document_analysis": """You are an expert legal document analyzer. Help users understand contracts,
            identify risks, obligations, payment terms, and unusual clauses. Be precise and cite specific sections.""",

            "timeline_builder": """You are a legal timeline specialist. Help users identify critical dates,
            deadlines, event sequences, and document chronology. Focus on temporal relationships.""",

            "contract_comparison": """You are a contract comparison expert. Help users identify differences
            between document versions, assess which terms are more favorable, and track revisions.""",

            "legal_research": """You are a legal research assistant. Help users find relevant cases, statutes,
            and legal authorities. Provide citation guidance and explain legal concepts.""",

            "contract_drafting": """You are a contract drafting assistant. Help users with clause suggestions,
            template selection, and best practices for specific contract types.""",

            "compliance_checking": """You are a compliance expert. Help users verify regulatory compliance,
            identify non-compliant clauses, and understand jurisdiction-specific requirements.""",

            "clause_library": """You are a clause library expert. Help users find appropriate clauses,
            understand clause variations, and customize clauses for specific needs.""",

            "property_conveyancing": """You are a property law specialist. Help with conveyancing processes,
            title searches, settlement requirements, and property transaction documentation.""",

            "citation_checking": """You are a legal citation expert. Help verify citation formats, check
            case validity, and ensure proper legal citation standards.""",

            "client_intake": """You are a client intake specialist. Help with information gathering,
            conflict checks, engagement letters, and initial case assessment.""",

            "general": """You are a helpful legal AI assistant. Provide guidance on using DafLegal's
            features and general legal workflow assistance."""
        }

    def get_answer(
        self,
        query: str,
        context: str = "general",
        matter_id: Optional[str] = None,
        current_page: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get a context-aware answer to a user query.

        Args:
            query: The user's question or request
            context: Page context (document_analysis, timeline_builder, etc.)
            matter_id: Optional matter ID for matter-specific queries
            current_page: Current page URL path
            additional_context: Any additional contextual information

        Returns:
            AI-generated response tailored to the context
        """
        # Build system prompt based on context
        system_prompt = self.context_prompts.get(context, self.context_prompts["general"])

        # Add matter awareness if matter_id provided
        if matter_id:
            system_prompt += f"\n\nYou are currently working on Matter ID: {matter_id}. "
            system_prompt += "Provide answers specific to this matter when relevant."

        # Add current page context
        if current_page:
            system_prompt += f"\n\nCurrent page: {current_page}"

        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]

        # Add additional context if provided
        if additional_context:
            context_str = "\n".join([f"{k}: {v}" for k, v in additional_context.items()])
            messages.insert(1, {
                "role": "system",
                "content": f"Additional context:\n{context_str}"
            })

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"I encountered an error processing your question: {str(e)}"

    def get_context_suggestions(self, context: str) -> list[str]:
        """Get suggested queries for a given context."""
        suggestions = {
            "document_analysis": [
                "Summarize the key risks in this document",
                "What are the payment terms?",
                "Identify all obligations of Party A",
                "Are there any unusual clauses?"
            ],
            "timeline_builder": [
                "What are the critical dates in this matter?",
                "Show me all events involving [party name]",
                "Which documents are most important?",
                "Create a summary timeline"
            ],
            "contract_comparison": [
                "What are the key differences?",
                "Which version is more favorable?",
                "List all changes to liability clauses",
                "Summarize revisions"
            ],
            "legal_research": [
                "Find cases on [topic]",
                "What's the leading authority on [issue]?",
                "Summarize recent developments in [area]",
                "Compare jurisdictions on [topic]"
            ],
            "compliance_checking": [
                "Does this comply with [regulation]?",
                "What compliance issues exist?",
                "Check against [jurisdiction] standards",
                "List all non-compliant clauses"
            ],
            "general": [
                "How do I use this feature?",
                "Show me an example",
                "What can I do here?",
                "Help me get started"
            ]
        }

        return suggestions.get(context, suggestions["general"])

    def get_follow_up_questions(
        self,
        conversation_history: list[Dict[str, str]],
        context: str = "general"
    ) -> list[str]:
        """
        Generate intelligent follow-up questions based on conversation history.

        Args:
            conversation_history: Recent conversation messages (role, content)
            context: Page context for context-aware suggestions

        Returns:
            List of 3-4 relevant follow-up questions
        """
        # Build system prompt
        system_prompt = f"""You are an intelligent legal assistant analyzing a conversation.
Based on the conversation history, generate 3-4 relevant follow-up questions that the user
might want to ask next. Make them specific, actionable, and contextually relevant.

Context: {context}

Guidelines:
- Keep questions concise (under 60 characters)
- Make them specific to the conversation topic
- Anticipate logical next steps or clarifications
- Use professional but approachable language
- Return ONLY the questions, one per line, without numbers or bullets"""

        # Build conversation context
        conversation_text = "\n".join([
            f"{msg['role'].upper()}: {msg['content']}"
            for msg in conversation_history[-6:]  # Last 6 messages
        ])

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Conversation:\n{conversation_text}\n\nGenerate 3-4 follow-up questions:"}
        ]

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Fast and cost-effective
                messages=messages,
                temperature=0.8,
                max_tokens=200
            )

            # Parse questions from response
            questions_text = response.choices[0].message.content.strip()
            questions = [
                q.strip().lstrip('1234567890.-•*) ')
                for q in questions_text.split('\n')
                if q.strip() and len(q.strip()) > 10
            ]

            return questions[:4]  # Return max 4 questions

        except Exception as e:
            # Return empty list on error to avoid breaking the UI
            print(f"Error generating follow-up questions: {str(e)}")
            return []
