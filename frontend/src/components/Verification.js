import React, { useState } from 'react';
import { TextField, Button, FormControlLabel, Checkbox, Box, Typography, Alert } from '@mui/material';
import AxiosInstance from './axios';  // Axios instance for making HTTP requests

const Verification = () => {
  // State variables to manage the form inputs and verification result
  const [docId, setDocId] = useState('');  // Document ID input field
  const [file, setFile] = useState(null);  // File to be uploaded
  const [useOcr, setUseOcr] = useState(false); // State to control whether OCR should be used
  const [verificationResult, setVerificationResult] = useState(null); // To store the result of the verification

  // Function to handle the verification process
  const onVerify = () => {
    // Check if Document ID and file are provided
    if (!docId || !file) {
      setVerificationResult('Please provide both the Document ID and the file.');
      return;
    }

    // Create a FormData object to send both file and form data to the server
    const formData = new FormData();
    formData.append('id', docId); // Add the Document ID to the formData
    formData.append('document', file); // Add the file to the formData
    formData.append('use_ocr', useOcr ? 'true' : 'false'); // Add the OCR option flag

    // Make a POST request to the backend to verify the document
    AxiosInstance.post('verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for sending file data
      },
    })
      .then((response) => {
        // On success, set the verification result to the message from the response
        setVerificationResult(response.data.message);
      })
      .catch((error) => {
        // On failure, set the error message in the verification result
        setVerificationResult('Verification failed: ' + (error.response?.data?.error || error.message));
      });
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Document Verification
      </Typography>

      {/* Input field for Document ID */}
      <TextField
        label="Document ID"
        fullWidth
        variant="outlined"
        value={docId}
        onChange={(e) => setDocId(e.target.value)} // Update docId state on change
        sx={{ marginBottom: 2 }}
      />

      {/* File upload button */}
      <Box mb={2}>
        <Button variant="contained" component="label">
          Select File
          <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} /> {/* File input */}
        </Button>
        {file && <Typography mt={1}>{file.name}</Typography>} {/* Show selected file name */}
      </Box>

      {/* Checkbox for enabling OCR option */}
      <FormControlLabel
        control={
          <Checkbox
            checked={useOcr}
            onChange={(e) => setUseOcr(e.target.checked)} // Update useOcr state on change
            color="primary"
          />
        }
        label="Use Optical Character Recognition (OCR) for Verification"
        sx={{ marginBottom: 2 }}
      />

      {/* Button to trigger the document verification */}
      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={onVerify} // Call the verification function on click
        sx={{ marginBottom: 2 }}
      >
        Verify Document
      </Button>

      {/* Display verification result as an alert */}
      {verificationResult && (
        <Alert
          severity={verificationResult.startsWith('Verification failed') ? 'error' : 'success'} // Determine alert severity based on result
          sx={{ marginTop: 2 }}
        >
          {verificationResult}
        </Alert>
      )}
    </Box>
  );
};

export default Verification;
