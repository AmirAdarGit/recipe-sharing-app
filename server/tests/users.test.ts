import request from 'supertest';
import express from 'express';
import cors from 'cors';
import User from '../src/models/User';
import userRoutes from '../src/routes/users';
import type { IUserDocument } from '../src/types/index';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API Endpoints', () => {
  let testUser: IUserDocument;

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
      }],
      profile: {
        bio: 'Test user bio',
        location: 'Test City',
        website: 'https://test.com',
        dietaryRestrictions: ['vegetarian'],
        cuisinePreferences: ['italian', 'mexican'],
        skillLevel: 'intermediate'
      }
    });
  });

  describe('GET /api/users/:firebaseUid', () => {
    it('should return user by Firebase UID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.firebaseUid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firebaseUid).toBe(testUser.firebaseUid);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.displayName).toBe(testUser.displayName);
      expect(response.body.data.profile.bio).toBe(testUser.profile.bio);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-uid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    const validUserData = {
      firebaseUid: 'new-user-123',
      email: 'newuser@example.com',
      displayName: 'New User',
      emailVerified: true,
      providers: [{
        providerId: 'google.com',
        uid: 'google-uid-123',
        email: 'newuser@example.com'
      }]
    };

    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.firebaseUid).toBe(validUserData.firebaseUid);
      expect(response.body.data.email).toBe(validUserData.email);
      expect(response.body.data.displayName).toBe(validUserData.displayName);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData: any = { ...validUserData };
      delete incompleteData.email;

      const response = await request(app)
        .post('/api/users')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should return 409 for duplicate Firebase UID', async () => {
      const duplicateData = {
        ...validUserData,
        firebaseUid: testUser.firebaseUid,
        email: 'different@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 409 for duplicate email', async () => {
      const duplicateData = {
        ...validUserData,
        firebaseUid: 'different-uid',
        email: testUser.email
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('PUT /api/users/:firebaseUid', () => {
    const updateData = {
      displayName: 'Updated User Name',
      profile: {
        bio: 'Updated bio',
        location: 'Updated City',
        website: 'https://updated.com',
        dietaryRestrictions: ['vegan', 'gluten-free'],
        cuisinePreferences: ['chinese', 'thai'],
        skillLevel: 'advanced'
      }
    };

    it('should update user successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser.firebaseUid}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.displayName).toBe(updateData.displayName);
      expect(response.body.data.profile.bio).toBe(updateData.profile.bio);
      expect(response.body.data.profile.skillLevel).toBe(updateData.profile.skillLevel);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/non-existent-uid')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should handle partial updates', async () => {
      const partialUpdate = {
        displayName: 'Partially Updated Name'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.firebaseUid}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe(partialUpdate.displayName);
      // Original profile should remain unchanged
      expect(response.body.data.profile.bio).toBe(testUser.profile.bio);
    });
  });

  describe('DELETE /api/users/:firebaseUid', () => {
    it('should delete user successfully', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser.firebaseUid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await User.findById(testUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/non-existent-uid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('User Model Methods', () => {
    it('should increment recipe count', async () => {
      const initialCount = testUser.stats.recipesCreated;
      await testUser.incrementRecipeCount();

      expect(testUser.stats.recipesCreated).toBe(initialCount + 1);
    });

    it('should decrement recipe count', async () => {
      testUser.stats.recipesCreated = 5;
      await testUser.save();

      await testUser.decrementRecipeCount();
      expect(testUser.stats.recipesCreated).toBe(4);
    });

    it('should not decrement recipe count below zero', async () => {
      testUser.stats.recipesCreated = 0;
      await testUser.save();

      await testUser.decrementRecipeCount();
      expect(testUser.stats.recipesCreated).toBe(0);
    });

    it('should update last login time', async () => {
      const originalLoginTime = testUser.lastLoginAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await testUser.updateLastLogin();
      expect(testUser.lastLoginAt.getTime()).toBeGreaterThan(originalLoginTime.getTime());
    });
  });

  describe('User Static Methods', () => {
    it('should find user by Firebase UID', async () => {
      const foundUser = await User.findByFirebaseUid(testUser.firebaseUid);
      expect(foundUser).toBeDefined();
      expect(foundUser?.firebaseUid).toBe(testUser.firebaseUid);
    });

    it('should find user by email', async () => {
      const foundUser = await User.findByEmail(testUser.email);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(testUser.email);
    });

    it('should handle case-insensitive email search', async () => {
      const foundUser = await User.findByEmail(testUser.email.toUpperCase());
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(testUser.email);
    });

    it('should return null for non-existent Firebase UID', async () => {
      const foundUser = await User.findByFirebaseUid('non-existent-uid');
      expect(foundUser).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await User.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });
});
