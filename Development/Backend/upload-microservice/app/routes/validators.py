"""
Upload validation utilities
"""
import json
import os
import logging
from typing import Dict, List, Tuple, Optional

logger = logging.getLogger(__name__)


class CategoryValidator:
    """Handle category and subcategory validation"""
    
    def __init__(self):
        self.categories = self._load_categories()
    
    def _load_categories(self) -> Dict:
        """Load categories from JSON file"""
        try:
            categories_path = os.path.join(
                os.path.dirname(__file__), '..', '..', 'data', 'categories.json'
            )
            with open(categories_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading categories: {e}")
            return {}
    
    def get_categories(self) -> Dict:
        """Get all available categories"""
        return self.categories
    
    def validate_category_subcategory(self, category: str, subcategory: str) -> bool:
        """Validate category and subcategory combination"""
        if category not in self.categories:
            return False
        
        if subcategory not in self.categories[category]:
            return False
        
        return True


class FileValidator:
    """Handle file validation"""
    
    ALLOWED_EXTENSIONS = {'pdf'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB in bytes
    
    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        return ('.' in filename and 
                filename.rsplit('.', 1)[1].lower() in FileValidator.ALLOWED_EXTENSIONS)
    
    @staticmethod
    def validate_file_size(file_buffer: bytes) -> bool:
        """Validate file size"""
        return len(file_buffer) <= FileValidator.MAX_FILE_SIZE
    
    @staticmethod
    def validate_file_not_empty(file_buffer: bytes) -> bool:
        """Check if file is not empty"""
        return len(file_buffer) > 0


class FormValidator:
    """Handle form data validation"""
    
    VALID_VISIBILITY_OPTIONS = {'public', 'private'}
    
    @staticmethod
    def validate_required_fields(category: str, subcategory: str) -> Tuple[bool, Optional[str]]:
        """Validate required form fields"""
        if not category or not subcategory:
            return False, "Category and subcategory are required"
        return True, None
    
    @staticmethod
    def validate_visibility(visibility: str) -> Tuple[bool, Optional[str]]:
        """Validate visibility field"""
        if visibility not in FormValidator.VALID_VISIBILITY_OPTIONS:
            return False, 'Visibility must be "public" or "private"'
        return True, None
    
    @staticmethod
    def validate_and_parse_tags(tags_str: str) -> Tuple[bool, Optional[str], Optional[List[str]]]:
        """Parse and validate tags JSON"""
        try:
            tags = json.loads(tags_str)
            if not isinstance(tags, list):
                return False, "Tags must be a JSON array", None
            
            # Clean and validate tags
            cleaned_tags = [str(tag).strip() for tag in tags if str(tag).strip()]
            return True, None, cleaned_tags
            
        except json.JSONDecodeError:
            return False, "Invalid tags JSON format", None


class UploadValidator:
    """Main validator class that combines all validation logic"""
    
    def __init__(self):
        self.category_validator = CategoryValidator()
        self.file_validator = FileValidator()
        self.form_validator = FormValidator()
    
    def validate_upload_request(self, file, form_data: Dict) -> Tuple[bool, Optional[str], Optional[Dict]]:
        """
        Validate entire upload request
        
        Returns:
            (is_valid, error_message, validated_data)
        """
        # Check if file exists
        if not file or file.filename == '':
            return False, "No file selected", None
        
        # Validate file type
        if not self.file_validator.allowed_file(file.filename):
            return False, "Only PDF files are allowed", None
        
        # Get and validate form data
        category = form_data.get('category', '').strip()
        subcategory = form_data.get('subcategory', '').strip()
        tags_str = form_data.get('tags', '[]')
        visibility = form_data.get('visibility', 'public').strip().lower()
        
        # Validate required fields
        is_valid, error = self.form_validator.validate_required_fields(category, subcategory)
        if not is_valid:
            return False, error, None
        
        # Validate category and subcategory
        if not self.category_validator.validate_category_subcategory(category, subcategory):
            return False, "Invalid category or subcategory", None
        
        # Validate visibility
        is_valid, error = self.form_validator.validate_visibility(visibility)
        if not is_valid:
            return False, error, None
        
        # Parse and validate tags
        is_valid, error, tags = self.form_validator.validate_and_parse_tags(tags_str)
        if not is_valid:
            return False, error, None
        
        validated_data = {
            'category': category,
            'subcategory': subcategory,
            'tags': tags,
            'visibility': visibility
        }
        
        return True, None, validated_data
    
    def validate_file_content(self, file_buffer: bytes) -> Tuple[bool, Optional[str]]:
        """Validate file content"""
        if not self.file_validator.validate_file_not_empty(file_buffer):
            return False, "Empty file uploaded"
        
        if not self.file_validator.validate_file_size(file_buffer):
            return False, f"File too large. Maximum size is {self.file_validator.MAX_FILE_SIZE // (1024*1024)}MB"
        
        return True, None