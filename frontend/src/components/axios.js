import axios from 'axios';

// Create an instance of axios with a custom configuration
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/',  // Change to your backend URL if different
  timeout: 10000,  // Set a timeout to handle slow network requests
  headers: {
    'Content-Type': 'application/json',  // Specify JSON as content type
  },
});

export default axiosInstance;
