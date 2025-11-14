"""
Analytics API Endpoints

Dashboard metrics and analytics for admin users.
"""

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_analytics_service(db: Session = Depends(get_session)) -> AnalyticsService:
    """Dependency to get analytics service"""
    return AnalyticsService(db=db)


@router.get("/dashboard")
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get overall dashboard metrics

    Returns counts for all major features and usage statistics.
    """
    return service.get_dashboard_overview(user_id=current_user.id)


@router.get("/trends")
async def get_usage_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get usage trends over time

    Returns daily counts for key activities over the specified period.
    """
    return service.get_usage_trends(days=days)


@router.get("/plans")
async def get_plan_distribution(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get distribution of users across subscription plans"""
    return service.get_plan_distribution()


@router.get("/features")
async def get_feature_usage(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get feature adoption statistics"""
    return service.get_feature_usage()


@router.get("/top-users")
async def get_top_users(
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get most active users"""
    return service.get_top_users(limit=limit)


@router.get("/compliance-stats")
async def get_compliance_stats(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Get compliance checking statistics"""
    return service.get_compliance_stats()
