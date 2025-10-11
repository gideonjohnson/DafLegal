import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import Optional


class S3Storage:
    """Handle S3 document storage"""

    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def upload_file(self, file_content: bytes, s3_key: str, content_type: str) -> bool:
        """
        Upload file to S3
        Returns: True if successful
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type,
                ServerSideEncryption="AES256"  # Encrypt at rest
            )
            return True
        except ClientError as e:
            raise ValueError(f"S3 upload failed: {str(e)}")

    def download_file(self, s3_key: str) -> Optional[bytes]:
        """
        Download file from S3
        Returns: File content as bytes
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return response["Body"].read()
        except ClientError as e:
            raise ValueError(f"S3 download failed: {str(e)}")

    def delete_file(self, s3_key: str) -> bool:
        """
        Delete file from S3
        Returns: True if successful
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError as e:
            raise ValueError(f"S3 deletion failed: {str(e)}")

    def generate_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        """
        Generate presigned URL for temporary access
        Returns: Presigned URL string
        """
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": s3_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise ValueError(f"Presigned URL generation failed: {str(e)}")
