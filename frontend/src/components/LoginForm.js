import React, { useState } from 'react'; // Import React and the useState hook
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation between routes
import { TextField, Button, Box, Typography } from '@mui/material'; // Import Material-UI components
import { login } from './axios'; // Import the login function from Axios instance

const LoginForm = () => {
  // State variables to store the username, password, and any error messages
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // useNavigate hook to navigate programmatically after successful login
  const navigate = useNavigate();

  // Function to handle login when the login button is clicked
  const handleLogin = async () => {
    try {
      // Call the login function with username and password
      await login(username, password);
      navigate('/'); // Redirect to home page on successful login
    } catch (err) {
      // If login fails, set error message
      setError('Invalid username or password');
    }
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
      {/* Box containing the login form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        {/* Display the title of the login form */}
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        {/* Username input field */}
        <TextField
          label="Username"
          variant="outlined"
          value={username} // Bind the username value to the state
          onChange={(e) => setUsername(e.target.value)} // Update the state when the user types
          sx={{ mb: 2, width: '300px' }} // Style the input field with margin and width
        />

        {/* Password input field */}
        <TextField
          label="Password"
          type="password" // Mask the password input
          variant="outlined"
          value={password} // Bind the password value to the state
          onChange={(e) => setPassword(e.target.value)} // Update the state when the user types
          sx={{ mb: 2, width: '300px' }} // Style the input field with margin and width
        />

        {/* Display error message if any error exists */}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Login button */}
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login {/* Trigger the handleLogin function on click */}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;
