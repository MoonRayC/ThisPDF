"""
MinIO client initialization and configuration
"""
from minio import Minio
from minio.error import S3Error
import logging
from app.config.config import Config
import json

logger = logging.getLogger(__name__)

def get_minio_client():
    """Initialize and return MinIO client"""
    try:
        client = Minio(
            Config.MINIO_ENDPOINT,
            access_key=Config.MINIO_ACCESS_KEY,
            secret_key=Config.MINIO_SECRET_KEY,
            secure=Config.MINIO_SECURE
        )

        ensure_bucket_exists(client)
        setup_public_access(client)

        return client
    except Exception as e:
        logger.error(f"Failed to initialize MinIO client: {e}")
        raise

def ensure_bucket_exists(client):
    """Ensure the required bucket exists"""
    try:
        bucket_name = Config.MINIO_BUCKET
        
        if not client.bucket_exists(bucket_name):
            logger.info(f"Creating bucket: {bucket_name}")
            client.make_bucket(bucket_name)
            logger.info(f"Bucket {bucket_name} created")
            
    except S3Error as e:
        logger.error(f"Error managing bucket: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error managing bucket: {e}")
        raise

def setup_public_access(client):
    """Configure public access policy for the bucket"""
    try:
        bucket_name = Config.MINIO_BUCKET
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [
                        f"arn:aws:s3:::{bucket_name}/public/*",
                        f"arn:aws:s3:::{bucket_name}/previews/*" 
                    ]
                }
            ]
        }
        
        client.set_bucket_policy(bucket_name, json.dumps(policy))
        logger.info(f"Public access policy set for {bucket_name}")
        
    except S3Error as e:
        logger.error(f"Error setting bucket policy: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error setting policy: {e}")
        raise


minio_client = get_minio_client()
