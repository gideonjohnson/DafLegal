"""
Drafting Assistant Service

AI-powered contract drafting with templates and intelligent clause suggestions.
"""

import secrets
import re
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from openai import OpenAI

from app.models.drafting import ContractTemplate, GeneratedContract, DraftingSession
from app.models.user import User


class DraftingService:
    """Contract drafting assistant service"""

    def __init__(self, db: Session, openai_api_key: str):
        self.db = db
        self.client = OpenAI(api_key=openai_api_key)

    # Template Management
    def create_template(
        self,
        user_id: int,
        name: str,
        description: str,
        category: str,
        template_text: str,
        variables: list[dict],
        jurisdiction: str = "US",
        included_clauses: list[str] = None,
        optional_clauses: list[str] = None,
        tags: list[str] = None
    ) -> ContractTemplate:
        """Create a new contract template"""
        template = ContractTemplate(
            template_id=f"tpl_{secrets.token_hex(8)}",
            user_id=user_id,
            name=name,
            description=description,
            category=category,
            jurisdiction=jurisdiction,
            template_text=template_text,
            variables=variables,
            included_clauses=included_clauses or [],
            optional_clauses=optional_clauses or [],
            tags=tags or []
        )
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def get_templates(
        self,
        category: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        is_public: bool = True
    ) -> list[ContractTemplate]:
        """Get contract templates with filters"""
        query = select(ContractTemplate)

        if is_public:
            query = query.where(ContractTemplate.is_public == True)

        if category:
            query = query.where(ContractTemplate.category == category)

        if jurisdiction:
            query = query.where(ContractTemplate.jurisdiction == jurisdiction)

        templates = self.db.exec(query.order_by(ContractTemplate.times_used.desc())).all()
        return list(templates)

    def get_template(self, template_id: str) -> ContractTemplate:
        """Get a specific template"""
        template = self.db.exec(
            select(ContractTemplate).where(ContractTemplate.template_id == template_id)
        ).first()

        if not template:
            raise ValueError("Template not found")

        return template

    # Contract Generation
    def generate_contract(
        self,
        user_id: int,
        template_id: str,
        name: str,
        variable_values: dict,
        selected_clauses: list[str] = None,
        file_format: str = "docx"
    ) -> GeneratedContract:
        """Generate a contract from a template with AI enhancement"""
        # Get template
        template = self.get_template(template_id)

        # Fill template variables
        contract_text = self._fill_template(
            template_text=template.template_text,
            variables=template.variables,
            values=variable_values,
            selected_clauses=selected_clauses or []
        )

        # AI enhancement: improve language, add suggestions
        enhanced_text, ai_suggestions = self._enhance_with_ai(
            contract_text=contract_text,
            category=template.category,
            jurisdiction=template.jurisdiction
        )

        # Risk analysis
        risk_analysis = self._analyze_risks(enhanced_text, template.category)

        # Create generated contract
        generated = GeneratedContract(
            generated_id=f"gen_{secrets.token_hex(8)}",
            user_id=user_id,
            template_id=template_id,
            name=name,
            category=template.category,
            variable_values=variable_values,
            selected_clauses=selected_clauses or [],
            generated_text=enhanced_text,
            status="draft",
            ai_suggestions=ai_suggestions,
            risk_analysis=risk_analysis,
            file_format=file_format
        )

        self.db.add(generated)

        # Update template usage
        template.times_used += 1

        self.db.commit()
        self.db.refresh(generated)

        return generated

    def _fill_template(
        self,
        template_text: str,
        variables: list[dict],
        values: dict,
        selected_clauses: list[str]
    ) -> str:
        """Fill template with provided values"""
        text = template_text

        # Replace variables {{variable_name}}
        for variable in variables:
            var_name = variable["name"]
            placeholder = f"{{{{{var_name}}}}}"

            if var_name in values:
                text = text.replace(placeholder, str(values[var_name]))
            else:
                # Use default or leave blank
                default = variable.get("default", f"[{var_name}]")
                text = text.replace(placeholder, default)

        # Handle conditional clauses
        # Remove optional clauses that weren't selected
        # This is a simplified version - production would use more sophisticated parsing
        clause_pattern = r'\[OPTIONAL_CLAUSE:(\w+)\](.*?)\[/OPTIONAL_CLAUSE:\1\]'

        def replace_optional_clause(match):
            clause_id = match.group(1)
            clause_content = match.group(2)
            return clause_content if clause_id in selected_clauses else ""

        text = re.sub(clause_pattern, replace_optional_clause, text, flags=re.DOTALL)

        return text

    def _enhance_with_ai(
        self,
        contract_text: str,
        category: str,
        jurisdiction: str
    ) -> tuple[str, list[dict]]:
        """Use AI to enhance contract language and suggest improvements"""
        prompt = f"""You are a legal contract drafting assistant. Review and enhance this {category} contract for {jurisdiction} jurisdiction.

Contract:
{contract_text}

Tasks:
1. Improve legal language clarity while maintaining precision
2. Ensure proper formatting
3. Identify any missing standard clauses
4. Suggest 3-5 specific improvements

Return a JSON response with:
{{
  "enhanced_text": "The enhanced contract text",
  "suggestions": [
    {{
      "type": "missing_clause" | "language_improvement" | "risk_mitigation",
      "section": "Section name",
      "suggestion": "Specific suggestion text",
      "priority": "high" | "medium" | "low"
    }}
  ]
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-5.1",
                messages=[
                    {"role": "system", "content": "You are a legal contract drafting expert. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result["enhanced_text"], result.get("suggestions", [])

        except Exception as e:
            # Fallback: return original text with generic suggestion
            return contract_text, [{
                "type": "general",
                "section": "General",
                "suggestion": "Have this contract reviewed by a licensed attorney before use.",
                "priority": "high"
            }]

    def _analyze_risks(self, contract_text: str, category: str) -> dict:
        """Quick AI-powered risk analysis"""
        prompt = f"""Analyze this {category} contract for potential risks. Provide a brief JSON analysis:

