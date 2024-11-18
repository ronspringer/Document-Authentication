import React, { useState } from 'react';
import { TextField, Button, FormControlLabel, Checkbox, Box, Typography, Alert } from '@mui/material';
import AxiosInstance from './axios';

const Verification = () => {
  const [docId, setDocId] = useState('');
  const [file, setFile] = useState(null);
  const [useOcr, setUseOcr] = useState(false); // State to control OCR option
  const [verificationResult, setVerificationResult] = useState(null);

  const onVerify = () => {
    if (!docId || !file) {
      setVerificationResult('Please provide both the Document ID and the file.');
      return;
    }

    const formData = new FormData();
    formData.append('id', docId); // Append the document ID
    formData.append('document', file); // Append the uploaded file
    formData.append('use_ocr', useOcr ? 'true' : 'false'); // Append the use_ocr flag

    AxiosInstance.post('verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    })
      .then((response) => {
        setVerificationResult(response.data.message);
      })
      .catch((error) => {
        setVerificationResult('Verification failed: ' + (error.response?.data?.error || error.message));
      });
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Document Verification
      </Typography>

      <TextField
        label="Document ID"
        fullWidth
        variant="outlined"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Box mb={2}>
        <Button variant="contained" component="label">
          Select File
          <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
        </Button>
        {file && <Typography mt={1}>{file.name}</Typography>}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={useOcr}
            onChange={(e) => setUseOcr(e.target.checked)}
            color="primary"
          />
        }
        label="Use Optical Character Recognition (OCR) for Verification"
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={onVerify}
        sx={{ marginBottom: 2 }}
      >
        Verify Document
      </Button>

      {verificationResult && (
        <Alert
          severity={verificationResult.startsWith('Verification failed') ? 'error' : 'success'}
          sx={{ marginTop: 2 }}
        >
          {verificationResult}
        </Alert>
      )}
    </Box>
  );
};

export default Verification;
