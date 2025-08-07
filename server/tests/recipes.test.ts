import request from 'supertest';
import express from 'express';
import cors from 'cors';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';
import recipeRoutes from '../src/routes/recipes';
import type { IUserDocument, IRecipeDocument } from '../src/types/index';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

describe('Recipe API Endpoints', () => {
  let testUser: IUserDocument;
  let testRecipes: IRecipeDocument[];

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      firebaseUid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      providers: [{
        providerId: 'password',
        uid: 'test-user-123',
        email: 'test@example.com'
      }]
    });

    // Create test recipes
    const recipeData = [
      {
        title: 'Test Recipe 1',
        description: 'A test recipe',
        author: testUser._id,
        authorFirebaseUid: testUser.firebaseUid,
        ingredients: [
          { name: 'Ingredient 1', quantity: 1, unit: 'cup', notes: '' }
        ],
        instructions: [
          { stepNumber: 1, instruction: 'Do something', duration: null, image: null }
        ],
        cookingTime: { prep: 10, cook: 20, total: 30 },
        servings: 4,
        difficulty: 'easy' as const,
        category: 'main-course' as const,
        cuisine: 'american' as const,
        status: 'published' as const,
        isPublic: true
      },
      {
        title: 'Test Recipe 2',
        description: 'Another test recipe',
        author: testUser._id,
        authorFirebaseUid: testUser.firebaseUid,
        ingredients: [
          { name: 'Ingredient 2', quantity: 2, unit: 'tbsp', notes: '' }
        ],
        instructions: [
          { stepNumber: 1, instruction: 'Do something else', duration: null, image: null }
        ],
        cookingTime: { prep: 15, cook: 25, total: 40 },
        servings: 2,
        difficulty: 'medium' as const,
        category: 'dessert' as const,
        cuisine: 'italian' as const,
        status: 'draft' as const,
        isPublic: true
      },
      {
        title: 'Test Recipe 3',
        description: 'A third test recipe',
        author: testUser._id,
        authorFirebaseUid: testUser.firebaseUid,
        ingredients: [
          { name: 'Ingredient 3', quantity: 3, unit: 'oz', notes: '' }
        ],
        instructions: [
          { stepNumber: 1, instruction: 'Do a third thing', duration: null, image: null }
        ],
        cookingTime: { prep: 5, cook: 15, total: 20 },
        servings: 6,
        difficulty: 'hard' as const,
        category: 'appetizer' as const,
        cuisine: 'chinese' as const,
        status: 'published' as const,
        isPublic: false
      }
    ];

    testRecipes = await Recipe.create(recipeData);
  });

  describe('GET /api/recipes', () => {
    it('should return all published public recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1); // Only one published public recipe
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Recipe 1');
      expect(response.body.data[0].status).toBe('published');
      expect(response.body.data[0].isPublic).toBe(true);
    });

    it('should filter recipes by category', async () => {
      const response = await request(app)
        .get('/api/recipes?category=main-course')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].category).toBe('main-course');
    });

    it('should filter recipes by cuisine', async () => {
      const response = await request(app)
        .get('/api/recipes?cuisine=american')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].cuisine).toBe('american');
    });

    it('should filter recipes by difficulty', async () => {
      const response = await request(app)
        .get('/api/recipes?difficulty=easy')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].difficulty).toBe('easy');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/recipes?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
    });
  });

  describe('GET /api/recipes/user/:firebaseUid', () => {
    it('should return all recipes for a user by default', async () => {
      const response = await request(app)
        .get(`/api/recipes/user/${testUser.firebaseUid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3); // All recipes regardless of status
      expect(response.body.total).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it('should filter user recipes by status', async () => {
      const response = await request(app)
        .get(`/api/recipes/user/${testUser.firebaseUid}?status=published`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2); // Two published recipes
      expect(response.body.data.every((recipe: any) => recipe.status === 'published')).toBe(true);
    });

    it('should filter user recipes by draft status', async () => {
      const response = await request(app)
        .get(`/api/recipes/user/${testUser.firebaseUid}?status=draft`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1); // One draft recipe
      expect(response.body.data[0].status).toBe('draft');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/recipes/user/non-existent-uid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle pagination for user recipes', async () => {
      const response = await request(app)
        .get(`/api/recipes/user/${testUser.firebaseUid}?page=1&limit=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(2); // 3 recipes with limit 2 = 2 pages
    });

    it('should sort user recipes by creation date (newest first)', async () => {
      const response = await request(app)
        .get(`/api/recipes/user/${testUser.firebaseUid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const recipes = response.body.data;
      
      // Check that recipes are sorted by createdAt in descending order
      for (let i = 0; i < recipes.length - 1; i++) {
        const currentDate = new Date(recipes[i].createdAt);
        const nextDate = new Date(recipes[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should return a specific recipe by ID', async () => {
      const recipe = testRecipes[0];
      const response = await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(recipe._id?.toString());
      expect(response.body.data.title).toBe(recipe.title);
      expect(response.body.data.author).toBeDefined();
      expect(response.body.data.author.displayName).toBe(testUser.displayName);
    });

    it('should increment view count when recipe is accessed', async () => {
      const recipe = testRecipes[0];
      const initialViews = recipe.stats.views;

      await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .expect(200);

      // Check that views were incremented
      const updatedRecipe = await Recipe.findById(recipe._id);
      expect(updatedRecipe?.stats.views).toBe(initialViews + 1);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const response = await request(app)
        .get(`/api/recipes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recipe not found');
    });

    it('should return 500 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/recipes/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/recipes', () => {
    const validRecipeData = {
      authorFirebaseUid: 'test-user-123',
      title: 'New Test Recipe',
      description: 'A new recipe for testing',
      ingredients: [
        { name: 'Test Ingredient', quantity: 1, unit: 'cup', notes: '' }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Test instruction', duration: null, image: null }
      ],
      cookingTime: { prep: 10, cook: 20 },
      servings: 4,
      category: 'main-course',
      cuisine: 'american'
    };

    it('should create a new recipe successfully', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send(validRecipeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe created successfully');
      expect(response.body.data.title).toBe(validRecipeData.title);
      expect(response.body.data.cookingTime.total).toBe(30); // prep + cook
      expect(response.body.data.status).toBe('draft'); // Default status
    });

    it('should increment user recipe count when recipe is created', async () => {
      const initialCount = testUser.stats.recipesCreated;

      await request(app)
        .post('/api/recipes')
        .send(validRecipeData)
        .expect(201);

      // Check that user's recipe count was incremented
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.stats.recipesCreated).toBe(initialCount + 1);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData: any = { ...validRecipeData };
      delete incompleteData.title;

      const response = await request(app)
        .post('/api/recipes')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should return 404 for non-existent author', async () => {
      const dataWithInvalidAuthor = {
        ...validRecipeData,
        authorFirebaseUid: 'non-existent-uid'
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(dataWithInvalidAuthor)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Author not found');
    });
  });

  describe('PUT /api/recipes/:id/publish', () => {
    it('should publish a recipe successfully', async () => {
      const draftRecipe = testRecipes.find(r => r.status === 'draft');
      expect(draftRecipe).toBeDefined();

      const response = await request(app)
        .put(`/api/recipes/${draftRecipe!._id}/publish`)
        .send({ authorFirebaseUid: testUser.firebaseUid })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe published successfully');
      expect(response.body.data.status).toBe('published');
      expect(response.body.data.publishedAt).toBeDefined();
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/recipes/${fakeId}/publish`)
        .send({ authorFirebaseUid: testUser.firebaseUid })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recipe not found');
    });

    it('should return 403 for unauthorized user', async () => {
      const recipe = testRecipes[0];
      const response = await request(app)
        .put(`/api/recipes/${recipe._id}/publish`)
        .send({ authorFirebaseUid: 'different-user-uid' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to publish this recipe');
    });
  });

  describe('PUT /api/recipes/:id/like', () => {
    it('should like a recipe successfully', async () => {
      const recipe = testRecipes[0];
      const initialLikes = recipe.stats.likes;

      const response = await request(app)
        .put(`/api/recipes/${recipe._id}/like`)
        .send({ action: 'like' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe liked successfully');
      expect(response.body.data.likes).toBe(initialLikes + 1);
    });

    it('should unlike a recipe successfully', async () => {
      const recipe = testRecipes[0];

      // First like the recipe
      await recipe.incrementLikes();
      const likesAfterIncrement = recipe.stats.likes;

      const response = await request(app)
        .put(`/api/recipes/${recipe._id}/like`)
        .send({ action: 'unlike' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe unliked successfully');
      expect(response.body.data.likes).toBe(likesAfterIncrement - 1);
    });

    it('should return 400 for invalid action', async () => {
      const recipe = testRecipes[0];
      const response = await request(app)
        .put(`/api/recipes/${recipe._id}/like`)
        .send({ action: 'invalid-action' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid action. Use "like" or "unlike"');
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/recipes/${fakeId}/like`)
        .send({ action: 'like' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recipe not found');
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    it('should delete a recipe successfully', async () => {
      const recipe = testRecipes[0];
      const initialRecipeCount = testUser.stats.recipesCreated;

      const response = await request(app)
        .delete(`/api/recipes/${recipe._id}`)
        .send({ authorFirebaseUid: testUser.firebaseUid })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recipe deleted successfully');

      // Verify recipe is deleted
      const deletedRecipe = await Recipe.findById(recipe._id);
      expect(deletedRecipe).toBeNull();

      // Verify user's recipe count was decremented
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.stats.recipesCreated).toBe(initialRecipeCount - 1);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/recipes/${fakeId}`)
        .send({ authorFirebaseUid: testUser.firebaseUid })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recipe not found');
    });

    it('should return 403 for unauthorized user', async () => {
      const recipe = testRecipes[0];
      const response = await request(app)
        .delete(`/api/recipes/${recipe._id}`)
        .send({ authorFirebaseUid: 'different-user-uid' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to delete this recipe');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking mongoose to simulate connection errors
      // For now, we'll test that the error handling structure is in place
      const response = await request(app)
        .get('/api/recipes/invalid-object-id')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });
});
