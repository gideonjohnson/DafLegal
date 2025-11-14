from fastapi import APIRouter
from app.api.v1 import contracts, users, billing, comparisons, clauses, compliance, research, drafting, analytics, citations, intake, conveyancing

api_router = APIRouter()

api_router.include_router(contracts.router)
api_router.include_router(users.router)
api_router.include_router(billing.router)
api_router.include_router(comparisons.router)
api_router.include_router(clauses.router)
api_router.include_router(compliance.router)
api_router.include_router(research.router)
api_router.include_router(drafting.router)
api_router.include_router(analytics.router)
api_router.include_router(citations.router)
api_router.include_router(intake.router)
api_router.include_router(conveyancing.router)
