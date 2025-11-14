"""
Citation Checker Service

AI-powered legal citation validation and correction.
"""

import re
import json
import secrets
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from openai import OpenAI

from app.models.citation_checker import CitationCheck, CitationIssue, CitationFormat


class CitationCheckerService:
    """Citation validation and verification service"""

    def __init__(self, db: Session, openai_api_key: str):
        self.db = db
        self.client = OpenAI(api_key=openai_api_key)

    def check_citations(
        self,
        user_id: int,
        document_text: str,
        document_name: str,
        citation_format: str = "bluebook",
        contract_id: Optional[str] = None
    ) -> CitationCheck:
        """
        Check all citations in a document for correctness

        Uses AI to:
        1. Extract all citations from document
        2. Validate format against citation style
        3. Verify citations exist (if possible)
        4. Suggest corrections
        """
        # Create check record
        check = CitationCheck(
            check_id=f"chk_{secrets.token_hex(8)}",
            user_id=user_id,
            contract_id=contract_id,
            document_text=document_text,
            document_name=document_name,
            citation_format=citation_format,
            status="processing"
        )
        self.db.add(check)
        self.db.commit()
        self.db.refresh(check)

        start_time = datetime.utcnow()

        try:
            # Use AI to analyze citations
            issues = self._analyze_citations_with_ai(
                document_text=document_text,
                citation_format=citation_format,
                check_id=check.check_id
            )

            # Save issues
            for issue_data in issues:
                issue = CitationIssue(
                    issue_id=f"iss_{secrets.token_hex(8)}",
                    check_id=check.check_id,
                    citation_text=issue_data["citation_text"],
                    citation_type=issue_data.get("citation_type", "unknown"),
                    location_start=issue_data.get("location_start", 0),
                    location_end=issue_data.get("location_end", 0),
                    severity=issue_data.get("severity", "medium"),
                    issue_type=issue_data.get("issue_type", "format_error"),
                    issue_description=issue_data["issue_description"],
                    expected_format=issue_data.get("expected_format"),
                    actual_format=issue_data.get("actual_format"),
                    suggested_fix=issue_data.get("suggested_fix"),
                    is_verified=issue_data.get("is_verified", False),
                    verification_status=issue_data.get("verification_status"),
                    surrounding_text=issue_data.get("surrounding_text")
                )
                self.db.add(issue)

            # Calculate statistics
            total_citations = len(issues) if issues else self._count_citations(document_text)
            invalid_citations = len([i for i in issues if i.get("severity") in ["critical", "high"]])
            warnings = len([i for i in issues if i.get("severity") in ["medium", "low"]])
            valid_citations = total_citations - invalid_citations - warnings

            # Overall score
            if total_citations > 0:
                score = (valid_citations / total_citations) * 100
            else:
                score = 100.0

            # Update check
            end_time = datetime.utcnow()
            check.status = "completed"
            check.total_citations_found = total_citations
            check.valid_citations = valid_citations
            check.invalid_citations = invalid_citations
            check.warnings = warnings
            check.overall_score = round(score, 1)
            check.processing_time_seconds = (end_time - start_time).total_seconds()

            self.db.commit()
            self.db.refresh(check)

            return check

        except Exception as e:
            check.status = "failed"
            self.db.commit()
            raise e

    def _analyze_citations_with_ai(
        self,
        document_text: str,
        citation_format: str,
        check_id: str
    ) -> list[dict]:
        """Use AI to find and validate citations"""
        prompt = f"""You are a legal citation expert specializing in {citation_format} format.

Analyze this legal document and identify ALL legal citations. For each citation found, determine if it follows proper {citation_format} format.

Document (first 3000 chars):
{document_text[:3000]}

For each citation, provide:
1. The citation text as it appears
2. Citation type (case, statute, regulation, article, book)
3. Severity of any issues (critical, high, medium, low, info)
4. Issue type (format_error, missing_element, outdated, style_issue)
5. Description of the issue (or "valid" if correct)
6. Expected format
7. Suggested correction

Return a JSON array:
[
  {{
    "citation_text": "Brown v. Board of Ed., 347 U.S. 483",
    "citation_type": "case",
    "location_start": 150,
    "location_end": 185,
    "severity": "medium",
    "issue_type": "format_error",
    "issue_description": "Case name should not be abbreviated in text citation",
    "expected_format": "Brown v. Board of Education, 347 U.S. 483 (1954)",
    "actual_format": "Brown v. Board of Ed., 347 U.S. 483",
    "suggested_fix": "Brown v. Board of Education, 347 U.S. 483 (1954)",
    "is_verified": true,
    "verification_status": "valid",
    "surrounding_text": "...landmark case Brown v. Board of Ed., 347 U.S. 483 established..."
  }}
]

If document has no citations, return empty array [].
Return ONLY valid JSON."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a legal citation expert. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            content = response.choices[0].message.content.strip()
            issues = json.loads(content)
            return issues

        except json.JSONDecodeError:
            # Fallback: basic regex detection
            return self._basic_citation_detection(document_text)
        except Exception:
            return []

    def _basic_citation_detection(self, text: str) -> list[dict]:
        """Fallback: Basic regex-based citation detection"""
        issues = []

        # Simple pattern for case citations (e.g., "123 U.S. 456")
        case_pattern = r'\d+\s+[A-Z][a-z\.]*\s+\d+'
        matches = re.finditer(case_pattern, text)

        for match in matches:
            issues.append({
                "citation_text": match.group(),
                "citation_type": "case",
                "location_start": match.start(),
                "location_end": match.end(),
                "severity": "info",
                "issue_type": "format_check",
                "issue_description": "Citation detected - manual review recommended",
                "expected_format": None,
                "actual_format": match.group(),
                "suggested_fix": None,
                "is_verified": False,
                "verification_status": "uncertain",
                "surrounding_text": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })

        return issues[:20]  # Limit to 20 for fallback

    def _count_citations(self, text: str) -> int:
        """Rough estimate of citation count"""
        # Look for common citation patterns
        patterns = [
            r'\d+\s+[A-Z][a-z\.]*\s+\d+',  # Reporter citations
            r'\d+\s+U\.S\.C\.',  # US Code
            r'\d+\s+C\.F\.R\.',  # Code of Federal Regulations
        ]

        count = 0
        for pattern in patterns:
            count += len(re.findall(pattern, text))

        return max(count, 1)  # At least 1

    def get_check(self, check_id: str) -> tuple[CitationCheck, list[CitationIssue]]:
        """Get a citation check and its issues"""
        check = self.db.exec(
            select(CitationCheck).where(CitationCheck.check_id == check_id)
        ).first()

        if not check:
            raise ValueError("Citation check not found")

        issues = self.db.exec(
            select(CitationIssue)
            .where(CitationIssue.check_id == check_id)
            .order_by(CitationIssue.severity.desc())
        ).all()

        return check, list(issues)

    def get_user_checks(self, user_id: int, limit: int = 50) -> list[CitationCheck]:
        """Get user's citation checks"""
        checks = self.db.exec(
            select(CitationCheck)
            .where(CitationCheck.user_id == user_id)
            .order_by(CitationCheck.created_at.desc())
            .limit(limit)
        ).all()

        return list(checks)

    def get_formats(self) -> list[CitationFormat]:
        """Get available citation formats"""
        formats = self.db.exec(
            select(CitationFormat).where(CitationFormat.is_active == True)
        ).all()

        return list(formats)
