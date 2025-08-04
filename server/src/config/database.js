import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connection options for MongoDB Atlas
const connectionOptions = {
  // Connection pool settings
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // bufferMaxEntries: 0, // Disable mongoose buffering (deprecated in newer versions)
  // bufferCommands: false, // Disable mongoose buffering (deprecated in newer versions)
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Atlas specific settings
  ssl: true,
  authSource: 'admin',
  
  // Application name for monitoring
  appName: 'RecipeSharingApp'
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Database connection function with retry logic
export const connectToDatabase = async () => {
  // If already connected, return early
  if (isConnected) {
    console.log('📊 Already connected to MongoDB Atlas');
    return mongoose.connection;
  }

  // Validate MongoDB URI
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log(`📍 Environment: ${NODE_ENV}`);
    
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    return mongoose.connection;
    
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, error.message);
    
    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase();
    } else {
      console.error('💥 Max retry attempts reached. Database connection failed.');
      throw error;
    }
  }
};

// Graceful disconnection
export const disconnectFromDatabase = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('🔌 Disconnected from MongoDB Atlas');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
  isConnected = true;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
  isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  await disconnectFromDatabase();
  process.exit(0);
});

// Export connection status checker
export const isConnectedToDatabase = () => isConnected;

// Export mongoose instance for direct access
export { mongoose };
