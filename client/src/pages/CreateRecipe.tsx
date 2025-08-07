import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import RecipeForm from '../components/RecipeForm';
import { API_BASE_URL } from '../config/api';

// TypeScript interfaces
interface RecipeImage {
  url: string;
  filename: string;
  isPrimary: boolean;
  uploadedAt: Date;
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
  images: RecipeImage[];
}

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

  const handleSubmit = async (formData: RecipeFormData): Promise<void> => {
    if (!user) {
      toast.authError('login', 'Please log in to create recipes');
      return;
    }

    try {
      // Validate that all images are properly uploaded (not blob URLs)
      const hasInvalidImages = formData.images.some(img =>
        img.url.startsWith('blob:') || !img.url.startsWith('https://')
      );

      if (hasInvalidImages) {
        toast.error('Please wait for all images to finish uploading before submitting');
        return;
      }

      // Prepare the recipe data for the API
      const recipeData = {
        authorFirebaseUid: user.uid,
        title: formData.title,
        description: formData.description,
        // Ensure ingredients have the correct field names
        ingredients: formData.ingredients.map(ingredient => ({
          name: ingredient.name,
          quantity: ingredient.quantity, // Ensure this is 'quantity', not 'amount'
          unit: ingredient.unit,
          notes: ingredient.notes || ''
        })),
        instructions: formData.instructions.map(instruction => ({
          stepNumber: instruction.stepNumber,
          instruction: instruction.instruction,
          duration: instruction.duration || null
        })),
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

      // Debug: Log the recipe data being sent
      console.log('Sending recipe data:', JSON.stringify(recipeData, null, 2));

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
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to create recipe');
      }

      await response.json();

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
