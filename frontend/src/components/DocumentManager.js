import React, { useState } from 'react'; // Import React and useState hook
import { Tabs, Tab, Box, Typography } from '@mui/material'; // Import Material-UI components
import UploadDocument from './UploadDocument'; // Import UploadDocument component
import Verification from './Verification'; // Import Verification component for document verification
import DocumentDownloadComponent from './DocumentDownloadComponent'; // Import DocumentDownloadComponent for document downloads

// TabPanel component to display content for each tab
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel" // Accessibility role
      hidden={value !== index} // Hide content if the tab is not selected
      id={`tabpanel-${index}`} // Unique ID for the panel
      aria-labelledby={`tab-${index}`} // Unique ID for the tab
      {...other}
    >
      {value === index && ( // Display content only when the tab is selected
        <Box p={3}>
          <Typography>{children}</Typography> {/* Render the children content passed to TabPanel */}
        </Box>
      )}
    </div>
  );
};

// DocumentManager component for handling document-related actions (Upload, Verify, Download)
const DocumentManager = () => {
  // State to track the currently selected tab (0 for Upload, 1 for Verify, 2 for Download)
  const [value, setValue] = useState(0);

  // Handle tab change event, update the 'value' state to switch between tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Document Authentication
      </Typography>

      {/* Tabs component for tab navigation */}
      <Tabs
        value={value} // Value that determines the selected tab
        onChange={handleChange} // Function to handle tab changes
        indicatorColor="primary" // Color of the tab indicator
        textColor="primary" // Color of the tab text
        centered // Center align the tabs
      >
        <Tab label="Upload Document" /> {/* Tab for uploading documents */}
        <Tab label="Verify Document" /> {/* Tab for verifying documents */}
        <Tab label="Download Documents" /> {/* Tab for downloading documents */}
      </Tabs>

      {/* TabPanel components to render content based on selected tab */}
      {/* Upload Document Tab */}
      <TabPanel value={value} index={0}>
        <UploadDocument /> {/* Render the UploadDocument component for this tab */}
      </TabPanel>

      {/* Verify Document Tab */}
      <TabPanel value={value} index={1}>
        <Verification /> {/* Render the Verification component for this tab */}
      </TabPanel>

      {/* Download Documents Tab */}
      <TabPanel value={value} index={2}>
        <DocumentDownloadComponent /> {/* Render the DocumentDownloadComponent for this tab */}
      </TabPanel>
    </Box>
  );
};

export default DocumentManager;
