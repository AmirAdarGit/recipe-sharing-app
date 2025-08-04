import mongoose, { Schema, Model, Types } from 'mongoose';
import type { 
  IRecipe, 
  IRecipeDocument, 
  Difficulty, 
  RecipeCategory, 
  CuisineType, 
  RecipeStatus 
} from '../types/index.js';

// Recipe schema
const recipeSchema = new Schema<IRecipeDocument>({
  // Recipe basic information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Author information (linked to User model)
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  authorFirebaseUid: {
    type: String,
    required: true,
    index: true
  },
  
  // Recipe images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Ingredients
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  
  // Cooking instructions
  instructions: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number, // in minutes
      default: null
    },
    image: {
      type: String,
      default: null
    }
  }],
  
  // Recipe metadata
  cookingTime: {
    prep: {
      type: Number, // in minutes
      required: true,
      min: 0
    },
    cook: {
      type: Number, // in minutes
      required: true,
      min: 0
    },
    total: {
      type: Number, // in minutes
      required: true,
      min: 0
    }
  },
  
  servings: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'] as Difficulty[],
    default: 'medium'
  },
  
  // Categories and tags
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main-course', 'dessert', 'beverage', 'snack', 'breakfast', 'lunch', 'dinner', 'side-dish'] as RecipeCategory[],
    index: true
  },
  
  cuisine: {
    type: String,
    required: true,
    enum: ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'mediterranean', 'american', 'korean', 'other'] as CuisineType[],
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Dietary information
  dietaryInfo: {
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isGlutenFree: {
      type: Boolean,
      default: false
    },
    isDairyFree: {
      type: Boolean,
      default: false
    },
    isNutFree: {
      type: Boolean,
      default: false
    },
    isKeto: {
      type: Boolean,
      default: false
    },
    isPaleo: {
      type: Boolean,
      default: false
    }
  },
  
  // Nutritional information (optional)
  nutrition: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    },
    sugar: {
      type: Number,
      min: 0
    }
  },
  
  // Recipe statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Recipe status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'] as RecipeStatus[],
    default: 'draft',
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'recipes'
});

// Indexes for better query performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ author: 1, status: 1 });
recipeSchema.index({ category: 1, cuisine: 1 });
recipeSchema.index({ 'stats.rating.average': -1 });
recipeSchema.index({ 'stats.likes': -1 });
recipeSchema.index({ publishedAt: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ 'cookingTime.total': 1 });

// Virtual for total cooking time calculation
recipeSchema.virtual('totalTime').get(function(this: IRecipeDocument) {
  return this.cookingTime.prep + this.cookingTime.cook;
});

// Instance methods
recipeSchema.methods.incrementViews = function(this: IRecipeDocument): Promise<IRecipeDocument> {
  this.stats.views += 1;
  return this.save();
};

recipeSchema.methods.incrementLikes = function(this: IRecipeDocument): Promise<IRecipeDocument> {
  this.stats.likes += 1;
  return this.save();
};

recipeSchema.methods.decrementLikes = function(this: IRecipeDocument): Promise<IRecipeDocument> {
  this.stats.likes = Math.max(0, this.stats.likes - 1);
  return this.save();
};

recipeSchema.methods.publish = function(this: IRecipeDocument): Promise<IRecipeDocument> {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

recipeSchema.methods.unpublish = function(this: IRecipeDocument): Promise<IRecipeDocument> {
  this.status = 'draft';
  this.publishedAt = undefined;
  return this.save();
};

// Static methods interface
interface IRecipeModel extends Model<IRecipeDocument> {
  findPublished(): Promise<IRecipeDocument[]>;
  findByAuthor(authorId: Types.ObjectId): Promise<IRecipeDocument[]>;
  findByCategory(category: RecipeCategory): Promise<IRecipeDocument[]>;
  findByCuisine(cuisine: CuisineType): Promise<IRecipeDocument[]>;
  searchRecipes(query: string): Promise<IRecipeDocument[]>;
}

// Static methods
recipeSchema.statics.findPublished = function(): Promise<IRecipeDocument[]> {
  return this.find({ status: 'published', isPublic: true });
};

recipeSchema.statics.findByAuthor = function(authorId: Types.ObjectId): Promise<IRecipeDocument[]> {
  return this.find({ author: authorId });
};

recipeSchema.statics.findByCategory = function(category: RecipeCategory): Promise<IRecipeDocument[]> {
  return this.find({ category, status: 'published', isPublic: true });
};

recipeSchema.statics.findByCuisine = function(cuisine: CuisineType): Promise<IRecipeDocument[]> {
  return this.find({ cuisine, status: 'published', isPublic: true });
};

recipeSchema.statics.searchRecipes = function(query: string): Promise<IRecipeDocument[]> {
  return this.find({
    $text: { $search: query },
    status: 'published',
    isPublic: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware
recipeSchema.pre('save', function(this: IRecipeDocument, next) {
  // Calculate total cooking time
  this.cookingTime.total = this.cookingTime.prep + this.cookingTime.cook;
  
  // Update timestamp
  this.updatedAt = new Date();
  
  // Set published date if publishing
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Export the model
const Recipe = mongoose.model<IRecipeDocument, IRecipeModel>('Recipe', recipeSchema);

export default Recipe;
