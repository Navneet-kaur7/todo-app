const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // Same domain in production
  : 'http://localhost:3001'; // Backend port for development

export default API_BASE_URL;