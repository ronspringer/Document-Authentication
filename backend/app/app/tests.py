import time
from django.test import TestCase, Client
from django.urls import reverse
from reportlab.pdfgen import canvas
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

class PerformanceTestCase(TestCase):
    # The setUp method is called before each test method is executed
    def setUp(self):
        # Initialize the test client and the URL for the document upload endpoint
        self.client = Client()
        self.upload_url = reverse('create_signed_document')

    # Helper method to generate a valid PDF document
    def generate_valid_pdf(self, filename, size_in_mb=25):
        buffer = BytesIO()  # Create an in-memory buffer to store the PDF data
        c = canvas.Canvas(buffer)  # Create a new PDF canvas
        # Generate a long string of 'A's to simulate content size
        text = "A" * (size_in_mb * 1024 * 1024)  # Create content of the desired size
        c.drawString(100, 750, text[:100])  # Write a portion of the text to the PDF
        c.showPage()  # Add a new page to the PDF
        c.save()  # Finalize the PDF creation
        buffer.seek(0)  # Rewind the buffer to the beginning
        return SimpleUploadedFile(filename, buffer.read(), content_type='application/pdf')
        # Return the generated PDF as an uploaded file (SimpleUploadedFile)

    # Test method to measure the performance of document upload
    def test_performance(self):
        # Generate a large sample PDF file to test performance
        large_document = self.generate_valid_pdf('large_sample.pdf')

        # Record the start time before making the request
        start_time = time.time()
        # Send the POST request to upload the document
        response = self.client.post(self.upload_url, {'document': large_document}, format='multipart')
        # Record the end time after receiving the response
        end_time = time.time()

        # Print the response status code and content for debugging purposes
        print(response.status_code, response.content.decode())  # Debugging step

        # Calculate the time it took to process the request
        processing_time = end_time - start_time

        # Assert that the response status code is 200 (success)
        self.assertEqual(response.status_code, 200, "Upload failed with response code not 200")
        # Assert that the processing time does not exceed 15 seconds
        self.assertLess(processing_time, 15, f"Processing time exceeded: {processing_time} seconds")
