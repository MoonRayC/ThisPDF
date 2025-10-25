"""
Upload routes for PDF file handling - Refactored and modularized
"""
from flask import Blueprint, request, jsonify
import logging

from app.utils.auth import require_auth
from app.routes.validators import UploadValidator
from app.routes.controller import UploadController
from app.routes.error_handlers import UploadErrorHandler

logger = logging.getLogger(__name__)

# Create blueprint
upload_bp = Blueprint('upload', __name__, url_prefix='/api')

# Initialize components
validator = UploadValidator()
controller = UploadController()
error_handler = UploadErrorHandler()

# Register error handlers
error_handler.register_error_handlers(upload_bp)


@upload_bp.route('/upload/categories', methods=['GET'])
def get_categories():
    """
    Get Categories and Subcategories
    ---
    tags:
      - Upload
    responses:
      200:
        description: List of available categories and subcategories
        schema:
          type: object
          example:
            Education: ["Mathematics", "Science"]
            Technology: ["AI", "Cloud"]
    """
    try:
        categories = validator.category_validator.get_categories()
        return jsonify(categories), 200
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return error_handler.handle_processing_error(
            "Failed to retrieve categories", str(e)
        )


@upload_bp.route('/upload', methods=['POST'])
@require_auth
def upload_pdf(user_id):
    """
    Upload PDF
    ---
    tags:
      - Upload
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required:
              - file
              - category
              - subcategory
              - visibility
            properties:
              file:
                type: string
                format: binary
              category:
                type: string
              subcategory:
                type: string
              tags:
                type: string
              visibility:
                type: string
                enum: [public, private]
    responses:
      201:
        description: Upload successful
      400:
        description: Validation error
      401:
        description: Unauthorized
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return error_handler.handle_validation_error('No file provided')
        
        file = request.files['file']
        
        # Validate upload request
        is_valid, error_message, validated_data = validator.validate_upload_request(
            file, request.form.to_dict()
        )
        
        if not is_valid:
            return error_handler.handle_validation_error(error_message)
        
        # Read file content
        file.seek(0)  # Reset file pointer
        file_buffer = file.read()
        
        # Validate file content
        is_valid, error_message = validator.validate_file_content(file_buffer)
        if not is_valid:
            return error_handler.handle_file_error(error_message)
        
        # Process upload
        success, error_message, response_data = controller.process_upload(
            file_buffer, file.filename, validated_data, user_id
        )
        
        if not success:
            if "virus detected" in error_message.lower():
                return error_handler.handle_virus_detection_error(error_message)
            elif "failed to upload" in error_message.lower():
                return error_handler.handle_storage_error(error_message)
            else:
                return error_handler.handle_processing_error(error_message)
        
        return jsonify(response_data), 201
        
    except Exception as e:
        logger.error(f"Unexpected error in upload endpoint: {e}")
        return error_handler.handle_processing_error(
            "Internal server error", str(e)
        )


@upload_bp.route('/upload/files/<file_id>', methods=['DELETE'])
@require_auth
def delete_pdf(user_id, file_id):
    """
    Delete PDF File
    ---
    tags:
      - Upload
    security:
      - bearerAuth: []
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: File deleted successfully
      404:
        description: File not found
      500:
        description: Server error
    """
    try:
        success, error_message = controller.delete_file(file_id, user_id)
        
        if success:
            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return error_handler.handle_not_found_error("File")
            
    except Exception as e:
        logger.error(f"Error in delete endpoint for file {file_id}: {e}")
        return error_handler.handle_processing_error(
            "Failed to delete file", str(e)
        )


@upload_bp.route('/upload/files/<file_id>/url', methods=['GET'])
@require_auth
def get_file_url(user_id, file_id):
    """
    Get PDF File URL (Private or Public)
    ---
    tags:
      - Upload
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: The ID of the PDF file
      - name: visibility
        in: query
        type: string
        enum: [public, private]
        default: private
        required: false
        description: Choose between public or private URL
      - name: expires
        in: query
        type: integer
        default: 3600
        required: false
        description: Expiration time in seconds for the URL (max 86400). Only applies to private links.
    security:
      - bearerAuth: []
    responses:
      200:
        description: File URL successfully generated
        examples:
          application/json: 
            file_url: "http://localhost:9000/pdf-upload-service/public/your-file-id.pdf"
            expires_in: null
            visibility: "public"
      400:
        description: Invalid visibility or expires value
      404:
        description: File not found or URL generation failed
      500:
        description: Internal server error
    """
    try:
        visibility = request.args.get('visibility', 'private')
        expires_param = request.args.get('expires', '3600')

        # Validate expires param
        try:
            expires_in = int(expires_param)
        except (ValueError, TypeError):
            return error_handler.handle_validation_error(
                'Invalid expires parameter. Must be a number.'
            )

        # Validate visibility
        if visibility not in ['public', 'private']:
            return error_handler.handle_validation_error(
                'Visibility must be "public" or "private"'
            )

        # Enforce max expiry window
        if expires_in <= 0 or expires_in > 86400:
            return error_handler.handle_validation_error(
                'Expires must be between 1 and 86400 seconds'
            )

        success, error_message, url_data = controller.get_file_url(
            file_id, visibility, expires_in
        )

        if success:
            return jsonify(url_data), 200
        else:
            return error_handler.handle_not_found_error("File URL")

    except Exception as e:
        logger.error(f"Error in get_file_url endpoint for file {file_id}: {e}")
        return error_handler.handle_processing_error(
            "Failed to get file URL", str(e)
        )

@upload_bp.route('/upload/preview/image/<file_id>', methods=['GET'])
def get_preview_image(file_id):
    """
    Get First Page Preview Image of a PDF
    ---
    tags:
      - Preview
    parameters:
      - name: file_id
        in: path
        type: string
        required: true
        description: The file ID of the uploaded PDF
    responses:
      200:
        description: Preview image URL generated
        examples:
          application/json:
            preview_url: "http://localhost:9000/pdf-upload-service/preview/<file_id>.jpg"
      404:
        description: Preview not found
    """
    try:
        success, error_message, url = controller.get_preview_url(file_id)

        if success:
            return jsonify({'preview_url': url}), 200
        else:
            return error_handler.handle_preview_error(error_message)

    except Exception as e:
        logger.error(f"Exception in preview route for {file_id}: {e}")
        return error_handler.handle_generic_error("Error retrieving preview")