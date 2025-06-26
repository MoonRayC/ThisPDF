"""
PDF metadata extraction service
"""
import PyPDF2
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class MetadataExtractor:
    """PDF metadata extraction utilities"""
    
    @staticmethod
    def extract_pdf_metadata(file_buffer):
        """
        Extract metadata from PDF file buffer
        
        Args:
            file_buffer (bytes): PDF file content as bytes
            
        Returns:
            dict: Extracted metadata including title, pages, size_kb
        """
        try:
            # Create BytesIO object from buffer
            pdf_stream = BytesIO(file_buffer)
            
            # Read PDF
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            # Extract basic info
            num_pages = len(pdf_reader.pages)
            size_kb = len(file_buffer) // 1024
            
            # Extract title from metadata
            title = "Untitled Document"
            if pdf_reader.metadata:
                # Try different title fields
                title_candidates = [
                    pdf_reader.metadata.get('/Title'),
                    pdf_reader.metadata.get('/Subject'),
                    pdf_reader.metadata.get('/Author')
                ]
                
                for candidate in title_candidates:
                    if candidate and candidate.strip():
                        title = candidate.strip()
                        break
            
            # If no title found, try to extract from first page text
            if title == "Untitled Document" and num_pages > 0:
                try:
                    first_page = pdf_reader.pages[0]
                    text = first_page.extract_text()
                    
                    # Get first non-empty line as potential title
                    lines = [line.strip() for line in text.split('\n') if line.strip()]
                    if lines:
                        # Use first line if it's not too long
                        potential_title = lines[0]
                        if len(potential_title) <= 100:
                            title = potential_title
                except Exception as e:
                    logger.warning(f"Could not extract text for title: {e}")
            
            metadata = {
                'title': title,
                'pages': num_pages,
                'size_kb': size_kb,
                'author': pdf_reader.metadata.get('/Author', '') if pdf_reader.metadata else '',
                'subject': pdf_reader.metadata.get('/Subject', '') if pdf_reader.metadata else '',
                'creator': pdf_reader.metadata.get('/Creator', '') if pdf_reader.metadata else ''
            }
            
            logger.info(f"Extracted metadata: {num_pages} pages, {size_kb}KB, title: '{title}'")
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {e}")
            # Return basic metadata with file size
            return {
                'title': 'Untitled Document',
                'pages': 0,
                'size_kb': len(file_buffer) // 1024,
                'author': '',
                'subject': '',
                'creator': ''
            }

def extract_pdf_info(file_buffer):
    """
    Convenience function to extract PDF metadata
    
    Args:
        file_buffer (bytes): PDF file content as bytes
        
    Returns:
        dict: Extracted metadata
    """
    extractor = MetadataExtractor()
    return extractor.extract_pdf_metadata(file_buffer)