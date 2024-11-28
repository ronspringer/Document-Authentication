import { React, useState, useEffect } from 'react'; // Import React and hooks
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'; // Material-UI components for UI layout
import { useNavigate } from 'react-router-dom'; // For navigation between routes
import { logout } from './axios'; // Logout function from Axios instance
import AxiosInstance from './axios'; // Axios instance for making API requests

const NavBarLayout = ({ children }) => {
  // Initialize state for user info
  const [userInfo, setUserInfo] = useState({ username: '', isSuperUser: false });
  
  // Use the useNavigate hook to programmatically navigate between routes
  const navigate = useNavigate();

  // useEffect hook to fetch user info once the component mounts
  useEffect(() => {
    // Function to fetch user info from the backend API
    const fetchUserInfo = async () => {
      try {
        const response = await AxiosInstance.get('user_info/'); // Ensure the backend endpoint is correct
        setUserInfo({
          username: response.data.username, // Set the username
          isSuperUser: response.data.is_superuser, // Set the user role (superuser or not)
        });
      } catch (error) {
        console.error('Error fetching user info:', error); // Log error if API request fails
      }
    };

    fetchUserInfo(); // Call the fetchUserInfo function to get user details on mount
  }, []); // Empty dependency array ensures it only runs once after the initial render

  return (
    <div>
      {/* AppBar component from Material-UI for the navigation bar */}
      <AppBar position="static">
        <Toolbar>
          {/* Button to navigate to the homepage */}
          <Button color="inherit" onClick={() => navigate('/')}>
            <Typography variant="h8">Document Authentication</Typography> {/* Display site title */}
          </Button>

          {/* Spacer component to push the rest of the content to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Display username if it's available */}
          {userInfo.username && (
            <Typography variant="body1" style={{ marginRight: '20px' }}>
              Welcome, {userInfo.username} {/* Display welcome message */}
            </Typography>
          )}

          {/* Conditionally render 'User Accounts' button if the user is a superuser */}
          {userInfo.isSuperUser && (
            <Button color="inherit" onClick={() => navigate('/user_list')}>
              User Accounts {/* Only show this button for superusers */}
            </Button>
          )}

          {/* Logout button */}
          <Button color="inherit" onClick={logout}>
            Logout {/* Trigger the logout function */}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Render the content of the page inside a div, styled with padding */}
      <div style={{ padding: '20px' }}>
        {children} {/* Render the children passed to the component */}
      </div>
    </div>
  );
};

export default NavBarLayout;
