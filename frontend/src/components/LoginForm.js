import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import AxiosInstance from './axios';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await AxiosInstance.post('login/', { username, password });
      if (response.data.message === 'Login successful') {
        localStorage.setItem('isAuthenticated', true);
        navigate('/'); // Redirect to home page on success
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2, width: '300px' }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2, width: '300px' }}
      />
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </Box>
    </Box>
  );
};

export default LoginForm;
