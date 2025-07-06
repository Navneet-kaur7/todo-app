const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log('Already connected to MongoDB');
      return;
    }

    console.log('Connecting to MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is NOT set');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options and use only supported ones
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // Remove bufferMaxEntries and bufferCommands - they're deprecated
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

module.exports = connectDB;