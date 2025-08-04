import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, isConnectedToDatabase } from './config/database.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Recipe Sharing App API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: isConnectedToDatabase() ? 'Connected' : 'Disconnected'
  });
});

// Health check route with database status
app.get('/api/health', (req, res) => {
  const dbStatus = isConnectedToDatabase();

  res.json({
    status: dbStatus ? 'OK' : 'WARNING',
    message: dbStatus ? 'Server is healthy!' : 'Server running but database disconnected',
    database: {
      connected: dbStatus,
      type: 'MongoDB Atlas'
    },
    timestamp: new Date().toISOString()
  });
});

// Database status route
app.get('/api/db-status', (req, res) => {
  const dbStatus = isConnectedToDatabase();

  res.json({
    connected: dbStatus,
    type: 'MongoDB Atlas',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    console.log('🔄 Initializing database connection...');
    await connectToDatabase();

    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Database: ${isConnectedToDatabase() ? 'Connected' : 'Disconnected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 CORS Origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
