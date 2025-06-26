"""
Configuration loader for Upload Microservice
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration class"""

    # Flask settings
    SECRET_KEY = os.getenv('JWT_SECRET', 'dev-secret-key')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/uploads')

    # Auth microservice
    AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:3001')
    JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret')

    # ClamAV configuration
    CLAMAV_SOCKET = os.getenv('CLAMAV_SOCKET', None)  # Unix only
    CLAMAV_HOST = os.getenv('CLAMAV_HOST', 'localhost')  # TCP fallback
    CLAMAV_PORT = int(os.getenv('CLAMAV_PORT', 3310))

    # MinIO configuration
    MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
    MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
    MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
    MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'pdf-upload-service')
    MINIO_SECURE = os.getenv('MINIO_SECURE', 'false').lower() == 'true'

    # File validation
    ALLOWED_EXTENSIONS = {'pdf'}
