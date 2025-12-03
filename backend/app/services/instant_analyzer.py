"""
Instant Document Analyzer Service
Extracts obligations, risks, summary, and suggested revisions using GPT-5.1.
"""
import json
from typing import Dict, Any
from openai import OpenAI
from app.core.config import settings


class InstantDocumentAnalyzer:
    """Analyze documents instantly for obligations, risks, and revisions"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-5.1"

    def analyze(self, text: str, filename: str = "") -> Dict[str, Any]:
        """
        Perform comprehensive document analysis.

        Returns:
        {
            "document_type": "Contract/Agreement/Court Filing/etc.",
            "summary": "Plain English summary...",
            "key_findings": ["Finding 1", "Finding 2", ...],
            "obligations": [...],
            "risk_flags": [...],
            "suggested_revisions": [...],
            "overall_risk_score": 0-10,
            "compliance_score": 0-100,
            "clarity_score": 0-100
        }
        """
        # Limit text for cost control (analyze first ~20k chars)
        text_to_analyze = text[:20000]

        prompt = self._build_prompt(text_to_analyze, filename)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert legal document analyst with deep expertise in contract law, litigation, and regulatory compliance.

Your job is to:
1. Identify ALL obligations (who must do what, by when)
2. Flag risks and problematic clauses with severity ratings
3. Provide a clear, jargon-free summary
4. Suggest specific revisions to improve the document

Be thorough but concise. Focus on what matters most to the parties involved."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=4000
            )

            result = json.loads(response.choices[0].message.content)
            return self._validate_result(result)

        except Exception as e:
            # Return a fallback result on error
            return self._get_fallback_result(str(e))

    def _build_prompt(self, text: str, filename: str) -> str:
        """Build the comprehensive analysis prompt"""
        return f"""Analyze this legal document and provide a comprehensive JSON response.

DOCUMENT: {filename if filename else "Uploaded Document"}
---
{text}
---

Provide analysis in this exact JSON structure:

{{
  "document_type": "Contract | Agreement | Court Filing | Deposition | Lease | NDA | Employment Agreement | Other",

  "summary": "A clear 3-5 sentence summary in plain English explaining what this document is, who the parties are, and what it accomplishes. Avoid legal jargon.",

  "key_findings": [
    "Most important finding #1",
    "Most important finding #2",
    "Most important finding #3",
    "Most important finding #4",
    "Most important finding #5"
  ],

  "obligations": [
    {{
      "party": "Name of the party with the obligation",
      "description": "Clear description of what they must do",
      "deadline": "When it must be done (or 'Ongoing' or 'Upon request' or null)",
      "type": "payment | delivery | performance | compliance | notification | confidentiality | indemnification | other",
      "criticality": "low | medium | high | critical"
    }}
  ],

  "risk_flags": [
    {{
      "severity": "low | medium | high | critical",
      "title": "Short title for the risk",
      "description": "Detailed explanation of the risk",
      "location": "Section or paragraph reference if identifiable",
      "recommendation": "Specific action to mitigate this risk"
    }}
  ],

  "suggested_revisions": [
    {{
      "section": "Which part of the document",
      "issue": "What's wrong or could be improved",
      "current_text": "The problematic text (abbreviated if long)",
      "suggested_text": "Your recommended replacement text",
      "reason": "Why this change improves the document",
      "priority": "low | medium | high"
    }}
  ],

  "overall_risk_score": 0.0 to 10.0 (0=minimal risk, 10=extreme risk),
  "compliance_score": 0 to 100 (how well it meets standard legal requirements),
  "clarity_score": 0 to 100 (how clear and unambiguous the language is)
}}

IMPORTANT GUIDELINES:
1. Extract ALL obligations, not just major ones. Include payment schedules, notification requirements, compliance duties, etc.
2. Flag ANY clause that could disadvantage either party, is ambiguous, or is missing standard protections.
3. For suggested_revisions, provide actual replacement text, not just descriptions of changes.
4. Be specific about deadlines and amounts when present in the document.
5. Risk flags should be actionable - always include a specific recommendation.
6. If sections are missing (like governing law, dispute resolution), flag them as risks.

Return ONLY valid JSON."""

    def _validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and ensure all required fields exist"""

        # Ensure required string fields
        result["document_type"] = result.get("document_type", "Unknown")
        result["summary"] = result.get("summary", "Analysis could not generate a summary.")

        # Ensure required list fields
        result["key_findings"] = result.get("key_findings", [])[:5]
        result["obligations"] = self._validate_obligations(result.get("obligations", []))
        result["risk_flags"] = self._validate_risk_flags(result.get("risk_flags", []))
        result["suggested_revisions"] = self._validate_revisions(result.get("suggested_revisions", []))

        # Ensure numeric scores
        result["overall_risk_score"] = min(10.0, max(0.0, float(result.get("overall_risk_score", 5.0))))
        result["compliance_score"] = min(100.0, max(0.0, float(result.get("compliance_score", 70.0))))
        result["clarity_score"] = min(100.0, max(0.0, float(result.get("clarity_score", 70.0))))

        return result

    def _validate_obligations(self, obligations: list) -> list:
        """Validate obligation items"""
        valid = []
        valid_types = ["payment", "delivery", "performance", "compliance", "notification", "confidentiality", "indemnification", "other"]
        valid_criticality = ["low", "medium", "high", "critical"]

        for o in obligations:
            if isinstance(o, dict) and "party" in o and "description" in o:
                valid.append({
                    "party": str(o.get("party", "Unknown")),
                    "description": str(o.get("description", "")),
                    "deadline": o.get("deadline"),
                    "type": o.get("type", "other") if o.get("type") in valid_types else "other",
                    "criticality": o.get("criticality", "medium") if o.get("criticality") in valid_criticality else "medium"
                })
        return valid

    def _validate_risk_flags(self, risks: list) -> list:
        """Validate risk flag items"""
        valid = []
        valid_severity = ["low", "medium", "high", "critical"]

        for r in risks:
            if isinstance(r, dict) and "description" in r:
                valid.append({
                    "severity": r.get("severity", "medium") if r.get("severity") in valid_severity else "medium",
                    "title": str(r.get("title", "Risk Identified")),
                    "description": str(r.get("description", "")),
                    "location": r.get("location"),
                    "recommendation": str(r.get("recommendation", "Review with legal counsel"))
                })
        return valid

    def _validate_revisions(self, revisions: list) -> list:
        """Validate suggested revision items"""
        valid = []
        valid_priority = ["low", "medium", "high"]

        for s in revisions:
            if isinstance(s, dict) and "issue" in s:
                valid.append({
                    "section": str(s.get("section", "General")),
                    "issue": str(s.get("issue", "")),
                    "current_text": str(s.get("current_text", ""))[:500],
                    "suggested_text": str(s.get("suggested_text", ""))[:500],
                    "reason": str(s.get("reason", "")),
                    "priority": s.get("priority", "medium") if s.get("priority") in valid_priority else "medium"
                })
        return valid

    def _get_fallback_result(self, error: str) -> Dict[str, Any]:
        """Return a fallback result when analysis fails"""
        return {
            "document_type": "Unknown",
            "summary": f"Analysis encountered an error: {error}. Please try again.",
            "key_findings": ["Analysis could not be completed"],
            "obligations": [],
            "risk_flags": [{
                "severity": "medium",
                "title": "Analysis Incomplete",
                "description": "The document could not be fully analyzed.",
                "location": None,
                "recommendation": "Please retry or contact support if the issue persists."
            }],
            "suggested_revisions": [],
            "overall_risk_score": 5.0,
            "compliance_score": 50.0,
            "clarity_score": 50.0
        }
