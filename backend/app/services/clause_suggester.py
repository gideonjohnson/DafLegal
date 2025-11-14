from typing import List, Dict, Any
from sqlmodel import Session

from app.models.clause import ClauseCategory, Clause, ClauseSuggestion
from app.models.contract import ContractAnalysis
from app.services.clause_service import ClauseService


class ClauseSuggester:
    """Suggest relevant clauses based on contract analysis"""

    @staticmethod
    def suggest_clauses_for_contract(
        session: Session,
        contract_id: int,
        user_id: int,
        analysis: ContractAnalysis
    ) -> List[Dict[str, Any]]:
        """
        Suggest clauses based on missing clauses and detected issues
        """
        suggestions = []

        # Get missing clauses from analysis
        missing_clauses = analysis.missing_clauses or []

        # Map missing clause names to categories
        clause_mapping = {
            "force_majeure": ClauseCategory.FORCE_MAJEURE,
            "dispute_resolution": ClauseCategory.DISPUTE_RESOLUTION,
            "governing_law": ClauseCategory.GOVERNING_LAW,
            "data_protection": ClauseCategory.DATA_PROTECTION,
            "warranties": ClauseCategory.WARRANTIES,
            "assignment_restrictions": ClauseCategory.ASSIGNMENT
        }

        # For each missing clause, find relevant suggestions
        for missing in missing_clauses:
            category = clause_mapping.get(missing)
            if not category:
                continue

            # Get similar clauses from library
            similar_clauses = ClauseService.get_similar_clauses(
                session=session,
                category=category,
                user_id=user_id,
                limit=3
            )

            if similar_clauses:
                suggestion = {
                    "category": category,
                    "reason": f"Contract is missing a {missing.replace('_', ' ')} clause",
                    "suggested_clauses": [
                        {
                            "clause_id": c.clause_id,
                            "title": c.title,
                            "text": c.text,
                            "risk_level": c.risk_level,
                            "usage_count": c.usage_count
                        }
                        for c in similar_clauses
                    ]
                }
                suggestions.append(suggestion)

                # Log suggestion in database
                clause_suggestion = ClauseSuggestion(
                    contract_id=contract_id,
                    user_id=user_id,
                    category=category,
                    reason=suggestion["reason"],
                    suggested_clause_ids=[c.id for c in similar_clauses]
                )
                session.add(clause_suggestion)

        # Also suggest based on detected high-risk clauses
        detected_clauses = analysis.detected_clauses or []
        for clause in detected_clauses:
            if clause.get("risk_level") in ["high", "medium"]:
                clause_type = clause.get("type")
                if clause_type:
                    try:
                        category = ClauseCategory(clause_type)
                        # Find better alternatives
                        alternatives = session.query(Clause).filter(
                            Clause.category == category,
                            Clause.risk_level.in_(["favorable", "neutral"]),
                            Clause.user_id == user_id,
                            Clause.is_latest_version == True
                        ).order_by(Clause.usage_count.desc()).limit(2).all()

                        if alternatives:
                            suggestion = {
                                "category": category,
                                "reason": f"Consider replacing high-risk {clause_type} clause with a more favorable alternative",
                                "suggested_clauses": [
                                    {
                                        "clause_id": c.clause_id,
                                        "title": c.title,
                                        "text": c.text,
                                        "risk_level": c.risk_level,
                                        "usage_count": c.usage_count
                                    }
                                    for c in alternatives
                                ]
                            }
                            suggestions.append(suggestion)
                    except ValueError:
                        # Invalid category, skip
                        pass

        session.commit()
        return suggestions

    @staticmethod
    def get_suggestions_for_contract(
        session: Session,
        contract_id: int,
        user_id: int
    ) -> List[Dict[str, Any]]:
        """
        Get previously generated suggestions for a contract
        """
        suggestions = session.query(ClauseSuggestion).filter(
            ClauseSuggestion.contract_id == contract_id,
            ClauseSuggestion.user_id == user_id
        ).all()

        result = []
        for suggestion in suggestions:
            # Get the actual clauses
            clauses = session.query(Clause).filter(
                Clause.id.in_(suggestion.suggested_clause_ids)
            ).all()

            result.append({
                "category": suggestion.category,
                "reason": suggestion.reason,
                "suggested_clauses": [
                    {
                        "clause_id": c.clause_id,
                        "title": c.title,
                        "text": c.text,
                        "risk_level": c.risk_level,
                        "usage_count": c.usage_count
                    }
                    for c in clauses
                ],
                "was_accepted": suggestion.was_accepted,
                "created_at": suggestion.created_at
            })

        return result
