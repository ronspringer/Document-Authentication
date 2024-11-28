import axios from 'axios';

// Create an instance of axios with a custom configuration
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  timeout: 10000, // Set a timeout to handle slow network requests
  headers: {
    'Content-Type': 'application/json', // Specify JSON as content type
  },
});

// Add a request interceptor to include the authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Retrieve token from local storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Add token to headers
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration or errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., token expired)
      localStorage.removeItem('access_token'); // Clear token
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

// Login function
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('login/', { username, password });
    const { access_token, refresh_token } = response.data; // Get tokens
    localStorage.setItem('access_token', access_token); // Save access token to local storage
    localStorage.setItem('refresh_token', refresh_token); // Save refresh token to local storage
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('access_token'); // Clear access token from local storage
  localStorage.removeItem('refresh_token'); // Clear refresh token from local storage
  window.location.href = '/login'; // Redirect to login page
};

// Session check function
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('access_token')); // Check if token exists
};

export default axiosInstance;
