// CreateUserForm.js
import React, { useState } from "react";
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Alert,
} from "@mui/material";
import AxiosInstance from './axios';
import { useNavigate } from 'react-router-dom';

const CreateUserForm = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await AxiosInstance.post(
                'create_user/',
                formData
            );
            setSuccess(response.data.message);
            setError(null);
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                username: "",
                password: "",
            });
        } catch (err) {
            setError(err.response.data.error || "An error occurred.");
            setSuccess(null);
        }
    };

    return (
        <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Add User
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px'}}>
            <Button color="primary" variant="contained" onClick={() => navigate('/user_list/')} sx={{marginLeft: '10px'}}>
                Back
            </Button>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                <TextField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
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
                <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                />
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
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Submit
                </Button>
            </Box>
        </Container>
        </Box>
    );
};

export default CreateUserForm;
