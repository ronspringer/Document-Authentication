from PyPDF2 import PdfReader
from io import BytesIO
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

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
    

def preprocess_image(image):
    """
    Preprocess the image for better OCR results.
    - Convert to grayscale
    - Enhance contrast
    - Resize for better resolution
    """
    # Convert to grayscale (L mode)
    image = image.convert("L")
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)

    # Apply a filter to reduce noise
    image = image.filter(ImageFilter.MedianFilter())

    # Resize to double the size for better OCR accuracy
    image = image.resize((image.width * 2, image.height * 2), Image.LANCZOS)

    return image


def extract_text_from_image(image_file):
    """
    Extracts text from an uploaded image file using Tesseract OCR.
    """
    try:
        # Open the image file
        image = Image.open(BytesIO(image_file.read()))
        
        # Preprocess the image
        # image = preprocess_image(image)

        # Perform OCR using Tesseract
        extracted_text = pytesseract.image_to_string(image, lang="eng")
        
        if not extracted_text.strip():
            raise ValueError("No text could be extracted from the image.")
        
        return extracted_text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from image: {str(e)}")
