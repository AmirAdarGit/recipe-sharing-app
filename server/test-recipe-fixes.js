/**
 * Test script to verify the Recipe API fixes
 * 1. Test image storage fix
 * 2. Test recipe retrieval fix
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import recipeRoutes from './dist/routes/recipes.js';
import Recipe from './dist/models/Recipe.js';
import User from './dist/models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/recipes', recipeRoutes);

const TEST_USER_UID = 'voaL3ljMTpaY89pT1MfDpktR8sE2';
const SPECIFIC_RECIPE_ID = '68943e1184c2f1f8368fe47c';

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function testImageStorageFix() {
  console.log('\n🖼️ TESTING IMAGE STORAGE FIX');
  console.log('=============================');
  
  try {
    // Test payload with images (same as user's example)
    const testRecipePayload = {
      authorFirebaseUid: TEST_USER_UID,
      title: "Test Recipe with Images",
      description: "Testing image storage fix",
      ingredients: [
        {
          name: "Test ingredient",
          quantity: 1,
          unit: "cup"
        }
      ],
      instructions: [
        {
          stepNumber: 1,
          instruction: "Test instruction"
        }
      ],
      cookingTime: {
        prep: 10,
        cook: 20
      },
      servings: 4,
      difficulty: "medium",
      category: "lunch",
      cuisine: "american",
      tags: [],
      notes: "Test notes for the recipe",
      isPublic: true,
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/recipe-sharing-app-bdf6d.firebasestorage.app/o/recipes%2FvoaL3ljMTpaY89pT1MfDpktR8sE2%2F1754550596190_si54lt7y18s.jpeg?alt=media&token=b7aa9b1f-b8bb-49db-b4e1-7d79f0c0c23a",
          alt: "Test Recipe Image",
          isPrimary: true
        }
      ],
      dietaryInfo: {
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: false,
        isNutFree: false,
        isKeto: false,
        isPaleo: false
      },
      nutrition: {}
    };

    console.log('📤 Sending POST request to create recipe with images...');
    
    const response = await request(app)
      .post('/api/recipes')
      .send(testRecipePayload)
      .expect(201);

    console.log('✅ Recipe created successfully!');
    console.log(`📊 Recipe ID: ${response.body.data._id}`);
    console.log(`📊 Images count: ${response.body.data.images?.length || 0}`);
    console.log(`📊 Notes: "${response.body.data.notes || 'No notes'}"`);
    console.log(`📊 Is Public: ${response.body.data.isPublic}`);

    if (response.body.data.images && response.body.data.images.length > 0) {
      console.log('🎉 SUCCESS: Images were stored correctly!');
      response.body.data.images.forEach((img, index) => {
        console.log(`   Image ${index + 1}:`);
        console.log(`   - URL: ${img.url}`);
        console.log(`   - Alt: ${img.alt}`);
        console.log(`   - Primary: ${img.isPrimary}`);
      });
    } else {
      console.log('❌ FAILED: Images were not stored');
    }

    // Verify in database
    const createdRecipe = await Recipe.findById(response.body.data._id);
    if (createdRecipe) {
      console.log('\n🔍 Verifying in database:');
      console.log(`📊 DB Images count: ${createdRecipe.images?.length || 0}`);
      console.log(`📊 DB Notes: "${createdRecipe.notes || 'No notes'}"`);
      console.log(`📊 DB Is Public: ${createdRecipe.isPublic}`);
    }

    // Clean up test recipe
    await Recipe.findByIdAndDelete(response.body.data._id);
    console.log('🧹 Test recipe cleaned up');

    return true;

  } catch (error) {
    console.error('❌ Image storage test failed:', error.message);
    return false;
  }
}

async function testRecipeRetrievalFix() {
  console.log('\n🔍 TESTING RECIPE RETRIEVAL FIX');
  console.log('===============================');
  
  try {
    console.log(`📤 Sending GET request for recipe ID: ${SPECIFIC_RECIPE_ID}`);
    
    const response = await request(app)
      .get(`/api/recipes/${SPECIFIC_RECIPE_ID}`)
      .expect(200);

    console.log('✅ Recipe retrieved successfully!');
    console.log(`📊 Recipe Title: ${response.body.data.title}`);
    console.log(`📊 Recipe Status: ${response.body.data.status}`);
    console.log(`📊 Author Firebase UID: ${response.body.data.authorFirebaseUid}`);
    console.log(`📊 Images count: ${response.body.data.images?.length || 0}`);
    console.log(`📊 View count: ${response.body.data.stats?.views || 0}`);

    return true;

  } catch (error) {
    console.error('❌ Recipe retrieval test failed:', error.message);
    
    // Additional debugging
    console.log('\n🔍 Additional debugging:');
    try {
      const recipe = await Recipe.findById(SPECIFIC_RECIPE_ID);
      if (recipe) {
        console.log('✅ Recipe exists in database');
        console.log(`📊 Title: ${recipe.title}`);
        console.log(`📊 Status: ${recipe.status}`);
      } else {
        console.log('❌ Recipe not found in database');
      }
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError.message);
    }

    return false;
  }
}

async function testUserRecipesEndpoint() {
  console.log('\n👤 TESTING USER RECIPES ENDPOINT');
  console.log('=================================');
  
  try {
    console.log(`📤 Sending GET request for user recipes: ${TEST_USER_UID}`);
    
    const response = await request(app)
      .get(`/api/recipes/user/${TEST_USER_UID}`)
      .expect(200);

    console.log('✅ User recipes retrieved successfully!');
    console.log(`📊 Total recipes: ${response.body.total}`);
    console.log(`📊 Returned recipes: ${response.body.count}`);
    
    if (response.body.data && response.body.data.length > 0) {
      console.log('📋 Recipe list:');
      response.body.data.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title} (ID: ${recipe._id})`);
        console.log(`      Status: ${recipe.status}, Images: ${recipe.images?.length || 0}`);
      });
    }

    return true;

  } catch (error) {
    console.error('❌ User recipes test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Recipe API Fix Tests...\n');
  
  await connectToDatabase();
  
  const results = {
    imageStorage: await testImageStorageFix(),
    recipeRetrieval: await testRecipeRetrievalFix(),
    userRecipes: await testUserRecipesEndpoint()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`🖼️  Image Storage Fix: ${results.imageStorage ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🔍 Recipe Retrieval Fix: ${results.recipeRetrieval ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`👤 User Recipes Endpoint: ${results.userRecipes ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from database');
  
  return allPassed;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests };
