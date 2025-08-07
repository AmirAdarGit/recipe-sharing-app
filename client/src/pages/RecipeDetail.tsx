import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/api';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: Array<{
    step: number;
    description: string;
  }>;
  cookingTime: {
    prep: number;
    cook: number;
    total: number;
  };
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine: string;
  tags: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  equipment?: string[];
  notes?: string;
  isPublic: boolean;
  authorFirebaseUid: string;
  authorDisplayName?: string;
  stats: {
    views: number;
    likes: number;
    saves: number;
  };
  createdAt: string;
  updatedAt: string;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError('Recipe ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
        
        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const data = await response.json();
        setRecipe(data.data);
        
        // Update view count
        if (user) {
          const idToken = await user.getIdToken();
          fetch(`${API_BASE_URL}/api/recipes/${id}/view`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }).catch(console.error);
        }
        
        // Check if user has liked/saved this recipe
        if (user) {
          checkUserInteractions();
        }
        
      } catch (err) {
        setError('Failed to load recipe');
        console.error('Error fetching recipe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const checkUserInteractions = async () => {
      if (!user) return;
      
      try {
        // const idToken = await user.getIdToken();
        // Check if liked and saved - implement these endpoints as needed
        // const [likeRes, saveRes] = await Promise.all([
        //   fetch(`${API_BASE_URL}/api/recipes/${id}/like/status`, { headers: { 'Authorization': `Bearer ${idToken}` }}),
        //   fetch(`${API_BASE_URL}/api/recipes/${id}/save/status`, { headers: { 'Authorization': `Bearer ${idToken}` }})
        // ]);
        // setIsLiked(likeRes.ok ? await likeRes.json() : false);
        // setIsSaved(saveRes.ok ? await saveRes.json() : false);
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    fetchRecipe();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !recipe) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipe._id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setRecipe(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            likes: prev.stats.likes + (isLiked ? -1 : 1)
          }
        } : null);
        toast.success(isLiked ? 'Recipe unliked' : 'Recipe liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleSave = async () => {
    if (!user || !recipe) return;
    
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipe._id}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsSaved(!isSaved);
        setRecipe(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            saves: prev.stats.saves + (isSaved ? -1 : 1)
          }
        } : null);
        toast.success(isSaved ? 'Recipe unsaved' : 'Recipe saved!');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#f56565';
      default: return '#718096';
    }
  };

  const adjustedIngredients = recipe ? recipe.ingredients.map(ingredient => ({
    ...ingredient,
    quantity: (parseFloat(ingredient.quantity) * servingMultiplier).toString()
  })) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen theme-bg-page pt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 theme-text-secondary text-lg">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen theme-bg-page pt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center theme-bg-primary rounded-lg shadow-lg p-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold theme-text-primary mb-2">{error || 'Recipe not found'}</h2>
            <p className="theme-text-secondary mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <Link
                to="/recipes"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page pt-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center space-x-2 text-sm theme-text-secondary">
            <Link to="/" className="hover:theme-text-primary">Home</Link>
            <span>/</span>
            <Link to="/recipes" className="hover:theme-text-primary">Recipes</Link>
            <span>/</span>
            <span className="theme-text-primary">{recipe.title}</span>
          </nav>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 theme-border-primary border rounded-lg theme-text-secondary hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Actions */}
          <div className="lg:col-span-1">
            {/* Recipe Images */}
            <div className="theme-bg-primary rounded-lg shadow-lg overflow-hidden mb-6">
              {recipe.images && recipe.images.length > 0 ? (
                <div>
                  <div className="aspect-square">
                    <img
                      src={recipe.images[selectedImageIndex]?.url || recipe.images[0].url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {recipe.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {recipe.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === selectedImageIndex ? 'border-blue-500' : 'border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`${recipe.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <span className="text-6xl text-gray-400">🍽️</span>
                    <p className="mt-2 text-gray-500">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="theme-bg-primary rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold theme-text-primary">{recipe.stats.views}</div>
                  <div className="text-sm theme-text-secondary">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold theme-text-primary">{recipe.stats.likes}</div>
                  <div className="text-sm theme-text-secondary">Likes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold theme-text-primary">{recipe.stats.saves}</div>
                  <div className="text-sm theme-text-secondary">Saves</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user && (
              <div className="theme-bg-primary rounded-lg shadow-lg p-6 space-y-3">
                <button
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={handleSave}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isSaved
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{isSaved ? '⭐' : '☆'}</span>
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                {user.uid === recipe.authorFirebaseUid && (
                  <Link
                    to={`/recipe/${recipe._id}/edit`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors"
                  >
                    <span>✏️</span>
                    <span>Edit Recipe</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Recipe Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <div className="theme-bg-primary rounded-lg shadow-lg p-6">
              <h1 className="text-4xl font-bold theme-text-primary mb-4">{recipe.title}</h1>
              <p className="text-lg theme-text-secondary mb-6">{recipe.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👤</span>
                  <span className="theme-text-secondary">by</span>
                  <span className="font-medium theme-text-primary">
                    {recipe.authorDisplayName || 'Anonymous Chef'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📅</span>
                  <span className="theme-text-secondary">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {recipe.category && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🏷️</span>
                    <span className="theme-text-secondary">{recipe.category}</span>
                  </div>
                )}
                {recipe.cuisine && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌍</span>
                    <span className="theme-text-secondary">{recipe.cuisine}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Recipe Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold theme-text-primary">
                    {formatTime(recipe.cookingTime.prep)}
                  </div>
                  <div className="text-sm theme-text-secondary">Prep Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold theme-text-primary">
                    {formatTime(recipe.cookingTime.cook)}
                  </div>
                  <div className="text-sm theme-text-secondary">Cook Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold theme-text-primary">
                    {formatTime(recipe.cookingTime.total)}
                  </div>
                  <div className="text-sm theme-text-secondary">Total Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold theme-text-primary">{recipe.servings * servingMultiplier}</div>
                  <div className="text-sm theme-text-secondary">Servings</div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="mt-4 flex items-center justify-center">
                <span
                  className="px-4 py-2 rounded-full text-white font-medium"
                  style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                >
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)} Level
                </span>
              </div>
            </div>

            {/* Nutrition Info */}
            {recipe.nutritionInfo && Object.keys(recipe.nutritionInfo).length > 0 && (
              <div className="theme-bg-primary rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold theme-text-primary mb-4">🥗 Nutrition Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.nutritionInfo.calories && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg">{recipe.nutritionInfo.calories}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                  )}
                  {recipe.nutritionInfo.protein && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg">{recipe.nutritionInfo.protein}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                  )}
                  {recipe.nutritionInfo.carbs && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg">{recipe.nutritionInfo.carbs}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                  )}
                  {recipe.nutritionInfo.fat && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-lg">{recipe.nutritionInfo.fat}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="theme-bg-primary rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold theme-text-primary">🥘 Ingredients</h2>
                <div className="flex items-center space-x-2">
                  <label className="text-sm theme-text-secondary">Servings:</label>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{recipe.servings * servingMultiplier}</span>
                    <button
                      onClick={() => setServingMultiplier(servingMultiplier + 0.5)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {adjustedIngredients.map((ingredient, ingredientIndex) => (
                  <div key={ingredientIndex} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      className="mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="theme-text-primary">
                      <strong>{ingredient.quantity} {ingredient.unit}</strong> {ingredient.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="theme-bg-primary rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold theme-text-primary mb-6">👨‍🍳 Instructions</h2>
              <div className="space-y-6">
                {recipe.instructions.map((instruction, index) => (
                  <div key={instruction.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {instruction.step}
                    </div>
                    <div className="flex-grow">
                      <p className="theme-text-primary leading-relaxed">{instruction.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            {recipe.equipment && recipe.equipment.length > 0 && (
              <div className="theme-bg-primary rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold theme-text-primary mb-4">🔧 Equipment Needed</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {recipe.equipment.map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="mr-2">🔧</span>
                      <span className="theme-text-primary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chef's Notes */}
            {recipe.notes && (
              <div className="theme-bg-primary rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold theme-text-primary mb-4">📝 Chef's Notes</h2>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="theme-text-primary italic">{recipe.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;