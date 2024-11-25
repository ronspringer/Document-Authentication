import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NavBarLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Navigation Bar */}
      <AppBar position="static">
      <Toolbar>
        {/* Left-aligned Button */}
        <Button color="inherit" onClick={() => navigate('/')}>
          <Typography variant="h8">
            Document Authentication
          </Typography>
        </Button>
        
        {/* Spacer to push User Accounts to the right */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Right-aligned Button */}
        <Button color="inherit" onClick={() => navigate('/user_list')}>
          User Accounts
        </Button>
      </Toolbar>
    </AppBar>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

export default NavBarLayout;
