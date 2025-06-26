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
            
            # Step 4: Prepare response data
            response_data = self._build_response_data(
                upload_result, pdf_metadata, validated_data, user_id
            )
            
            logger.info(f"File uploaded successfully: {upload_result['file_id']} by user {user_id}")
            return True, None, response_data
            
        except Exception as e:
            logger.error(f"Unexpected error in upload processing: {e}")
            return False, f"Internal server error: {str(e)}", None
    
    def _build_response_data(self, upload_result: Dict, pdf_metadata: Dict, 
                           validated_data: Dict, user_id: str) -> Dict:
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
            # TODO: In a real implementation, you would:
            # 1. Check if the file belongs to the user
            # 2. Delete from database
            # 3. Delete from storage
            
            # For now, just attempt to delete from storage
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
    
    def get_file_url(self, file_id: str, visibility: str = 'private', 
                    expires_in: int = 3600) -> Tuple[bool, Optional[str], Optional[Dict]]:
        """
        Get file URL (direct or presigned)
        
        Args:
            file_id: File identifier
            visibility: File visibility ('public' or 'private')
            expires_in: Expiration time for presigned URLs (seconds)
            
        Returns:
            (success, error_message, url_data)
        """
        try:
            if visibility == 'public':
                # Public files have direct URLs
                protocol = 'https' if Config.MINIO_SECURE else 'http'
                endpoint = Config.MINIO_ENDPOINT
                
                if endpoint.startswith('http://') or endpoint.startswith('https://'):
                    file_url = f"{endpoint}/{Config.MINIO_BUCKET}/public/{file_id}.pdf"
                else:
                    file_url = f"{protocol}://{endpoint}/{Config.MINIO_BUCKET}/public/{file_id}.pdf"
                
                url_data = {
                    'file_url': file_url,
                    'expires_in': None
                }
            else:
                # Generate presigned URL for private files
                file_url = storage_service.get_presigned_url(file_id, visibility, expires_in)
                
                if not file_url:
                    return False, "Could not generate presigned URL", None
                
                url_data = {
                    'file_url': file_url,
                    'expires_in': expires_in
                }
            
            return True, None, url_data
            
        except Exception as e:
            logger.error(f"Error getting URL for file {file_id}: {e}")
            return False, f"Failed to get file URL: {str(e)}", None