import os
from app import create_app
from app.config.config import Config
from app.client.minio_client import get_minio_client
from app.services.virus_scanner import scanner

app = create_app()

def check_clamav_ready():
    """Check if ClamAV scanner is available"""
    if scanner.cd is not None:
        print("✅ Connected to ClamAV Socket")
    else:
        print("❌ ClamAV not available (scanner disabled)")

def check_minio_ready():
    """Check if MinIO bucket exists"""
    try:
        client = get_minio_client()
        if client.bucket_exists(Config.MINIO_BUCKET):
            print(f"✅ Connected to Minio Bucket: {Config.MINIO_BUCKET}")
        else:
            print(f"❌ Bucket '{Config.MINIO_BUCKET}' does not exist.")
    except Exception as e:
        print(f"❌ Failed to connect to MinIO: {e}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3003))
    debug = os.getenv('FLASK_ENV') == 'development'
    environment = os.getenv('FLASK_ENV', 'production')

    # Start checks
    print("\n🔍 Running startup checks...\n")
    check_clamav_ready()
    check_minio_ready()

    print(f"\n🚀 Upload Microservice running on port {port}")
    print(f"📋 Environment: {environment}")
    print(f"📊 Health check: http://localhost:{port}/health")
    print(f"📝 API Documentation: http://localhost:{port}/api-docs\n")
    print("✅ Service ready to serve!\n")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
