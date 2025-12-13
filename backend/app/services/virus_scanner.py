"""
Virus scanning service using ClamAV
"""
import logging
from typing import Tuple, Optional
from app.core.config import settings

# Try to import clamd, but don't fail if not available
try:
    import clamd
    CLAMD_AVAILABLE = True
except ImportError:
    CLAMD_AVAILABLE = False
    clamd = None

logger = logging.getLogger(__name__)


class VirusScanner:
    """Handle virus scanning for uploaded files using ClamAV"""

    def __init__(self):
        """Initialize ClamAV client connection"""
        self.enabled = settings.CLAMAV_ENABLED and CLAMD_AVAILABLE

        if not CLAMD_AVAILABLE:
            logger.warning("clamd library not installed - virus scanning disabled")
            self.scanner = None
            self.enabled = False
            return

        if self.enabled:
            try:
                # Connect to ClamAV daemon (supports both TCP and Unix socket)
                if settings.CLAMAV_USE_TCP:
                    self.scanner = clamd.ClamdNetworkSocket(
                        host=settings.CLAMAV_HOST,
                        port=settings.CLAMAV_PORT,
                        timeout=settings.CLAMAV_TIMEOUT
                    )
                else:
                    self.scanner = clamd.ClamdUnixSocket(
                        path=settings.CLAMAV_SOCKET_PATH,
                        timeout=settings.CLAMAV_TIMEOUT
                    )

                # Test connection
                self.scanner.ping()
                logger.info("ClamAV connection established successfully")
            except Exception as e:
                logger.error(f"Failed to connect to ClamAV: {str(e)}")
                logger.warning("ClamAV disabled due to connection failure - files will be allowed")
                self.enabled = False
                self.scanner = None
        else:
            logger.info("ClamAV virus scanning is disabled")
            self.scanner = None

    def scan_bytes(self, file_content: bytes, filename: str = "unknown") -> Tuple[bool, Optional[str]]:
        """
        Scan file content for viruses

        Args:
            file_content: File content as bytes
            filename: Name of the file (for logging)

        Returns:
            Tuple of (is_clean, virus_name)
            - is_clean: True if file is clean, False if infected
            - virus_name: Name of detected virus, or None if clean

        Raises:
            Exception: If scanning fails (in production mode)
        """
        if not self.enabled:
            # If ClamAV is disabled, allow the file (not recommended for production)
            logger.warning(f"Virus scanning disabled - allowing file: {filename}")
            return (True, None)

        try:
            # Scan the file content
            result = self.scanner.instream(file_content)

            # Parse result
            # Result format: {'stream': ('FOUND', 'virus-name')} or {'stream': ('OK', None)}
            status = result.get('stream')

            if status is None:
                logger.error(f"Invalid scan result for {filename}: {result}")
                raise Exception("Invalid virus scan result")

            scan_status, virus_name = status

            if scan_status == 'OK':
                logger.info(f"File scanned clean: {filename}")
                return (True, None)
            elif scan_status == 'FOUND':
                logger.warning(f"Virus detected in {filename}: {virus_name}")
                return (False, virus_name)
            elif scan_status == 'ERROR':
                logger.error(f"ClamAV scan error for {filename}: {virus_name}")
                raise Exception(f"Virus scan error: {virus_name}")
            else:
                logger.error(f"Unknown scan status for {filename}: {scan_status}")
                raise Exception(f"Unknown virus scan status: {scan_status}")

        except Exception as e:
            # Check if it's a ClamAV connection error (only if clamd is available)
            is_connection_error = CLAMD_AVAILABLE and clamd and isinstance(e, clamd.ConnectionError)

            if is_connection_error:
                logger.error(f"ClamAV connection error while scanning {filename}: {str(e)}")
            else:
                logger.error(f"Error scanning {filename}: {str(e)}")

            # In production, allow files through with warning if ClamAV unavailable
            # This prevents blocking uploads if ClamAV service has issues
            logger.warning(f"Allowing file {filename} due to scan error - virus scanning unavailable")
            return (True, None)

    def get_version(self) -> Optional[str]:
        """Get ClamAV version information"""
        if not self.enabled:
            return None
        try:
            return self.scanner.version()
        except Exception as e:
            logger.error(f"Failed to get ClamAV version: {str(e)}")
            return None

    def reload_database(self) -> bool:
        """Reload ClamAV virus database"""
        if not self.enabled:
            return False
        try:
            self.scanner.reload()
            logger.info("ClamAV database reloaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to reload ClamAV database: {str(e)}")
            return False

    def get_stats(self) -> Optional[dict]:
        """Get ClamAV statistics"""
        if not self.enabled:
            return None
        try:
            stats = self.scanner.stats()
            return {"stats": stats}
        except Exception as e:
            logger.error(f"Failed to get ClamAV stats: {str(e)}")
            return None


# Singleton instance
_virus_scanner = None


def get_virus_scanner() -> VirusScanner:
    """Get or create virus scanner instance"""
    global _virus_scanner
    if _virus_scanner is None:
        _virus_scanner = VirusScanner()
    return _virus_scanner
