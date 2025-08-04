import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection configuration
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Connection options for MongoDB Atlas
const connectionOptions = {
  // Connection pool settings
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  
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
let isConnected: boolean = false;
let connectionAttempts: number = 0;
const MAX_RETRY_ATTEMPTS: number = 5;
const RETRY_DELAY: number = 5000; // 5 seconds

// Database connection function with retry logic
export const connectToDatabase = async (): Promise<Connection> => {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, errorMessage);
    
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
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('🔌 Disconnected from MongoDB Atlas');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error disconnecting from MongoDB:', errorMessage);
    throw error;
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
  isConnected = true;
});

mongoose.connection.on('error', (error: Error) => {
  console.error('❌ Mongoose connection error:', error.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
  isConnected = false;
});

// Handle application termination
const handleShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  await disconnectFromDatabase();
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Export connection status checker
export const isConnectedToDatabase = (): boolean => isConnected;

// Export mongoose instance for direct access
export { mongoose };
