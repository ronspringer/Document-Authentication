import time
from django.test import TestCase, Client
from django.urls import reverse
from reportlab.pdfgen import canvas
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

class PerformanceTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.upload_url = reverse('create_signed_document')

    def generate_valid_pdf(self, filename, size_in_mb=25):
        buffer = BytesIO()
        c = canvas.Canvas(buffer)
        text = "A" * (size_in_mb * 1024 * 1024)
        c.drawString(100, 750, text[:100])
        c.showPage()
        c.save()
        buffer.seek(0)
        return SimpleUploadedFile(filename, buffer.read(), content_type='application/pdf')

    def test_performance(self):
        large_document = self.generate_valid_pdf('large_sample.pdf')

        start_time = time.time()
        response = self.client.post(self.upload_url, {'document': large_document}, format='multipart')
        end_time = time.time()

        print(response.status_code, response.content.decode())  # Debugging step

        processing_time = end_time - start_time

        self.assertEqual(response.status_code, 200, "Upload failed with response code not 200")
        self.assertLess(processing_time, 15, f"Processing time exceeded: {processing_time} seconds")
