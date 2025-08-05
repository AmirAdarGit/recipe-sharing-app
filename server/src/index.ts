import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, isConnectedToDatabase } from './config/database.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import type { ApiResponse } from './types/index.js';

// Load environment variables
dotenv.config();

// Force Railway rebuild - API routes fix v2

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000');
const HOST: string = process.env.HOST || '0.0.0.0';

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
app.get('/', (_req: Request, res: Response<ApiResponse>) => {
  res.json({ 
    success: true,
    message: 'Recipe Sharing App API is running!',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      database: isConnectedToDatabase() ? 'Connected' : 'Disconnected'
    }
  });
});

// Health check route with database status
app.get('/api/health', (_req: Request, res: Response<ApiResponse>) => {
  const dbStatus = isConnectedToDatabase();
  
  res.json({ 
    success: dbStatus,
    message: dbStatus ? 'Server is healthy!' : 'Server running but database disconnected',
    data: {
      database: {
        connected: dbStatus,
        type: 'MongoDB Atlas'
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Database status route
app.get('/api/db-status', (_req: Request, res: Response<ApiResponse>) => {
  const dbStatus = isConnectedToDatabase();
  
  res.json({
    success: dbStatus,
    data: {
      connected: dbStatus,
      type: 'MongoDB Atlas',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// Test route
app.get('/api/test', (_req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'Test route working!',
    data: { typescript: true, version: '1.0.2' }
  });
});

// Debug route to check route registration
app.get('/api/debug', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Debug route working!',
    routes: {
      userRoutes: typeof userRoutes,
      recipeRoutes: typeof recipeRoutes
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
console.log('🛣️ Registering API routes...');
console.log('📝 userRoutes type:', typeof userRoutes);
console.log('📝 recipeRoutes type:', typeof recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
console.log('✅ API routes registered successfully');

// 404 handler - catch all unmatched routes
app.use((req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error: Error, _req: Request, res: Response<ApiResponse>, _next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server with database connection
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB Atlas
    console.log('🔄 Initializing database connection...');
    await connectToDatabase();
    
    // Start Express server
    app.listen(PORT, HOST, () => {
      console.log(`🚀 TypeScript Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Database: ${isConnectedToDatabase() ? 'Connected' : 'Disconnected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 CORS Origins: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`📝 TypeScript: Enabled ✅`);
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Failed to start server:', errorMessage);
    process.exit(1);
  }
};

// Start the server
startServer();
