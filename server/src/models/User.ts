import mongoose, { Schema, Model } from 'mongoose';
import type { 
  IUser, 
  IUserDocument, 
  DietaryRestriction, 
  CuisineType, 
  SkillLevel 
} from '../types/index.js';

// User schema that integrates with Firebase Authentication
const userSchema = new Schema<IUserDocument>({
  // Firebase UID as primary identifier
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic user information (synced from Firebase)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  photoURL: {
    type: String,
    default: null
  },
  
  // Email verification status (synced from Firebase)
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Authentication provider information
  providers: [{
    providerId: {
      type: String,
      required: true,
      enum: ['password', 'google.com', 'facebook.com', 'twitter.com']
    },
    uid: String,
    email: String
  }],
  
  // User profile information
  profile: {
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    
    location: {
      type: String,
      maxlength: 100,
      default: ''
    },
    
    website: {
      type: String,
      maxlength: 200,
      default: ''
    },
    
    // Cooking preferences and dietary restrictions
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'halal', 'kosher'] as DietaryRestriction[]
    }],
    
    cuisinePreferences: [{
      type: String,
      enum: ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'mediterranean', 'american', 'korean'] as CuisineType[]
    }],
    
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'] as SkillLevel[],
      default: 'beginner'
    }
  },
  
  // User statistics
  stats: {
    recipesCreated: {
      type: Number,
      default: 0
    },
    
    recipesLiked: {
      type: Number,
      default: 0
    },
    
    followers: {
      type: Number,
      default: 0
    },
    
    following: {
      type: Number,
      default: 0
    }
  },
  
  // User preferences
  preferences: {
    isPublic: {
      type: Boolean,
      default: true
    },
    
    allowFollowers: {
      type: Boolean,
      default: true
    },
    
    emailNotifications: {
      type: Boolean,
      default: true
    },
    
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  collection: 'users'
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ 'profile.skillLevel': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for user's full name
userSchema.virtual('fullName').get(function(this: IUserDocument) {
  return this.displayName;
});

// Instance methods
userSchema.methods.updateLastLogin = function(this: IUserDocument): Promise<IUserDocument> {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.incrementRecipeCount = function(this: IUserDocument): Promise<IUserDocument> {
  this.stats.recipesCreated += 1;
  return this.save();
};

userSchema.methods.decrementRecipeCount = function(this: IUserDocument): Promise<IUserDocument> {
  this.stats.recipesCreated = Math.max(0, this.stats.recipesCreated - 1);
  return this.save();
};

// Static methods interface
interface IUserModel extends Model<IUserDocument> {
  findByFirebaseUid(firebaseUid: string): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  createFromFirebaseUser(firebaseUser: any): Promise<IUserDocument>;
}

// Static methods
userSchema.statics.findByFirebaseUid = function(firebaseUid: string): Promise<IUserDocument | null> {
  return this.findOne({ firebaseUid });
};

userSchema.statics.findByEmail = function(email: string): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.createFromFirebaseUser = function(firebaseUser: any): Promise<IUserDocument> {
  const userData = {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    providers: firebaseUser.providerData.map((provider: any) => ({
      providerId: provider.providerId,
      uid: provider.uid,
      email: provider.email
    }))
  };
  
  return this.create(userData);
};

// Pre-save middleware
userSchema.pre('save', function(this: IUserDocument, next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
