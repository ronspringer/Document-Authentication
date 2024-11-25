from django.contrib.auth.models import User
import json
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.http import require_http_methods
from .models import Document
from .digital_signature import verify_signature, sign_document
from .qr_code import embed_qr_code_and_link
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BasicAuthentication
from rest_framework.response import Response
from rest_framework.decorators import api_view
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from django.contrib.auth import authenticate, login
import uuid
from django.urls import reverse
import hashlib
from django.shortcuts import render
from PIL import Image
import pytesseract
from io import BytesIO
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
from .utils import extract_text_from_pdf
from rest_framework.pagination import PageNumberPagination

def create_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        email = data.get("email", "")
        username = data.get("username", "")
        password = data.get("password", "")

        # Validation
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists."}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists."}, status=400)

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        return JsonResponse({"message": "User created successfully."}, status=201)
    return JsonResponse({"error": "Invalid request method."}, status=405)


@require_http_methods(["GET"])
def list_users(request):
    users = User.objects.values("id", "first_name", "last_name", "email", "username")
    return JsonResponse(list(users), safe=False)


@require_http_methods(["PUT"])
def update_user(request, user_id):
    try:
        data = json.loads(request.body)
        user = User.objects.get(pk=user_id)

        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.username = data.get("username", user.username)
        password = data.get("password")

        if password:
            user.set_password(password)

        user.save()
        return JsonResponse({"message": "User updated successfully."})
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    

def validate_uploaded_file(uploaded_file, allowed_extensions=None):
    """
    Validate the uploaded file type and size.
    """
    allowed_extensions = allowed_extensions or ['pdf', 'png', 'jpg', 'jpeg']
    if not uploaded_file.name.lower().endswith(tuple(allowed_extensions)):
        raise ValueError(f"Unsupported file type. Allowed extensions: {allowed_extensions}")

    if uploaded_file.size == 0:
        raise ValueError("Uploaded file is empty.")

    return True


def extract_text_from_image(image_file):
    """
    Extract text from an image file using OCR.
    """
    image = Image.open(BytesIO(image_file.read()))
    return pytesseract.image_to_string(image)

def perform_ocr_verification(uploaded_file, stored_text_content):
    """
    Perform OCR verification for an uploaded file against stored content.
    """
    validate_uploaded_file(uploaded_file, allowed_extensions=['pdf', 'png', 'jpg', 'jpeg'])
    if uploaded_file.name.lower().endswith(('png', 'jpg', 'jpeg')):
        extracted_text = extract_text_from_image(uploaded_file)
    elif uploaded_file.name.lower().endswith('pdf'):
        extracted_text = extract_text_from_pdf(uploaded_file)
    else:
        raise ValueError("Unsupported file format for OCR verification.")
    
    # Compare the extracted text with the stored text content
    return extracted_text.strip() == stored_text_content.strip()


# Updated verify_document view
def verify_document(request):
    if request.method == "POST":
        try:
            document_id = request.POST.get("id")
            uploaded_file = request.FILES.get("document")
            use_ocr = request.POST.get("use_ocr", "false").lower() == "true"

            if not document_id or not uploaded_file:
                return JsonResponse({"error": "Document ID and file are required."}, status=400)

            document = get_object_or_404(Document, document_id=document_id)
            validate_uploaded_file(uploaded_file)

            if use_ocr:
                extracted_text = perform_ocr_verification(uploaded_file, document.text_content)
                if extracted_text:
                    return JsonResponse({"verified": True, "message": "OCR Verification: Document content matches."})
                else:
                    return JsonResponse({"verified": False, "message": "OCR Verification: Document content does not match."})
            else:
                uploaded_content = uploaded_file.read()
                public_key = load_pem_public_key(document.public_key, backend=default_backend())
                is_verified = verify_signature(uploaded_content, document.signature, public_key)

                if is_verified:
                    return JsonResponse({"verified": True, "message": "Document is authentic and untampered!"})
                else:
                    return JsonResponse({"verified": False, "message": "Document signature verification failed."})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "GET":
        try:
            # Get document ID from query parameters
            document_id = request.GET.get("id")

            # Retrieve the document or return 404 if not found
            document = get_object_or_404(Document, document_id=document_id)

            # Load the public key from the document
            public_key = load_pem_public_key(document.public_key, backend=default_backend())

            # Recompute the document's current content hash (after QR embedding)
            with open(document.pdf_file.path, "rb") as pdf_file:
                current_content = pdf_file.read()

            # Verify the document's signature
            is_verified = verify_signature(current_content, document.signature, public_key)
            verification_status = "Authentic and Untampered" if is_verified else "Document Verification Failed"

            # Render the template with verification status
            return render(
                request,
                "verify_document.html",
                {"document_id": document.document_id, "status": verification_status},
            )

        except Document.DoesNotExist:
            # Render an error message if the document doesn't exist
            return render(request, "verify_document.html", {"error": "Document not found."})
        except Exception as e:
            # Catch any other exceptions and render a generic error message
            return render(request, "verify_document.html", {"error": f"Document Verification Failed"})

    return JsonResponse({"error": "Invalid request method."}, status=400)

