import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users - Get all users (for testing)
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/users/:firebaseUid - Get user by Firebase UID
router.get('/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST /api/users - Create or update user from Firebase Auth
router.post('/', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, emailVerified, providerData } = req.body;
    
    // Validate required fields
    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and email are required'
      });
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
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or Firebase UID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating/updating user',
      error: error.message
    });
  }
});

// PUT /api/users/:firebaseUid/profile - Update user profile
router.put('/:firebaseUid/profile', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { bio, location, website, dietaryRestrictions, cuisinePreferences, skillLevel } = req.body;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
});

// PUT /api/users/:firebaseUid/login - Update last login time
router.put('/:firebaseUid/login', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.updateLastLogin();
    
    res.json({
      success: true,
      message: 'Login time updated successfully',
      data: { lastLoginAt: user.lastLoginAt }
    });
  } catch (error) {
    console.error('Error updating login time:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating login time',
      error: error.message
    });
  }
});

// DELETE /api/users/:firebaseUid - Delete user (soft delete by setting isActive to false)
router.delete('/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

export default router;
