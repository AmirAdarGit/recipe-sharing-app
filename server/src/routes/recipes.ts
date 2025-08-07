import express, { Request, Response } from 'express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  CreateRecipeRequest, 
  RecipeQueryParams,
  LikeRecipeRequest,
  PublishRecipeRequest,
  DeleteRecipeRequest,
  IRecipeDocument 
} from '../types/index.js';

const router = express.Router();

// GET /api/recipes - Get all published recipes
router.get('/', async (req: Request<{}, PaginatedResponse<IRecipeDocument>, {}, RecipeQueryParams>, res: Response<PaginatedResponse<IRecipeDocument>>) => {
  try {
    const { page = '1', limit = '20', category, cuisine, difficulty, search } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Build query
    const query: any = { status: 'published', isPublic: true };
    
    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;
    if (difficulty) query.difficulty = difficulty;
    
    let recipes: IRecipeDocument[];
    
    if (search) {
      // Text search
      recipes = await Recipe.find({
        ...query,
        $text: { $search: search }
      })
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    } else {
      // Regular query
      recipes = await Recipe.find(query)
        .populate('author', 'displayName photoURL')
        .select('-__v')
        .sort({ publishedAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    }
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      count: recipes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: recipes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: errorMessage,
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
      data: []
    });
  }
});

// GET /api/recipes/user/:firebaseUid - Get recipes by user (moved before /:id to avoid conflicts)
router.get('/user/:firebaseUid', async (
  req: Request<{ firebaseUid: string }, PaginatedResponse<IRecipeDocument>, {}, RecipeQueryParams>,
  res: Response<PaginatedResponse<IRecipeDocument>>
): Promise<void> => {
  try {
    const { firebaseUid } = req.params;
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Find user first
    const user = await User.findByFirebaseUid(firebaseUid);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        count: 0,
        total: 0,
        page: pageNum,
        pages: 0,
        data: []
      });
      return;
    }

    // Build query - include all recipes by default, filter by status if specified
    const query: any = { author: user._id };
    if (status) {
      query.status = status;
    }

    console.log(`🔍 Fetching recipes for user ${firebaseUid} with query:`, query);

    const recipes = await Recipe.find(query)
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Recipe.countDocuments(query);

    console.log(`📊 Found ${recipes.length} recipes (total: ${total}) for user ${firebaseUid}`);

    res.json({
      success: true,
      count: recipes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: recipes
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching user recipes',
      error: errorMessage,
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
      data: []
    });
  }
});

// GET /api/recipes/:id - Get recipe by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<IRecipeDocument>>): Promise<void> => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id)
      .populate('author', 'displayName photoURL profile.bio')
      .select('-__v');

    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Increment view count
    await recipe.incrementViews();

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe',
      error: errorMessage
    });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', async (req: Request<{}, ApiResponse<IRecipeDocument>, CreateRecipeRequest>, res: Response<ApiResponse<IRecipeDocument>>): Promise<void> => {
  try {
    const { authorFirebaseUid, title, description, ingredients, instructions, cookingTime, servings, difficulty, category, cuisine, tags, dietaryInfo, nutrition } = req.body;
    
    // Validate required fields
    if (!authorFirebaseUid || !title || !description || !ingredients || !instructions || !cookingTime || !servings || !category || !cuisine) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Find author
    const author = await User.findByFirebaseUid(authorFirebaseUid);
    if (!author) {
      res.status(404).json({
        success: false,
        message: 'Author not found'
      });
      return;
    }
    
    // Create recipe
    const recipeData = {
      author: author._id,
      authorFirebaseUid,
      title,
      description,
      ingredients,
      instructions,
      cookingTime: {
        ...cookingTime,
        total: cookingTime.prep + cookingTime.cook
      },
      servings,
      difficulty: difficulty || 'medium',
      category,
      cuisine,
      tags: tags || [],
      dietaryInfo: dietaryInfo || {},
      nutrition: nutrition || {},
      images: []
    };
    
    const recipe = await Recipe.create(recipeData);
    
    // Increment user's recipe count
    await author.incrementRecipeCount();
    
    // Populate author info for response
    await recipe.populate('author', 'displayName photoURL');
    
    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: errorMessage
    });
  }
});

// PUT /api/recipes/:id/publish - Publish recipe
router.put('/:id/publish', async (
  req: Request<{ id: string }, ApiResponse<IRecipeDocument>, PublishRecipeRequest>,
  res: Response<ApiResponse<IRecipeDocument>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { authorFirebaseUid } = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Verify ownership
    if (recipe.authorFirebaseUid !== authorFirebaseUid) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to publish this recipe'
      });
      return;
    }
    
    await recipe.publish();
    
    res.json({
      success: true,
      message: 'Recipe published successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Error publishing recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error publishing recipe',
      error: errorMessage
    });
  }
});

// PUT /api/recipes/:id/like - Like/unlike recipe
router.put('/:id/like', async (
  req: Request<{ id: string }, ApiResponse<{ likes: number }>, LikeRecipeRequest>,
  res: Response<ApiResponse<{ likes: number }>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    if (action === 'like') {
      await recipe.incrementLikes();
    } else if (action === 'unlike') {
      await recipe.decrementLikes();
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "like" or "unlike"'
      });
      return;
    }
    
    res.json({
      success: true,
      message: `Recipe ${action}d successfully`,
      data: { likes: recipe.stats.likes }
    });
  } catch (error) {
    console.error('Error updating recipe likes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating recipe likes',
      error: errorMessage
    });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', async (
  req: Request<{ id: string }, ApiResponse, DeleteRecipeRequest>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { authorFirebaseUid } = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
      return;
    }

    // Verify ownership
    if (recipe.authorFirebaseUid !== authorFirebaseUid) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
      return;
    }
    
    await Recipe.findByIdAndDelete(id);
    
    // Decrement user's recipe count
    const author = await User.findByFirebaseUid(authorFirebaseUid);
    if (author) {
      await author.decrementRecipeCount();
    }
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe',
      error: errorMessage
    });
  }
});

export default router;
