// CreateUserForm.js
import React, { useState } from "react"; // Import React and the useState hook
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Alert,
} from "@mui/material"; // Import Material-UI components for form styling and alerts
import AxiosInstance from './axios'; // Import the AxiosInstance for making API requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for page navigation

const CreateUserForm = () => {
    // State to hold the form data (user's first name, last name, email, username, and password)
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
    });

    // State to hold error and success messages
    const [error, setError] = useState(null); // Stores error message if there's an issue
    const [success, setSuccess] = useState(null); // Stores success message if user is created successfully
    const navigate = useNavigate(); // Hook for navigation

    // Handle form field changes and update the formData state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission: send a POST request to create a new user
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        try {
            // Send a POST request to create a new user, passing formData as the request body
            const response = await AxiosInstance.post('create_user/', formData);
            setSuccess(response.data.message); // If the request is successful, display a success message
            setError(null); // Clear any previous error messages
            setFormData({ // Reset the form fields after successful submission
                first_name: "",
                last_name: "",
                email: "",
                username: "",
                password: "",
            });
        } catch (err) {
            // If an error occurs, set the error message
            setError(err.response.data.error || "An error occurred.");
            setSuccess(null); // Clear any previous success message
        }
    };

    return (
        <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
            {/* Container to center and constrain the form width */}
            <Container maxWidth="sm">
                {/* Heading for the form */}
                <Typography variant="h4" component="h1" gutterBottom>
                    Add User
                </Typography>

                {/* Show error or success message if applicable */}
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                {/* Back button to navigate to user list */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px' }}>
                    <Button color="primary" variant="contained" onClick={() => navigate('/user_list/')} sx={{ marginLeft: '10px' }}>
                        Back
                    </Button>
                </Box>

                {/* Form for creating a new user */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                    {/* Input field for first name */}
                    <TextField
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />
                    {/* Input field for last name */}
                    <TextField
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />
                    {/* Input field for email */}
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                        type="email"
                        margin="normal"
                    />
                    {/* Input field for username */}
                    <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />
                    {/* Input field for password */}
                    <TextField
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        required
                        type="password"
                        margin="normal"
                    />
                    {/* Submit button to send the form data */}
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Submit
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CreateUserForm;
