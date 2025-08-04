import express from 'express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/recipes - Get all published recipes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, cuisine, difficulty, search } = req.query;
    
    // Build query
    const query = { status: 'published', isPublic: true };
    
    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;
    if (difficulty) query.difficulty = difficulty;
    
    let recipes;
    
    if (search) {
      // Text search
      recipes = await Recipe.find({
        ...query,
        $text: { $search: search }
      })
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    } else {
      // Regular query
      recipes = await Recipe.find(query)
        .populate('author', 'displayName photoURL')
        .select('-__v')
        .sort({ publishedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: recipes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message
    });
  }
});

// GET /api/recipes/:id - Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findById(id)
      .populate('author', 'displayName photoURL profile.bio')
      .select('-__v');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Increment view count
    await recipe.incrementViews();
    
    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipe',
      error: error.message
    });
  }
});

// GET /api/recipes/user/:firebaseUid - Get recipes by user
router.get('/user/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { page = 1, limit = 20, status = 'published' } = req.query;
    
    // Find user first
    const user = await User.findByFirebaseUid(firebaseUid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const query = { author: user._id };
    if (status) query.status = status;
    
    const recipes = await Recipe.find(query)
      .populate('author', 'displayName photoURL')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      count: recipes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: recipes
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user recipes',
      error: error.message
    });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', async (req, res) => {
  try {
    const { authorFirebaseUid, title, description, ingredients, instructions, cookingTime, servings, difficulty, category, cuisine, tags, dietaryInfo, nutrition } = req.body;
    
    // Validate required fields
    if (!authorFirebaseUid || !title || !description || !ingredients || !instructions || !cookingTime || !servings || !category || !cuisine) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find author
    const author = await User.findByFirebaseUid(authorFirebaseUid);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    // Create recipe
    const recipeData = {
      author: author._id,
      authorFirebaseUid,
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty: difficulty || 'medium',
      category,
      cuisine,
      tags: tags || [],
      dietaryInfo: dietaryInfo || {},
      nutrition: nutrition || {}
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
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: error.message
    });
  }
});

// PUT /api/recipes/:id/publish - Publish recipe
router.put('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorFirebaseUid } = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Verify ownership
    if (recipe.authorFirebaseUid !== authorFirebaseUid) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this recipe'
      });
    }
    
    await recipe.publish();
    
    res.json({
      success: true,
      message: 'Recipe published successfully',
      data: recipe
    });
  } catch (error) {
    console.error('Error publishing recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing recipe',
      error: error.message
    });
  }
});

// PUT /api/recipes/:id/like - Like/unlike recipe
router.put('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    if (action === 'like') {
      await recipe.incrementLikes();
    } else if (action === 'unlike') {
      await recipe.decrementLikes();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "like" or "unlike"'
      });
    }
    
    res.json({
      success: true,
      message: `Recipe ${action}d successfully`,
      data: { likes: recipe.stats.likes }
    });
  } catch (error) {
    console.error('Error updating recipe likes:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating recipe likes',
      error: error.message
    });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorFirebaseUid } = req.body;
    
    const recipe = await Recipe.findById(id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Verify ownership
    if (recipe.authorFirebaseUid !== authorFirebaseUid) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error deleting recipe',
      error: error.message
    });
  }
});

export default router;
