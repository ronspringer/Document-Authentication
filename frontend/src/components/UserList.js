// UserList.js
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
import EditIcon from "@mui/icons-material/Edit";
import AxiosInstance from './axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get('users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await AxiosInstance.put(`users/${selectedUser.id}/`, formData);
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Box sx={{ width: '98%', bgcolor: 'background.paper', boxShadow: 3, borderRadius: 2, mt: 5, p: 2 }}>
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        User Accounts
      </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '20px'}}>
            <Button color="success" variant="contained" onClick={() => navigate('/create_user')}>
                Add User
            </Button>
            <Button color="primary" variant="contained" onClick={() => navigate('/')} sx={{marginLeft: '10px'}}>
                Back
            </Button>
        </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
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
