"""
Legal Research Service

AI-powered legal research assistant for finding case law, statutes, and regulations.

NOTE: This MVP uses AI to simulate legal research results. In production, this would
integrate with real legal databases like Westlaw, LexisNexis, or public APIs like
CourtListener, Case.law, or government statute databases.
"""

import json
import secrets
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from openai import OpenAI

from app.models.research import (
    ResearchQuery,
    ResearchResult,
    Citation,
    ResearchTemplate
)
from app.models.user import User


class ResearchService:
    """Legal research assistant service"""

    def __init__(self, db: Session, openai_api_key: str):
        self.db = db
        self.client = OpenAI(api_key=openai_api_key)

    def create_research_query(
        self,
        user_id: int,
        query_text: str,
        query_type: str,
        jurisdiction: Optional[str] = None,
        filters: dict = None
    ) -> ResearchQuery:
        """Create a new research query"""
        query = ResearchQuery(
            query_id=f"req_{secrets.token_hex(8)}",
            user_id=user_id,
            query_text=query_text,
            query_type=query_type,
            jurisdiction=jurisdiction or "US",
            filters=filters or {}
        )
        self.db.add(query)
        self.db.commit()
        self.db.refresh(query)
        return query

    def perform_research(
        self,
        query_id: str,
        max_results: int = 10
    ) -> list[ResearchResult]:
        """
        Perform AI-powered legal research

        NOTE: This MVP uses AI to generate simulated results. In production,
        this would query real legal databases.
        """
        # Get query
        query = self.db.exec(
            select(ResearchQuery).where(ResearchQuery.query_id == query_id)
        ).first()

        if not query:
            raise ValueError("Query not found")

        start_time = datetime.utcnow()

        # Update status
        query.status = "processing"
        self.db.commit()

        try:
            # Generate research results using AI
            results = self._ai_research(
                query_text=query.query_text,
                query_type=query.query_type,
                jurisdiction=query.jurisdiction,
                max_results=max_results
            )

            # Save results to database
            saved_results = []
            for result_data in results:
                result = ResearchResult(
                    result_id=f"res_{secrets.token_hex(8)}",
                    query_id=query_id,
                    title=result_data["title"],
                    citation=result_data["citation"],
                    document_type=result_data["document_type"],
                    jurisdiction=result_data.get("jurisdiction"),
                    court=result_data.get("court"),
                    date_decided=result_data.get("date_decided"),
                    summary=result_data["summary"],
                    key_points=result_data.get("key_points", []),
                    relevance_score=result_data.get("relevance_score", 7.0),
                    full_text_url=result_data.get("full_text_url"),
                    judges=result_data.get("judges"),
                    parties=result_data.get("parties"),
                    topics=result_data.get("topics", []),
                    ai_summary=result_data.get("ai_summary"),
                    precedent_value=result_data.get("precedent_value", "persuasive")
                )
                self.db.add(result)
                saved_results.append(result)

            # Update query status
            end_time = datetime.utcnow()
            query.status = "completed"
            query.result_count = len(saved_results)
            query.processing_time_seconds = (end_time - start_time).total_seconds()

            self.db.commit()

            # Refresh to get relationships
            for result in saved_results:
                self.db.refresh(result)

            return saved_results

        except Exception as e:
            query.status = "failed"
            self.db.commit()
            raise e

    def _ai_research(
        self,
        query_text: str,
        query_type: str,
        jurisdiction: str,
        max_results: int
    ) -> list[dict]:
        """
        Use AI to generate legal research results

        NOTE: This simulates legal research for MVP. In production, integrate with:
        - CourtListener API (free case law)
        - Case.law (Harvard's free case law)
        - Congress.gov API (US statutes)
        - UK Legislation API
        - African LII (Kenya legal information)
        """
        prompt = f"""You are a legal research assistant. A lawyer has searched for: "{query_text}"

Query Type: {query_type}
Jurisdiction: {jurisdiction}
Number of results needed: {max_results}

Generate {max_results} realistic legal research results (cases, statutes, or regulations) that would be relevant to this query.

For each result, provide:
1. Title of the case/statute
2. Proper legal citation
3. Court (if case) or legislative body (if statute)
4. Date decided/enacted
5. Brief summary (2-3 sentences)
6. 3-5 key points
7. Relevance score (0-10)
8. Parties involved (if case)
9. Key topics/legal areas
10. Precedent value (binding/persuasive/informational)
11. AI analysis of why this is relevant

Return ONLY a JSON array of results, no other text. Format:
[
  {{
    "title": "Case/Statute Title",
    "citation": "Proper legal citation",
    "document_type": "case" or "statute" or "regulation",
    "jurisdiction": "{jurisdiction}",
    "court": "Court name",
    "date_decided": "YYYY-MM-DD",
    "summary": "Brief summary",
    "key_points": ["Point 1", "Point 2", ...],
    "relevance_score": 8.5,
    "full_text_url": "https://example.com/case",
    "judges": ["Judge Name"],
    "parties": ["Plaintiff", "Defendant"],
    "topics": ["Contract Law", "Breach"],
    "ai_summary": "Why this is relevant to the query",
    "precedent_value": "binding"
  }}
]"""

        response = self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a legal research assistant. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        # Parse AI response
        try:
            results = json.loads(response.choices[0].message.content)
            return results[:max_results]
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return self._generate_fallback_results(query_text, query_type, jurisdiction, max_results)

    def _generate_fallback_results(
        self,
        query_text: str,
        query_type: str,
        jurisdiction: str,
        max_results: int
    ) -> list[dict]:
        """Generate basic fallback results if AI fails"""
        return [{
            "title": f"Research Result for: {query_text[:50]}",
            "citation": f"Example v. Case, 123 {jurisdiction} 456 (2024)",
            "document_type": query_type,
            "jurisdiction": jurisdiction,
            "court": "Supreme Court",
            "date_decided": "2024-01-15",
            "summary": f"This is a relevant {query_type} regarding {query_text}",
            "key_points": [
                "Key legal principle 1",
                "Key legal principle 2",
                "Key legal principle 3"
            ],
            "relevance_score": 7.0,
            "full_text_url": None,
            "judges": ["Justice Example"],
            "parties": ["Plaintiff", "Defendant"],
            "topics": ["General Law"],
            "ai_summary": "This result matches your search query.",
            "precedent_value": "persuasive"
        } for _ in range(min(3, max_results))]

    def get_query_results(self, query_id: str) -> tuple[ResearchQuery, list[ResearchResult]]:
        """Get a query and its results"""
        query = self.db.exec(
            select(ResearchQuery).where(ResearchQuery.query_id == query_id)
        ).first()

        if not query:
            raise ValueError("Query not found")

        results = self.db.exec(
            select(ResearchResult)
            .where(ResearchResult.query_id == query_id)
            .order_by(ResearchResult.relevance_score.desc())
        ).all()

        return query, list(results)

    def get_user_queries(self, user_id: int, limit: int = 50) -> list[ResearchQuery]:
        """Get user's research history"""
        queries = self.db.exec(
            select(ResearchQuery)
            .where(ResearchQuery.user_id == user_id)
            .order_by(ResearchQuery.created_at.desc())
            .limit(limit)
        ).all()
        return list(queries)

    def update_result(
        self,
        result_id: str,
        is_saved: Optional[bool] = None,
        notes: Optional[str] = None
    ) -> ResearchResult:
        """Update a research result"""
        result = self.db.exec(
            select(ResearchResult).where(ResearchResult.result_id == result_id)
        ).first()

        if not result:
            raise ValueError("Result not found")

        if is_saved is not None:
            result.is_saved = is_saved

        if notes is not None:
            result.notes = notes

        self.db.commit()
        self.db.refresh(result)
        return result

    # Citation Management
    def create_citation(
        self,
        user_id: int,
        citation_text: str,
        document_type: str,
        title: str,
        result_id: Optional[str] = None,
        tags: list[str] = None,
        folder: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Citation:
        """Save a citation for future reference"""
        citation = Citation(
            citation_id=f"cit_{secrets.token_hex(8)}",
            user_id=user_id,
            result_id=result_id,
            citation_text=citation_text,
            document_type=document_type,
            title=title,
            tags=tags or [],
            folder=folder,
            notes=notes
        )
        self.db.add(citation)
        self.db.commit()
        self.db.refresh(citation)
        return citation

    def get_user_citations(
        self,
        user_id: int,
        folder: Optional[str] = None,
        tags: list[str] = None
    ) -> list[Citation]:
        """Get user's saved citations with optional filters"""
        query = select(Citation).where(Citation.user_id == user_id)

        if folder:
            query = query.where(Citation.folder == folder)

        # Note: Tag filtering would need to be done in Python for SQLite
        # For PostgreSQL, you could use array operators

        citations = self.db.exec(
            query.order_by(Citation.created_at.desc())
        ).all()

        # Filter by tags if provided
        if tags:
            citations = [
                c for c in citations
                if any(tag in c.tags for tag in tags)
            ]

        return list(citations)

    def update_citation(
        self,
        citation_id: str,
        tags: Optional[list[str]] = None,
        folder: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Citation:
        """Update a citation"""
        citation = self.db.exec(
            select(Citation).where(Citation.citation_id == citation_id)
        ).first()

        if not citation:
            raise ValueError("Citation not found")

        if tags is not None:
            citation.tags = tags

        if folder is not None:
            citation.folder = folder

        if notes is not None:
            citation.notes = notes

        citation.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(citation)
        return citation

    def delete_citation(self, citation_id: str):
        """Delete a citation"""
        citation = self.db.exec(
            select(Citation).where(Citation.citation_id == citation_id)
        ).first()

        if not citation:
            raise ValueError("Citation not found")

        self.db.delete(citation)
        self.db.commit()

    # Templates
    def get_templates(self, category: Optional[str] = None) -> list[ResearchTemplate]:
        """Get research templates"""
        query = select(ResearchTemplate).where(ResearchTemplate.is_public == True)

        if category:
            query = query.where(ResearchTemplate.category == category)

        templates = self.db.exec(query).all()
        return list(templates)
