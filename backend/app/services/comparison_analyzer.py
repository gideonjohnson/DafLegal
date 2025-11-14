import json
import difflib
from typing import Dict, Any, List
from openai import OpenAI
from app.core.config import settings


class ContractComparisonAnalyzer:
    """Compare two contract versions using AI and text diff"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o-mini"

    def compare_contracts(
        self,
        original_text: str,
        revised_text: str,
        original_analysis: Dict[str, Any],
        revised_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compare two contract versions and return structured diff
        """
        # 1. Generate text-level diff
        text_changes = self._generate_text_diff(original_text, revised_text)

        # 2. Analyze clause changes
        clause_changes = self._analyze_clause_changes(
            original_analysis.get("detected_clauses", []),
            revised_analysis.get("detected_clauses", [])
        )

        # 3. Calculate risk delta
        risk_delta = self._calculate_risk_delta(original_analysis, revised_analysis)

        # 4. Use AI to identify substantive vs cosmetic changes
        ai_analysis = self._ai_semantic_comparison(
            original_text[:10000],
            revised_text[:10000],
            text_changes
        )

        # 5. Combine results
        return {
            "summary": ai_analysis.get("summary"),
            "additions": ai_analysis.get("additions", []),
            "deletions": ai_analysis.get("deletions", []),
            "modifications": ai_analysis.get("modifications", []),
            "clause_changes": clause_changes,
            "risk_delta": risk_delta,
            "substantive_changes": ai_analysis.get("substantive_changes", []),
            "cosmetic_changes": ai_analysis.get("cosmetic_changes", [])
        }

    def _generate_text_diff(self, original: str, revised: str) -> List[Dict[str, Any]]:
        """Generate basic text diff using difflib"""
        original_lines = original.split('\n')
        revised_lines = revised.split('\n')

        differ = difflib.Differ()
        diff = list(differ.compare(original_lines, revised_lines))

        changes = []
        for line in diff[:100]:  # Limit for performance
            if line.startswith('+ '):
                changes.append({
                    "type": "addition",
                    "text": line[2:].strip(),
                    "original_text": None,
                    "revised_text": line[2:].strip()
                })
            elif line.startswith('- '):
                changes.append({
                    "type": "deletion",
                    "text": line[2:].strip(),
                    "original_text": line[2:].strip(),
                    "revised_text": None
                })

        return changes

    def _analyze_clause_changes(
        self,
        original_clauses: List[Dict],
        revised_clauses: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Compare clauses between two versions"""
        clause_changes = []
        original_types = {c["type"]: c for c in original_clauses}
        revised_types = {c["type"]: c for c in revised_clauses}

        # Find added clauses
        for clause_type in set(revised_types.keys()) - set(original_types.keys()):
            clause_changes.append({
                "clause_type": clause_type,
                "change_type": "added",
                "original_clause": None,
                "revised_clause": revised_types[clause_type],
                "impact_summary": f"New {clause_type} clause added"
            })

        # Find removed clauses
        for clause_type in set(original_types.keys()) - set(revised_types.keys()):
            clause_changes.append({
                "clause_type": clause_type,
                "change_type": "removed",
                "original_clause": original_types[clause_type],
                "revised_clause": None,
                "impact_summary": f"{clause_type.capitalize()} clause removed"
            })

        # Find modified clauses
        for clause_type in set(original_types.keys()) & set(revised_types.keys()):
            original = original_types[clause_type]
            revised = revised_types[clause_type]

            if original["text"] != revised["text"]:
                clause_changes.append({
                    "clause_type": clause_type,
                    "change_type": "modified",
                    "original_clause": original,
                    "revised_clause": revised,
                    "impact_summary": f"{clause_type.capitalize()} clause modified"
                })

        return clause_changes

    def _calculate_risk_delta(
        self,
        original_analysis: Dict[str, Any],
        revised_analysis: Dict[str, Any]
    ) -> float:
        """Calculate change in risk score"""
        original_risk = original_analysis.get("risk_score", 5.0)
        revised_risk = revised_analysis.get("risk_score", 5.0)
        return round(revised_risk - original_risk, 2)

    def _ai_semantic_comparison(
        self,
        original_text: str,
        revised_text: str,
        text_changes: List[Dict]
    ) -> Dict[str, Any]:
        """Use AI to analyze semantic differences"""
        prompt = self._build_comparison_prompt(original_text, revised_text)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert legal contract analyst. Compare contract versions and identify substantive vs. cosmetic changes."
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
            return result

        except Exception as e:
            # Fallback to basic analysis if AI fails
            return {
                "summary": "Contract comparison completed",
                "additions": [],
                "deletions": [],
                "modifications": [],
                "substantive_changes": [],
                "cosmetic_changes": []
            }

    def _build_comparison_prompt(self, original: str, revised: str) -> str:
        """Build prompt for AI comparison"""
        return f"""Compare these two contract versions and identify the key differences.

**ORIGINAL VERSION:**
{original}

**REVISED VERSION:**
{revised}

Provide a JSON response with the following structure:

{{
  "summary": "Brief summary of overall changes in 2-3 sentences",
  "additions": [
    {{
      "type": "addition",
      "original_text": null,
      "revised_text": "the new text that was added",
      "location": "Section 3.2",
      "is_substantive": true
    }}
  ],
  "deletions": [
    {{
      "type": "deletion",
      "original_text": "the text that was removed",
      "revised_text": null,
      "location": "Section 5.1",
      "is_substantive": true
    }}
  ],
  "modifications": [
    {{
      "type": "modification",
      "original_text": "original wording",
      "revised_text": "revised wording",
      "location": "Section 2.4",
      "is_substantive": false
    }}
  ],
  "substantive_changes": [
    {{
      "type": "modification",
      "original_text": "liability capped at $100,000",
      "revised_text": "liability capped at $50,000",
      "location": "Section 8.3",
      "is_substantive": true
    }}
  ],
  "cosmetic_changes": [
    {{
      "type": "modification",
      "original_text": "Company",
      "revised_text": "the Company",
      "location": "Throughout",
      "is_substantive": false
    }}
  ]
}}

Focus on:
1. **Substantive changes**: Changes to legal obligations, rights, money, dates, or terms
2. **Cosmetic changes**: Formatting, punctuation, capitalization, or minor wording without legal impact

Return ONLY valid JSON.
"""
