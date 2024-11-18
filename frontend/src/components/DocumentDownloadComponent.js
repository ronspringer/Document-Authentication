import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Box, Typography, Button, Pagination } from '@mui/material';
import AxiosInstance from './axios';

const DocumentDownloadComponent = () => {
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);  // Total number of pages
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);  // Keep track of the current page

  // Fetch documents when page changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await AxiosInstance.get('documents/', {
          params: { page: page },  // Pass the current page to the backend
        });
        setDocuments(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 10));  // Calculate total pages based on count
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [page]);  // Re-fetch when the page changes

  // Download document function
  const downloadDocument = async (documentId, documentName) => {
    try {
      const response = await AxiosInstance.get(`download/${documentId}/`, {
        responseType: 'blob', // Important for binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentName || 'Document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
        {loading && <Typography>Loading...</Typography>}
        <Typography variant="h6" gutterBottom>
        Download Documents
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>

      {documents.length > 0 ? (
        <List>
          {documents.map((doc) => (
            <ListItem
              key={doc.document_id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginRight: '170px',
              }}
            >
              <ListItemText primary={doc.document_name || 'Unnamed Document'} />
              <Button
                variant="contained"
                color="primary"
                onClick={() => downloadDocument(doc.document_id, doc.document_name)}
              >
                Download
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="textSecondary">
          No documents available for download.
        </Typography>
      )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}  // Pass totalPages here
          page={page}
          onChange={(e, value) => setPage(value)} // Update the page state
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default DocumentDownloadComponent;
