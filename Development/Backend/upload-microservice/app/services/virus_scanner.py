"""
Virus scanning service using ClamAV (TCP only)
"""
import clamd
import logging
import time
import io
from app.config.config import Config

logger = logging.getLogger(__name__)

class VirusScanner:
    """ClamAV virus scanner wrapper using TCP only"""

    def __init__(self, retries=30, delay=2):
        self.cd = None
        for attempt in range(1, retries + 1):
            try:
                self.cd = clamd.ClamdNetworkSocket(
                    host=Config.CLAMAV_HOST,
                    port=Config.CLAMAV_PORT
                )
                self.cd.ping()
                logger.info("✅ ClamAV connection established")
                break
            except Exception as e:
                logger.warning(f"⏳ Attempt {attempt}/{retries} - Failed to connect to ClamAV: {e}")
                time.sleep(delay)
        else:
            logger.warning("❌ ClamAV connection failed after retries, continuing without it")
            self.cd = None

    def scan_file(self, file_path):
        """Scan a file for viruses"""
        if not self.cd:
            logger.warning("⚠️ ClamAV not available, skipping virus scan")
            return {'clean': True, 'result': 'ClamAV not available - scan skipped'}

        try:
            scan_result = self.cd.scan(file_path)
            if scan_result is None:
                return {'clean': True, 'result': 'File is clean'}
            else:
                file_name = list(scan_result.keys())[0]
                virus_info = scan_result[file_name]
                return {'clean': False, 'result': f'Virus detected: {virus_info[1]}'}
        except Exception as e:
            logger.error(f"❌ Error scanning file {file_path}: {e}")
            return {'clean': False, 'result': f'Scan error: {str(e)}'}

    def scan_buffer(self, file_buffer):
        """Scan file content from buffer"""
        if not self.cd:
            logger.warning("⚠️ ClamAV not available, skipping virus scan")
            return {'clean': True, 'result': 'ClamAV not available - scan skipped'}

        try:
            scan_result = self.cd.instream(io.BytesIO(file_buffer))
            if scan_result['stream'][0] == 'OK':
                return {'clean': True, 'result': 'File is clean'}
            else:
                virus_info = scan_result['stream'][1]
                return {'clean': False, 'result': f'Virus detected: {virus_info}'}
        except Exception as e:
            logger.error(f"❌ Error scanning buffer: {e}")
            return {'clean': False, 'result': f'Scan error: {str(e)}'}

# Global instance
scanner = VirusScanner(
    retries=int(getattr(Config, "CLAMAV_RETRIES", 30)),
    delay=int(getattr(Config, "CLAMAV_RETRY_DELAY", 2))
)

def scan_uploaded_file(file_buffer):
    """Convenience wrapper"""
    return scanner.scan_buffer(file_buffer)
