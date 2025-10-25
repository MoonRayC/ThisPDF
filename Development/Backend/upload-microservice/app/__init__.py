import os
from flask import Flask, Response
from flasgger import Swagger
from app.config.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    port = int(os.getenv('PORT', 3003))
    environment = os.getenv('FLASK_ENV', 'production')

    # Run startup diagnostics
    from app.services.virus_scanner import scanner
    from app.client.minio_client import get_minio_client

    print("\n🔍 Running startup checks...\n")

    # ClamAV check
    if scanner.cd is not None:
        print("✅ Connected to ClamAV Socket")
    else:
        print("❌ ClamAV not available (scanner disabled)")

    # MinIO check
    try:
        client = get_minio_client()
        if client.bucket_exists(Config.MINIO_BUCKET):
            print(f"✅ Connected to Minio Bucket: {Config.MINIO_BUCKET}")
        else:
            print(f"❌ Bucket '{Config.MINIO_BUCKET}' does not exist.")
    except Exception as e:
        print(f"❌ Failed to connect to MinIO: {e}")

    print(f"\n🚀 Upload Microservice running on port {port}")
    print(f"📋 Environment: {environment}")
    print(f"📊 Health check: http://localhost:{port}/health")
    print(f"📝 API Documentation: http://localhost:{port}/api-docs\n")
    print("✅ Service ready to serve!\n")

    # Root endpoint with ASCII banner
    @app.route('/')
    def root():
        ascii_banner = """
  ==================================================
     ________  ______  _________    __   __   
    |__  ___ \/ ____ \/ _____/ /_  /_/__/ /_______
      / /__/ / /   / / /    / __ \__ /_  __/ ____/
     / ___  / /___/ / /____/ /_/ / /  / / (___  )
    /_/  /_/_______/______/_____/_/  /_/ /_____/
                    O N L I N E
  ==================================================
        """
        return Response(ascii_banner, mimetype='text/plain')

    SWAGGER_CONFIG = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api-docs/", 
        "swagger_version": None,
        "title": "Upload Microservice API"
    }

    SWAGGER_TEMPLATE = {
        "openapi": "3.0.0",
        "info": {
            "title": "Upload Microservice API",
            "description": "Handles PDF uploads, virus scanning, metadata, and MinIO storage",
            "version": "1.0.0",
        },
        "servers": [
            {
                "url": "http://localhost:3003"
            }
        ],
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "JWT Authorization header using the Bearer scheme. Example: `Bearer {token}`"
                }
            }
        },
        "security": [
            {
                "bearerAuth": []
            }
        ]
    }

    Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)

    from app.routes.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'upload-microservice'}, 200

    @app.route('/')
    def home():
        return {
            'message': '📁 Upload Microservice is running!',
            'docs': '/api-docs',
            'health': '/health'
        }

    return app
