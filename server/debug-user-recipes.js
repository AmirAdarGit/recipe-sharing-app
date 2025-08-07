/**
 * Debug script to test the user recipes API endpoint
 * This script will help identify why the API is not returning recipes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './dist/models/User.js';
import Recipe from './dist/models/Recipe.js';

dotenv.config();

const FIREBASE_UID = 'voaL3ljMTpaY89pT1MfDpktR8sE2';

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function debugUserRecipes() {
  console.log('🔍 Starting debug session for user recipes...\n');
  
  try {
    // Step 1: Check if user exists
    console.log('Step 1: Checking if user exists...');
    const user = await User.findByFirebaseUid(FIREBASE_UID);
    
    if (!user) {
      console.log('❌ User not found with Firebase UID:', FIREBASE_UID);
      
      // Check if user exists with different field
      const userByFirebaseUid = await User.findOne({ firebaseUid: FIREBASE_UID });
      const userByAuthorFirebaseUid = await User.findOne({ authorFirebaseUid: FIREBASE_UID });
      
      console.log('🔍 User by firebaseUid:', userByFirebaseUid ? 'Found' : 'Not found');
      console.log('🔍 User by authorFirebaseUid:', userByAuthorFirebaseUid ? 'Found' : 'Not found');
      
      // List all users to see what's in the database
      const allUsers = await User.find({}).select('firebaseUid email displayName').limit(5);
      console.log('📋 Sample users in database:');
      allUsers.forEach(u => {
        console.log(`  - Firebase UID: ${u.firebaseUid}, Email: ${u.email}, Name: ${u.displayName}`);
      });
      
      return;
    }
    
    console.log('✅ User found:');
    console.log(`  - ID: ${user._id}`);
    console.log(`  - Firebase UID: ${user.firebaseUid}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Display Name: ${user.displayName}`);
    console.log(`  - Recipes Created: ${user.stats.recipesCreated}\n`);
    
    // Step 2: Check recipes by author ObjectId
    console.log('Step 2: Checking recipes by author ObjectId...');
    const recipesByAuthorId = await Recipe.find({ author: user._id });
    console.log(`📊 Recipes found by author ObjectId: ${recipesByAuthorId.length}`);
    
    if (recipesByAuthorId.length > 0) {
      console.log('📋 Recipes by author ObjectId:');
      recipesByAuthorId.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.title} (Status: ${recipe.status}, Public: ${recipe.isPublic})`);
      });
    }
    
    // Step 3: Check recipes by authorFirebaseUid
    console.log('\nStep 3: Checking recipes by authorFirebaseUid...');
    const recipesByFirebaseUid = await Recipe.find({ authorFirebaseUid: FIREBASE_UID });
    console.log(`📊 Recipes found by authorFirebaseUid: ${recipesByFirebaseUid.length}`);
    
    if (recipesByFirebaseUid.length > 0) {
      console.log('📋 Recipes by authorFirebaseUid:');
      recipesByFirebaseUid.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.title} (Status: ${recipe.status}, Public: ${recipe.isPublic})`);
      });
    }
    
    // Step 4: Check all recipes in database
    console.log('\nStep 4: Checking total recipes in database...');
    const totalRecipes = await Recipe.countDocuments();
    console.log(`📊 Total recipes in database: ${totalRecipes}`);
    
    // Step 5: Check recipes with different statuses
    console.log('\nStep 5: Checking recipes by status...');
    const publishedRecipes = await Recipe.find({ author: user._id, status: 'published' });
    const draftRecipes = await Recipe.find({ author: user._id, status: 'draft' });
    const archivedRecipes = await Recipe.find({ author: user._id, status: 'archived' });
    
    console.log(`📊 Published recipes: ${publishedRecipes.length}`);
    console.log(`📊 Draft recipes: ${draftRecipes.length}`);
    console.log(`📊 Archived recipes: ${archivedRecipes.length}`);
    
    // Step 6: Test the exact query from the API
    console.log('\nStep 6: Testing exact API query...');
    const apiQuery = { author: user._id, status: 'published' };
    const apiRecipes = await Recipe.find(apiQuery)
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    console.log(`📊 API query result: ${apiRecipes.length} recipes`);
    
    if (apiRecipes.length > 0) {
      console.log('📋 API query recipes:');
      apiRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.title}`);
        console.log(`     - Status: ${recipe.status}`);
        console.log(`     - Public: ${recipe.isPublic}`);
        console.log(`     - Author: ${recipe.author?.displayName || 'Unknown'}`);
        console.log(`     - Created: ${recipe.createdAt}`);
      });
    }
    
    // Step 7: Test without status filter
    console.log('\nStep 7: Testing without status filter...');
    const allUserRecipes = await Recipe.find({ author: user._id })
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    console.log(`📊 All user recipes (no status filter): ${allUserRecipes.length}`);
    
    if (allUserRecipes.length > 0) {
      console.log('📋 All user recipes:');
      allUserRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.title} (Status: ${recipe.status})`);
      });
    }
    
    // Step 8: Sample a few recipes to check their structure
    if (totalRecipes > 0) {
      console.log('\nStep 8: Checking sample recipe structure...');
      const sampleRecipes = await Recipe.find({}).limit(3);
      sampleRecipes.forEach((recipe, index) => {
        console.log(`Sample Recipe ${index + 1}:`);
        console.log(`  - Title: ${recipe.title}`);
        console.log(`  - Author ObjectId: ${recipe.author}`);
        console.log(`  - Author Firebase UID: ${recipe.authorFirebaseUid}`);
        console.log(`  - Status: ${recipe.status}`);
        console.log(`  - Public: ${recipe.isPublic}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug session failed:', error);
  }
}

async function main() {
  await connectToDatabase();
  await debugUserRecipes();
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from database');
}

main().catch(console.error);
