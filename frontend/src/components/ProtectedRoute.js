import React from 'react';
import { Navigate } from 'react-router-dom';

// This component will check if the user is authenticated
const ProtectedRoute = ({ children }) => {
  // Get authentication status (you can use context, localStorage, or Redux to manage auth state)
  const isAuthenticated = localStorage.getItem('authToken'); // Example using localStorage

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the children (the protected route components)
  return children;
};

export default ProtectedRoute;
