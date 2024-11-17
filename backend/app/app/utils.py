from PyPDF2 import PdfReader
from io import BytesIO

def extract_text_from_pdf(file):
    try:
        # Read the binary content of the file
        pdf_file = file.read()

        # Attempt to read the PDF with PyPDF2
        pdf_reader = PdfReader(BytesIO(pdf_file))
        if len(pdf_reader.pages) == 0:
            raise ValueError("The PDF file is empty.")

        # Extract text from each page of the PDF
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() or ""

        if not extracted_text:
            raise ValueError("No text could be extracted from the PDF.")
        
        return extracted_text
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
