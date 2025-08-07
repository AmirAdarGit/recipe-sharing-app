/**
 * Debug script for Recipe API issues
 * 1. Image storage issue
 * 2. Recipe retrieval issue for specific ID
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './dist/models/Recipe.js';
import User from './dist/models/User.js';

dotenv.config();

const SPECIFIC_RECIPE_ID = '68943e1184c2f1f8368fe47c';
const TEST_USER_UID = 'voaL3ljMTpaY89pT1MfDpktR8sE2';

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function debugRecipeRetrieval() {
  console.log('\n🔍 DEBUGGING RECIPE RETRIEVAL ISSUE');
  console.log('=====================================');
  
  try {
    // Test 1: Check if the specific recipe ID exists
    console.log(`\n1. Checking if recipe ID ${SPECIFIC_RECIPE_ID} exists...`);
    
    // Check if it's a valid ObjectId format
    const isValidObjectId = mongoose.Types.ObjectId.isValid(SPECIFIC_RECIPE_ID);
    console.log(`   Valid ObjectId format: ${isValidObjectId}`);
    
    if (!isValidObjectId) {
      console.log('❌ Invalid ObjectId format - this is the issue!');
      return;
    }
    
    // Try to find the recipe
    const recipe = await Recipe.findById(SPECIFIC_RECIPE_ID);
    
    if (recipe) {
      console.log('✅ Recipe found:');
      console.log(`   - Title: ${recipe.title}`);
      console.log(`   - Author Firebase UID: ${recipe.authorFirebaseUid}`);
      console.log(`   - Status: ${recipe.status}`);
      console.log(`   - Created: ${recipe.createdAt}`);
      console.log(`   - Images count: ${recipe.images?.length || 0}`);
    } else {
      console.log('❌ Recipe not found in database');
      
      // Check if there are any recipes with similar IDs
      console.log('\n2. Searching for similar recipe IDs...');
      const allRecipes = await Recipe.find({}).select('_id title authorFirebaseUid').limit(10);
      console.log('📋 Available recipe IDs:');
      allRecipes.forEach(r => {
        console.log(`   - ${r._id} (${r.title})`);
      });
    }
    
    // Test 2: Check recipes for the specific user
    console.log(`\n3. Checking recipes for user ${TEST_USER_UID}...`);
    const userRecipes = await Recipe.find({ authorFirebaseUid: TEST_USER_UID });
    console.log(`📊 Found ${userRecipes.length} recipes for this user:`);
    userRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ID: ${recipe._id}`);
      console.log(`      Title: ${recipe.title}`);
      console.log(`      Status: ${recipe.status}`);
      console.log(`      Images: ${recipe.images?.length || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error during recipe retrieval debug:', error);
  }
}

async function debugImageStorage() {
  console.log('\n🖼️ DEBUGGING IMAGE STORAGE ISSUE');
  console.log('=================================');
  
  try {
    // Test 1: Check current recipe structure
    console.log('\n1. Checking current recipe image storage...');
    const recipesWithImages = await Recipe.find({ 
      authorFirebaseUid: TEST_USER_UID,
      'images.0': { $exists: true }
    });
    
    console.log(`📊 Recipes with images: ${recipesWithImages.length}`);
    
    if (recipesWithImages.length > 0) {
      recipesWithImages.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title}:`);
        recipe.images.forEach((img, imgIndex) => {
          console.log(`      Image ${imgIndex + 1}: ${img.url}`);
          console.log(`      Alt: ${img.alt}`);
          console.log(`      Primary: ${img.isPrimary}`);
        });
      });
    } else {
      console.log('❌ No recipes found with images stored');
    }
    
    // Test 2: Check all recipes for this user to see image field structure
    console.log('\n2. Checking image field structure for all user recipes...');
    const allUserRecipes = await Recipe.find({ authorFirebaseUid: TEST_USER_UID });
    
    if (allUserRecipes.length === 0) {
      console.log('❌ No recipes found for this user. Create a recipe first.');
      return;
    }
    
    allUserRecipes.forEach((recipe, index) => {
      console.log(`   Recipe ${index + 1}: ${recipe.title}`);
      console.log(`   - Images field exists: ${recipe.images !== undefined}`);
      console.log(`   - Images array length: ${recipe.images?.length || 0}`);
      console.log(`   - Images content:`, recipe.images || 'No images');
    });
    
    // Test 3: Create a test recipe with images to verify the issue
    console.log('\n3. Testing recipe creation with images...');
    
    const user = await User.findByFirebaseUid(TEST_USER_UID);
    if (!user) {
      console.log('❌ User not found for testing');
      return;
    }
    
    const testRecipeData = {
      author: user._id,
      authorFirebaseUid: TEST_USER_UID,
      title: 'Test Recipe with Images - Debug',
      description: 'Testing image storage',
      ingredients: [{ name: 'Test ingredient', quantity: 1, unit: 'cup', notes: '' }],
      instructions: [{ stepNumber: 1, instruction: 'Test instruction', duration: null, image: null }],
      cookingTime: { prep: 10, cook: 20, total: 30 },
      servings: 4,
      difficulty: 'easy',
      category: 'main-course',
      cuisine: 'american',
      tags: [],
      images: [
        {
          url: 'https://test-image-url.com/test.jpg',
          alt: 'Test image',
          isPrimary: true
        }
      ],
      dietaryInfo: {},
      nutrition: {},
      status: 'draft' // Add status to match your schema
    };
    
    const testRecipe = await Recipe.create(testRecipeData);
    console.log('✅ Test recipe created with ID:', testRecipe._id);
    console.log('📊 Images in created recipe:', testRecipe.images);
    
    // Clean up test recipe
    await Recipe.findByIdAndDelete(testRecipe._id);
    console.log('🧹 Test recipe cleaned up');
    
  } catch (error) {
    console.error('❌ Error during image storage debug:', error);
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 TESTING API ENDPOINTS');
  console.log('========================');
  
  try {
    // This would require the server to be running
    console.log('ℹ️  To test API endpoints, run the server and use:');
    console.log(`   curl "http://localhost:5000/api/recipes/${SPECIFIC_RECIPE_ID}"`);
    console.log(`   curl "http://localhost:5000/api/recipes/user/${TEST_USER_UID}"`);
    
    // Test recipe creation payload
    console.log('\n📝 Sample recipe creation payload with images:');
    const samplePayload = {
      authorFirebaseUid: TEST_USER_UID,
      title: "Test Recipe",
      description: "Test description",
      ingredients: [{ name: "Test", quantity: 1, unit: "cup" }],
      instructions: [{ stepNumber: 1, instruction: "Test step" }],
      cookingTime: { prep: 10, cook: 20 },
      servings: 4,
      difficulty: "medium",
      category: "lunch",
      cuisine: "american",
      tags: [],
      images: [
        {
          url: "https://firebasestorage.googleapis.com/test.jpg",
          alt: "Test image",
          isPrimary: true
        }
      ],
      dietaryInfo: {},
      nutrition: {}
    };
    
    console.log(JSON.stringify(samplePayload, null, 2));
    
  } catch (error) {
    console.error('❌ Error during API endpoint testing:', error);
  }
}

async function main() {
  console.log('🚀 Starting Recipe API Debug Session...\n');
  
  await connectToDatabase();
  await debugRecipeRetrieval();
  await debugImageStorage();
  await testAPIEndpoints();
  
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from database');
  console.log('\n🎉 Debug session completed!');
}

main().catch(console.error);
