from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class UsageRecord(SQLModel, table=True):
    """Track API usage for billing and analytics"""
    __tablename__ = "usage_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    # Usage details
    resource_type: str  # "contract_analysis"
    pages_consumed: int = Field(default=0)
    files_consumed: int = Field(default=1)

    # Reference
    contract_id: Optional[int] = Field(foreign_key="contracts.id")

    # Billing period
    billing_period_start: datetime
    billing_period_end: datetime

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
