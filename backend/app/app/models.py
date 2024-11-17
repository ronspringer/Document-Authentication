from django.db import models
import hashlib
from .utils import extract_text_from_pdf  # Import from utils

class Document(models.Model):
    # Existing fields
    document_id = models.CharField(max_length=255, unique=True)
    document_name = models.CharField(max_length=255, blank=True, null=True)
    content = models.BinaryField()  # Store document content (binary)
    text_content = models.TextField(blank=True, null=True)  # Store extracted text content for OCR verification
    hash = models.CharField(max_length=64, blank=True, null=True)  # Store SHA-256 hash of content
    signature = models.BinaryField()  # Digital signature
    public_key = models.BinaryField()  # Public key for verification
    pdf_file = models.FileField(upload_to='documents/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.content:
            self.hash = hashlib.sha256(self.content).hexdigest()

        # Save the model to store the file first
        super().save(*args, **kwargs)

        # Now that the file is saved, extract text if it's a PDF
        if self.pdf_file:
            try:
                extracted_text = ""
                with open(self.pdf_file.path, 'rb') as pdf_file:
                    extracted_text = extract_text_from_pdf(pdf_file)

                # Store the extracted text in the database
                self.text_content = extracted_text
                super().save(update_fields=["text_content"])  # Update only the extracted text
            except Exception as e:
                raise ValueError(f"Error extracting text from PDF: {str(e)}")

    def __str__(self):
        return self.document_name if self.document_name else self.document_id
