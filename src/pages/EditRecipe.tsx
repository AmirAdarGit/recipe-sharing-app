import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import RecipeForm from '../components/RecipeForm';
import { API_BASE_URL } from '../config/api';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  authorFirebaseUid: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    instruction: string;
    duration?: number;
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
  notes?: string;
  isPublic: boolean;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
}

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    instruction: string;
    duration?: number;
  }>;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine: string;
  tags: string[];
  notes: string;
  isPublic: boolean;
}

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialFormData, setInitialFormData] = useState<RecipeFormData | null>(null);

  // Fetch recipe for editing
  const fetchRecipe = async () => {
    if (!id || !user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Recipe not found');
          navigate('/my-recipes');
          return;
        }
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
      const fetchedRecipe = data.data;

      // Check if user owns this recipe
      if (fetchedRecipe.authorFirebaseUid !== user.uid) {
        toast.error('You can only edit your own recipes');
        navigate('/my-recipes');
        return;
      }

      setRecipe(fetchedRecipe);

      // Convert recipe data to form format
      const formData: RecipeFormData = {
        title: fetchedRecipe.title,
        description: fetchedRecipe.description,
        ingredients: fetchedRecipe.ingredients,
        instructions: fetchedRecipe.instructions,
        prepTime: fetchedRecipe.cookingTime.prep,
        cookTime: fetchedRecipe.cookingTime.cook,
        servings: fetchedRecipe.servings,
        difficulty: fetchedRecipe.difficulty,
        category: fetchedRecipe.category,
        cuisine: fetchedRecipe.cuisine,
        tags: fetchedRecipe.tags,
        notes: fetchedRecipe.notes || '',
        isPublic: fetchedRecipe.isPublic
      };

      setInitialFormData(formData);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe for editing');
      navigate('/my-recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id, user]);

  const handleSubmit = async (formData: RecipeFormData) => {
    if (!user || !recipe) {
      toast.authError('login', 'Please log in to edit recipes');
      return;
    }

    try {
      // Prepare the updated recipe data
      const updateData = {
        title: formData.title,
        description: formData.description,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        cookingTime: {
          prep: formData.prepTime,
          cook: formData.cookTime
        },
        servings: formData.servings,
        difficulty: formData.difficulty,
        category: formData.category,
        cuisine: formData.cuisine,
        tags: formData.tags,
        notes: formData.notes,
        isPublic: formData.isPublic,
        // Keep existing dietary info and nutrition if not changed
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isDairyFree: false,
          isNutFree: false,
          isKeto: false,
          isPaleo: false
        },
        nutrition: {}
      };

      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipe._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipe');
      }

      const result = await response.json();
      
      toast.recipe.updateSuccess();
      navigate(`/recipe/${recipe._id}`);
      
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.recipe.updateError();
      throw error; // Re-throw to let the form handle loading state
    }
  };

  const handleCancel = () => {
    if (recipe) {
      navigate(`/recipe/${recipe._id}`);
    } else {
      navigate('/my-recipes');
    }
  };

  const handleDelete = async () => {
    if (!user || !recipe) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this recipe? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipe._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorFirebaseUid: user.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      toast.recipe.deleteSuccess();
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.recipe.deleteError();
    }
  };

  if (loading) {
    return (
      <div className="edit-recipe-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe for editing...</p>
      </div>
    );
  }

  if (!recipe || !initialFormData) {
    return (
      <div className="edit-recipe-error">
        <h2>Recipe not found</h2>
        <p>The recipe you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <button onClick={() => navigate('/my-recipes')} className="btn-back">
          Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="edit-recipe-page">
      <div className="edit-recipe-header">
        <div className="header-content">
          <h1>Edit Recipe</h1>
          <p>Make changes to your recipe</p>
        </div>
        <div className="header-actions">
          <button onClick={handleDelete} className="btn-delete-recipe">
            Delete Recipe
          </button>
        </div>
      </div>

      <RecipeForm
        initialData={initialFormData}
        isEditing={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditRecipe;
