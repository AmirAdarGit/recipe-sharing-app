import { Document, Types } from 'mongoose';

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count: number;
  total: number;
  page: number;
  pages: number;
}

// User Types
export interface IUserProfile {
  bio: string;
  location: string;
  website: string;
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: CuisineType[];
  skillLevel: SkillLevel;
}

export interface IUserStats {
  recipesCreated: number;
  recipesLiked: number;
  followers: number;
  following: number;
}

export interface IUserPreferences {
  isPublic: boolean;
  allowFollowers: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface IProvider {
  providerId: 'password' | 'google.com' | 'facebook.com' | 'twitter.com';
  uid: string;
  email: string;
}

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  providers: IProvider[];
  profile: IUserProfile;
  stats: IUserStats;
  preferences: IUserPreferences;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  updateLastLogin(): Promise<IUserDocument>;
  incrementRecipeCount(): Promise<IUserDocument>;
  decrementRecipeCount(): Promise<IUserDocument>;
}

// Recipe Types
export interface IIngredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface IInstruction {
  stepNumber: number;
  instruction: string;
  duration?: number; // in minutes
  image?: string;
}

export interface ICookingTime {
  prep: number; // in minutes
  cook: number; // in minutes
  total: number; // in minutes
}

export interface IRecipeImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface IDietaryInfo {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isKeto: boolean;
  isPaleo: boolean;
}

export interface INutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export interface IRecipeStats {
  views: number;
  likes: number;
  saves: number;
  comments: number;
  rating: {
    average: number;
    count: number;
  };
}

export interface IRecipe {
  title: string;
  description: string;
  author: Types.ObjectId;
  authorFirebaseUid: string;
  images: IRecipeImage[];
  ingredients: IIngredient[];
  instructions: IInstruction[];
  cookingTime: ICookingTime;
  servings: number;
  difficulty: Difficulty;
  category: RecipeCategory;
  cuisine: CuisineType;
  tags: string[];
  dietaryInfo: IDietaryInfo;
  nutrition: INutrition;
  stats: IRecipeStats;
  status: RecipeStatus;
  isPublic: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipeDocument extends IRecipe, Document {
  incrementViews(): Promise<IRecipeDocument>;
  incrementLikes(): Promise<IRecipeDocument>;
  decrementLikes(): Promise<IRecipeDocument>;
  publish(): Promise<IRecipeDocument>;
  unpublish(): Promise<IRecipeDocument>;
}

// Enum Types
export type DietaryRestriction = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'keto' 
  | 'paleo' 
  | 'halal' 
  | 'kosher';

export type CuisineType = 
  | 'italian' 
  | 'chinese' 
  | 'mexican' 
  | 'indian' 
  | 'japanese' 
  | 'french' 
  | 'thai' 
  | 'mediterranean' 
  | 'american' 
  | 'korean' 
  | 'other';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type RecipeCategory = 
  | 'appetizer' 
  | 'main-course' 
  | 'dessert' 
  | 'beverage' 
  | 'snack' 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'side-dish';

export type RecipeStatus = 'draft' | 'published' | 'archived';

// Request/Response Types
export interface CreateUserRequest {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  providerData?: IProvider[];
}

export interface UpdateUserProfileRequest {
  bio?: string;
  location?: string;
  website?: string;
  dietaryRestrictions?: DietaryRestriction[];
  cuisinePreferences?: CuisineType[];
  skillLevel?: SkillLevel;
}

export interface CreateRecipeRequest {
  authorFirebaseUid: string;
  title: string;
  description: string;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  cookingTime: Omit<ICookingTime, 'total'>;
  servings: number;
  difficulty?: Difficulty;
  category: RecipeCategory;
  cuisine: CuisineType;
  tags?: string[];
  dietaryInfo?: Partial<IDietaryInfo>;
  nutrition?: INutrition;
}

export interface RecipeQueryParams {
  page?: string;
  limit?: string;
  category?: RecipeCategory;
  cuisine?: CuisineType;
  difficulty?: Difficulty;
  search?: string;
  status?: RecipeStatus;
}

export interface LikeRecipeRequest {
  action: 'like' | 'unlike';
}

export interface PublishRecipeRequest {
  authorFirebaseUid: string;
}

export interface DeleteRecipeRequest {
  authorFirebaseUid: string;
}

// Database Connection Types
export interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    retryWrites: boolean;
    retryReads: boolean;
    ssl: boolean;
    authSource: string;
    appName: string;
  };
}

// Environment Types
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  HOST: string;
  MONGODB_URI: string;
  MONGODB_TEST_URI?: string;
  CORS_ORIGIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_CLIENT_ID: string;
  FIREBASE_AUTH_URI: string;
  FIREBASE_TOKEN_URI: string;
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: string;
  FIREBASE_CLIENT_X509_CERT_URL: string;
}
