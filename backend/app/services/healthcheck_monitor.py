"""
Healthchecks.io Integration
Sends periodic pings to monitor service uptime
"""
import httpx
import asyncio
from datetime import datetime
from typing import Optional
from app.core.config import settings


class HealthcheckMonitor:
    """Monitor service for healthchecks.io"""

    def __init__(self, check_url: Optional[str] = None):
        """
        Initialize healthcheck monitor

        Args:
            check_url: Your healthchecks.io ping URL
                      Format: https://hc-ping.com/YOUR-UUID-HERE
                      Get this from https://healthchecks.io after creating a check
        """
        self.check_url = check_url or getattr(settings, 'HEALTHCHECK_URL', None)
        self.enabled = bool(self.check_url)

    async def ping_success(self, message: str = ""):
        """
        Ping healthchecks.io to signal service is healthy

        Args:
            message: Optional message to include with ping
        """
        if not self.enabled:
            return

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = self.check_url
                if message:
                    url = f"{url}/{message}"
                await client.get(url)
        except Exception as e:
            # Don't let healthcheck failures crash the app
            print(f"Healthcheck ping failed: {e}")

    async def ping_fail(self, message: str = ""):
        """
        Ping healthchecks.io to signal service failure

        Args:
            message: Error message describing the failure
        """
        if not self.enabled:
            return

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = f"{self.check_url}/fail"
                if message:
                    url = f"{url}/{message}"
                await client.get(url)
        except Exception as e:
            print(f"Healthcheck fail ping error: {e}")

    async def ping_start(self):
        """Signal that a job/task has started"""
        if not self.enabled:
            return

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.get(f"{self.check_url}/start")
        except Exception as e:
            print(f"Healthcheck start ping failed: {e}")


# Global instance
healthcheck = HealthcheckMonitor()
