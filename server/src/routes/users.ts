import express, { Request, Response } from 'express';
import User from '../models/User.js';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  CreateUserRequest, 
  UpdateUserProfileRequest,
  IUserDocument 
} from '../types/index.js';

const router = express.Router();

// GET /api/users - Get all users (for testing)
router.get('/', async (req: Request, res: Response<PaginatedResponse<IUserDocument>>) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: users.length,
      total: users.length,
      page: 1,
      pages: 1,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: errorMessage,
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
      data: []
    });
  }
});

// GET /api/users/:firebaseUid - Get user by Firebase UID
router.get('/:firebaseUid', async (req: Request<{ firebaseUid: string }>, res: Response<ApiResponse<IUserDocument>>): Promise<void> => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: errorMessage
    });
  }
});

// POST /api/users - Create or update user from Firebase Auth
router.post('/', async (req: Request<{}, ApiResponse<IUserDocument>, CreateUserRequest>, res: Response<ApiResponse<IUserDocument>>): Promise<void> => {
  try {
    const { firebaseUid, email, displayName, photoURL, emailVerified, providerData } = req.body;
    
    // Validate required fields
    if (!firebaseUid || !email) {
      res.status(400).json({
        success: false,
        message: 'Firebase UID and email are required'
      });
      return;
    }
    
    // Check if user already exists
    let user = await User.findByFirebaseUid(firebaseUid);
    
    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      user.emailVerified = emailVerified;
      user.lastLoginAt = new Date();
      
      if (providerData && Array.isArray(providerData)) {
        user.providers = providerData.map(provider => ({
          providerId: provider.providerId,
          uid: provider.uid,
          email: provider.email
        }));
      }
      
      await user.save();
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } else {
      // Create new user
      const userData = {
        firebaseUid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL,
        emailVerified,
        providers: providerData ? providerData.map(provider => ({
          providerId: provider.providerId,
          uid: provider.uid,
          email: provider.email
        })) : []
      };
      
      user = await User.create(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User with this email or Firebase UID already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating/updating user',
      error: errorMessage
    });
  }
});

// PUT /api/users/:firebaseUid/profile - Update user profile
router.put('/:firebaseUid/profile', async (
  req: Request<{ firebaseUid: string }, ApiResponse<IUserDocument>, UpdateUserProfileRequest>,
  res: Response<ApiResponse<IUserDocument>>
): Promise<void> => {
  try {
    const { firebaseUid } = req.params;
    const { bio, location, website, dietaryRestrictions, cuisinePreferences, skillLevel } = req.body;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Update profile fields
    if (bio !== undefined) user.profile.bio = bio;
    if (location !== undefined) user.profile.location = location;
    if (website !== undefined) user.profile.website = website;
    if (dietaryRestrictions !== undefined) user.profile.dietaryRestrictions = dietaryRestrictions;
    if (cuisinePreferences !== undefined) user.profile.cuisinePreferences = cuisinePreferences;
    if (skillLevel !== undefined) user.profile.skillLevel = skillLevel;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: errorMessage
    });
  }
});

// PUT /api/users/:firebaseUid/login - Update last login time
router.put('/:firebaseUid/login', async (
  req: Request<{ firebaseUid: string }>,
  res: Response<ApiResponse<{ lastLoginAt: Date }>>
): Promise<void> => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    await user.updateLastLogin();
    
    res.json({
      success: true,
      message: 'Login time updated successfully',
      data: { lastLoginAt: user.lastLoginAt }
    });
  } catch (error) {
    console.error('Error updating login time:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating login time',
      error: errorMessage
    });
  }
});

// DELETE /api/users/:firebaseUid - Delete user (soft delete by setting isActive to false)
router.delete('/:firebaseUid', async (
  req: Request<{ firebaseUid: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: errorMessage
    });
  }
});

export default router;
