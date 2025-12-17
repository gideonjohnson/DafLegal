import json
from typing import Dict, Any, List
from openai import OpenAI
from app.core.config import settings
from app.services.document_processor import DocumentProcessor


class AIContractAnalyzer:
    """Analyze contracts using OpenAI GPT-4o mini"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def analyze_contract(self, extracted_text: str) -> Dict[str, Any]:
        """
        Analyze contract and return structured results
        """
        # Chunk text if needed
        chunks = DocumentProcessor.chunk_text(extracted_text, max_chunk_size=8000)

        # For MVP, analyze first chunk or combine if small enough
        text_to_analyze = extracted_text[:15000]  # Limit for cost control

        # Build the analysis prompt
        prompt = self._build_analysis_prompt(text_to_analyze)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert legal contract analyzer. Analyze contracts thoroughly and provide structured JSON responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            result = json.loads(response.choices[0].message.content)
            return self._validate_and_structure_result(result)

        except Exception as e:
            raise ValueError(f"AI analysis failed: {str(e)}")

    def _build_analysis_prompt(self, text: str) -> str:
        """Build the analysis prompt with explicit rubric"""
        return f"""Analyze this legal contract and provide a structured JSON response with the following fields:

**Executive Summary:**
Provide 3-5 bullet points summarizing the key aspects of this contract in plain English.

**Key Terms:**
- parties: List of all parties involved (array)
- effective_date: When does the contract start? (string or null)
- term: Duration of the contract (string or null)
- payment: Payment terms and amounts (string or null)

**Detected Clauses:**
Identify and analyze these clause types (return as array of objects):
1. **Termination** - How can parties exit? Notice periods? Penalties?
2. **Indemnification** - Who protects whom from what liabilities?
3. **Liability Cap** - Are damages limited? To what amount?
4. **Intellectual Property** - Who owns what IP? Any licensing?
5. **Confidentiality** - What information is protected? For how long?
6. **Payment Terms** - When and how are payments made?
7. **Renewal/Auto-renewal** - Does it auto-renew? How to cancel?

For each clause, provide:
- type: (string) e.g., "termination", "indemnity", "liability"
- risk_level: "low", "medium", or "high"
- text: (string) Relevant excerpt from contract
- explanation: (string) Why this clause matters and what risk it presents

**Missing Clauses:**
Identify which of these standard clauses are MISSING (return as array of strings):
- force_majeure
- dispute_resolution
- governing_law
- data_protection
- warranties
- assignment_restrictions

**Risk Score:**
- risk_score: (float) Overall risk from 0-10 where 0=no risk, 10=extreme risk
- overall_risk_level: "low", "medium", or "high"

**Contract Text:**
{text}

Return ONLY valid JSON with this exact structure:
{{
  "executive_summary": ["bullet 1", "bullet 2", ...],
  "key_terms": {{
    "parties": ["Party A", "Party B"],
    "effective_date": "2024-01-01" or null,
    "term": "3 years" or null,
    "payment": "$50,000 annually" or null
  }},
  "detected_clauses": [
    {{
      "type": "termination",
      "risk_level": "medium",
      "text": "excerpt from contract...",
      "explanation": "why this matters..."
    }}
  ],
  "missing_clauses": ["force_majeure", "data_protection"],
  "risk_score": 6.5,
  "overall_risk_level": "medium"
}}
"""

    def _validate_and_structure_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI response and ensure required fields"""
        required_fields = [
            "executive_summary",
            "key_terms",
            "detected_clauses",
            "missing_clauses",
            "risk_score",
            "overall_risk_level"
        ]

        for field in required_fields:
            if field not in result:
                result[field] = self._get_default_value(field)

        # Ensure risk_score is float
        result["risk_score"] = float(result.get("risk_score", 5.0))

        # Ensure risk_level is valid
        valid_levels = ["low", "medium", "high"]
        if result.get("overall_risk_level") not in valid_levels:
            result["overall_risk_level"] = "medium"

        return result

    def _get_default_value(self, field: str) -> Any:
        """Get default value for missing field"""
        defaults = {
            "executive_summary": ["Contract analysis in progress..."],
            "key_terms": {
                "parties": [],
                "effective_date": None,
                "term": None,
                "payment": None
            },
            "detected_clauses": [],
            "missing_clauses": [],
            "risk_score": 5.0,
            "overall_risk_level": "medium"
        }
        return defaults.get(field, None)
