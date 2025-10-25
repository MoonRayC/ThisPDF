from pdf2image import convert_from_bytes
from io import BytesIO
from app.client.minio_client import minio_client
from app.config.config import Config
import logging

logger = logging.getLogger(__name__)

def generate_and_upload_preview(file_buffer: bytes, file_id: str):
    """
    Generate first page preview from a PDF file and upload to MinIO

    Args:
        file_buffer (bytes): The content of the PDF file
        file_id (str): The unique file ID for naming the preview
        visibility (str): Either 'public' or 'private'
    """
    try:
        logger.info(f"Generating preview image for file ID: {file_id}")
        
        images = convert_from_bytes(file_buffer, dpi=Config.PREVIEW_DPI, first_page=1, last_page=1, fmt=Config.PREVIEW_FORMAT.lower())
        
        if not images:
            raise Exception("No page found in PDF for preview")

        img_buffer = BytesIO()
        images[0].save(img_buffer, Config.PREVIEW_FORMAT)
        img_buffer.seek(0)

        object_path = f"{Config.PREVIEW_FOLDER}/{file_id}.jpg"

        minio_client.put_object(
            bucket_name=Config.MINIO_BUCKET,
            object_name=object_path,
            data=img_buffer,
            length=img_buffer.getbuffer().nbytes,
            content_type='image/jpeg'
        )

        logger.info(f"Uploaded preview to MinIO: {object_path}")

        protocol = 'https' if Config.MINIO_SECURE else 'http'
        url = f"{protocol}://{Config.PUBLIC_MINIO_HOST}/{Config.MINIO_BUCKET}/{object_path}"
        return {
            "success": True,
            "preview_url": url,
        }

    except Exception as e:
        logger.error(f"Failed to generate/upload preview image: {e}")
        raise
