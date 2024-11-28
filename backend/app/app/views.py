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
from rest_framework.decorators import api_view, permission_classes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from django.contrib.auth import authenticate, login
import uuid
from django.urls import reverse
import hashlib
from django.shortcuts import render
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
from .utils import extract_text_from_pdf, extract_text_from_image
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.decorators import login_required

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Create a new user
def create_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        email = data.get("email", "")
        username = data.get("username", "")
        password = data.get("password", "")

        # Validation checks for username and email uniqueness
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists."}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists."}, status=400)

        # Create user using the data
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        return JsonResponse({"message": "User created successfully."}, status=201)
    return JsonResponse({"error": "Invalid request method."}, status=405)



# List all users with basic details
@require_http_methods(["GET"])
def list_users(request):
    # Retrieves users with only relevant fields: ID, name, email, and username
    users = User.objects.values("id", "first_name", "last_name", "email", "username")
    return JsonResponse(list(users), safe=False)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    try:
        data = json.loads(request.body)
        user = User.objects.get(pk=user_id)

        # Update user attributes with the new data from request
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
    

# Helper function to validate uploaded files
def validate_uploaded_file(uploaded_file, allowed_extensions=None):
    """
    Validate the uploaded file type and size.
    """
    allowed_extensions = allowed_extensions or ['pdf', 'png', 'jpg', 'jpeg']
    # Check file type based on extension
    if not uploaded_file.name.lower().endswith(tuple(allowed_extensions)):
        raise ValueError(f"Unsupported file type. Allowed extensions: {allowed_extensions}")

    # Check if the file is empty
    if uploaded_file.size == 0:
        raise ValueError("Uploaded file is empty.")

    return True


# Perform OCR verification of document
def perform_ocr_verification(uploaded_file, stored_text_content):
    """
    Perform OCR verification for an uploaded file against stored content.
    """
    validate_uploaded_file(uploaded_file, allowed_extensions=['pdf', 'png', 'jpg', 'jpeg'])
    
    # Depending on file type, use OCR to extract text
    if uploaded_file.name.lower().endswith(('png', 'jpg', 'jpeg')):
        extracted_text = extract_text_from_image(uploaded_file)
    elif uploaded_file.name.lower().endswith('pdf'):
        extracted_text = extract_text_from_pdf(uploaded_file)
    else:
        raise ValueError("Unsupported file format for OCR verification.")
    
    # Compare the extracted text with stored content for verification
    return extracted_text.strip() == stored_text_content.strip()


# Document verification view
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
            document_id = request.GET.get("id")

            # Retrieve document for verification
            document = get_object_or_404(Document, document_id=document_id)

            public_key = load_pem_public_key(document.public_key, backend=default_backend())
            # Recompute content hash for verification
            with open(document.pdf_file.path, "rb") as pdf_file:
                current_content = pdf_file.read()

            is_verified = verify_signature(current_content, document.signature, public_key)
            verification_status = "Authentic and Untampered" if is_verified else "Document Verification Failed"

            return render(
                request,
                "verify_document.html",
                {"document_id": document.document_id, "status": verification_status},
            )

        except Document.DoesNotExist:
            return render(request, "verify_document.html", {"error": "Document not found."})
        except Exception as e:
            return render(request, "verify_document.html", {"error": f"Document Verification Failed"})

    return JsonResponse({"error": "Invalid request method."}, status=400)


# Document signing view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def download_document(request, document_id):
    # Retrieve the document by its ID
    document = get_object_or_404(Document, id=document_id)
    
    # Get the document name from the document instance
    document_name = document.document_name
    
    # Return the document as an attachment with the document name as the filename
    return FileResponse(document.pdf_file, as_attachment=True, filename=f"{document_name}.pdf")


class DocumentPagination(PageNumberPagination):
    page_size = 10  # Number of documents per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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


@api_view(['POST'])
def login_view(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')

    # Authenticate the user
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return JsonResponse({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': str(refresh)
        })

    return JsonResponse({'error': 'Invalid credentials'}, status=401)

# User info view - protected route
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return JsonResponse({
        'username': user.username,
        'is_superuser': user.is_superuser,
        'email': user.email,
    })


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)

class RefreshTokenView(TokenRefreshView):
    permission_classes = (AllowAny,)