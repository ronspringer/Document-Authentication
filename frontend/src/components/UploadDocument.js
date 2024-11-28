import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material'; // Material-UI components for layout and styling
import AxiosInstance from './axios'; // Axios instance for making HTTP requests

const UploadDocument = () => {
  // State variables for managing the file, document name, and upload status
  const [file, setFile] = useState(null); // Holds the file to be uploaded
  const [documentName, setDocumentName] = useState(''); // Holds the name of the document
  const [uploadStatus, setUploadStatus] = useState(''); // Holds the status of the upload (success or error)

  // Function to handle file selection and update the file state
  const onFileChange = (e) => {
    setFile(e.target.files[0]); // Set the selected file
    setUploadStatus(''); // Reset the upload status each time a new file is selected
  };

  // Function to handle document name input change
  const onNameChange = (e) => {
    setDocumentName(e.target.value); // Set the document name as the user types
  };

  // Function to handle document upload
  const onUpload = () => {
    // Check if both file and document name are provided
    if (!file || !documentName) {
      alert('Please provide both a file and a document name.');
      return; // Return early if validation fails
    }

    // Create a FormData object to send the file and document name in the request body
    const formData = new FormData();
    formData.append('document', file); // Append the file
    formData.append('document_name', documentName); // Append the document name

    // Send POST request to upload the document to the server
    AxiosInstance.post('create_signed_document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set header for file upload
      },
    })
      .then((response) => {
        // If upload is successful, set the success message
        setUploadStatus(response.data.message);
      })
      .catch((error) => {
        // If there's an error during upload, set the error message
        setUploadStatus('Error uploading document');
        console.error(error); // Log the error for debugging
      });
  };

  return (
    <Box>
      {/* Container for the upload form */}
      <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Upload Document
        </Typography>

        {/* Input field for the document name */}
        <Box mb={2}>
          <TextField
            fullWidth
            label="Document Name"
            value={documentName}
            onChange={onNameChange} // Handle name input change
            variant="outlined"
          />
        </Box>

        {/* File selection button */}
        <Box mb={2}>
          <Button variant="contained" component="label">
            Select File
            <input type="file" hidden onChange={onFileChange} /> {/* Hidden file input */}
          </Button>
          {/* Show file name after selection */}
          {file && <Typography mt={1}>{file.name}</Typography>}
        </Box>

        {/* Button to trigger file upload */}
        <Button variant="contained" color="primary" fullWidth onClick={onUpload} sx={{ marginBottom: 2 }}>
          Upload Document
        </Button>

        {/* Display upload status message (success or error) */}
        {uploadStatus && (
          <Alert severity={uploadStatus.startsWith('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
            {uploadStatus} {/* Display the upload status message */}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default UploadDocument;
