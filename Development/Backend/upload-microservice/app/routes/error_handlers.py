"""
Error handlers for upload routes
"""
from flask import jsonify, Blueprint
import logging

logger = logging.getLogger(__name__)


class UploadErrorHandler:
    """Handle upload-related errors"""
    
    @staticmethod
    def register_error_handlers(blueprint: Blueprint):
        """Register error handlers with the blueprint"""
        
        @blueprint.errorhandler(413)
        def file_too_large(error):
            """Handle file too large error"""
            logger.warning("File upload rejected: File too large")
            return jsonify({
                'error': 'File too large. Maximum size is 16MB.',
                'error_code': 'FILE_TOO_LARGE'
            }), 413
        
        @blueprint.errorhandler(400)
        def bad_request(error):
            """Handle bad request errors"""
            logger.warning(f"Bad request in upload: {error}")
            return jsonify({
                'error': 'Bad request',
                'error_code': 'BAD_REQUEST'
            }), 400
        
        @blueprint.errorhandler(415)
        def unsupported_media_type(error):
            """Handle unsupported media type errors"""
            logger.warning("Upload rejected: Unsupported media type")
            return jsonify({
                'error': 'Unsupported media type. Only PDF files are allowed.',
                'error_code': 'UNSUPPORTED_MEDIA_TYPE'
            }), 415
        
        @blueprint.errorhandler(500)
        def internal_server_error(error):
            """Handle internal server errors"""
            logger.error(f"Internal server error in upload: {error}")
            return jsonify({
                'error': 'Internal server error',
                'error_code': 'INTERNAL_SERVER_ERROR'
            }), 500
    
    @staticmethod
    def create_error_response(message: str, status_code: int = 400, 
                            error_code: str = None, details: str = None) -> tuple:
        """
        Create standardized error response
        
        Args:
            message: Error message
            status_code: HTTP status code
            error_code: Application-specific error code
            details: Additional error details
            
        Returns:
            (response, status_code) tuple
        """
        error_response = {
            'error': message
        }
        
        if error_code:
            error_response['error_code'] = error_code
        
        if details:
            error_response['details'] = details
        
        return jsonify(error_response), status_code
    
    @staticmethod
    def handle_validation_error(error_message: str) -> tuple:
        """Handle validation errors"""
        return UploadErrorHandler.create_error_response(
            error_message, 400, 'VALIDATION_ERROR'
        )
    
    @staticmethod
    def handle_file_error(error_message: str, status_code: int = 400) -> tuple:
        """Handle file-related errors"""
        return UploadErrorHandler.create_error_response(
            error_message, status_code, 'FILE_ERROR'
        )
    
    @staticmethod
    def handle_processing_error(error_message: str, details: str = None) -> tuple:
        """Handle processing errors"""
        return UploadErrorHandler.create_error_response(
            error_message, 500, 'PROCESSING_ERROR', details
        )
    
    @staticmethod
    def handle_storage_error(error_message: str, details: str = None) -> tuple:
        """Handle storage-related errors"""
        return UploadErrorHandler.create_error_response(
            error_message, 500, 'STORAGE_ERROR', details
        )
    
    @staticmethod
    def handle_virus_detection_error(scan_result: str) -> tuple:
        """Handle virus detection errors"""
        return UploadErrorHandler.create_error_response(
            'File rejected - virus detected',
            400,
            'VIRUS_DETECTED',
            scan_result
        )
    
    @staticmethod
    def handle_auth_error(error_message: str = "Authentication required") -> tuple:
        """Handle authentication errors"""
        return UploadErrorHandler.create_error_response(
            error_message, 401, 'AUTH_ERROR'
        )
    
    @staticmethod
    def handle_not_found_error(resource: str = "Resource") -> tuple:
        """Handle not found errors"""
        return UploadErrorHandler.create_error_response(
            f'{resource} not found', 404, 'NOT_FOUND'
        )
    
    @staticmethod
    def handle_preview_error(message="Preview not available"):
        """Handle preview not found errors"""
        return UploadErrorHandler.create_error_response(
            message, 404, 'PREVIEW_NOT_FOUND'
        )
    


# Custom exception classes for better error handling
class UploadError(Exception):
    """Base exception for upload-related errors"""
    def __init__(self, message: str, error_code: str = None, status_code: int = 400):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(UploadError):
    """Exception for validation errors"""
    def __init__(self, message: str):
        super().__init__(message, 'VALIDATION_ERROR', 400)


class FileError(UploadError):
    """Exception for file-related errors"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message, 'FILE_ERROR', status_code)


class ProcessingError(UploadError):
    """Exception for processing errors"""
    def __init__(self, message: str, details: str = None):
        self.details = details
        super().__init__(message, 'PROCESSING_ERROR', 500)


class StorageError(UploadError):
    """Exception for storage errors"""
    def __init__(self, message: str, details: str = None):
        self.details = details
        super().__init__(message, 'STORAGE_ERROR', 500)


class VirusDetectionError(UploadError):
    """Exception for virus detection"""
    def __init__(self, scan_result: str):
        self.scan_result = scan_result
        super().__init__('File rejected - virus detected', 'VIRUS_DETECTED', 400)