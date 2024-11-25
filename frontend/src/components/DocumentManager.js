import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import UploadDocument from './UploadDocument';
import Verification from './Verification'; // Verify Document component
import DocumentDownloadComponent from './DocumentDownloadComponent';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const DocumentManager = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Document Authentication
      </Typography>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Upload Document" />
        <Tab label="Verify Document" />
        <Tab label="Download Documents" />
      </Tabs>

      {/* Upload Document Tab */}
      <TabPanel value={value} index={0}>
        <UploadDocument />
      </TabPanel>

      {/* Verify Document Tab */}
      <TabPanel value={value} index={1}>
        <Verification />
      </TabPanel>

      {/* Download Documents Tab */}
      <TabPanel value={value} index={2}>
        <DocumentDownloadComponent />
      </TabPanel>
    </Box>
  );
};

export default DocumentManager;
