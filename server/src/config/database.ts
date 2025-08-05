import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection configuration
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Detect MongoDB type from URI
const isAtlas = MONGODB_URI?.includes('mongodb+srv://') || MONGODB_URI?.includes('.mongodb.net');
const isLocal = MONGODB_URI?.includes('localhost') || MONGODB_URI?.includes('127.0.0.1');

// Dynamic connection options based on environment and MongoDB type
const getConnectionOptions = () => {
  const baseOptions = {
    // Connection pool settings
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Application name for monitoring
    appName: 'RecipeSharingApp'
  };

  // Atlas-specific settings
  if (isAtlas) {
    console.log('🌐 Configuring for MongoDB Atlas (SSL enabled)');
    return {
      ...baseOptions,
      ssl: true,
      authSource: 'admin',
    };
  }
  
  // Local MongoDB settings
  if (isLocal) {
    console.log('🏠 Configuring for Local MongoDB (SSL disabled)');
    return {
      ...baseOptions,
      ssl: false,
      // No authSource needed for local usually
    };
  }
  
  // Other hosted MongoDB (try without SSL first)
  console.log('🚀 Configuring for Hosted MongoDB (SSL disabled)');
  return {
    ...baseOptions,
    ssl: false,
    authSource: 'admin',
  };
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
    console.log('📊 Already connected to MongoDB');
    return mongoose.connection;
  }

  // Validate MongoDB URI
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Connection type: ${isAtlas ? 'Atlas' : isLocal ? 'Local' : 'Hosted'}`);
    
    const connectionOptions = getConnectionOptions();
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    return mongoose.connection;
    
  } catch (error) {
    connectionAttempts++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}):`, errorMessage);
    
    // If SSL error and not Atlas, try again without SSL
    if (errorMessage.toLowerCase().includes('ssl') && !isAtlas && connectionAttempts === 1) {
      console.log('🔄 SSL error detected, retrying without SSL...');
      // This will use the getConnectionOptions() which already disables SSL for non-Atlas
    }
    
    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase();
    } else {
      console.error('💥 Max retry attempts reached. Database connection failed.');
      console.error('💡 Check your MONGODB_URI and ensure the database server is running');
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
      console.log('🔌 Disconnected from MongoDB');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error disconnecting from MongoDB:', errorMessage);
    throw error;
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log(`🔗 Mongoose connected to MongoDB (${isAtlas ? 'Atlas' : isLocal ? 'Local' : 'Hosted'})`);
  isConnected = true;
});

mongoose.connection.on('error', (error: Error) => {
  console.error('❌ Mongoose connection error:', error.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
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