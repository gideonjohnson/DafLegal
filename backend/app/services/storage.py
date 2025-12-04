import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings
from typing import Optional
import io


class CloudinaryStorage:
    """Handle Cloudinary document storage"""

    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    def upload_file(self, file_content: bytes, s3_key: str, content_type: str) -> bool:
        """
        Upload file to Cloudinary
        Returns: True if successful
        """
        try:
            # Upload as raw file (not image transformation)
            result = cloudinary.uploader.upload(
                file_content,
                public_id=s3_key,
                resource_type="raw",  # For non-image files (PDFs, DOCX, etc.)
                overwrite=True
            )
            return True
        except Exception as e:
            raise ValueError(f"Cloudinary upload failed: {str(e)}")

    def download_file(self, s3_key: str) -> Optional[bytes]:
        """
        Download file from Cloudinary
        Returns: File content as bytes
        """
        try:
            import httpx
            # Get the URL for the raw file
            url = cloudinary.utils.cloudinary_url(s3_key, resource_type="raw")[0]

            # Download the file
            response = httpx.get(url)
            if response.status_code == 200:
                return response.content
            else:
                raise ValueError(f"Failed to download file: HTTP {response.status_code}")
        except Exception as e:
            raise ValueError(f"Cloudinary download failed: {str(e)}")

    def delete_file(self, s3_key: str) -> bool:
        """
        Delete file from Cloudinary
        Returns: True if successful
        """
        try:
            result = cloudinary.uploader.destroy(s3_key, resource_type="raw")
            return result.get("result") == "ok"
        except Exception as e:
            raise ValueError(f"Cloudinary deletion failed: {str(e)}")

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        """
        Generate signed URL for temporary access
        Returns: Signed URL string
        """
        try:
            # Generate a secure URL with expiration
            url = cloudinary.utils.cloudinary_url(
                s3_key,
                resource_type="raw",
                sign_url=True,
                type="authenticated"
            )[0]
            return url
        except Exception as e:
            raise ValueError(f"Cloudinary URL generation failed: {str(e)}")


# Alias for backward compatibility
S3Storage = CloudinaryStorage
