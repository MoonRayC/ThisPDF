"""
Authentication utilities for validating JWT tokens and getting user info
"""
import requests
import logging
from flask import request
from app.config.config import Config

logger = logging.getLogger(__name__)

def get_user_from_token():
    """
    Validate JWT token and return user UUID
    Returns user UUID if valid, None if invalid
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            logger.warning("No Authorization header provided")
            return None
        
        # Extract token (format: "Bearer <token>")
        if not auth_header.startswith('Bearer '):
            logger.warning("Invalid Authorization header format")
            return None
        
        token = auth_header[7:]  # Remove "Bearer " prefix
        
        # Call auth microservice to validate token
        auth_url = f"{Config.AUTH_SERVICE_URL}/api/user"
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.get(auth_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            user_data = response.json()
            user_id = user_data.get('id')
            logger.info(f"Token validated for user: {user_id}")
            return user_id
        else:
            logger.warning(f"Token validation failed: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error contacting auth service: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in token validation: {e}")
        return None

def require_auth(f):
    """
    Decorator to require authentication for routes
    """
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_user_from_token()
        if user_id is None:
            return {'error': 'Invalid token'}, 401
        
        # Pass user_id to the route function
        return f(user_id=user_id, *args, **kwargs)
    
    return decorated_function