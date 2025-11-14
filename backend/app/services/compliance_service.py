import secrets
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from datetime import datetime

from app.models.compliance import (
    Playbook, ComplianceRule, ComplianceCheck, ComplianceException,
    RuleType, RuleSeverity, ComplianceStatus
)
from app.models.contract import Contract, ContractAnalysis
from app.services.compliance_engine import ComplianceEngine


class ComplianceService:
    """Service for managing compliance checks and playbooks"""

    @staticmethod
    def create_playbook(
        session: Session,
        user_id: int,
        name: str,
        **kwargs
    ) -> Playbook:
        """Create a new playbook"""
        playbook = Playbook(
            playbook_id=f"plb_{secrets.token_urlsafe(16)}",
            user_id=user_id,
            name=name,
            **kwargs
        )
        session.add(playbook)
        session.commit()
        session.refresh(playbook)
        return playbook

    @staticmethod
    def add_rule_to_playbook(
        session: Session,
        playbook_id: str,
        user_id: int,
        name: str,
        description: str,
        rule_type: RuleType,
        severity: RuleSeverity,
        parameters: Dict[str, Any],
        replacement_text: Optional[str] = None,
        replacement_clause_id: Optional[str] = None,
        redline_instruction: Optional[str] = None,
        **kwargs
    ) -> ComplianceRule:
        """Add a rule to a playbook"""
        # Get playbook
        playbook = session.exec(
            select(Playbook).where(
                Playbook.playbook_id == playbook_id,
                Playbook.user_id == user_id
            )
        ).first()

        if not playbook:
            raise ValueError("Playbook not found")

        # Create rule
        rule = ComplianceRule(
            rule_id=f"rul_{secrets.token_urlsafe(16)}",
            playbook_id=playbook.id,
            name=name,
            description=description,
            rule_type=rule_type,
            severity=severity,
            parameters=parameters,
            replacement_text=replacement_text,
            replacement_clause_id=replacement_clause_id,
            redline_instruction=redline_instruction,
            **kwargs
        )

        session.add(rule)

        # Update playbook rule count
        playbook.rule_count += 1
        playbook.updated_at = datetime.utcnow()
        session.add(playbook)

        session.commit()
        session.refresh(rule)
        return rule

    @staticmethod
    def run_compliance_check(
        session: Session,
        user_id: int,
        contract_id: str,
        playbook_id: str
    ) -> ComplianceCheck:
        """
        Run compliance check (synchronously for now, will move to Celery)
        """
        # Get contract
        contract = session.exec(
            select(Contract).where(
                Contract.contract_id == contract_id,
                Contract.user_id == user_id
            )
        ).first()

        if not contract:
            raise ValueError("Contract not found")

        # Get playbook
        playbook = session.exec(
            select(Playbook).where(
                Playbook.playbook_id == playbook_id,
                Playbook.user_id == user_id
            )
        ).first()

        if not playbook:
            raise ValueError("Playbook not found")

        # Get contract analysis
        analysis = session.exec(
            select(ContractAnalysis).where(
                ContractAnalysis.contract_id == contract.id
            )
        ).first()

        if not analysis:
            raise ValueError("Contract must be analyzed before compliance check")

        # Create compliance check record
        check = ComplianceCheck(
            check_id=f"chk_{secrets.token_urlsafe(16)}",
            user_id=user_id,
            contract_id=contract.id,
            playbook_id=playbook.id,
            status=ComplianceStatus.PROCESSING
        )
        session.add(check)
        session.commit()
        session.refresh(check)

        # Run checks
        try:
            results = ComplianceService._execute_compliance_check(
                session, check, playbook, contract, analysis
            )

            # Update check with results
            check.status = ComplianceStatus.COMPLETED
            check.overall_status = results["overall_status"]
            check.compliance_score = results["compliance_score"]
            check.rules_checked = results["rules_checked"]
            check.rules_passed = results["rules_passed"]
            check.rules_failed = results["rules_failed"]
            check.rules_warning = results["rules_warning"]
            check.violations = results["violations"]
            check.passed_rules = results["passed_rules"]
            check.warnings = results["warnings"]
            check.executive_summary = results["executive_summary"]
            check.recommendations = results["recommendations"]
            check.processing_time_seconds = results["processing_time"]
            check.processed_at = datetime.utcnow()

            session.add(check)

            # Update playbook usage
            playbook.usage_count += 1
            playbook.last_used_at = datetime.utcnow()
            session.add(playbook)

            session.commit()
            session.refresh(check)

            return check

        except Exception as e:
            check.status = ComplianceStatus.FAILED
            check.error_message = str(e)
            session.add(check)
            session.commit()
            raise

    @staticmethod
    def _execute_compliance_check(
        session: Session,
        check: ComplianceCheck,
        playbook: Playbook,
        contract: Contract,
        analysis: ContractAnalysis
    ) -> Dict[str, Any]:
        """Execute the compliance check"""
        import time
        start_time = time.time()

        # Get all active rules from playbook
        rules = session.exec(
            select(ComplianceRule).where(
                ComplianceRule.playbook_id == playbook.id,
                ComplianceRule.is_active == True
            )
        ).all()

        if not rules:
            raise ValueError("Playbook has no active rules")

        # Check for exceptions
        exceptions = session.exec(
            select(ComplianceException).where(
                ComplianceException.contract_id == contract.id,
                ComplianceException.is_active == True
            )
        ).all()

        exception_rule_ids = {exc.rule_id for exc in exceptions}

        # Run each rule
        violations = []
        passed_rules = []
        warnings = []
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}

        contract_text = analysis.extracted_text or ""

        for rule in rules:
            # Skip if exception exists
            if rule.id in exception_rule_ids:
                continue

            # Evaluate rule
            result = ComplianceEngine.evaluate_rule(
                rule, analysis, contract_text
            )

            result_detail = {
                "rule_id": rule.rule_id,
                "rule_name": rule.name,
                "severity": rule.severity,
                "status": result["status"],
                "message": result["message"],
                "location": result.get("location"),
                "auto_fixable": result.get("auto_fixable", False)
            }

            # Add redlining suggestions if available
            if rule.replacement_text:
                result_detail["suggestion"] = f"Replace with: {rule.replacement_text}"
                result_detail["auto_fixable"] = True
            elif rule.replacement_clause_id:
                result_detail["suggestion"] = f"Insert Clause ID: {rule.replacement_clause_id}"
                result_detail["auto_fixable"] = True
            elif rule.redline_instruction:
                result_detail["suggestion"] = f"AI Redline Instruction: {rule.redline_instruction}"
                result_detail["auto_fixable"] = True
            elif result.get("suggestion"):
                result_detail["suggestion"] = result.get("suggestion")

            if result["status"] == "failed":
                violations.append(result_detail)
                severity_counts[rule.severity] += 1

                # Update rule violation count
                rule.violation_count += 1
                rule.last_triggered_at = datetime.utcnow()
                session.add(rule)

            elif result["status"] == "warning":
                warnings.append(result_detail)

            elif result["status"] == "passed":
                passed_rules.append({
                    "rule_id": rule.rule_id,
                    "rule_name": rule.name,
                    "message": result["message"]
                })

        # Calculate metrics
        rules_checked = len(rules) - len(exception_rule_ids)
        rules_failed = len(violations)
        rules_warning = len(warnings)
        rules_passed = len(passed_rules)

        # Calculate compliance score
        compliance_score = ComplianceEngine.calculate_compliance_score(
            rules_checked=rules_checked,
            rules_passed=rules_passed,
            rules_failed=rules_failed,
            violations_by_severity=severity_counts
        )

        # Determine overall status
        overall_status = ComplianceEngine.determine_overall_status(
            compliance_score=compliance_score,
            critical_violations=severity_counts["critical"],
            high_violations=severity_counts["high"]
        )

        # Generate executive summary
        executive_summary = ComplianceService._generate_executive_summary(
            compliance_score=compliance_score,
            overall_status=overall_status,
            violations=violations,
            severity_counts=severity_counts
        )

        # Generate recommendations
        recommendations = ComplianceService._generate_recommendations(
            violations=violations,
            severity_counts=severity_counts
        )

        return {
            "overall_status": overall_status,
            "compliance_score": compliance_score,
            "rules_checked": rules_checked,
            "rules_passed": rules_passed,
            "rules_failed": rules_failed,
            "rules_warning": rules_warning,
            "violations": violations,
            "passed_rules": passed_rules,
            "warnings": warnings,
            "executive_summary": executive_summary,
            "recommendations": recommendations,
            "processing_time": time.time() - start_time
        }

    @staticmethod
    def _generate_executive_summary(
        compliance_score: float,
        overall_status: ComplianceStatus,
        violations: List[Dict],
        severity_counts: Dict[str, int]
    ) -> str:
        """Generate executive summary of compliance check"""
        status_text = {
            ComplianceStatus.COMPLIANT: "fully compliant",
            ComplianceStatus.PARTIAL_COMPLIANT: "partially compliant",
            ComplianceStatus.NON_COMPLIANT: "non-compliant"
        }

        summary_parts = []

        # Overall assessment
        summary_parts.append(
            f"Contract is {status_text.get(overall_status, 'under review')} "
            f"with a compliance score of {compliance_score:.1f}%."
        )

        # Violations by severity
        if severity_counts["critical"] > 0:
            summary_parts.append(
                f"Found {severity_counts['critical']} critical violation(s) requiring immediate attention."
            )

        if severity_counts["high"] > 0:
            summary_parts.append(
                f"Identified {severity_counts['high']} high-severity issue(s) that should be addressed."
            )

        if severity_counts["medium"] > 0:
            summary_parts.append(
                f"Detected {severity_counts['medium']} medium-severity concern(s)."
            )

        # Key violations
        if violations:
            critical_violations = [v for v in violations if v["severity"] == "critical"]
            if critical_violations:
                summary_parts.append(
                    f"Most critical: {critical_violations[0]['message']}"
                )

        return " ".join(summary_parts)

    @staticmethod
    def _generate_recommendations(
        violations: List[Dict],
        severity_counts: Dict[str, int]
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []

        # Critical violations first
        critical_violations = [v for v in violations if v["severity"] == "critical"]
        for violation in critical_violations[:3]:  # Top 3
            if violation.get("suggestion"):
                recommendations.append(f"[CRITICAL] {violation['suggestion']}")

        # High severity
        high_violations = [v for v in violations if v["severity"] == "high"]
        for violation in high_violations[:3]:  # Top 3
            if violation.get("suggestion"):
                recommendations.append(f"[HIGH] {violation['suggestion']}")

        # General recommendations
        if severity_counts["critical"] > 0:
            recommendations.append("Do not proceed with contract execution until critical issues are resolved")

        if severity_counts["high"] > 0:
            recommendations.append("Seek legal review before finalizing the agreement")

        return recommendations

    @staticmethod
    def get_playbook_rules(
        session: Session,
        playbook_id: str,
        user_id: int
    ) -> List[ComplianceRule]:
        """Get all rules for a playbook"""
        playbook = session.exec(
            select(Playbook).where(
                Playbook.playbook_id == playbook_id,
                Playbook.user_id == user_id
            )
        ).first()

        if not playbook:
            return []

        rules = session.exec(
            select(ComplianceRule).where(
                ComplianceRule.playbook_id == playbook.id
            ).order_by(ComplianceRule.severity.desc())
        ).all()

        return rules

    @staticmethod
    def create_exception(
        session: Session,
        user_id: int,
        contract_id: str,
        rule_id: str,
        reason: str,
        **kwargs
    ) -> ComplianceException:
        """Create a compliance exception"""
        # Verify contract and rule exist
        contract = session.exec(
            select(Contract).where(
                Contract.contract_id == contract_id,
                Contract.user_id == user_id
            )
        ).first()

        if not contract:
            raise ValueError("Contract not found")

        rule = session.exec(
            select(ComplianceRule).where(
                ComplianceRule.rule_id == rule_id
            )
        ).first()

        if not rule:
            raise ValueError("Rule not found")

        exception = ComplianceException(
            exception_id=f"exc_{secrets.token_urlsafe(16)}",
            user_id=user_id,
            contract_id=contract.id,
            rule_id=rule.id,
            reason=reason,
            approved_at=datetime.utcnow(),
            **kwargs
        )

        session.add(exception)
        session.commit()
        session.refresh(exception)
        return exception
