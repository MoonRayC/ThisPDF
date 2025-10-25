"""
Upload controller handling business logic
"""
import logging
from typing import Dict, Tuple, Optional
from werkzeug.utils import secure_filename

from app.services.virus_scanner import scan_uploaded_file
from app.services.metadata_extractor import extract_pdf_info
from app.services.storage import upload_file_to_storage, storage_service
from app.config.config import Config
from app.services.preview_generator import generate_and_upload_preview
from app.client.minio_client import minio_client
from minio.error import S3Error

logger = logging.getLogger(__name__)


class UploadController:
    """Handle upload business logic"""
    
    def __init__(self):
        pass
    
    def process_upload(self, file_buffer: bytes, filename: str, 
                      validated_data: Dict, user_id: str) -> Tuple[bool, Optional[str], Optional[Dict]]:
        """
        Process the complete upload workflow
        
        Args:
            file_buffer: File content as bytes
            filename: Original filename
            validated_data: Validated form data
            user_id: User ID from authentication
            
        Returns:
            (success, error_message, response_data)
        """
        try:
            # Step 1: Virus scanning
            logger.info(f"Scanning file {filename} for viruses")
            scan_result = scan_uploaded_file(file_buffer)
            
            if not scan_result['clean']:
                logger.warning(f"Virus detected in uploaded file: {scan_result['result']}")
                return False, f"File rejected - virus detected: {scan_result['result']}", None
            
            # Step 2: Extract PDF metadata
            logger.info(f"Extracting metadata from {filename}")
            pdf_metadata = extract_pdf_info(file_buffer)
            
            # Step 3: Upload to storage
            logger.info(f"Uploading {filename} to storage ({validated_data['visibility']})")
            upload_result = upload_file_to_storage(
                file_buffer,
                visibility=validated_data['visibility'],
                filename=secure_filename(filename)
            )
            
            if not upload_result['success']:
                logger.error(f"Failed to upload file: {upload_result.get('error')}")
                return False, f"Failed to upload file: {upload_result.get('error')}", None
            
            preview_url = None

            try:
                logger.info(f"Generating preview for file_id {upload_result['file_id']}")
                preview_result = generate_and_upload_preview(
                    file_buffer=file_buffer,
                    file_id=upload_result['file_id']
                )
                preview_url = preview_result.get("preview_url")
            except Exception as e:
                logger.warning(f"Failed to generate preview image: {e}")
            
            # Step 4: Prepare response data
            response_data = self._build_response_data(
                upload_result, pdf_metadata, validated_data, user_id, preview_url
            )
            
            logger.info(f"File uploaded successfully: {upload_result['file_id']} by user {user_id}")
            return True, None, response_data
            
        except Exception as e:
            logger.error(f"Unexpected error in upload processing: {e}")
            return False, f"Internal server error: {str(e)}", None
    
    def _build_response_data(self, upload_result: Dict, pdf_metadata: Dict, 
                           validated_data: Dict, user_id: str, preview_url: Optional[str]) -> Dict:
        """Build response data structure"""
        response_metadata = {
            'title': pdf_metadata['title'],
            'pages': pdf_metadata['pages'],
            'size_kb': pdf_metadata['size_kb'],
            'visibility': validated_data['visibility'],
            'category': validated_data['category'],
            'subcategory': validated_data['subcategory'],
            'tags': validated_data['tags'],
            'uploader_id': user_id,
            'author': pdf_metadata.get('author', ''),
            'subject': pdf_metadata.get('subject', ''),
            'creator': pdf_metadata.get('creator', '')
        }
        
        return {
            'message': 'Upload successful',
            'pdf_id': upload_result['file_id'],
            'file_url': upload_result.get('file_url'),
            'image_url': preview_url,
            'metadata': response_metadata
        }
    
    def delete_file(self, file_id: str, user_id: str) -> Tuple[bool, Optional[str]]:
        """
        Delete a file by ID
        
        Args:
            file_id: File identifier
            user_id: User ID (for authorization - not implemented yet)
            
        Returns:
            (success, error_message)
        """
        try:
            deleted = False
            for visibility in ['public', 'private']:
                if storage_service.delete_file(file_id, visibility):
                    deleted = True
                    break
            
            if deleted:
                logger.info(f"File {file_id} deleted successfully by user {user_id}")
                return True, None
            else:
                return False, "File not found or could not be deleted"
                
        except Exception as e:
            logger.error(f"Error deleting file {file_id}: {e}")
            return False, f"Failed to delete file: {str(e)}"
    
    def get_file_url(self, file_id: str, visibility: str = 'private', expires_in: int = 3600):
        try:
            url = None
            if visibility == 'public':
                protocol = 'https' if Config.MINIO_SECURE else 'http'
                url = f"{protocol}://{Config.PUBLIC_MINIO_HOST}/{Config.MINIO_BUCKET}/public/{file_id}.pdf"
                try:
                    storage_service.client.stat_object(Config.MINIO_BUCKET, f"public/{file_id}.pdf")
                except S3Error:
                    return False, 'File not found', None

                return True, None, {
                    'file_url': url,
                    'expires_in': None,
                    'visibility': 'public'
                }

            else:
                url = storage_service.get_presigned_url(file_id, visibility, expires_in)
                if not url:
                    return False, 'Could not generate secure URL', None

                return True, None, {
                    'file_url': url,
                    'expires_in': expires_in,
                    'visibility': 'private'
                }

        except Exception as e:
            logger.error(f"Error getting URL for {file_id}: {e}")
            return False, str(e), None
        

    def get_preview_url(self, file_id: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate public URL for preview image if it exists.

        Args:
            file_id: The ID of the PDF file

        Returns:
            Tuple: (success, error_message, preview_url)
        """
        try:
            preview_key = f"{Config.PREVIEW_FOLDER}/{file_id}.jpg"
            protocol = 'https' if Config.MINIO_SECURE else 'http'
            url = f"{protocol}://{Config.PUBLIC_MINIO_HOST}/{Config.MINIO_BUCKET}/{preview_key}"

            # ✅ Use the same client that uploaded the preview
            minio_client.stat_object(Config.MINIO_BUCKET, preview_key)

            return True, None, url
        except S3Error:
            return False, "Preview image not found", None
        except Exception as e:
            logger.error(f"Error getting preview URL for {file_id}: {e}")
            return False, "Internal server error", None