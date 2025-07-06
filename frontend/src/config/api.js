// Use consistent API base URL configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'  // Replace with your actual backend URL
  : 'http://localhost:5000/api';           // Local development

console.log('API Base URL:', API_BASE_URL); // Debug log
export default API_BASE_URL;


