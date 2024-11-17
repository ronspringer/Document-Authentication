import React, { useState } from 'react';
import AxiosInstance from './axios';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');  // State for document name
  const [uploadStatus, setUploadStatus] = useState(''); // For feedback messages

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus(''); // Clear any previous upload status message
  };

  const onNameChange = (e) => {
    setDocumentName(e.target.value);  // Update document name state
  };

  const onUpload = () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    if (!documentName) {
      alert("Please enter a document name.");
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_name', documentName);  // Append the document name to the form data

    AxiosInstance.post('create_signed_document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        setUploadStatus(response.data.message); // Show success message
      })
      .catch((error) => {
        setUploadStatus('Error uploading document'); // Show error message
        console.error(error);
      });
  };

  return (
    <div>
      <div>
        <label>Document Name:</label>
        <input 
          type="text" 
          value={documentName} 
          onChange={onNameChange} 
          placeholder="Enter document name" 
        />
      </div>
      <div>
        <label>Upload Document:</label>
        <input type="file" onChange={onFileChange} />
      </div>
      <button onClick={onUpload}>Upload Document</button>
      {uploadStatus && <p>{uploadStatus}</p>} {/* Display upload status */}
    </div>
  );
};

export default UploadDocument;
