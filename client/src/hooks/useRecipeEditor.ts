import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';
import { recipeAPI } from '../services/api';

// TypeScript interfaces
interface RecipeImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface Instruction {
  stepNumber: number;
  instruction: string;
  duration?: number;
}

interface DietaryInfo {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isKeto: boolean;
  isPaleo: boolean;
}

interface ApiRecipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
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
  images: RecipeImage[];
  dietaryInfo?: DietaryInfo;
  authorFirebaseUid: string;
  createdAt: string;
  updatedAt: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine: string;
  tags: string[];
  notes: string;
  isPublic: boolean;
  images: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
    uploadedAt: Date;
  }>;
  dietaryInfo?: DietaryInfo;
}

interface UseRecipeEditorReturn {
  recipe: ApiRecipe | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: RecipeFormData | null;
  handleSubmit: (formData: RecipeFormData) => Promise<void>;
  handleCancel: () => void;
  refetch: () => Promise<void>;
}

export const useRecipeEditor = (recipeId: string | undefined): UseRecipeEditorReturn => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<ApiRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert API recipe to form data format
  const convertToFormData = useCallback((apiRecipe: ApiRecipe): RecipeFormData => {
    return {
      title: apiRecipe.title,
      description: apiRecipe.description,
      ingredients: apiRecipe.ingredients,
      instructions: apiRecipe.instructions,
      prepTime: apiRecipe.cookingTime.prep,
      cookTime: apiRecipe.cookingTime.cook,
      servings: apiRecipe.servings,
      difficulty: apiRecipe.difficulty,
      category: apiRecipe.category,
      cuisine: apiRecipe.cuisine,
      tags: apiRecipe.tags,
      notes: apiRecipe.notes || '',
      isPublic: apiRecipe.isPublic,
      images: apiRecipe.images.map(img => ({
        url: img.url,
        filename: img.url.split('/').pop() || 'image',
        isPrimary: img.isPrimary,
        uploadedAt: new Date()
      })),
      dietaryInfo: apiRecipe.dietaryInfo || {
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isDairyFree: false,
        isNutFree: false,
        isKeto: false,
        isPaleo: false
      }
    };
  }, []);

  // Convert form data to API format - Fixed dependencies
  const convertToApiFormat = useCallback((formData: RecipeFormData) => {
    return {
      authorFirebaseUid: user!.uid,
      title: formData.title,
      description: formData.description,
      ingredients: formData.ingredients,
      instructions: formData.instructions,
      cookingTime: {
        prep: formData.prepTime,
        cook: formData.cookTime,
        total: formData.prepTime + formData.cookTime
      },
      servings: formData.servings,
      difficulty: formData.difficulty,
      category: formData.category,
      cuisine: formData.cuisine,
      tags: formData.tags,
      notes: formData.notes,
      isPublic: formData.isPublic,
      images: formData.images.map(img => ({
        url: img.url,
        alt: formData.title,
        isPrimary: img.isPrimary
      })),
      dietaryInfo: formData.dietaryInfo || {
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
  }, [user?.uid]); // Only depend on user.uid, not the whole user object

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    if (!recipeId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await recipeAPI.getRecipe(recipeId);

      if (!response.success || !response.data) {
        throw new Error('Recipe not found');
      }

      const fetchedRecipe = response.data;

      // Check if user owns this recipe
      if (fetchedRecipe.authorFirebaseUid !== user.uid) {
        toast.error('You can only edit your own recipes');
        navigate('/my-recipes');
        return;
      }

      setRecipe(fetchedRecipe);
    } catch (error: any) {
      console.error('Error fetching recipe:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load recipe';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [recipeId, user?.uid]);

  // Handle form submission - Fixed dependencies
  const handleSubmit = useCallback(async (formData: RecipeFormData) => {
    if (!user || !recipe) {
      toast.authError('login', 'Please log in to update recipes');
      return;
    }

    try {
      setSaving(true);

      const apiData = convertToApiFormat(formData);
      const response = await recipeAPI.updateRecipe(recipe._id, apiData);

      if (response.success) {
        toast.success('Recipe updated successfully!');
        navigate('/my-recipes');
      } else {
        throw new Error(response.message || 'Failed to update recipe');
      }
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update recipe';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [user?.uid, recipe?._id, convertToApiFormat]); // Removed toast and navigate

  // Handle cancel action - Fixed dependencies
  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/my-recipes');
    }
  }, []); // Removed navigate dependency

  // Fetch recipe on mount and when dependencies change
  useEffect(() => {
    let isMounted = true;

    const loadRecipe = async () => {
      if (!recipeId || !user) return;

      try {
        setLoading(true);
        setError(null);

        const response = await recipeAPI.getRecipe(recipeId);

        if (!isMounted) return; // Component unmounted, don't update state

        if (!response.success || !response.data) {
          throw new Error('Recipe not found');
        }

        const fetchedRecipe = response.data;

        // Check if user owns this recipe
        if (fetchedRecipe.authorFirebaseUid !== user.uid) {
          toast.error('You can only edit your own recipes');
          navigate('/my-recipes');
          return;
        }

        setRecipe(fetchedRecipe);
      } catch (error: any) {
        if (!isMounted) return; // Component unmounted, don't update state

        console.error('Error fetching recipe:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load recipe';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRecipe();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates after unmount
    };
  }, [recipeId, user?.uid]); // Only depend on stable values

  // Get form data
  const formData = recipe ? convertToFormData(recipe) : null;

  return {
    recipe,
    loading,
    saving,
    error,
    formData,
    handleSubmit,
    handleCancel,
    refetch
  };
};
