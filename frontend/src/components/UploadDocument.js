import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import AxiosInstance from './axios';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('');
  };

  const onNameChange = (e) => {
    setDocumentName(e.target.value);
  };

  const onUpload = () => {
    if (!file || !documentName) {
      alert('Please provide both a file and a document name.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_name', documentName);

    AxiosInstance.post('create_signed_document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        setUploadStatus(response.data.message);
      })
      .catch((error) => {
        setUploadStatus('Error uploading document');
        console.error(error);
      });
  };

  return (
    <Box>
      <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload Document
      </Typography>
      <Box mb={2}>
        <TextField
          fullWidth
          label="Document Name"
          value={documentName}
          onChange={onNameChange}
          variant="outlined"
        />
      </Box>
      <Box mb={2}>
        <Button variant="contained" component="label">
          Select File
          <input type="file" hidden onChange={onFileChange} />
        </Button>
        {file && <Typography mt={1}>{file.name}</Typography>}
      </Box>
      <Button variant="contained" color="primary" fullWidth onClick={onUpload} sx={{ marginBottom: 2 }}>
        Upload Document
      </Button>

      {uploadStatus && (
        <Alert severity={uploadStatus.startsWith('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
          {uploadStatus}
        </Alert>
      )}
    </Box>
    </Box>
  );
};

export default UploadDocument;
