const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/database');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - Updated for Vercel deployment
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local development
    'https://todo-app-gules-nu-52.vercel.app', // Your Vercel deployment
    /^https:\/\/.*\.vercel\.app$/,     // Any Vercel preview deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/auth', require('./auth'));
app.use('/api/tasks', require('./tasks'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API root route
app.get('/api', (req, res) => {
  res.json({
    message: 'Todo API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    routes: ['/api/auth', '/api/tasks']
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;