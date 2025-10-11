from fastapi import APIRouter
from app.api.v1 import contracts, users, billing

api_router = APIRouter()

api_router.include_router(contracts.router)
api_router.include_router(users.router)
api_router.include_router(billing.router)
