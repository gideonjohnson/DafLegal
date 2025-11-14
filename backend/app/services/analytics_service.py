"""
Analytics Service

Aggregate usage metrics and analytics for the admin dashboard.
"""

from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session, select, func
from sqlalchemy import and_

from app.models.user import User
from app.models.contract import Contract, ContractAnalysis, ContractComparison
from app.models.clause import Clause, ClauseUsageLog
from app.models.compliance import ComplianceCheck
from app.models.research import ResearchQuery
from app.models.drafting import GeneratedContract


class AnalyticsService:
    """Analytics and metrics aggregation service"""

    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_overview(self, user_id: Optional[int] = None) -> dict:
        """Get overall dashboard metrics"""
        # User filter if specified
        user_filter = User.id == user_id if user_id else True

        # Total users
        total_users = self.db.exec(select(func.count(User.id))).one()

        # Total contracts
        total_contracts = self.db.exec(
            select(func.count(Contract.id))
        ).one()

        # Contracts analyzed (with results)
        analyzed_contracts = self.db.exec(
            select(func.count(ContractAnalysis.id))
        ).one()

        # Total comparisons
        total_comparisons = self.db.exec(
            select(func.count(ContractComparison.id))
        ).one()

        # Total clauses
        total_clauses = self.db.exec(
            select(func.count(Clause.id))
        ).one()

        # Total compliance checks
        total_compliance_checks = self.db.exec(
            select(func.count(ComplianceCheck.id))
        ).one()

        # Total research queries
        total_research = self.db.exec(
            select(func.count(ResearchQuery.id))
        ).one()

        # Total generated contracts
        total_generated = self.db.exec(
            select(func.count(GeneratedContract.id))
        ).one()

        return {
            "total_users": total_users,
            "total_contracts": total_contracts,
            "analyzed_contracts": analyzed_contracts,
            "total_comparisons": total_comparisons,
            "total_clauses": total_clauses,
            "total_compliance_checks": total_compliance_checks,
            "total_research_queries": total_research,
            "total_generated_contracts": total_generated
        }

    def get_usage_trends(self, days: int = 30) -> dict:
        """Get usage trends over time"""
        since_date = datetime.utcnow() - timedelta(days=days)

        # Contracts uploaded per day
        contracts_trend = self.db.exec(
            select(
                func.date(Contract.created_at).label('date'),
                func.count(Contract.id).label('count')
            )
            .where(Contract.created_at >= since_date)
            .group_by(func.date(Contract.created_at))
            .order_by(func.date(Contract.created_at))
        ).all()

        # Compliance checks per day
        compliance_trend = self.db.exec(
            select(
                func.date(ComplianceCheck.created_at).label('date'),
                func.count(ComplianceCheck.id).label('count')
            )
            .where(ComplianceCheck.created_at >= since_date)
            .group_by(func.date(ComplianceCheck.created_at))
            .order_by(func.date(ComplianceCheck.created_at))
        ).all()

        return {
            "contracts": [{"date": str(row.date), "count": row.count} for row in contracts_trend],
            "compliance": [{"date": str(row.date), "count": row.count} for row in compliance_trend]
        }

    def get_plan_distribution(self) -> dict:
        """Get distribution of users across plans"""
        plans = self.db.exec(
            select(
                User.plan,
                func.count(User.id).label('count')
            )
            .group_by(User.plan)
        ).all()

        return {
            "plans": [{"plan": row.plan, "count": row.count} for row in plans]
        }

    def get_feature_usage(self) -> dict:
        """Get feature usage statistics"""
        total_users = self.db.exec(select(func.count(User.id))).one()

        # Users who uploaded contracts
        contract_users = self.db.exec(
            select(func.count(func.distinct(Contract.user_id)))
        ).one()

        # Users who used comparisons
        comparison_users = self.db.exec(
            select(func.count(func.distinct(ContractComparison.user_id)))
        ).one()

        # Users who created clauses
        clause_users = self.db.exec(
            select(func.count(func.distinct(Clause.user_id)))
        ).one()

        # Users who ran compliance checks
        compliance_users = self.db.exec(
            select(func.count(func.distinct(ComplianceCheck.user_id)))
        ).one()

        # Users who did research
        research_users = self.db.exec(
            select(func.count(func.distinct(ResearchQuery.user_id)))
        ).one()

        # Users who generated contracts
        drafting_users = self.db.exec(
            select(func.count(func.distinct(GeneratedContract.user_id)))
        ).one()

        return {
            "total_users": total_users,
            "contract_analysis": {"users": contract_users, "percentage": round(contract_users/total_users*100, 1) if total_users > 0 else 0},
            "comparison": {"users": comparison_users, "percentage": round(comparison_users/total_users*100, 1) if total_users > 0 else 0},
            "clause_library": {"users": clause_users, "percentage": round(clause_users/total_users*100, 1) if total_users > 0 else 0},
            "compliance": {"users": compliance_users, "percentage": round(compliance_users/total_users*100, 1) if total_users > 0 else 0},
            "research": {"users": research_users, "percentage": round(research_users/total_users*100, 1) if total_users > 0 else 0},
            "drafting": {"users": drafting_users, "percentage": round(drafting_users/total_users*100, 1) if total_users > 0 else 0}
        }

    def get_top_users(self, limit: int = 10) -> list[dict]:
        """Get most active users"""
        # Count contracts per user
        top_users = self.db.exec(
            select(
                User.id,
                User.email,
                User.full_name,
                User.plan,
                func.count(Contract.id).label('contract_count')
            )
            .join(Contract, Contract.user_id == User.id, isouter=True)
            .group_by(User.id, User.email, User.full_name, User.plan)
            .order_by(func.count(Contract.id).desc())
            .limit(limit)
        ).all()

        return [
            {
                "user_id": row.id,
                "email": row.email,
                "full_name": row.full_name,
                "plan": row.plan,
                "contract_count": row.contract_count
            }
            for row in top_users
        ]

    def get_compliance_stats(self) -> dict:
        """Get compliance checking statistics"""
        total_checks = self.db.exec(select(func.count(ComplianceCheck.id))).one()

        if total_checks == 0:
            return {
                "total_checks": 0,
                "avg_score": 0,
                "status_distribution": {}
            }

        # Average compliance score
        avg_score = self.db.exec(
            select(func.avg(ComplianceCheck.compliance_score))
        ).one()

        # Status distribution
        statuses = self.db.exec(
            select(
                ComplianceCheck.status,
                func.count(ComplianceCheck.id).label('count')
            )
            .group_by(ComplianceCheck.status)
        ).all()

        return {
            "total_checks": total_checks,
            "avg_score": round(float(avg_score or 0), 1),
            "status_distribution": {row.status: row.count for row in statuses}
        }
