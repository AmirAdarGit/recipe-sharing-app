import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const startLocalMongoDB = async () => {
  try {
    console.log('🐳 Starting local MongoDB with Docker...');
    
    // Try to start existing container first
    try {
      await execAsync('docker start recipe-sharing-app-local');
      console.log('✅ Existing MongoDB container started');
    } catch {
      // If container doesn't exist, create new one
      await execAsync('docker run -d --name recipe-sharing-app-local -p 27017:27017 mongo:latest');
      console.log('✅ New MongoDB container created and started');
    }
    
    // Wait a moment for MongoDB to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('🎯 MongoDB ready on localhost:27017');
    
  } catch (error) {
    console.error('❌ Failed to start MongoDB container:', error.message);
    throw error;
  }
};