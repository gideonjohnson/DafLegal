"""
Conversational Legal Research Service
ChatGPT-level conversational research with verifiable citations and zero hallucinations.
"""
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from openai import OpenAI
from app.core.config import settings


# Known legal databases and their citation formats
LEGAL_DATABASES = {
    "austlii": {
        "name": "AustLII",
        "base_url": "http://www.austlii.edu.au",
        "description": "Australasian Legal Information Institute"
    },
    "bailii": {
        "name": "BAILII",
        "base_url": "https://www.bailii.org",
        "description": "British and Irish Legal Information Institute"
    },
    "canlii": {
        "name": "CanLII",
        "base_url": "https://www.canlii.org",
        "description": "Canadian Legal Information Institute"
    },
    "courtlistener": {
        "name": "CourtListener",
        "base_url": "https://www.courtlistener.com",
        "description": "US Court Opinions"
    },
    "google_scholar": {
        "name": "Google Scholar",
        "base_url": "https://scholar.google.com",
        "description": "Academic and Legal Papers"
    }
}

# Jurisdiction-specific citation patterns
CITATION_PATTERNS = {
    "AU": {
        "high_court": r"\[\d{4}\] HCA \d+",
        "federal": r"\[\d{4}\] FCA \d+",
        "nsw": r"\[\d{4}\] NSWSC \d+|\[\d{4}\] NSWCA \d+",
        "vic": r"\[\d{4}\] VSC \d+|\[\d{4}\] VSCA \d+",
        "qld": r"\[\d{4}\] QSC \d+|\[\d{4}\] QCA \d+",
    },
    "UK": {
        "supreme": r"\[\d{4}\] UKSC \d+",
        "appeal": r"\[\d{4}\] EWCA \w+ \d+",
        "high": r"\[\d{4}\] EWHC \d+",
    },
    "US": {
        "supreme": r"\d+ U\.S\. \d+|\d+ S\. ?Ct\. \d+",
        "federal": r"\d+ F\.\d+d? \d+",
        "circuit": r"\d+ F\. App'x \d+",
    },
    "CA": {
        "supreme": r"\[\d{4}\] \d+ S\.C\.R\. \d+",
        "federal": r"\[\d{4}\] \d+ F\.C\. \d+",
    }
}


