"""
Rate limiting for DafLegal API
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import logging

logger = logging.getLogger(__name__)


# Create limiter instance
# Use Redis if available, otherwise in-memory storage
try:
    from app.core.config import settings

    if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL:
        from slowapi.middleware import SlowAPIMiddleware
        limiter = Limiter(
            key_func=get_remote_address,
            storage_uri=settings.REDIS_URL,
            strategy="fixed-window"
        )
    else:
        limiter = Limiter(
            key_func=get_remote_address,
            strategy="fixed-window"
        )
except Exception as e:
    logger.warning(f"Redis not available for rate limiting, using in-memory storage: {e}")
    limiter = Limiter(
        key_func=get_remote_address,
        strategy="fixed-window"
    )


def get_api_key_identifier(request: Request) -> str:
    """
    Extract API key from request for user-specific rate limiting
    Falls back to IP address if no API key
    """
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        api_key = auth_header.replace("Bearer ", "")
        # Use first 16 chars of API key as identifier
        return f"key:{api_key[:16]}"

    # Fallback to IP address
    return get_remote_address(request)


# Create user-specific limiter
user_limiter = Limiter(
    key_func=get_api_key_identifier,
    strategy="fixed-window"
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Custom rate limiting middleware with better error messages
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except RateLimitExceeded as e:
            from fastapi.responses import JSONResponse

            # Extract retry-after from exception if available
            retry_after = getattr(e, 'retry_after', 60)

            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": retry_after,
                    "limit": str(e),
                    "message": "You have sent too many requests. Please wait before trying again."
                },
                headers={"Retry-After": str(retry_after)}
            )


# Rate limit configurations for different plan tiers
RATE_LIMITS = {
    "free_trial": {
        "requests_per_minute": 10,
        "requests_per_hour": 100,
        "requests_per_day": 500
    },
    "starter": {
        "requests_per_minute": 30,
        "requests_per_hour": 500,
        "requests_per_day": 2000
    },
    "pro": {
        "requests_per_minute": 60,
        "requests_per_hour": 2000,
        "requests_per_day": 10000
    },
    "team": {
        "requests_per_minute": 120,
        "requests_per_hour": 5000,
        "requests_per_day": 50000
    }
}


def get_user_rate_limit(plan: str = "free_trial") -> str:
    """
    Get rate limit string for a given plan
    Returns: slowapi limit string (e.g., "10/minute;100/hour;500/day")
    """
    config = RATE_LIMITS.get(plan, RATE_LIMITS["free_trial"])
    return f"{config['requests_per_minute']}/minute;{config['requests_per_hour']}/hour;{config['requests_per_day']}/day"


# Export limiter instances
__all__ = ["limiter", "user_limiter", "get_user_rate_limit", "RateLimitMiddleware"]
