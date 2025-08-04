import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection configuration
const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI  // Atlas for production
  : 'mongodb://localhost:27017/recipe-sharing-app'; // Local Docker for development


// Connection options
const connectionOptions = process.env.NODE_ENV === 'production' ? {
  // Production (Atlas) options
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  ssl: true,
  authSource: 'admin',
  appName: 'RecipeSharingApp'
} : {
  // Development (Local Docker) options
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Database connection function with environment-specific logic
export const connectToDatabase = async () => {
  if (isConnected) {
    console.log('📊 Already connected to MongoDB');
    return mongoose.connection;
  }

  // Validate MongoDB URI for production
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required for production');
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🎯 Database: ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local Docker'}`);
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    return mongoose.connection;
    
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, error.message);
    
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
