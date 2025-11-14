"""
Conveyancing Service - Kenya

Workflow management, stamp duty calculation, and due diligence for Kenya property transactions.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal


class ConveyancingWorkflowService:
    """Manage conveyancing workflow stages and milestones"""

    # Kenya conveyancing workflow stages
    WORKFLOW_STAGES = {
        "sale_purchase": [
            {
                "stage": "instruction",
                "name": "Instruction & Retainer",
                "description": "Receive instructions, sign retainer, collect initial documents",
                "typical_days": 1,
                "tasks": [
                    "Sign retainer agreement",
                    "Collect client ID and KRA PIN",
                    "Obtain title deed details",
                    "Request deposit payment"
                ]
            },
            {
                "stage": "due_diligence",
                "name": "Searches & Due Diligence",
                "description": "Conduct official searches and verify property status",
                "typical_days": 14,
                "tasks": [
                    "Official search at Land Registry",
                    "Rates clearance from County",
                    "Land rent clearance",
                    "Physical inspection",
                    "Verify encumbrances",
                    "Check planning approvals"
                ]
            },
            {
                "stage": "drafting",
                "name": "Document Drafting",
                "description": "Draft and review transaction documents",
                "typical_days": 7,
                "tasks": [
                    "Draft Sale Agreement",
                    "Draft Transfer (Form CR11)",
                    "Prepare requisitions on title",
                    "Draft consent forms (if needed)",
                    "Review and finalize all documents"
                ]
            },
            {
                "stage": "approval",
                "name": "Approvals & Consents",
                "description": "Obtain necessary approvals and consents",
                "typical_days": 30,
                "tasks": [
                    "Land Control Board consent (if required)",
                    "Spouse consent",
                    "Company board resolution (if applicable)",
                    "Bank consent (if mortgaged)",
                    "NEMA approval (if required)"
                ]
            },
            {
                "stage": "execution",
                "name": "Execution of Documents",
                "description": "Execute sale agreement and transfer documents",
                "typical_days": 3,
                "tasks": [
                    "Parties sign Sale Agreement",
                    "Pay deposit",
                    "Sign Transfer (CR11)",
                    "Witness signatures",
                    "Exchange executed documents"
                ]
            },
            {
                "stage": "payment",
                "name": "Payment & Financial Settlement",
                "description": "Process payments and clear financial obligations",
                "typical_days": 2,
                "tasks": [
                    "Pay balance of purchase price",
                    "Pay stamp duty",
                    "Pay Capital Gains Tax (seller)",
                    "Clear rates arrears",
                    "Clear land rent arrears",
                    "Pay legal fees"
                ]
            },
            {
                "stage": "registration",
                "name": "Registration",
                "description": "Submit documents for registration at Land Registry",
                "typical_days": 60,
                "tasks": [
                    "Lodge transfer at Land Registry",
                    "Pay registration fees",
                    "Track registration progress",
                    "Collect registered documents",
                    "Obtain new title deed"
                ]
            },
            {
                "stage": "completion",
                "name": "Completion & Handover",
                "description": "Complete transaction and handover property",
                "typical_days": 1,
                "tasks": [
                    "Hand over registered title deed",
                    "Hand over property keys",
                    "Provide completion statement",
                    "Archive transaction files",
                    "Close matter"
                ]
            }
        ]
    }

    def get_workflow_stages(self, transaction_type: str) -> List[Dict[str, Any]]:
        """Get workflow stages for transaction type"""
        # For MVP, using sale_purchase workflow for all transaction types
        # Can be expanded to have specific workflows per type
        return self.WORKFLOW_STAGES.get("sale_purchase", [])

    def calculate_estimated_duration(self, transaction_type: str, has_consent_requirement: bool = False) -> int:
        """
        Calculate estimated duration in days

        Returns: Total estimated days for transaction
        """
        stages = self.get_workflow_stages(transaction_type)
        total_days = sum(stage.get("typical_days", 0) for stage in stages)

        # Add extra time for Land Control consent
        if has_consent_requirement:
            total_days += 30  # Land Control Board can take 30+ days

        return total_days

    def get_next_milestones(
        self,
        current_stage: str,
        transaction_type: str = "sale"
    ) -> List[Dict[str, Any]]:
        """Get next milestones based on current stage"""

        stages = self.get_workflow_stages(transaction_type)
        current_stage_found = False
        next_milestones = []

        for stage in stages:
            if current_stage_found and len(next_milestones) < 3:
                # Return next 3 stages
                next_milestones.append(stage)
            if stage["stage"] == current_stage:
                current_stage_found = True

        return next_milestones

    def calculate_progress_percentage(
        self,
        current_stage: str,
        transaction_type: str = "sale"
    ) -> int:
        """Calculate progress percentage based on current stage"""

        stages = self.get_workflow_stages(transaction_type)
        total_stages = len(stages)

        for index, stage in enumerate(stages):
            if stage["stage"] == current_stage:
                # Progress is (completed stages / total stages) * 100
                progress = ((index + 1) / total_stages) * 100
                return int(progress)

        return 0


class StampDutyCalculator:
    """Calculate stamp duty and government fees for Kenya property transactions"""

    # Kenya Stamp Duty Rates (as of 2024)
    # Residential: 4% of property value (or 2% for affordable housing)
    # Commercial: 4% of property value
    # Agricultural: Lower rates may apply in some cases

    RESIDENTIAL_RATE = Decimal("4.0")  # 4%
    AFFORDABLE_HOUSING_RATE = Decimal("2.0")  # 2%
    COMMERCIAL_RATE = Decimal("4.0")  # 4%
    AGRICULTURAL_RATE = Decimal("4.0")  # 4%

    # Capital Gains Tax
    CGT_RATE = Decimal("5.0")  # 5% on gains

    # Standard fees
    REGISTRATION_FEE_BASE = Decimal("1000.0")
    SEARCH_FEE = Decimal("500.0")
    CONSENT_FEE = Decimal("2000.0")

    def calculate_stamp_duty(
        self,
        property_value: Decimal,
        property_type: str,
        is_first_time_buyer: bool = False,
        is_affordable_housing: bool = False
    ) -> Dict[str, Decimal]:
        """
        Calculate stamp duty for property transaction

        Args:
            property_value: Market value or purchase price
            property_type: residential, commercial, agricultural, industrial
            is_first_time_buyer: First-time buyer status
            is_affordable_housing: Affordable housing scheme

        Returns:
            Dictionary with breakdown of stamp duty calculation
        """

        # Determine applicable rate
        if is_affordable_housing:
            rate = self.AFFORDABLE_HOUSING_RATE
        elif property_type.lower() == "residential":
            rate = self.RESIDENTIAL_RATE
        elif property_type.lower() == "commercial":
            rate = self.COMMERCIAL_RATE
        elif property_type.lower() == "agricultural":
            rate = self.AGRICULTURAL_RATE
        else:
            rate = self.RESIDENTIAL_RATE  # Default

        # Calculate stamp duty
        stamp_duty_amount = (property_value * rate) / Decimal("100")

        # Registration fee (typically based on property value brackets)
        registration_fee = self._calculate_registration_fee(property_value)

        return {
            "property_value": property_value,
            "stamp_duty_rate": rate,
            "stamp_duty_amount": stamp_duty_amount.quantize(Decimal("0.01")),
            "registration_fee": registration_fee,
            "search_fees": self.SEARCH_FEE,
            "consent_fees": Decimal("0.00"),  # Added if needed
            "total_government_charges": (stamp_duty_amount + registration_fee + self.SEARCH_FEE).quantize(Decimal("0.01"))
        }

    def _calculate_registration_fee(self, property_value: Decimal) -> Decimal:
        """Calculate registration fee based on property value brackets"""

        # Simplified brackets (actual brackets may vary)
        if property_value <= Decimal("500000"):
            return Decimal("1000.00")
        elif property_value <= Decimal("2000000"):
            return Decimal("2500.00")
        elif property_value <= Decimal("5000000"):
            return Decimal("5000.00")
        elif property_value <= Decimal("10000000"):
            return Decimal("10000.00")
        else:
            return Decimal("15000.00")

    def calculate_capital_gains_tax(
        self,
        purchase_price: Decimal,
        sale_price: Decimal,
        acquisition_date: datetime,
        improvements_cost: Decimal = Decimal("0.00")
    ) -> Dict[str, Decimal]:
        """
        Calculate Capital Gains Tax for property sale (Kenya)

        CGT = 5% of (Sale Price - (Purchase Price + Improvements))
        """

        # Calculate gain
        adjusted_cost = purchase_price + improvements_cost
        capital_gain = sale_price - adjusted_cost

        # CGT only applies if there's a gain
        if capital_gain <= 0:
            return {
                "purchase_price": purchase_price,
                "sale_price": sale_price,
                "improvements_cost": improvements_cost,
                "capital_gain": Decimal("0.00"),
                "cgt_rate": self.CGT_RATE,
                "cgt_amount": Decimal("0.00"),
                "cgt_required": False
            }

        # Calculate CGT (5% of gain)
        cgt_amount = (capital_gain * self.CGT_RATE) / Decimal("100")

        return {
            "purchase_price": purchase_price,
            "sale_price": sale_price,
            "improvements_cost": improvements_cost,
            "capital_gain": capital_gain.quantize(Decimal("0.01")),
            "cgt_rate": self.CGT_RATE,
            "cgt_amount": cgt_amount.quantize(Decimal("0.01")),
            "cgt_required": True
        }

    def calculate_legal_fees(
        self,
        property_value: Decimal,
        transaction_type: str = "sale"
    ) -> Dict[str, Decimal]:
        """
        Calculate legal fees (advocate's fees) based on property value

        Kenya Law Society recommended scales (simplified)
        """

        # Simplified fee scale (actual scales more detailed)
        if property_value <= Decimal("500000"):
            percentage = Decimal("2.5")
        elif property_value <= Decimal("2000000"):
            percentage = Decimal("2.0")
        elif property_value <= Decimal("5000000"):
            percentage = Decimal("1.75")
        elif property_value <= Decimal("10000000"):
            percentage = Decimal("1.5")
        else:
            percentage = Decimal("1.25")

        legal_fees = (property_value * percentage) / Decimal("100")

        # Minimum fee
        minimum_fee = Decimal("50000.00")
        legal_fees = max(legal_fees, minimum_fee)

        return {
            "property_value": property_value,
            "fee_percentage": percentage,
            "legal_fees": legal_fees.quantize(Decimal("0.01")),
            "vat_amount": (legal_fees * Decimal("16") / Decimal("100")).quantize(Decimal("0.01")),  # 16% VAT
            "total_with_vat": (legal_fees * Decimal("1.16")).quantize(Decimal("0.01"))
        }

    def calculate_total_transaction_cost(
        self,
        property_value: Decimal,
        property_type: str,
        is_buyer: bool = True,
        has_mortgage: bool = False,
        is_affordable_housing: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate total transaction cost for buyer or seller

        Returns comprehensive breakdown of all costs
        """

        # Stamp duty (buyer pays)
        stamp_duty = self.calculate_stamp_duty(
            property_value, property_type,
            is_affordable_housing=is_affordable_housing
        )

        # Legal fees
        legal_fees = self.calculate_legal_fees(property_value)

        # Disbursements (searches, certificates, etc.)
        disbursements = Decimal("5000.00")  # Typical disbursements

        if is_buyer:
            total_cost = (
                property_value +
                stamp_duty["stamp_duty_amount"] +
                stamp_duty["registration_fee"] +
                legal_fees["total_with_vat"] +
                disbursements
            )

            breakdown = {
                "property_value": property_value,
                "stamp_duty": stamp_duty["stamp_duty_amount"],
                "registration_fee": stamp_duty["registration_fee"],
                "legal_fees": legal_fees["total_with_vat"],
                "disbursements": disbursements,
                "total_cost": total_cost.quantize(Decimal("0.01")),
                "role": "buyer"
            }

            if has_mortgage:
                # Add mortgage registration costs
                mortgage_stamp_duty = Decimal("0.1") * property_value / Decimal("100")  # 0.1% of loan
                breakdown["mortgage_stamp_duty"] = mortgage_stamp_duty
                breakdown["total_cost"] += mortgage_stamp_duty

        else:
            # Seller costs (CGT if applicable, legal fees)
            total_cost = (
                legal_fees["total_with_vat"] +
                disbursements
            )

            breakdown = {
                "property_value": property_value,
                "legal_fees": legal_fees["total_with_vat"],
                "disbursements": disbursements,
                "capital_gains_tax": Decimal("0.00"),  # Would need purchase price to calculate
                "total_cost": total_cost.quantize(Decimal("0.01")),
                "role": "seller"
            }

        return breakdown


class DueDiligenceService:
    """Due diligence and search management for conveyancing"""

    # Required searches for property transactions in Kenya
    REQUIRED_SEARCHES = {
        "sale_purchase": [
            {
                "search_type": "official_search",
                "name": "Official Search - Land Registry",
                "description": "Verify current ownership, encumbrances, and restrictions",
                "authority": "Lands Registry",
                "is_critical": True,
                "typical_duration_days": 7,
                "estimated_cost": 500
            },
            {
                "search_type": "rates_clearance",
                "name": "Rates Clearance Certificate",
                "description": "Confirm property rates are paid up to date",
                "authority": "County Government",
                "is_critical": True,
                "typical_duration_days": 14,
                "estimated_cost": 1000
            },
            {
                "search_type": "land_rent",
                "name": "Land Rent Clearance",
                "description": "Confirm land rent payments are current (for leasehold)",
                "authority": "Lands Office",
                "is_critical": False,
                "typical_duration_days": 10,
                "estimated_cost": 500
            },
            {
                "search_type": "physical_planning",
                "name": "Physical Planning Approval",
                "description": "Verify building approvals and compliance",
                "authority": "County Physical Planning",
                "is_critical": False,
                "typical_duration_days": 7,
                "estimated_cost": 1500
            }
        ]
    }

    def get_required_searches(
        self,
        transaction_type: str,
        property_type: str,
        is_leasehold: bool = False,
        has_structures: bool = True
    ) -> List[Dict[str, Any]]:
        """Get list of required searches based on transaction and property details"""

        searches = []
        base_searches = self.REQUIRED_SEARCHES.get("sale_purchase", [])

        for search in base_searches:
            # Skip land rent search if freehold
            if search["search_type"] == "land_rent" and not is_leasehold:
                continue

            # Skip planning search if vacant land
            if search["search_type"] == "physical_planning" and not has_structures:
                continue

            searches.append(search.copy())

        # Add Land Control search if property exceeds 5 acres (approximate threshold)
        # or if in specific areas requiring consent
        # This would need more property details to determine accurately

        return searches

    def assess_search_results(
        self,
        search_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Assess search results and identify issues

        Returns risk assessment and recommendations
        """

        issues = []
        critical_issues = []
        warnings = []
        recommendations = []

        for result in search_results:
            if result.get("has_issues"):
                issue_severity = result.get("severity", "medium")

                if issue_severity == "critical":
                    critical_issues.append({
                        "search": result.get("search_name"),
                        "issues": result.get("issues_found", [])
                    })
                elif issue_severity in ["high", "medium"]:
                    issues.append({
                        "search": result.get("search_name"),
                        "severity": issue_severity,
                        "issues": result.get("issues_found", [])
                    })
                else:
                    warnings.append({
                        "search": result.get("search_name"),
                        "issues": result.get("issues_found", [])
                    })

        # Generate recommendations
        if critical_issues:
            recommendations.append("DO NOT PROCEED - Critical issues identified. Resolve before continuing.")
            risk_level = "critical"
        elif len(issues) >= 3:
            recommendations.append("Proceed with caution - Multiple issues identified. Obtain client instructions.")
            risk_level = "high"
        elif issues:
            recommendations.append("Address identified issues before completion.")
            risk_level = "medium"
        else:
            recommendations.append("Searches clear - Proceed to next stage.")
            risk_level = "low"

        return {
            "risk_level": risk_level,
            "critical_issues_count": len(critical_issues),
            "issues_count": len(issues),
            "warnings_count": len(warnings),
            "critical_issues": critical_issues,
            "issues": issues,
            "warnings": warnings,
            "recommendations": recommendations,
            "can_proceed": len(critical_issues) == 0
        }
