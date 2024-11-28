import React, { useState, useEffect } from 'react'; // Import React, useState, and useEffect hooks
import { List, ListItem, ListItemText, Box, Typography, Button, Pagination } from '@mui/material'; // Import Material-UI components
import AxiosInstance from './axios'; // Import the AxiosInstance for making API requests

const DocumentDownloadComponent = () => {
  // State to hold the list of documents, total pages, loading state, and current page
  const [documents, setDocuments] = useState([]);
  const [totalPages, setTotalPages] = useState(1); // Total number of pages (for pagination)
  const [loading, setLoading] = useState(false); // Loading state to show a loading message
  const [page, setPage] = useState(1); // State to keep track of the current page for pagination

  // Fetch documents whenever the page changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true); // Set loading state to true when fetching data
      try {
        // Fetch documents from the backend API, passing the current page as a query parameter
        const response = await AxiosInstance.get('documents/', {
          params: { page: page }, // Send the page number as a parameter to the backend
        });

        // Set the documents state with the results from the response
        setDocuments(response.data.results || []);
        // Calculate the total number of pages based on the document count (assumes 10 items per page)
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (error) {
        // Handle any errors during the API request
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false); // Set loading state to false once the request is complete
      }
    };

    fetchDocuments(); // Call the fetchDocuments function to fetch the data
  }, [page]); // Re-fetch documents whenever the page changes

  // Function to download a document by its ID
  const downloadDocument = async (documentId, documentName) => {
    try {
      // Make a GET request to download the document, expecting a binary file (blob)
      const response = await AxiosInstance.get(`download/${documentId}/`, {
        responseType: 'blob', // Set the response type to 'blob' to handle binary data
      });

      // Create a URL for the binary data (Blob) returned from the API
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); // Create a temporary link element to trigger the download
      link.href = url;
      link.setAttribute('download', `${documentName || 'Document'}.pdf`); // Set the download file name
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Trigger a click event to start the download
      link.remove(); // Remove the link element after the download is triggered
    } catch (error) {
      // Handle any errors that occur during the document download
      console.error('Error downloading document:', error);
    }
  };

  return (
    <Box>
      {/* Container for the title and loading state */}
      <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Download Documents
        </Typography>
        {loading && <Typography>Loading...</Typography>} {/* Show loading text when documents are being fetched */}
      </Box>

      {/* List of documents with download buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        {documents.length > 0 ? (
          <List>
            {/* Map over documents and render them in a list */}
            {documents.map((doc) => (
              <ListItem
                key={doc.document_id} // Use document ID as the key for each list item
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between', // Space between document name and download button
                  alignItems: 'center', // Align items in the center
                  marginRight: '170px', // Add some margin to the right for alignment
                }}
              >
                <ListItemText primary={doc.document_name || 'Unnamed Document'} /> {/* Display the document name */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => downloadDocument(doc.document_id, doc.document_name)} // Trigger download on click
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

      {/* Pagination component to navigate through document pages */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages} // Total number of pages
          page={page} // Current page number
          onChange={(e, value) => setPage(value)} // Update the page state when the user changes pages
          color="primary" // Set pagination color to primary (blue)
        />
      </Box>
    </Box>
  );
};

export default DocumentDownloadComponent;
