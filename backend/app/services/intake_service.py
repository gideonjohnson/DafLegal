"""
Intake Triage Service

AI-powered client intake categorization, risk assessment, and lawyer routing.
"""

import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings
from datetime import datetime, timedelta


class IntakeTriageService:
    """AI-powered intake analysis and categorization"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o-mini"

    def analyze_intake(
        self,
        matter_title: str,
        matter_description: str,
        matter_type: str,
        practice_area: str,
        urgency: str,
        complexity: str,
        estimated_value: Optional[float] = None,
        deadline: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Analyze intake submission using AI

        Returns:
            - Suggested categorization
            - Risk assessment
            - Recommended actions
            - Priority calculation
            - Recommended lawyers (if specialization data available)
        """

        prompt = self._build_intake_analysis_prompt(
            matter_title, matter_description, matter_type,
            practice_area, urgency, complexity, estimated_value, deadline
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert legal practice manager specializing in client intake triage,
                        matter categorization, and resource allocation. Analyze intake submissions and provide
                        structured recommendations for matter handling, risk assessment, and lawyer assignment."""
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
            return self._validate_and_structure_result(result, deadline)

        except Exception as e:
            raise ValueError(f"Intake analysis failed: {str(e)}")

    def _build_intake_analysis_prompt(
        self,
        matter_title: str,
        matter_description: str,
        matter_type: str,
        practice_area: str,
        urgency: str,
        complexity: str,
        estimated_value: Optional[float],
        deadline: Optional[datetime]
    ) -> str:
        """Build AI prompt for intake analysis"""

        deadline_info = ""
        if deadline:
            days_until = (deadline - datetime.utcnow()).days
            deadline_info = f"\nDeadline: {deadline.strftime('%Y-%m-%d')} ({days_until} days from now)"

        value_info = ""
        if estimated_value:
            value_info = f"\nEstimated Matter Value: KES {estimated_value:,.2f}"

        return f"""Analyze this client intake submission and provide a structured JSON response:

**Matter Title:** {matter_title}

**Matter Description:**
{matter_description}

**Initial Categorization:**
- Matter Type: {matter_type}
- Practice Area: {practice_area}
- Stated Urgency: {urgency}
- Stated Complexity: {complexity}{value_info}{deadline_info}

**Please provide the following analysis in JSON format:**

{{
    "suggested_category": "string - Confirm or suggest better matter type (litigation, transactional, advisory, compliance, real_estate, corporate, employment, ip, family, criminal, conveyancing)",
    "suggested_practice_area": "string - Confirm or refine practice area",
    "suggested_urgency": "string - Assess true urgency: critical (< 3 days), high (< 1 week), medium (1-4 weeks), low (> 4 weeks)",
    "suggested_complexity": "string - Assess complexity: simple, moderate, complex, highly_complex",
    "confidence_score": number - Confidence in categorization (0-100),

    "risk_assessment": {{
        "risk_level": "string - Overall risk: low, medium, high, critical",
        "risk_factors": ["array of specific risk factors identified"],
        "risk_notes": "string - Brief explanation of key risks"
    }},

    "recommendations": {{
        "immediate_actions": ["array of actions to take immediately"],
        "required_documents": ["array of documents needed from client"],
        "searches_required": ["array of searches/verifications needed"],
        "estimated_duration_days": number - Estimated time to complete matter,
        "estimated_fee_range": {{
            "min": number - Minimum estimated legal fees (KES),
            "max": number - Maximum estimated legal fees (KES)
        }}
    }},

    "lawyer_requirements": {{
        "required_specialization": "string - Required specialization (e.g., conveyancing, corporate, litigation)",
        "minimum_experience_years": number - Minimum years of experience needed,
        "proficiency_level": "string - Required level: junior, intermediate, senior, expert",
        "special_skills": ["array of special skills or qualifications needed"]
    }},

    "priority_calculation": {{
        "urgency_score": number - Score for urgency (0-40),
        "value_score": number - Score for matter value (0-25),
        "complexity_score": number - Score for complexity (0-20),
        "risk_score": number - Score for risk factors (0-15),
        "total_priority": number - Total priority score (0-100),
        "priority_notes": "string - Explanation of priority calculation"
    }},

    "conflict_check": {{
        "requires_conflict_check": boolean - Is conflict check needed?,
        "conflict_risk_factors": ["array of potential conflict areas"],
        "parties_to_check": ["array of parties/entities to check for conflicts"]
    }},

    "additional_notes": "string - Any additional observations or recommendations"
}}

**Important Guidelines:**
- For Kenya-specific matters (conveyancing, land law), consider Kenyan legal requirements
- Assess if Land Control Board consent is needed for property transactions
- Consider statutory deadlines (e.g., court filing deadlines, limitation periods)
- Flag matters requiring specialized expertise
- Identify compliance requirements (KRA, NEMA, County Government, etc.)
- Consider client sophistication level based on description
"""

    def _validate_and_structure_result(
        self,
        result: Dict[str, Any],
        deadline: Optional[datetime]
    ) -> Dict[str, Any]:
        """Validate and structure the AI response"""

        # Extract and validate core fields
        structured_result = {
            "categorization": {
                "suggested_category": result.get("suggested_category", "general"),
                "suggested_practice_area": result.get("suggested_practice_area", "general"),
                "suggested_urgency": result.get("suggested_urgency", "medium"),
                "suggested_complexity": result.get("suggested_complexity", "moderate"),
                "confidence_score": min(100, max(0, result.get("confidence_score", 75)))
            },
            "risk_assessment": result.get("risk_assessment", {
                "risk_level": "medium",
                "risk_factors": [],
                "risk_notes": ""
            }),
            "recommendations": result.get("recommendations", {
                "immediate_actions": [],
                "required_documents": [],
                "searches_required": [],
                "estimated_duration_days": None,
                "estimated_fee_range": None
            }),
            "lawyer_requirements": result.get("lawyer_requirements", {
                "required_specialization": None,
                "minimum_experience_years": 0,
                "proficiency_level": "intermediate",
                "special_skills": []
            }),
            "priority_calculation": result.get("priority_calculation", {
                "total_priority": 50,
                "priority_notes": ""
            }),
            "conflict_check": result.get("conflict_check", {
                "requires_conflict_check": True,
                "conflict_risk_factors": [],
                "parties_to_check": []
            }),
            "additional_notes": result.get("additional_notes", "")
        }

        # Calculate final priority score if deadline exists
        priority = structured_result["priority_calculation"]["total_priority"]
        if deadline:
            days_until = (deadline - datetime.utcnow()).days
            if days_until < 3:
                priority = min(100, priority + 20)  # Critical deadline boost
            elif days_until < 7:
                priority = min(100, priority + 10)  # High urgency boost

        structured_result["priority_calculation"]["total_priority"] = priority

        return structured_result

    def calculate_priority_score(
        self,
        urgency: str,
        complexity: str,
        estimated_value: Optional[float] = None,
        risk_level: str = "medium",
        deadline: Optional[datetime] = None,
        is_existing_client: bool = False
    ) -> float:
        """
        Calculate priority score (0-100) based on multiple factors

        Scoring breakdown:
        - Urgency: 0-40 points
        - Value: 0-25 points
        - Complexity: 0-20 points
        - Risk: 0-15 points
        - Client status: 0-5 points (existing client bonus)
        """

        score = 0.0

        # Urgency scoring (0-40)
        urgency_scores = {
            "critical": 40,
            "high": 30,
            "medium": 20,
            "low": 10
        }
        score += urgency_scores.get(urgency.lower(), 20)

        # Deadline adjustment
        if deadline:
            days_until = (deadline - datetime.utcnow()).days
            if days_until < 3:
                score += 15  # Critical deadline
            elif days_until < 7:
                score += 10  # Urgent deadline
            elif days_until < 14:
                score += 5   # Soon deadline

        # Value scoring (0-25)
        if estimated_value:
            if estimated_value >= 10000000:  # 10M KES+
                score += 25
            elif estimated_value >= 5000000:  # 5-10M KES
                score += 20
            elif estimated_value >= 1000000:  # 1-5M KES
                score += 15
            elif estimated_value >= 500000:   # 500K-1M KES
                score += 10
            else:
                score += 5

        # Complexity scoring (0-20)
        complexity_scores = {
            "highly_complex": 20,
            "complex": 15,
            "moderate": 10,
            "simple": 5
        }
        score += complexity_scores.get(complexity.lower(), 10)

        # Risk scoring (0-15)
        risk_scores = {
            "critical": 15,
            "high": 12,
            "medium": 8,
            "low": 4
        }
        score += risk_scores.get(risk_level.lower(), 8)

        # Existing client bonus (0-5)
        if is_existing_client:
            score += 5

        # Cap at 100
        return min(100.0, score)

    def match_lawyers(
        self,
        required_specialization: str,
        minimum_experience_years: int,
        proficiency_level: str,
        matter_value: Optional[float] = None,
        available_lawyers: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Match intake to suitable lawyers based on specialization, availability, and capacity

        Returns list of matched lawyers sorted by match score
        """

        if not available_lawyers:
            return []

        matched_lawyers = []

        for lawyer in available_lawyers:
            match_score = 0
            reasons = []

            # Check specialization match (0-40 points)
            if lawyer.get("specialization", "").lower() == required_specialization.lower():
                match_score += 40
                reasons.append("Exact specialization match")
            elif required_specialization.lower() in lawyer.get("specialization", "").lower():
                match_score += 25
                reasons.append("Related specialization")

            # Check experience (0-25 points)
            years_exp = lawyer.get("years_experience", 0)
            if years_exp >= minimum_experience_years * 1.5:
                match_score += 25
                reasons.append("Highly experienced")
            elif years_exp >= minimum_experience_years:
                match_score += 20
                reasons.append("Meets experience requirement")
            elif years_exp >= minimum_experience_years * 0.75:
                match_score += 10
                reasons.append("Nearly meets experience requirement")

            # Check proficiency level (0-20 points)
            proficiency_map = {"junior": 1, "intermediate": 2, "senior": 3, "expert": 4}
            required_level = proficiency_map.get(proficiency_level.lower(), 2)
            lawyer_level = proficiency_map.get(lawyer.get("proficiency_level", "").lower(), 2)

            if lawyer_level >= required_level:
                match_score += 20
                reasons.append("Meets proficiency requirement")
            elif lawyer_level == required_level - 1:
                match_score += 10
                reasons.append("Close to required proficiency")

            # Check availability (0-10 points)
            if lawyer.get("is_available", False) and lawyer.get("is_accepting_new_matters", False):
                current_workload = lawyer.get("current_workload", 0)
                max_capacity = lawyer.get("max_capacity", 10)
                capacity_ratio = current_workload / max_capacity if max_capacity > 0 else 1

                if capacity_ratio < 0.5:
                    match_score += 10
                    reasons.append("Low workload")
                elif capacity_ratio < 0.75:
                    match_score += 7
                    reasons.append("Moderate workload")
                elif capacity_ratio < 0.9:
                    match_score += 4
                    reasons.append("Near capacity")

            # Check matter value preference (0-5 points)
            if matter_value and lawyer.get("minimum_matter_value"):
                if matter_value >= lawyer.get("minimum_matter_value"):
                    match_score += 5
                    reasons.append("Meets value preference")

            # Only include lawyers with reasonable match score
            if match_score >= 30:
                matched_lawyers.append({
                    "user_id": lawyer.get("user_id"),
                    "name": lawyer.get("name", "Unknown"),
                    "specialization": lawyer.get("specialization"),
                    "proficiency_level": lawyer.get("proficiency_level"),
                    "years_experience": lawyer.get("years_experience"),
                    "current_workload": lawyer.get("current_workload", 0),
                    "max_capacity": lawyer.get("max_capacity", 10),
                    "match_score": round(match_score, 1),
                    "match_reasons": reasons,
                    "is_available": lawyer.get("is_available", False)
                })

        # Sort by match score (descending)
        matched_lawyers.sort(key=lambda x: x["match_score"], reverse=True)

        return matched_lawyers

    def identify_required_documents(
        self,
        matter_type: str,
        practice_area: str,
        transaction_details: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Identify required documents based on matter type and practice area
        Kenya-specific requirements included
        """

        documents = []

        # Common documents for all matters
        documents.extend([
            "Client ID copy or passport",
            "KRA PIN certificate"
        ])

        # Matter-type specific documents
        if matter_type.lower() in ["conveyancing", "real_estate"]:
            documents.extend([
                "Title deed or official search copy",
                "Rates clearance certificate",
                "Land rent clearance (if applicable)",
                "Survey plan or deed plan",
                "Valuation report (if available)"
            ])

            if transaction_details and transaction_details.get("transaction_type") == "sale":
                documents.extend([
                    "Sale agreement (if already drafted)",
                    "Land Control Board consent (if required)",
                    "Spouse consent (if married)"
                ])

        elif matter_type.lower() == "corporate":
            documents.extend([
                "Certificate of incorporation",
                "CR12 (Company details)",
                "Company PIN certificate",
                "Memorandum and Articles of Association",
                "Board resolution (if applicable)"
            ])

        elif matter_type.lower() == "employment":
            documents.extend([
                "Employment contract or offer letter",
                "Payslips (last 3 months)",
                "Correspondence related to matter"
            ])

        elif matter_type.lower() == "litigation":
            documents.extend([
                "Court documents (if any)",
                "Correspondence with other party",
                "Supporting evidence documents",
                "Witness statements (if available)"
            ])

        return documents
