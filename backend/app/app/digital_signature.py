from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes

def sign_document(document_content, private_key):
    # Ensure document_content is in bytes
    if isinstance(document_content, str):
        document_content = document_content.encode()  # Encode only if it’s a string

    # Hash the document content
    document_hash = hashes.Hash(hashes.SHA256())
    document_hash.update(document_content)
    digest = document_hash.finalize()

    # Sign the hashed document content
    signature = private_key.sign(
        digest,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return signature

def verify_signature(document_content, signature, public_key):
    # Ensure document_content is in bytes
    if isinstance(document_content, str):
        document_content = document_content.encode()

    # Hash the document content
    document_hash = hashes.Hash(hashes.SHA256())
    document_hash.update(document_content)
    digest = document_hash.finalize()

    try:
        # Verify the document signature using the public key
        public_key.verify(
            signature,
            digest,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception as e:
        print("Verification failed:", e)
        return False