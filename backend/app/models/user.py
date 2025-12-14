from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum


class PlanType(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"
    FREE_TRIAL = "free_trial"  # Deprecated, keeping for backward compatibility


class User(SQLModel, table=True):
    """User account"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None

    # OAuth identifiers
    google_id: Optional[str] = Field(default=None, unique=True)

    # Plan information
    plan: PlanType = Field(default=PlanType.FREE_TRIAL)
    stripe_customer_id: Optional[str] = Field(default=None, unique=True)
    stripe_subscription_id: Optional[str] = Field(default=None, unique=True)
    paystack_customer_code: Optional[str] = Field(default=None, unique=True)
    paystack_subscription_code: Optional[str] = Field(default=None, unique=True)

    # Usage tracking
    pages_used_current_period: int = Field(default=0)
    files_used_current_period: int = Field(default=0)
    billing_period_start: datetime = Field(default_factory=datetime.utcnow)
    billing_period_end: datetime = Field(default_factory=lambda: datetime.utcnow())

    # Metadata
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    api_keys: List["APIKey"] = Relationship(back_populates="user")
    contracts: List["Contract"] = Relationship(back_populates="user")
    clauses: List["Clause"] = Relationship(back_populates="user")
    playbooks: List["Playbook"] = Relationship(back_populates="user")
    research_queries: List["ResearchQuery"] = Relationship(back_populates="user")
    citations: List["Citation"] = Relationship(back_populates="user")
    contract_templates: List["ContractTemplate"] = Relationship(back_populates="user")


class APIKey(SQLModel, table=True):
    """API key for authentication"""
    __tablename__ = "api_keys"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    key: str = Field(unique=True, index=True)
    name: str
    is_active: bool = Field(default=True)

    last_used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="api_keys")
