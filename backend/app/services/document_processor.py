import io
from typing import Tuple
from pypdf import PdfReader
from docx import Document
import pdfminer.high_level


class DocumentProcessor:
    """Extract text from PDF and DOCX files"""

    @staticmethod
    def extract_from_pdf(file_content: bytes) -> Tuple[str, int]:
        """
        Extract text from PDF
        Returns: (extracted_text, page_count)
        """
        try:
            # Try pypdf first (faster)
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            page_count = len(reader.pages)

            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)

            extracted_text = "\n\n".join(text_parts)

            # If pypdf fails to extract much text, try pdfminer
            if len(extracted_text.strip()) < 100:
                pdf_file.seek(0)
                extracted_text = pdfminer.high_level.extract_text(pdf_file)

            return extracted_text, page_count

        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def extract_from_docx(file_content: bytes) -> Tuple[str, int]:
        """
        Extract text from DOCX
        Returns: (extracted_text, estimated_page_count)
        """
        try:
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)

            text_parts = []
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)

            extracted_text = "\n\n".join(text_parts)

            # Estimate page count (assuming ~700-900 words per page)
            word_count = len(extracted_text.split())
            estimated_pages = max(1, word_count // 800)

            return extracted_text, estimated_pages

        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

    @staticmethod
    def process_file(file_content: bytes, file_type: str) -> Tuple[str, int, int]:
        """
        Process file and extract text
        Returns: (extracted_text, page_count, word_count)
        """
        if file_type == "pdf":
            text, pages = DocumentProcessor.extract_from_pdf(file_content)
        elif file_type in ["docx", "doc"]:
            text, pages = DocumentProcessor.extract_from_docx(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        word_count = len(text.split())

        return text, pages, word_count

    @staticmethod
    def chunk_text(text: str, max_chunk_size: int = 4000) -> list[str]:
        """
        Split text into chunks for AI processing
        Tries to split on paragraph boundaries
        """
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_size = 0

        for para in paragraphs:
            para_size = len(para)

            if current_size + para_size > max_chunk_size and current_chunk:
                # Save current chunk and start new one
                chunks.append("\n\n".join(current_chunk))
                current_chunk = [para]
                current_size = para_size
            else:
                current_chunk.append(para)
                current_size += para_size

        # Add remaining chunk
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))

        return chunks
