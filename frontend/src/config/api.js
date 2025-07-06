// Use consistent API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? '/api'  // Use relative path in production for monorepo deployment
    : 'http://localhost:5000/api');

console.log('API Config - Environment:', process.env.NODE_ENV);
console.log('API Config - Base URL:', API_BASE_URL);
console.log('API Config - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

export default API_BASE_URL;