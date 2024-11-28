import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Icon for editing users
import AxiosInstance from './axios';  // Axios instance for making HTTP requests
import { useNavigate } from 'react-router-dom'; // For navigation within the app

const UserList = () => {
  // State variables for managing user data, selected user, form input, and dialog visibility
  const [users, setUsers] = useState([]); // List of users
  const [selectedUser, setSelectedUser] = useState(null); // The user currently being edited
  const [formData, setFormData] = useState({}); // Form data for the user being edited
  const [open, setOpen] = useState(false); // Dialog visibility for editing user
  const navigate = useNavigate(); // Hook to navigate between routes

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once after initial render

  // Function to fetch all users from the API
  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get('users/'); // Make GET request to fetch users
      setUsers(response.data); // Set the response data to the users state
    } catch (error) {
      console.error("Error fetching users:", error); // Log any error during the fetch process
    }
  };

  // Function to handle the edit action
  const handleEdit = (user) => {
    setSelectedUser(user); // Set the selected user to the user clicked
    setFormData(user); // Pre-fill the form with the user's data
    setOpen(true); // Open the dialog to edit the selected user
  };

  // Function to handle closing the dialog
  const handleClose = () => {
    setOpen(false); // Close the dialog
    setSelectedUser(null); // Clear the selected user
    setFormData({}); // Clear the form data
  };

  // Function to handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // Update the form data state
  };

  // Function to handle the form submission (save the updated user data)
  const handleSubmit = async () => {
    try {
      // Make PUT request to update the user
      await AxiosInstance.put(`users/${selectedUser.id}/`, formData);
      fetchUsers(); // Refresh the user list after updating
      handleClose(); // Close the dialog after successful update
    } catch (error) {
      console.error("Error updating user:", error); // Log any error during the update process
    }
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
      <Container>
        {/* Header for the User List page */}
        <Typography variant="h4" component="h1" gutterBottom>
          User Accounts
        </Typography>

        {/* Buttons for adding a new user and navigating back */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px'}}>
          <Button color="success" variant="contained" onClick={() => navigate('/create_user')}>
            Add User
          </Button>
          <Button color="primary" variant="contained" onClick={() => navigate('/')} sx={{marginLeft: '10px'}}>
            Back
          </Button>
        </Box>

        {/* Table to display the list of users */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* Table headers */}
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Actions</TableCell> {/* Action buttons (edit) */}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map through users and create table rows */}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {/* Edit button to edit user */}
                    <IconButton onClick={() => handleEdit(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog to edit the selected user */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {/* Form fields for editing user details */}
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Username"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password (Leave blank to keep unchanged)"
              name="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {/* Button to save changes */}
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserList;
