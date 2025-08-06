import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import RecipeForm from '../components/RecipeForm';
import { API_BASE_URL } from '../config/api';

// RecipeFormData structure:
// {
//   title: string,
//   description: string,
//   ingredients: [{ name, quantity, unit, notes }],
//   instructions: [{ stepNumber, instruction, duration }],
//   prepTime: number,
//   cookTime: number,
//   servings: number,
//   difficulty: 'easy' | 'medium' | 'hard',
//   category: string,
//   cuisine: string,
//   tags: string[],
//   notes: string,
//   isPublic: boolean,
//   images: [{ url, filename, isPrimary, uploadedAt }]
// }

const CreateRecipe: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (formData: any): Promise<void> => {
    if (!user) {
      toast.authError('login', 'Please log in to create recipes');
      return;
    }

    try {
      // Prepare the recipe data for the API
      const recipeData = {
        authorFirebaseUid: user.uid,
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
        images: formData.images.map(img => ({
          url: img.url,
          alt: formData.title,
          isPrimary: img.isPrimary
        })),
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

      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(recipeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create recipe');
      }

      const result = await response.json();
      
      toast.recipe.createSuccess();
      navigate('/my-recipes');
      
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.recipe.createError();
      throw error; // Re-throw to let the form handle loading state
    }
  };

  const handleCancel = () => {
    navigate('/my-recipes');
  };

  return (
    <div className="create-recipe-page">
      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={false}
      />
    </div>
  );
};

export default CreateRecipe;
