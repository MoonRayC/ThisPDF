"""
File storage service using MinIO
"""
import uuid
from io import BytesIO
import logging
from minio.error import S3Error
from app.client.minio_client import get_minio_client
from app.config.config import Config

logger = logging.getLogger(__name__)

class StorageService:
    """MinIO storage service for PDF files"""
    
    def __init__(self):
        """Initialize storage service"""
        self.client = get_minio_client()
        self.bucket_name = Config.MINIO_BUCKET
    
    def upload_pdf(self, file_buffer, visibility='public', filename=None):
        """
        Upload PDF file to MinIO storage
        
        Args:
            file_buffer (bytes): PDF file content
            visibility (str): 'public' or 'private'
            filename (str): Original filename (optional)
            
        Returns:
            dict: Upload result with file_id, file_url, and metadata
        """
        try:
            # Generate unique file ID
            file_id = str(uuid.uuid4())
            
            # Determine object path based on visibility
            if visibility == 'public':
                object_path = f"public/{file_id}.pdf"
            else:
                object_path = f"private/{file_id}.pdf"
            
            # Create BytesIO from buffer
            file_stream = BytesIO(file_buffer)
            file_size = len(file_buffer)
            
            # Upload file to MinIO
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
            
            # Generate file URL
            if visibility == 'public':
                # Public files can be accessed directly
                if Config.MINIO_SECURE:
                    protocol = 'https'
                else:
                    protocol = 'http'
                
                endpoint = Config.MINIO_ENDPOINT
                if endpoint.startswith('http://') or endpoint.startswith('https://'):
                    file_url = f"{endpoint}/{self.bucket_name}/{object_path}"
                else:
                    file_url = f"{protocol}://{endpoint}/{self.bucket_name}/{object_path}"
            else:
                # Private files need presigned URLs (not implemented in this basic version)
                file_url = None
            
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
            return {
                'success': False,
                'error': f'Storage error: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {e}")
            return {
                'success': False,
                'error': f'Upload error: {str(e)}'
            }
    
    def delete_file(self, file_id, visibility='public'):
        """
        Delete file from storage
        
        Args:
            file_id (str): File ID to delete
            visibility (str): 'public' or 'private'
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            if visibility == 'public':
                object_path = f"public/{file_id}.pdf"
            else:
                object_path = f"private/{file_id}.pdf"
            
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
        """
        Generate presigned URL for private files
        
        Args:
            file_id (str): File ID
            visibility (str): File visibility
            expires_in (int): URL expiration time in seconds
            
        Returns:
            str: Presigned URL or None if error
        """
        try:
            if visibility == 'public':
                object_path = f"public/{file_id}.pdf"
            else:
                object_path = f"private/{file_id}.pdf"
            
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_path,
                expires=expires_in
            )
            
            return url
            
        except Exception as e:
            logger.error(f"Error generating presigned URL for {file_id}: {e}")
            return None

# Global storage service instance
storage_service = StorageService()

def upload_file_to_storage(file_buffer, visibility='public', filename=None):
    """
    Convenience function to upload file to storage
    
    Args:
        file_buffer (bytes): File content
        visibility (str): 'public' or 'private'
        filename (str): Original filename
        
    Returns:
        dict: Upload result
    """
    return storage_service.upload_pdf(file_buffer, visibility, filename)