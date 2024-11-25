import React from 'react';
import DocumentManager from './components/DocumentManager';
import CreateUserForm from './components/CreateUserForm';
import UserList from './components/UserList';
import NavBarLayout from './components/NavBarLayout';
import LoginForm from './components/LoginForm'; // Add Login Component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this is implemented

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NavBarLayout>
                <DocumentManager />
              </NavBarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user_list"
          element={
            <ProtectedRoute>
              <NavBarLayout>
                <UserList />
              </NavBarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_user"
          element={
            <ProtectedRoute>
              <NavBarLayout>
                <CreateUserForm />
              </NavBarLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