# Document signing view
# Document signing view
@api_view(['POST'])
def create_signed_document(request):
    if request.method == "POST":
        uploaded_file = request.FILES.get("document")
        document_name = request.data.get("document_name")

        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        try:
            # Read the file content for hashing and signing
            document_content = uploaded_file.read()
            
            if len(document_content) == 0:
                return JsonResponse({"error": "Uploaded file is empty"}, status=400)

            # Reset file pointer after reading for text extraction
            uploaded_file.seek(0)

            # Extract text if it's a PDF (optional step for OCR verification)
            extracted_text = ""
            if uploaded_file.name.lower().endswith(".pdf"):
                try:
                    extracted_text = extract_text_from_pdf(uploaded_file)
                except Exception as e:
                    raise ValueError(f"Error extracting text from PDF: {str(e)}")

            # Compute SHA-256 hash of the document content
            document_hash = hashlib.sha256(document_content).hexdigest()

            # Generate a private key for signing
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )

            # Sign the document content
            signature = sign_document(document_content, private_key)

            # Generate a unique document ID
            document_id = str(uuid.uuid4())

            # Save the document in the database
            document = Document.objects.create(
                document_id=document_id,
                document_name=document_name,
                content=document_content,
                hash=document_hash,  # Save the hash
                signature=signature,
                public_key=private_key.public_key().public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ),
                pdf_file=uploaded_file,
                text_content=extracted_text  # Save the extracted text for later OCR verification
            )

            # Generate a verification URL with a QR code
            verification_url = f"http://localhost:8000/verify?id={document.document_id}"
            document_path = document.pdf_file.path

            # Embed QR code and verification link in the document PDF
            embed_qr_code_and_link(document_path, verification_url, document_path)

            # After embedding the QR code, sign the document again, ensuring it's signed and tamper-proof
            # Re-read the document to apply the signature with QR embedded
            with open(document_path, 'rb') as signed_file:
                signed_document_content = signed_file.read()
                
            signature_after_qr = sign_document(signed_document_content, private_key)
            
            # Update the document with the new signature after QR embedding
            document.signature = signature_after_qr
            document.save()  # Save the updated signature

            return JsonResponse({"message": "Document signed, QR code embedded, and saved successfully!", "document_id": document_id})

        except ValueError as ve:
            return JsonResponse({"error": f"Error processing the PDF: {str(ve)}"}, status=400)

        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)


# Document download view
@api_view(['GET'])
def download_document(request, document_id):
    # Retrieve the document by its ID
    document = get_object_or_404(Document, id=document_id)
    
    # Get the document name from the document instance
    document_name = document.document_name  # Assuming `document_name` is a field in your model
    
    # Return the document as an attachment with the document name as the filename
    return FileResponse(document.pdf_file, as_attachment=True, filename=f"{document_name}.pdf")


class DocumentPagination(PageNumberPagination):
    page_size = 10  # Number of documents per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
def list_documents(request):
    documents = Document.objects.all()
    paginator = DocumentPagination()
    result_page = paginator.paginate_queryset(documents, request)
    
    document_list = [
        {
            "document_id": doc.id,
            "document_name": doc.document_name,
            "download_url": request.build_absolute_uri(reverse('download_document', args=[doc.id])),
        }
        for doc in result_page
    ]
    return paginator.get_paginated_response(document_list)


# Login view
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request'}, status=400)
