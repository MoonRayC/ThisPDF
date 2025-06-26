"""
Virus scanning service using ClamAV
"""
import clamd
import logging
import platform
from app.config.config import Config

logger = logging.getLogger(__name__)

class VirusScanner:
    """ClamAV virus scanner wrapper"""

    def __init__(self):
        """Initialize ClamAV connection"""
        try:
            if platform.system() != "Windows" and Config.CLAMAV_SOCKET:
                self.cd = clamd.ClamdUnixSocket(Config.CLAMAV_SOCKET)
            else:
                self.cd = clamd.ClamdNetworkSocket(
                    host=Config.CLAMAV_HOST or "localhost",
                    port=int(Config.CLAMAV_PORT or 3310)
                )
            self.cd.ping()
            logger.info("ClamAV connection established")
        except Exception as e:
            logger.error(f"Failed to connect to ClamAV: {e}")
            self.cd = None

    def scan_file(self, file_path):
        """Scan a file for viruses"""
        if not self.cd:
            logger.warning("ClamAV not available, skipping virus scan")
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
            logger.error(f"Error scanning file {file_path}: {e}")
            return {'clean': False, 'result': f'Scan error: {str(e)}'}

    def scan_buffer(self, file_buffer):
        """Scan file content from buffer"""
        if not self.cd:
            logger.warning("ClamAV not available, skipping virus scan")
            return {'clean': True, 'result': 'ClamAV not available - scan skipped'}

        try:
            scan_result = self.cd.instream(file_buffer)
            if scan_result['stream'][0] == 'OK':
                return {'clean': True, 'result': 'File is clean'}
            else:
                virus_info = scan_result['stream'][1]
                return {'clean': False, 'result': f'Virus detected: {virus_info}'}
        except Exception as e:
            logger.error(f"Error scanning buffer: {e}")
            return {'clean': False, 'result': f'Scan error: {str(e)}'}

# Global instance
scanner = VirusScanner()

def scan_uploaded_file(file_buffer):
    """Convenience wrapper"""
    return scanner.scan_buffer(file_buffer)
