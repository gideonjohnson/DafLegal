"""
Server-Sent Events (SSE) API for Real-Time Updates
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from typing import AsyncIterator
import asyncio
import json
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.contract import Contract, ContractStatus

router = APIRouter(prefix="/sse", tags=["sse"])


async def event_stream(contract_id: str, user_id: int, db: Session) -> AsyncIterator[str]:
    """
    Generate SSE stream for contract analysis progress

    Yields formatted SSE messages with contract status updates
    """
    last_status = None
    timeout_counter = 0
    max_timeout = 300  # 5 minutes total timeout

    try:
        while timeout_counter < max_timeout:
            # Fetch current contract status
            statement = select(Contract).where(
                Contract.contract_id == contract_id,
                Contract.user_id == user_id
            )
            contract = db.exec(statement).first()

            if not contract:
                yield f"event: error\ndata: {json.dumps({'error': 'Contract not found'})}\n\n"
                break

            current_status = contract.status if hasattr(contract, 'status') else 'processing'

            # Only send update if status changed or every 5 seconds (heartbeat)
            if current_status != last_status or timeout_counter % 5 == 0:
                # Calculate progress percentage
                progress = get_progress_percentage(current_status)

                event_data = {
                    'contract_id': contract_id,
                    'status': current_status,
                    'progress': progress,
                    'risk_level': contract.risk_level if hasattr(contract, 'risk_level') else None,
                    'risk_score': contract.risk_score if hasattr(contract, 'risk_score') else None,
                    'timestamp': datetime.utcnow().isoformat()
                }

                yield f"data: {json.dumps(event_data)}\n\n"
                last_status = current_status

                # If processing is complete, send final message and close
                if current_status in ['completed', 'failed']:
                    yield f"event: close\ndata: {json.dumps({'status': current_status})}\n\n"
                    break

            await asyncio.sleep(1)
            timeout_counter += 1

        # Timeout reached
        if timeout_counter >= max_timeout:
            yield f"event: timeout\ndata: {json.dumps({'error': 'Stream timeout reached'})}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"


def get_progress_percentage(status: str) -> int:
    """
    Map contract status to progress percentage
    """
    status_map = {
        'uploaded': 10,
        'extracting': 30,
        'analyzing': 60,
        'processing': 50,  # generic processing
        'completed': 100,
        'failed': 0
    }
    return status_map.get(status, 0)


@router.get("/contracts/{contract_id}")
async def contract_status_stream(
    contract_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream real-time contract analysis status updates via Server-Sent Events

    Usage:
    ```javascript
    const eventSource = new EventSource('/api/v1/sse/contracts/{contract_id}', {
        headers: { Authorization: 'Bearer YOUR_API_KEY' }
    })

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('Progress:', data.progress, '%')
    }

    eventSource.addEventListener('close', () => {
        eventSource.close()
    })
    ```
    """
    # Verify contract belongs to user
    statement = select(Contract).where(
        Contract.contract_id == contract_id,
        Contract.user_id == current_user.id
    )
    contract = db.exec(statement).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )

    return StreamingResponse(
        event_stream(contract_id, current_user.id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.get("/contracts/{contract_id}/status")
async def get_contract_status(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current contract analysis status (polling endpoint - alternative to SSE)

    Use this if SSE is not supported by the client
    """
    statement = select(Contract).where(
        Contract.contract_id == contract_id,
        Contract.user_id == current_user.id
    )
    contract = db.exec(statement).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )

    current_status = contract.status if hasattr(contract, 'status') else 'processing'

    return {
        'contract_id': contract_id,
        'status': current_status,
        'progress': get_progress_percentage(current_status),
        'risk_level': contract.risk_level if hasattr(contract, 'risk_level') else None,
        'risk_score': contract.risk_score if hasattr(contract, 'risk_score') else None,
        'file_name': contract.file_name,
        'created_at': contract.created_at.isoformat() if contract.created_at else None,
        'updated_at': contract.updated_at.isoformat() if hasattr(contract, 'updated_at') and contract.updated_at else None
    }
