import re
from typing import List, Dict, Any, Tuple
from sqlmodel import Session

from app.models.compliance import (
    ComplianceRule, RuleType, RuleSeverity, ComplianceStatus
)
from app.models.contract import ContractAnalysis


class ComplianceEngine:
    """Core engine for evaluating contracts against compliance rules"""

    @staticmethod
    def evaluate_rule(
        rule: ComplianceRule,
        contract_analysis: ContractAnalysis,
        contract_text: str
    ) -> Dict[str, Any]:
        """
        Evaluate a single rule against a contract
        Returns: {status, message, location, suggestion, auto_fixable}
        """
        rule_type = rule.rule_type
        parameters = rule.parameters

        # Dispatch to appropriate rule handler
        if rule_type == RuleType.REQUIRED_CLAUSE:
            return ComplianceEngine._check_required_clause(
                rule, contract_analysis, parameters
            )
        elif rule_type == RuleType.PROHIBITED_CLAUSE:
            return ComplianceEngine._check_prohibited_clause(
                rule, contract_analysis, parameters
            )
        elif rule_type == RuleType.REQUIRED_TERM:
            return ComplianceEngine._check_required_term(
                rule, contract_text, parameters
            )
        elif rule_type == RuleType.PROHIBITED_TERM:
            return ComplianceEngine._check_prohibited_term(
                rule, contract_text, parameters
            )
        elif rule_type == RuleType.NUMERIC_THRESHOLD:
            return ComplianceEngine._check_numeric_threshold(
                rule, contract_analysis, parameters
            )
        elif rule_type == RuleType.CUSTOM_PATTERN:
            return ComplianceEngine._check_custom_pattern(
                rule, contract_text, parameters
            )
        else:
            return {
                "status": "warning",
                "message": f"Unknown rule type: {rule_type}",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

    @staticmethod
    def _check_required_clause(
        rule: ComplianceRule,
        analysis: ContractAnalysis,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if required clause is present"""
        required_category = parameters.get("category")
        must_contain = parameters.get("must_contain")

        detected_clauses = analysis.detected_clauses or []

        # Find clauses of required category
        matching_clauses = [
            c for c in detected_clauses
            if c.get("type") == required_category
        ]

        if not matching_clauses:
            return {
                "status": "failed",
                "message": f"Contract missing required {required_category} clause",
                "location": None,
                "suggestion": rule.auto_fix_suggestion or f"Add a {required_category} clause",
                "auto_fixable": rule.auto_fix
            }

        # If specific content required, check for it
        if must_contain:
            for clause in matching_clauses:
                if must_contain.lower() in clause.get("text", "").lower():
                    return {
                        "status": "passed",
                        "message": f"Required {required_category} clause present with expected content",
                        "location": None,
                        "suggestion": None,
                        "auto_fixable": False
                    }

            return {
                "status": "failed",
                "message": f"{required_category.capitalize()} clause present but missing required text: '{must_contain}'",
                "location": None,
                "suggestion": f"Ensure {required_category} clause contains: {must_contain}",
                "auto_fixable": rule.auto_fix
            }

        return {
            "status": "passed",
            "message": f"Required {required_category} clause present",
            "location": None,
            "suggestion": None,
            "auto_fixable": False
        }

    @staticmethod
    def _check_prohibited_clause(
        rule: ComplianceRule,
        analysis: ContractAnalysis,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if prohibited clause is absent"""
        prohibited_category = parameters.get("category")
        prohibited_content = parameters.get("prohibited_content")

        detected_clauses = analysis.detected_clauses or []

        # Find clauses of prohibited category
        matching_clauses = [
            c for c in detected_clauses
            if c.get("type") == prohibited_category
        ]

        if not matching_clauses:
            return {
                "status": "passed",
                "message": f"No prohibited {prohibited_category} clause found",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

        # Check for prohibited content
        if prohibited_content:
            for clause in matching_clauses:
                if prohibited_content.lower() in clause.get("text", "").lower():
                    return {
                        "status": "failed",
                        "message": f"Contract contains prohibited content in {prohibited_category}: '{prohibited_content}'",
                        "location": None,
                        "suggestion": f"Remove or modify {prohibited_category} clause to exclude: {prohibited_content}",
                        "auto_fixable": False
                    }

        # Prohibited category exists but without specific prohibited content
        return {
            "status": "warning",
            "message": f"Contract contains {prohibited_category} clause - review recommended",
            "location": None,
            "suggestion": "Review clause to ensure compliance",
            "auto_fixable": False
        }

    @staticmethod
    def _check_required_term(
        rule: ComplianceRule,
        contract_text: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if required term/phrase is present"""
        required_terms = parameters.get("terms", [])
        require_all = parameters.get("require_all", False)  # All terms or any term

        if not required_terms:
            return {
                "status": "warning",
                "message": "No required terms specified",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

        found_terms = []
        missing_terms = []

        for term in required_terms:
            if term.lower() in contract_text.lower():
                found_terms.append(term)
            else:
                missing_terms.append(term)

        if require_all:
            if not missing_terms:
                return {
                    "status": "passed",
                    "message": f"All required terms present: {', '.join(required_terms)}",
                    "location": None,
                    "suggestion": None,
                    "auto_fixable": False
                }
            else:
                return {
                    "status": "failed",
                    "message": f"Missing required terms: {', '.join(missing_terms)}",
                    "location": None,
                    "suggestion": f"Add the following terms: {', '.join(missing_terms)}",
                    "auto_fixable": rule.auto_fix
                }
        else:
            # Require any term
            if found_terms:
                return {
                    "status": "passed",
                    "message": f"Found required term(s): {', '.join(found_terms)}",
                    "location": None,
                    "suggestion": None,
                    "auto_fixable": False
                }
            else:
                return {
                    "status": "failed",
                    "message": f"None of the required terms found: {', '.join(required_terms)}",
                    "location": None,
                    "suggestion": f"Add at least one of: {', '.join(required_terms)}",
                    "auto_fixable": rule.auto_fix
                }

    @staticmethod
    def _check_prohibited_term(
        rule: ComplianceRule,
        contract_text: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if prohibited term/phrase is absent"""
        prohibited_terms = parameters.get("terms", [])

        if not prohibited_terms:
            return {
                "status": "warning",
                "message": "No prohibited terms specified",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

        found_prohibited = []

        for term in prohibited_terms:
            if term.lower() in contract_text.lower():
                found_prohibited.append(term)

        if not found_prohibited:
            return {
                "status": "passed",
                "message": "No prohibited terms found",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }
        else:
            return {
                "status": "failed",
                "message": f"Contract contains prohibited terms: {', '.join(found_prohibited)}",
                "location": None,
                "suggestion": f"Remove or replace: {', '.join(found_prohibited)}",
                "auto_fixable": False
            }

    @staticmethod
    def _check_numeric_threshold(
        rule: ComplianceRule,
        analysis: ContractAnalysis,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if numeric value meets threshold"""
        field = parameters.get("field")  # e.g., "liability_cap", "payment_amount"
        min_value = parameters.get("min")
        max_value = parameters.get("max")

        # Try to extract numeric value from analysis
        # This is a simplified version - real implementation would need more sophisticated extraction
        value = None

        # Check payment terms
        if field == "payment_amount" and analysis.payment_terms:
            # Try to extract number from payment terms
            numbers = re.findall(r'\$?[\d,]+(?:\.\d{2})?', analysis.payment_terms)
            if numbers:
                value_str = numbers[0].replace('$', '').replace(',', '')
                try:
                    value = float(value_str)
                except ValueError:
                    pass

        if value is None:
            return {
                "status": "warning",
                "message": f"Could not determine {field} value from contract",
                "location": None,
                "suggestion": f"Manually verify {field} meets requirements",
                "auto_fixable": False
            }

        # Check thresholds
        violations = []
        if min_value is not None and value < min_value:
            violations.append(f"below minimum of {min_value}")

        if max_value is not None and value > max_value:
            violations.append(f"above maximum of {max_value}")

        if violations:
            return {
                "status": "failed",
                "message": f"{field.replace('_', ' ').title()} ({value}) is {', '.join(violations)}",
                "location": None,
                "suggestion": f"Adjust {field} to be between {min_value} and {max_value}",
                "auto_fixable": False
            }

        return {
            "status": "passed",
            "message": f"{field.replace('_', ' ').title()} ({value}) within acceptable range",
            "location": None,
            "suggestion": None,
            "auto_fixable": False
        }

    @staticmethod
    def _check_custom_pattern(
        rule: ComplianceRule,
        contract_text: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if custom regex pattern matches/doesn't match"""
        pattern = rule.pattern
        should_match = parameters.get("should_match", True)

        if not pattern:
            return {
                "status": "warning",
                "message": "No pattern specified",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

        try:
            matches = re.search(pattern, contract_text, re.IGNORECASE)

            if should_match:
                if matches:
                    return {
                        "status": "passed",
                        "message": "Required pattern found in contract",
                        "location": None,
                        "suggestion": None,
                        "auto_fixable": False
                    }
                else:
                    return {
                        "status": "failed",
                        "message": "Required pattern not found in contract",
                        "location": None,
                        "suggestion": rule.auto_fix_suggestion or "Add required content",
                        "auto_fixable": rule.auto_fix
                    }
            else:
                if matches:
                    return {
                        "status": "failed",
                        "message": "Prohibited pattern found in contract",
                        "location": None,
                        "suggestion": "Remove prohibited content",
                        "auto_fixable": False
                    }
                else:
                    return {
                        "status": "passed",
                        "message": "Prohibited pattern not found",
                        "location": None,
                        "suggestion": None,
                        "auto_fixable": False
                    }

        except re.error as e:
            return {
                "status": "warning",
                "message": f"Invalid regex pattern: {str(e)}",
                "location": None,
                "suggestion": None,
                "auto_fixable": False
            }

    @staticmethod
    def calculate_compliance_score(
        rules_checked: int,
        rules_passed: int,
        rules_failed: int,
        violations_by_severity: Dict[str, int]
    ) -> float:
        """
        Calculate overall compliance score (0-100)
        Weighted by severity of violations
        """
        if rules_checked == 0:
            return 100.0

        # Severity weights (higher = more penalty)
        severity_weights = {
            "critical": 10,
            "high": 5,
            "medium": 2,
            "low": 1,
            "info": 0.5
        }

        # Calculate weighted violation score
        total_penalty = 0
        for severity, count in violations_by_severity.items():
            weight = severity_weights.get(severity, 1)
            total_penalty += count * weight

        # Maximum possible penalty
        max_penalty = rules_checked * severity_weights["critical"]

        # Calculate score
        if max_penalty == 0:
            return 100.0

        score = max(0, 100 - (total_penalty / max_penalty * 100))
        return round(score, 2)

    @staticmethod
    def determine_overall_status(
        compliance_score: float,
        critical_violations: int,
        high_violations: int
    ) -> ComplianceStatus:
        """Determine overall compliance status"""
        if critical_violations > 0:
            return ComplianceStatus.NON_COMPLIANT

        if compliance_score >= 90 and high_violations == 0:
            return ComplianceStatus.COMPLIANT

        if compliance_score >= 70:
            return ComplianceStatus.PARTIAL_COMPLIANT

        return ComplianceStatus.NON_COMPLIANT