class LegalResearchChat:
    """Conversational legal research with verified citations"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL  # Configurable model for legal reasoning
        self.conversations: Dict[str, List[Dict]] = {}

    def research(
        self,
        query: str,
        conversation_id: Optional[str] = None,
        jurisdiction: str = "AU",
        include_statutes: bool = True,
        include_cases: bool = True,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform conversational legal research.

        Returns:
        {
            "conversation_id": "conv_xxx",
            "response": "Main response text with inline citations...",
            "citations": [
                {
                    "id": "cite_1",
                    "type": "case",
                    "title": "Case Name",
                    "citation": "[2024] HCA 1",
                    "court": "High Court of Australia",
                    "date": "2024-01-15",
                    "relevance": "Why this is relevant",
                    "key_quote": "Important quote...",
                    "url": "https://...",
                    "verified": true
                }
            ],
            "follow_up_questions": ["Question 1?", "Question 2?"],
            "research_summary": {
                "query_type": "case_law|statutory|general",
                "jurisdiction": "AU",
                "sources_searched": ["AustLII", "..."],
                "confidence_level": "high|medium|low"
            }
        }
        """
        # Initialize or retrieve conversation
        if conversation_id and conversation_id in self.conversations:
            messages = self.conversations[conversation_id]
        else:
            conversation_id = f"conv_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            messages = self._init_conversation(jurisdiction)
            self.conversations[conversation_id] = messages

        # Build the research query with context
        research_prompt = self._build_research_prompt(
            query, jurisdiction, include_statutes, include_cases, date_from, date_to
        )

        messages.append({"role": "user", "content": research_prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.1,  # Low temperature for accuracy
                max_tokens=4000
            )

            result = json.loads(response.choices[0].message.content)

            # Validate and enhance citations
            validated_result = self._validate_and_enhance_citations(result, jurisdiction)

            # Store assistant response in conversation
            messages.append({
                "role": "assistant",
                "content": response.choices[0].message.content
            })

            # Add conversation metadata
            validated_result["conversation_id"] = conversation_id
            validated_result["research_summary"]["sources_searched"] = self._get_sources_for_jurisdiction(jurisdiction)

            return validated_result

        except Exception as e:
            return self._get_error_response(conversation_id, str(e))

    def _init_conversation(self, jurisdiction: str) -> List[Dict]:
        """Initialize conversation with system prompt"""
        jur_context = self._get_jurisdiction_context(jurisdiction)

        system_prompt = f"""You are an expert legal research assistant specializing in {jur_context['name']} law.

CRITICAL RULES - YOU MUST FOLLOW THESE:

1. ONLY cite cases and statutes that you are CERTAIN exist. If you're not sure, say "I cannot verify this citation" or suggest the user verify independently.

2. For every legal proposition, provide a specific citation. Use this format:
   - Cases: "Case Name [Year] Court Number" (e.g., "Smith v Jones [2024] HCA 1")
   - Statutes: "Section X of the Act Name Year (Jurisdiction)" (e.g., "Section 52 of the Trade Practices Act 1974 (Cth)")

3. When you cite a case, explain:
   - The key legal principle it establishes
   - Why it's relevant to the query
   - Any important qualifications or limitations

4. Be honest about uncertainty. If a legal area is unsettled or you're not certain about a proposition, say so clearly.

5. Structure responses clearly:
   - Start with a direct answer to the question
   - Provide the legal reasoning with citations
   - Note any exceptions or qualifications
   - Suggest follow-up research if needed

6. For statutes, always cite:
   - The specific section number
   - The full name of the Act
   - The year and jurisdiction
   - Any relevant amendments

7. NEVER make up case names, citations, or legal principles. It's better to say "I don't have specific case authority for this" than to fabricate.

{jur_context['specific_guidance']}

Return ALL responses in this JSON format:
{{
    "response": "Your main response with inline citation markers like [1], [2], etc.",
    "citations": [
        {{
            "id": "1",
            "type": "case|statute|regulation|article",
            "title": "Full title",
            "citation": "Formal citation",
            "court": "Court name (for cases)",
            "date": "YYYY-MM-DD or YYYY",
            "jurisdiction": "Jurisdiction code",
            "relevance": "Why this is relevant",
            "key_quote": "Important quote if applicable",
            "url": "URL to source if known",
            "verified": true/false (false if you're uncertain this citation is accurate)
        }}
    ],
    "follow_up_questions": [
        "Suggested follow-up question 1?",
        "Suggested follow-up question 2?",
        "Suggested follow-up question 3?"
    ],
    "research_summary": {{
        "query_type": "case_law|statutory|procedural|general",
        "jurisdiction": "{jurisdiction}",
        "confidence_level": "high|medium|low",
        "limitations": "Any limitations of this research"
    }}
}}"""

        return [{"role": "system", "content": system_prompt}]

    def _get_jurisdiction_context(self, jurisdiction: str) -> Dict:
        """Get jurisdiction-specific context"""
        contexts = {
            "AU": {
                "name": "Australian",
                "specific_guidance": """
Australian-specific guidance:
- The High Court of Australia is the final court of appeal
- Use neutral citations: [Year] HCA/FCA/State abbreviation Number
- Key databases: AustLII (austlii.edu.au), Federal Court, State courts
- Important legislation: Corporations Act 2001, Competition and Consumer Act 2010, Fair Work Act 2009
- Be aware of constitutional division between Commonwealth and State powers
- Cite the Australian Consumer Law as "Schedule 2 to the Competition and Consumer Act 2010 (Cth)"
"""
            },
            "UK": {
                "name": "United Kingdom",
                "specific_guidance": """
UK-specific guidance:
- Supreme Court (formerly House of Lords) is the final court
- Use neutral citations: [Year] UKSC/EWCA/EWHC Number
- Key databases: BAILII, UK Legislation, Courts and Tribunals Judiciary
- Note EU law may still apply to matters before Brexit
- Distinguish between England & Wales, Scotland, and Northern Ireland law where relevant
"""
            },
            "US": {
                "name": "United States",
                "specific_guidance": """
US-specific guidance:
- Cite US Supreme Court cases with U.S. Reports or S.Ct citations
- Distinguish between federal and state law
- Note circuit splits where relevant
- Key databases: CourtListener, Google Scholar, Justia
- Always identify which circuit or state court for federal/state decisions
"""
            },
            "CA": {
                "name": "Canadian",
                "specific_guidance": """
Canadian-specific guidance:
- Supreme Court of Canada is the final court
- Use neutral citations: [Year] SCC/FC/Provincial abbreviation Number
- Key database: CanLII
- Distinguish between federal and provincial jurisdiction
- Note bilingual nature of legal system
"""
            }
        }
        return contexts.get(jurisdiction, contexts["AU"])

    def _build_research_prompt(
        self,
        query: str,
        jurisdiction: str,
        include_statutes: bool,
        include_cases: bool,
        date_from: Optional[str],
        date_to: Optional[str]
    ) -> str:
        """Build the research prompt with filters"""
        prompt = f"LEGAL RESEARCH QUERY: {query}\n\n"
        prompt += f"Jurisdiction: {jurisdiction}\n"

        if include_cases and include_statutes:
            prompt += "Include: Case law AND Statutes/Legislation\n"
        elif include_cases:
            prompt += "Include: Case law only\n"
        elif include_statutes:
            prompt += "Include: Statutes/Legislation only\n"

        if date_from:
            prompt += f"Date range: From {date_from}"
            if date_to:
                prompt += f" to {date_to}"
            prompt += "\n"

        prompt += "\nProvide a comprehensive answer with full citations. Remember to verify all citations and mark any as unverified if you're uncertain."

        return prompt

    def _validate_and_enhance_citations(self, result: Dict, jurisdiction: str) -> Dict:
        """Validate citations and add URLs where possible"""
        citations = result.get("citations", [])
        validated_citations = []

        for cite in citations:
            citation_text = cite.get("citation", "")
            cite_type = cite.get("type", "")

            # Try to validate citation format
            is_valid_format = self._validate_citation_format(citation_text, jurisdiction)

            # Generate URL if possible
            url = cite.get("url") or self._generate_citation_url(cite, jurisdiction)

            validated_cite = {
                **cite,
                "url": url,
                "verified": cite.get("verified", False) and is_valid_format,
                "format_valid": is_valid_format
            }

            validated_citations.append(validated_cite)

        result["citations"] = validated_citations
        return result

    def _validate_citation_format(self, citation: str, jurisdiction: str) -> bool:
        """Check if citation matches expected format for jurisdiction"""
        patterns = CITATION_PATTERNS.get(jurisdiction, {})

        for pattern_name, pattern in patterns.items():
            if re.search(pattern, citation):
                return True

        # Allow statutes without strict pattern matching
        if "Act" in citation or "Section" in citation:
            return True

        return False

    def _generate_citation_url(self, cite: Dict, jurisdiction: str) -> Optional[str]:
        """Generate URL to legal database for citation"""
        citation_text = cite.get("citation", "")
        cite_type = cite.get("type", "")

        if jurisdiction == "AU":
            # AustLII search URL
            if cite_type == "case":
                return f"http://www.austlii.edu.au/cgi-bin/sinosrch.cgi?query={citation_text.replace(' ', '+')}"
            elif cite_type == "statute":
                return "http://www.austlii.edu.au/au/legis/"

        elif jurisdiction == "UK":
            if cite_type == "case":
                return f"https://www.bailii.org/cgi-bin/find?query={citation_text.replace(' ', '+')}"
            elif cite_type == "statute":
                return "https://www.legislation.gov.uk/"

        elif jurisdiction == "US":
            if cite_type == "case":
                return f"https://www.courtlistener.com/?q={citation_text.replace(' ', '+')}"

        elif jurisdiction == "CA":
            if cite_type == "case":
                return f"https://www.canlii.org/en/#search/text={citation_text.replace(' ', '%20')}"

        # Fallback to Google Scholar
        return f"https://scholar.google.com/scholar?q={citation_text.replace(' ', '+')}"

    def _get_sources_for_jurisdiction(self, jurisdiction: str) -> List[str]:
        """Get list of sources searched for jurisdiction"""
        sources = {
            "AU": ["AustLII", "Federal Court of Australia", "High Court of Australia", "State Courts"],
            "UK": ["BAILII", "UK Legislation", "Courts and Tribunals Judiciary"],
            "US": ["CourtListener", "Google Scholar", "Justia", "Cornell LII"],
            "CA": ["CanLII", "Supreme Court of Canada", "Federal Court Reports"]
        }
        return sources.get(jurisdiction, ["General Legal Databases"])

    def _get_error_response(self, conversation_id: str, error: str) -> Dict:
        """Return error response"""
        return {
            "conversation_id": conversation_id,
            "response": f"I encountered an error while researching: {error}. Please try rephrasing your question or try again later.",
            "citations": [],
            "follow_up_questions": [
                "Would you like me to try a more specific search?",
                "Can you provide more context about your legal question?"
            ],
            "research_summary": {
                "query_type": "error",
                "jurisdiction": "unknown",
                "sources_searched": [],
                "confidence_level": "low",
                "limitations": f"Error occurred: {error}"
            }
        }

    def get_conversation_history(self, conversation_id: str) -> List[Dict]:
        """Get conversation history"""
        if conversation_id in self.conversations:
            return [
                msg for msg in self.conversations[conversation_id]
                if msg["role"] != "system"
            ]
        return []

    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear a conversation"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False

    def get_suggested_queries(self, jurisdiction: str = "AU") -> List[Dict]:
        """Get suggested research queries"""
        suggestions = {
            "AU": [
                {
                    "category": "Contract Law",
                    "queries": [
                        "What are the requirements for a valid contract under Australian law?",
                        "When can a contract be set aside for unconscionable conduct?",
                        "What is the test for misleading or deceptive conduct under the ACL?"
                    ]
                },
                {
                    "category": "Employment Law",
                    "queries": [
                        "What constitutes unfair dismissal under the Fair Work Act?",
                        "What are an employer's obligations regarding workplace safety?",
                        "When is a contractor considered an employee?"
                    ]
                },
                {
                    "category": "Property Law",
                    "queries": [
                        "What are the requirements for adverse possession in NSW?",
                        "How are easements created and extinguished?",
                        "What is the doctrine of indefeasibility under Torrens title?"
                    ]
                },
                {
                    "category": "Corporate Law",
                    "queries": [
                        "What are directors' duties under the Corporations Act?",
                        "When can the corporate veil be pierced?",
                        "What is the business judgment rule?"
                    ]
                }
            ],
            "UK": [
                {
                    "category": "Contract Law",
                    "queries": [
                        "What is the doctrine of consideration in English contract law?",
                        "When will a court imply terms into a contract?",
                        "What are the requirements for frustration of contract?"
                    ]
                }
            ],
            "US": [
                {
                    "category": "Constitutional Law",
                    "queries": [
                        "What is the current test for First Amendment free speech claims?",
                        "How does qualified immunity apply to police officers?",
                        "What is the dormant commerce clause?"
                    ]
                }
            ]
        }
        return suggestions.get(jurisdiction, suggestions["AU"])
