"""
Matter Timeline & Fact Chronology Builder API
Upload documents and build a searchable, clickable timeline with hot docs.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import time
import uuid

from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.document_processor import DocumentProcessor
from app.services.timeline_builder import TimelineBuilder

router = APIRouter(prefix="/timeline", tags=["timeline"])

# In-memory storage for demo (replace with database in production)
matters_store: Dict[str, Dict] = {}
documents_store: Dict[str, Dict] = {}


class TimelineEvent(BaseModel):
    date: str
    date_precision: str
    event_type: str
    description: str
    parties_involved: List[str]
    significance: str
    quote: Optional[str] = None
    source_doc_id: str
    source_filename: str
    source_is_hot: bool


class TimelineEntry(BaseModel):
    date: str
    events: List[TimelineEvent]
    source_docs: List[str]
    event_count: int
    has_hot_doc: bool


class HotDoc(BaseModel):
    doc_id: str
    filename: str
    importance: str
    reason: str
    doc_type: str
    doc_date: Optional[str]
    summary: str


class DocumentInfo(BaseModel):
    doc_id: str
    filename: str
    doc_type: str
    doc_date: Optional[str]
    importance: str
    is_hot_doc: bool
    hot_doc_reason: str
    summary: str
    event_count: int
    uploaded_at: datetime


class MatterInfo(BaseModel):
    matter_id: str
    name: str
    description: Optional[str]
    created_at: datetime
    document_count: int
    event_count: int
    hot_docs_count: int


class MatterCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None


class TimelineResponse(BaseModel):
    matter_id: str
    matter_name: str
    date_range: Dict[str, Optional[str]]
    key_parties: List[str]
    hot_docs: List[HotDoc]
    timeline: List[TimelineEntry]
    documents: List[DocumentInfo]
    statistics: Dict[str, int]
    matter_summary: Optional[str]


class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    doc_type: str
    importance: str
    is_hot_doc: bool
    event_count: int
    processing_time_seconds: float


@router.post("/matters", response_model=MatterInfo)
async def create_matter(
    request: MatterCreateRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new matter/case for timeline building"""
    matter_id = f"mat_{uuid.uuid4().hex[:12]}"

    matter = {
        "matter_id": matter_id,
        "name": request.name,
        "description": request.description,
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
        "documents": [],
        "timeline_data": None
    }

    matters_store[matter_id] = matter

    return MatterInfo(
        matter_id=matter_id,
        name=request.name,
        description=request.description,
        created_at=matter["created_at"],
        document_count=0,
        event_count=0,
        hot_docs_count=0
    )


@router.get("/matters", response_model=List[MatterInfo])
async def list_matters(
    current_user: User = Depends(get_current_user)
):
    """List all matters for the current user"""
    user_matters = [m for m in matters_store.values() if m.get("user_id") == current_user.id]

    return [
        MatterInfo(
            matter_id=m["matter_id"],
            name=m["name"],
            description=m.get("description"),
            created_at=m["created_at"],
            document_count=len(m.get("documents", [])),
            event_count=sum(d.get("event_count", 0) for d in m.get("documents", [])),
            hot_docs_count=sum(1 for d in m.get("documents", []) if d.get("is_hot_doc"))
        )
        for m in sorted(user_matters, key=lambda x: x["created_at"], reverse=True)
    ]


