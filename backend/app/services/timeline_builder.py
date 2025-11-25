"""
Matter Timeline & Fact Chronology Builder Service
Extracts dates, events, and key facts from documents to build a searchable timeline.
"""
import json
from typing import Dict, Any, List
from datetime import datetime
from openai import OpenAI
from app.core.config import settings


class TimelineBuilder:
    """Build chronological timelines from multiple documents"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o-mini"

    def extract_events_from_document(self, text: str, filename: str, doc_id: str) -> Dict[str, Any]:
        """
        Extract dated events and facts from a single document.

        Returns:
        {
            "doc_id": "unique_id",
            "filename": "document.pdf",
            "doc_type": "Email/Contract/Letter/etc",
            "doc_date": "2024-01-15",
            "importance": "high/medium/low",
            "is_hot_doc": true/false,
            "hot_doc_reason": "Why this is important",
            "summary": "Brief summary",
            "events": [
                {
                    "date": "2024-01-15",
                    "date_precision": "exact/approximate/inferred",
                    "event_type": "communication/agreement/breach/payment/filing/meeting/other",
                    "description": "What happened",
                    "parties_involved": ["Party A", "Party B"],
                    "significance": "high/medium/low",
                    "quote": "Relevant quote from document"
                }
            ]
        }
        """
        # Limit text for cost control
        text_to_analyze = text[:15000]

        prompt = self._build_extraction_prompt(text_to_analyze, filename)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert legal analyst specializing in building case chronologies and timelines.

Your job is to:
1. Extract ALL dated events, facts, and communications from documents
2. Identify the document type and its overall importance to the case
3. Flag "hot documents" - documents that are particularly important for litigation
4. Note who was involved in each event and what significance it has

Be thorough - extract every date and event mentioned. Include approximate dates when exact dates aren't given.
A "hot doc" is a document that could be particularly important in litigation - smoking gun evidence, key admissions, pivotal communications, etc."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=3000
            )

            result = json.loads(response.choices[0].message.content)
            result["doc_id"] = doc_id
            result["filename"] = filename
            return self._validate_extraction(result)

        except Exception as e:
            return self._get_fallback_extraction(doc_id, filename, str(e))

    def build_timeline(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Combine extracted events from multiple documents into a unified timeline.

        Returns:
        {
            "matter_summary": "Overall summary of the matter",
            "date_range": {"start": "2023-01-01", "end": "2024-06-15"},
            "key_parties": ["Party A", "Party B"],
            "hot_docs": [...],
            "timeline": [
                {
                    "date": "2024-01-15",
                    "events": [...],
                    "documents": [...]
                }
            ],
            "statistics": {
                "total_events": 45,
                "total_documents": 12,
                "hot_docs_count": 3,
                "date_range_days": 530
            }
        }
        """
        all_events = []
        hot_docs = []
        all_parties = set()

        # Collect all events and hot docs
        for doc in documents:
            doc_id = doc.get("doc_id", "")
            filename = doc.get("filename", "")
            is_hot = doc.get("is_hot_doc", False)

            if is_hot:
                hot_docs.append({
                    "doc_id": doc_id,
                    "filename": filename,
                    "importance": doc.get("importance", "medium"),
                    "reason": doc.get("hot_doc_reason", ""),
                    "doc_type": doc.get("doc_type", "Document"),
                    "doc_date": doc.get("doc_date"),
                    "summary": doc.get("summary", "")
                })

            for event in doc.get("events", []):
                event["source_doc_id"] = doc_id
                event["source_filename"] = filename
                event["source_is_hot"] = is_hot
                all_events.append(event)

                for party in event.get("parties_involved", []):
                    all_parties.add(party)

        # Sort events by date
        all_events.sort(key=lambda x: self._parse_date(x.get("date", "1900-01-01")))

        # Group events by date
        timeline = self._group_events_by_date(all_events)

        # Calculate date range
        dates = [self._parse_date(e.get("date", "")) for e in all_events if e.get("date")]
        dates = [d for d in dates if d]

        date_range = {
            "start": min(dates).isoformat() if dates else None,
            "end": max(dates).isoformat() if dates else None
        }

        # Calculate statistics
        date_range_days = (max(dates) - min(dates)).days if len(dates) >= 2 else 0

        return {
            "date_range": date_range,
            "key_parties": list(all_parties),
            "hot_docs": sorted(hot_docs, key=lambda x: x.get("importance", "") == "high", reverse=True),
            "timeline": timeline,
            "statistics": {
                "total_events": len(all_events),
                "total_documents": len(documents),
                "hot_docs_count": len(hot_docs),
                "date_range_days": date_range_days
            }
        }

    def generate_matter_summary(self, timeline_data: Dict[str, Any]) -> str:
        """Generate an AI summary of the entire matter based on timeline"""
        events_text = ""
        for entry in timeline_data.get("timeline", [])[:30]:  # Limit for context
            events_text += f"\n{entry['date']}:\n"
            for event in entry.get("events", []):
                events_text += f"  - {event.get('description', '')}\n"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a legal analyst. Summarize the key facts of this matter in 3-4 paragraphs."
                    },
                    {
                        "role": "user",
                        "content": f"Summarize this case chronology:\n{events_text}"
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            return response.choices[0].message.content
        except:
            return "Unable to generate summary."

    def _build_extraction_prompt(self, text: str, filename: str) -> str:
        """Build the event extraction prompt"""
        return f"""Analyze this document and extract all dated events and facts.

DOCUMENT: {filename}
---
{text}
---

Extract information in this exact JSON structure:

{{
  "doc_type": "Email | Letter | Contract | Court Filing | Memo | Report | Invoice | Agreement | Other",
  "doc_date": "YYYY-MM-DD (the primary date of the document, or null)",
  "importance": "high | medium | low",
  "is_hot_doc": true or false,
  "hot_doc_reason": "If hot doc, explain why (key admission, smoking gun, pivotal communication, etc.)",
  "summary": "2-3 sentence summary of the document",
  "events": [
    {{
      "date": "YYYY-MM-DD",
      "date_precision": "exact | approximate | inferred",
      "event_type": "communication | agreement | breach | payment | filing | meeting | deadline | notice | other",
      "description": "Clear description of what happened",
      "parties_involved": ["Person/Company A", "Person/Company B"],
      "significance": "high | medium | low",
      "quote": "Key quote from document (if relevant)"
    }}
  ]
}}

GUIDELINES:
1. Extract EVERY date mentioned, even references to past events
2. Use "approximate" for phrases like "early January" or "around March 2024"
3. Use "inferred" when you deduce a date from context
4. A document is a "hot doc" if it contains: key admissions, evidence of wrongdoing, pivotal decisions, smoking gun evidence, or critical turning points
5. Include the parties involved in each event
6. Quote directly when there's important language

Return ONLY valid JSON."""

    def _validate_extraction(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean extraction result"""
        valid_doc_types = ["Email", "Letter", "Contract", "Court Filing", "Memo", "Report", "Invoice", "Agreement", "Other"]
        valid_importance = ["high", "medium", "low"]
        valid_event_types = ["communication", "agreement", "breach", "payment", "filing", "meeting", "deadline", "notice", "other"]
        valid_precision = ["exact", "approximate", "inferred"]
        valid_significance = ["high", "medium", "low"]

        result["doc_type"] = result.get("doc_type", "Other") if result.get("doc_type") in valid_doc_types else "Other"
        result["importance"] = result.get("importance", "medium") if result.get("importance") in valid_importance else "medium"
        result["is_hot_doc"] = bool(result.get("is_hot_doc", False))
        result["hot_doc_reason"] = str(result.get("hot_doc_reason", "")) if result["is_hot_doc"] else ""
        result["summary"] = str(result.get("summary", ""))[:500]

        # Validate events
        valid_events = []
        for event in result.get("events", []):
            if isinstance(event, dict) and event.get("date") and event.get("description"):
                valid_events.append({
                    "date": str(event.get("date", ""))[:10],
                    "date_precision": event.get("date_precision", "exact") if event.get("date_precision") in valid_precision else "exact",
                    "event_type": event.get("event_type", "other") if event.get("event_type") in valid_event_types else "other",
                    "description": str(event.get("description", ""))[:500],
                    "parties_involved": event.get("parties_involved", []) if isinstance(event.get("parties_involved"), list) else [],
                    "significance": event.get("significance", "medium") if event.get("significance") in valid_significance else "medium",
                    "quote": str(event.get("quote", ""))[:300] if event.get("quote") else None
                })

        result["events"] = valid_events
        return result

    def _get_fallback_extraction(self, doc_id: str, filename: str, error: str) -> Dict[str, Any]:
        """Return fallback result on error"""
        return {
            "doc_id": doc_id,
            "filename": filename,
            "doc_type": "Other",
            "doc_date": None,
            "importance": "medium",
            "is_hot_doc": False,
            "hot_doc_reason": "",
            "summary": f"Could not analyze document: {error}",
            "events": []
        }

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime"""
        try:
            return datetime.fromisoformat(date_str[:10])
        except:
            return datetime(1900, 1, 1)

    def _group_events_by_date(self, events: List[Dict]) -> List[Dict]:
        """Group events by date for timeline display"""
        grouped = {}
        for event in events:
            date = event.get("date", "Unknown")
            if date not in grouped:
                grouped[date] = {
                    "date": date,
                    "events": [],
                    "source_docs": set()
                }
            grouped[date]["events"].append(event)
            grouped[date]["source_docs"].add(event.get("source_doc_id", ""))

        # Convert sets to lists and sort
        result = []
        for date in sorted(grouped.keys()):
            entry = grouped[date]
            entry["source_docs"] = list(entry["source_docs"])
            entry["event_count"] = len(entry["events"])
            entry["has_hot_doc"] = any(e.get("source_is_hot") for e in entry["events"])
            result.append(entry)

        return result
