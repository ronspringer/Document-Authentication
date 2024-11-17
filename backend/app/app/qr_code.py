import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PyPDF2 import PdfWriter, PdfReader
from io import BytesIO

def generate_qr_code(url, filename="verification_qr.png"):
    qr = qrcode.make(url)
    qr.save(filename)
    return filename

def embed_qr_code_and_link(pdf_path, verification_url, output_pdf):
    qr_filename = generate_qr_code(verification_url)

    # Create a PDF overlay for QR code and text link, now positioned to the left
    packet = BytesIO()
    c = canvas.Canvas(packet, pagesize=letter)

    # Move QR code and link to the left
    qr_x = 10  # Move to the left (adjust X position for left side)
    qr_y = 50  # Y position stays the same for bottom placement

    # Draw QR code and text link
    c.drawImage(qr_filename, qr_x, qr_y, width=50, height=50)  # Smaller QR code
    c.drawString(qr_x, qr_y - 15, "Verify document:")  # Text above the link
    c.drawString(qr_x, qr_y - 30, verification_url)  # Text link in smaller font

    c.save()

    # Merge overlay on each page of the original PDF
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    original_pdf = PdfReader(pdf_path)
    writer = PdfWriter()

    # Add original pages except the last
    for i, page in enumerate(original_pdf.pages):
        if i == len(original_pdf.pages) - 1:
            # Apply overlay to the last page
            page.merge_page(overlay_pdf.pages[0])
        writer.add_page(page)

    # Write the modified PDF to output
    with open(output_pdf, "wb") as f_out:
        writer.write(f_out)
