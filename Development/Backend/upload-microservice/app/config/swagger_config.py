swagger_template = {
    "swagger": "3.0",
    "info": {
        "title": "Upload Microservice API",
        "description": "Handles PDF uploads, virus scanning, metadata, and MinIO storage",
        "version": "1.0.0"
    },
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT token in the format: Bearer {your_token}"
        }
    },
    "security": [
        {"BearerAuth": []}
    ]
}
