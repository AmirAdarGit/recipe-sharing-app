/**
 * Integration tests for the Recipe API endpoints
 * These tests run against the actual API server
 */

import request from 'supertest';

const API_BASE_URL = 'http://localhost:5000';

// Test data
const TEST_USER_UID = 'voaL3ljMTpaY89pT1MfDpktR8sE2';

describe('Recipe API Integration Tests', () => {
  // Skip these tests if server is not running
  const isServerRunning = async () => {
    try {
      await request(API_BASE_URL).get('/health').timeout(1000);
      return true;
    } catch {
      return false;
    }
  };

  beforeAll(async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.log('⚠️  Server not running on localhost:5000, skipping integration tests');
    }
  });

  describe('GET /api/recipes/user/:firebaseUid', () => {
    it('should return user recipes successfully', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get(`/api/recipes/user/${TEST_USER_UID}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBeGreaterThanOrEqual(0);

      console.log(`✅ Found ${response.body.count} recipes for user ${TEST_USER_UID}`);
    });

    it('should filter recipes by status', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      // Test with published status
      const publishedResponse = await request(API_BASE_URL)
        .get(`/api/recipes/user/${TEST_USER_UID}?status=published`)
        .expect(200);

      expect(publishedResponse.body.success).toBe(true);
      expect(Array.isArray(publishedResponse.body.data)).toBe(true);

      // Test with draft status
      const draftResponse = await request(API_BASE_URL)
        .get(`/api/recipes/user/${TEST_USER_UID}?status=draft`)
        .expect(200);

      expect(draftResponse.body.success).toBe(true);
      expect(Array.isArray(draftResponse.body.data)).toBe(true);

      console.log(`✅ Published: ${publishedResponse.body.count}, Draft: ${draftResponse.body.count}`);
    });

    it('should handle pagination', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get(`/api/recipes/user/${TEST_USER_UID}?page=1&limit=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.page).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(2);

      console.log(`✅ Pagination working: page ${response.body.page}, limit 2, got ${response.body.data.length} items`);
    });

    it('should return 404 for non-existent user', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get('/api/recipes/user/non-existent-uid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');

      console.log('✅ Non-existent user handled correctly');
    });
  });

  describe('GET /api/recipes', () => {
    it('should return public recipes', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get('/api/recipes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);

      console.log(`✅ Found ${response.body.count} public recipes`);
    });

    it('should filter by category', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get('/api/recipes?category=main-course')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // If there are results, verify they have the correct category
      if (response.body.data.length > 0) {
        response.body.data.forEach((recipe: any) => {
          expect(recipe.category).toBe('main-course');
        });
      }

      console.log(`✅ Category filter working: found ${response.body.count} main-course recipes`);
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      console.log('✅ Health check passed');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid recipe ID format', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const response = await request(API_BASE_URL)
        .get('/api/recipes/invalid-id')
        .expect(500);

      expect(response.body.success).toBe(false);
      console.log('✅ Invalid ID format handled correctly');
    });

    it('should handle non-existent recipe ID', async () => {
      const serverRunning = await isServerRunning();
      if (!serverRunning) {
        console.log('Skipping test - server not running');
        return;
      }

      const validButNonExistentId = '507f1f77bcf86cd799439011';
      const response = await request(API_BASE_URL)
        .get(`/api/recipes/${validButNonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recipe not found');
      console.log('✅ Non-existent recipe ID handled correctly');
    });
  });
});