Contract (first 2000 chars):
{contract_text[:2000]}

Return:
{{
  "overall_risk": "low" | "medium" | "high",
  "risk_factors": ["factor 1", "factor 2", ...],
  "recommendations": ["rec 1", "rec 2", ...]
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-5.1",
                messages=[
                    {"role": "system", "content": "You are a legal risk analyst. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            import json
            return json.loads(response.choices[0].message.content)

        except Exception:
            return {
                "overall_risk": "medium",
                "risk_factors": ["Requires legal review"],
                "recommendations": ["Consult with attorney before signing"]
            }

    # Contract Management
    def get_user_contracts(
        self,
        user_id: int,
        category: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> list[GeneratedContract]:
        """Get user's generated contracts"""
        query = select(GeneratedContract).where(GeneratedContract.user_id == user_id)

        if category:
            query = query.where(GeneratedContract.category == category)

        if status:
            query = query.where(GeneratedContract.status == status)

        contracts = self.db.exec(
            query.order_by(GeneratedContract.created_at.desc()).limit(limit)
        ).all()

        return list(contracts)

    def get_contract(self, generated_id: str) -> GeneratedContract:
        """Get a specific generated contract"""
        contract = self.db.exec(
            select(GeneratedContract).where(GeneratedContract.generated_id == generated_id)
        ).first()

        if not contract:
            raise ValueError("Contract not found")

        return contract

    def update_contract(
        self,
        generated_id: str,
        generated_text: Optional[str] = None,
        status: Optional[str] = None
    ) -> GeneratedContract:
        """Update a generated contract"""
        contract = self.get_contract(generated_id)

        if generated_text is not None:
            contract.generated_text = generated_text
            contract.edit_count += 1
            contract.last_edited_at = datetime.utcnow()

        if status is not None:
            contract.status = status

        self.db.commit()
        self.db.refresh(contract)

        return contract

    def delete_contract(self, generated_id: str):
        """Delete a generated contract"""
        contract = self.get_contract(generated_id)
        self.db.delete(contract)
        self.db.commit()