@router.delete("/matters/{matter_id}")
async def delete_matter(
    matter_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a matter and all its documents"""
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Remove associated documents
    for doc in matter.get("documents", []):
        doc_id = doc.get("doc_id")
        if doc_id in documents_store:
            del documents_store[doc_id]

    del matters_store[matter_id]
    return {"status": "deleted", "matter_id": matter_id}


@router.post("/matters/{matter_id}/documents", response_model=DocumentUploadResponse)
async def upload_document(
    matter_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a document to a matter and extract timeline events"""
    start_time = time.time()

    # Validate matter exists
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
        "message/rfc822",  # .eml files
        "application/vnd.ms-outlook"  # .msg files
    ]

    content_type = file.content_type or "application/octet-stream"
    if content_type not in allowed_types and not file.filename.endswith(('.pdf', '.docx', '.doc', '.txt', '.eml')):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: PDF, DOCX, DOC, TXT, EML"
        )

    # Read file content
    content = await file.read()

    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 25MB.")

    # Determine file type
    filename = file.filename or "document"
    if filename.endswith('.pdf') or 'pdf' in content_type:
        file_type = "pdf"
    elif filename.endswith(('.docx', '.doc')) or 'document' in content_type:
        file_type = "docx"
    else:
        file_type = "txt"

    try:
        # Extract text from document
        extracted_text, page_count, word_count = DocumentProcessor.process_file(content, file_type)

        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the document."
            )

        # Generate document ID
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"

        # Extract events using timeline builder
        builder = TimelineBuilder()
        extraction = builder.extract_events_from_document(extracted_text, filename, doc_id)

        # Store document data
        doc_data = {
            **extraction,
            "content": extracted_text[:50000],  # Store first 50k chars
            "page_count": page_count,
            "word_count": word_count,
            "uploaded_at": datetime.utcnow(),
            "event_count": len(extraction.get("events", []))
        }

        documents_store[doc_id] = doc_data

        # Add to matter
        matter["documents"].append(doc_data)
        matter["timeline_data"] = None  # Invalidate cached timeline

        processing_time = time.time() - start_time

        return DocumentUploadResponse(
            doc_id=doc_id,
            filename=filename,
            doc_type=extraction.get("doc_type", "Other"),
            importance=extraction.get("importance", "medium"),
            is_hot_doc=extraction.get("is_hot_doc", False),
            event_count=len(extraction.get("events", [])),
            processing_time_seconds=round(processing_time, 2)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")


@router.post("/matters/{matter_id}/documents/batch")
async def upload_documents_batch(
    matter_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload multiple documents at once"""
    results = []
    errors = []

    for file in files:
        try:
            result = await upload_document(matter_id, file, current_user)
            results.append(result)
        except HTTPException as e:
            errors.append({"filename": file.filename, "error": e.detail})
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})

    return {
        "uploaded": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }


@router.delete("/matters/{matter_id}/documents/{doc_id}")
async def delete_document(
    matter_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a document from a matter"""
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Remove from matter
    matter["documents"] = [d for d in matter["documents"] if d.get("doc_id") != doc_id]
    matter["timeline_data"] = None  # Invalidate cache

    # Remove from store
    if doc_id in documents_store:
        del documents_store[doc_id]

    return {"status": "deleted", "doc_id": doc_id}


@router.get("/matters/{matter_id}/timeline", response_model=TimelineResponse)
async def get_timeline(
    matter_id: str,
    include_summary: bool = Query(default=True, description="Generate AI summary of the matter"),
    current_user: User = Depends(get_current_user)
):
    """Get the complete timeline for a matter"""
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    documents = matter.get("documents", [])

    if not documents:
        return TimelineResponse(
            matter_id=matter_id,
            matter_name=matter["name"],
            date_range={"start": None, "end": None},
            key_parties=[],
            hot_docs=[],
            timeline=[],
            documents=[],
            statistics={
                "total_events": 0,
                "total_documents": 0,
                "hot_docs_count": 0,
                "date_range_days": 0
            },
            matter_summary=None
        )

    # Build timeline
    builder = TimelineBuilder()
    timeline_data = builder.build_timeline(documents)

    # Generate summary if requested
    matter_summary = None
    if include_summary and timeline_data.get("timeline"):
        matter_summary = builder.generate_matter_summary(timeline_data)

    # Build document info list
    doc_infos = [
        DocumentInfo(
            doc_id=d["doc_id"],
            filename=d["filename"],
            doc_type=d.get("doc_type", "Other"),
            doc_date=d.get("doc_date"),
            importance=d.get("importance", "medium"),
            is_hot_doc=d.get("is_hot_doc", False),
            hot_doc_reason=d.get("hot_doc_reason", ""),
            summary=d.get("summary", ""),
            event_count=len(d.get("events", [])),
            uploaded_at=d.get("uploaded_at", datetime.utcnow())
        )
        for d in documents
    ]

    return TimelineResponse(
        matter_id=matter_id,
        matter_name=matter["name"],
        date_range=timeline_data["date_range"],
        key_parties=timeline_data["key_parties"],
        hot_docs=[HotDoc(**hd) for hd in timeline_data["hot_docs"]],
        timeline=[TimelineEntry(**te) for te in timeline_data["timeline"]],
        documents=doc_infos,
        statistics=timeline_data["statistics"],
        matter_summary=matter_summary
    )


@router.get("/matters/{matter_id}/documents/{doc_id}")
async def get_document(
    matter_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get document details including extracted text"""
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if doc_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = documents_store[doc_id]

    return {
        "doc_id": doc["doc_id"],
        "filename": doc["filename"],
        "doc_type": doc.get("doc_type", "Other"),
        "doc_date": doc.get("doc_date"),
        "importance": doc.get("importance", "medium"),
        "is_hot_doc": doc.get("is_hot_doc", False),
        "hot_doc_reason": doc.get("hot_doc_reason", ""),
        "summary": doc.get("summary", ""),
        "events": doc.get("events", []),
        "content_preview": doc.get("content", "")[:5000],
        "page_count": doc.get("page_count", 0),
        "word_count": doc.get("word_count", 0)
    }


@router.get("/matters/{matter_id}/search")
async def search_timeline(
    matter_id: str,
    query: str = Query(..., min_length=2, description="Search query"),
    current_user: User = Depends(get_current_user)
):
    """Search across all events and documents in a matter"""
    if matter_id not in matters_store:
        raise HTTPException(status_code=404, detail="Matter not found")

    matter = matters_store[matter_id]
    if matter.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    query_lower = query.lower()
    results = []

    for doc in matter.get("documents", []):
        # Search document metadata
        doc_matches = query_lower in doc.get("filename", "").lower() or \
                      query_lower in doc.get("summary", "").lower()

        # Search events
        for event in doc.get("events", []):
            if query_lower in event.get("description", "").lower() or \
               query_lower in (event.get("quote") or "").lower() or \
               any(query_lower in p.lower() for p in event.get("parties_involved", [])):
                results.append({
                    "type": "event",
                    "date": event.get("date"),
                    "description": event.get("description"),
                    "source_doc_id": doc["doc_id"],
                    "source_filename": doc["filename"],
                    "is_hot_doc": doc.get("is_hot_doc", False),
                    "quote": event.get("quote")
                })

        if doc_matches:
            results.append({
                "type": "document",
                "doc_id": doc["doc_id"],
                "filename": doc["filename"],
                "summary": doc.get("summary", ""),
                "is_hot_doc": doc.get("is_hot_doc", False)
            })

    return {
        "query": query,
        "result_count": len(results),
        "results": results
    }
