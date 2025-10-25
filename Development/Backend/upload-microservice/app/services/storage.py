"""
File storage service using MinIO
"""
import uuid
from io import BytesIO
import logging
from urllib.parse import urlparse, urlunparse
from minio.error import S3Error
from minio import Minio
from app.client.minio_client import get_minio_client
from app.config.config import Config
import datetime

logger = logging.getLogger(__name__)

class StorageService:
    """MinIO storage service for PDF files"""
    
    def __init__(self):
        self.client = get_minio_client()
        self.bucket_name = Config.MINIO_BUCKET

    def _get_object_path(self, file_id: str, visibility: str) -> str:
        """Helper to build object path within bucket"""
        return f"{visibility}/{file_id}.pdf"

    def upload_pdf(self, file_buffer, visibility='public', filename=None):
        """
        Upload PDF file to MinIO storage
        """
        try:
            file_id = str(uuid.uuid4())
            object_path = self._get_object_path(file_id, visibility)

            file_stream = BytesIO(file_buffer)
            file_size = len(file_buffer)

            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_path,
                data=file_stream,
                length=file_size,
                content_type='application/pdf',
                metadata={
                    'original_filename': filename or 'unknown.pdf',
                    'visibility': visibility,
                    'file_id': file_id
                }
            )

            file_url = None
            if visibility == 'public':
                protocol = 'https' if Config.MINIO_SECURE else 'http'
                public_endpoint = Config.PUBLIC_MINIO_HOST
                file_url = f"{protocol}://{public_endpoint}/{self.bucket_name}/{object_path}"

            logger.info(f"File uploaded successfully: {file_id} ({visibility})")
            return {
                'success': True,
                'file_id': file_id,
                'file_url': file_url,
                'object_path': object_path,
                'size_bytes': file_size
            }

        except S3Error as e:
            logger.error(f"MinIO error uploading file: {e}")
            return {'success': False, 'error': f'Storage error: {str(e)}'}
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {e}")
            return {'success': False, 'error': f'Upload error: {str(e)}'}

    def delete_file(self, file_id, visibility='public'):
        """
        Delete file from storage
        """
        try:
            object_path = self._get_object_path(file_id, visibility)
            self.client.remove_object(self.bucket_name, object_path)
            logger.info(f"File deleted successfully: {file_id}")
            return True
        except S3Error as e:
            logger.error(f"Error deleting file {file_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting file {file_id}: {e}")
            return False

    def get_presigned_url(self, file_id, visibility='private', expires_in=3600):

        object_path = f"{visibility}/{file_id}.pdf"

        try:
            self.client.stat_object(self.bucket_name, object_path)
        except S3Error:
            logger.error(f"File not found: {object_path}")
            return None

        try:
            public_client = Minio(
            endpoint=Config.PUBLIC_MINIO_HOST,
            access_key=Config.MINIO_ACCESS_KEY,
            secret_key=Config.MINIO_SECRET_KEY,
            secure=False
)

            url = public_client.presigned_get_object(
            self.bucket_name,
            object_path,
            expires=datetime.timedelta(seconds=expires_in)
            )
            return url

        except S3Error as e:
            logger.error(f"Error generating presigned URL for {file_id}: {e}")
            return None     

        except Exception as e:
            logger.error(f"Error generating presigned URL for {file_id}: {e}")
            return None


storage_service = StorageService()

def upload_file_to_storage(file_buffer, visibility='public', filename=None):
    return storage_service.upload_pdf(file_buffer, visibility, filename)
