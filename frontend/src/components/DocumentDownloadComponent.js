import React, { useState, useEffect } from 'react';
import AxiosInstance from './axios';

function DocumentDownloadComponent() {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        // Fetch list of documents from the backend API
        async function fetchDocuments() {
            try {
                const response = await AxiosInstance.get('documents/'); // Adjust the URL if needed
                setDocuments(response.data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
        fetchDocuments();
    }, []);

    // Download document function
    const downloadDocument = async (documentId, documentName) => {
        try {
            const response = await AxiosInstance.get(`download/${documentId}/`, {
                responseType: 'blob'  // Important for binary data
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${documentName}.pdf`); // Use documentName for the filename
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    return (
        <div>
            <h1>Available Documents</h1>
            <ul>
                {documents.map((doc) => (
                    <li key={doc.document_id}>
                        {doc.document_name || "Unnamed Document"}  {/* Display document name */}
                        <button onClick={() => downloadDocument(doc.document_id, doc.document_name)}>
                            Download
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DocumentDownloadComponent;
