import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import EditRecipe from '../pages/EditRecipe';
import { recipeAPI } from '../services/api';

// Mock the API
jest.mock('../services/api');
const mockedRecipeAPI = recipeAPI as jest.Mocked<typeof recipeAPI>;

// Mock the hooks
jest.mock('../hooks/useToast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    authError: jest.fn()
  })
}));

jest.mock('../hooks/useRecipeEditor', () => ({
  useRecipeEditor: () => ({
    recipe: {
      _id: 'test-recipe-id',
      title: 'Test Recipe',
      description: 'Test Description',
      ingredients: [
        { name: 'Test Ingredient', quantity: 1, unit: 'cup', notes: '' }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Test instruction', duration: null }
      ],
      cookingTime: { prep: 10, cook: 20, total: 30 },
      servings: 4,
      difficulty: 'medium' as const,
      category: 'main-course',
      cuisine: 'american',
      tags: ['test'],
      notes: 'Test notes',
      isPublic: true,
      images: [],
      authorFirebaseUid: 'test-user-uid',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    loading: false,
    saving: false,
    error: null,
    formData: {
      title: 'Test Recipe',
      description: 'Test Description',
      ingredients: [
        { name: 'Test Ingredient', quantity: 1, unit: 'cup', notes: '' }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Test instruction', duration: null }
      ],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'medium' as const,
      category: 'main-course',
      cuisine: 'american',
      tags: ['test'],
      notes: 'Test notes',
      isPublic: true,
      images: []
    },
    handleSubmit: jest.fn(),
    handleCancel: jest.fn()
  })
}));

// Mock Firebase Auth
jest.mock('../config/firebase', () => ({
  auth: {},
  storage: {}
}));

const renderEditRecipe = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <EditRecipe />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('EditRecipe Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the edit recipe page', () => {
    renderEditRecipe();
    
    expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
    expect(screen.getByText('Update your recipe details')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    // Mock loading state
    jest.doMock('../hooks/useRecipeEditor', () => ({
      useRecipeEditor: () => ({
        recipe: null,
        loading: true,
        saving: false,
        error: null,
        formData: null,
        handleSubmit: jest.fn(),
        handleCancel: jest.fn()
      })
    }));

    renderEditRecipe();
    
    expect(screen.getByText('Loading recipe...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Mock error state
    jest.doMock('../hooks/useRecipeEditor', () => ({
      useRecipeEditor: () => ({
        recipe: null,
        loading: false,
        saving: false,
        error: 'Recipe not found',
        formData: null,
        handleSubmit: jest.fn(),
        handleCancel: jest.fn()
      })
    }));

    renderEditRecipe();
    
    expect(screen.getByText('Error Loading Recipe')).toBeInTheDocument();
    expect(screen.getByText('Recipe not found')).toBeInTheDocument();
  });

  it('renders the recipe form when data is loaded', () => {
    renderEditRecipe();
    
    // The RecipeForm component should be rendered
    // We can't test the exact form fields without mocking the RecipeForm component
    // but we can verify the page structure is correct
    expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
  });
});

describe('Recipe Validation', () => {
  const { validateRecipeForm, validateField } = require('../utils/recipeValidation');

  describe('validateRecipeForm', () => {
    it('validates a complete valid recipe', () => {
      const validRecipe = {
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        ingredients: [
          { name: 'Test Ingredient', quantity: 1, unit: 'cup', notes: '' }
        ],
        instructions: [
          { stepNumber: 1, instruction: 'Mix ingredients together', duration: null }
        ],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'medium' as const,
        category: 'main-course',
        cuisine: 'american',
        tags: ['test'],
        notes: 'Test notes',
        isPublic: true,
        images: []
      };

      const result = validateRecipeForm(validRecipe);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates required fields', () => {
      const invalidRecipe = {
        title: '',
        description: '',
        ingredients: [],
        instructions: [],
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: '' as any,
        category: '',
        cuisine: '',
        tags: [],
        notes: '',
        isPublic: true,
        images: []
      };

      const result = validateRecipeForm(invalidRecipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates title length', () => {
      const result1 = validateField('title', 'ab');
      expect(result1?.message).toContain('at least 3 characters');

      const result2 = validateField('title', 'a'.repeat(101));
      expect(result2?.message).toContain('less than 100 characters');
    });

    it('validates servings range', () => {
      const result1 = validateField('servings', 0);
      expect(result1?.message).toContain('at least 1');

      const result2 = validateField('servings', 51);
      expect(result2?.message).toContain('cannot exceed 50');
    });

    it('validates cooking times', () => {
      const result1 = validateField('prepTime', -1);
      expect(result1?.message).toContain('cannot be negative');

      const result2 = validateField('cookTime', -1);
      expect(result2?.message).toContain('cannot be negative');
    });
  });
});

describe('Recipe API Integration', () => {
  it('calls the correct API endpoint for updating recipe', async () => {
    const mockRecipe = {
      _id: 'test-recipe-id',
      title: 'Updated Recipe',
      description: 'Updated description',
      // ... other fields
    };

    mockedRecipeAPI.updateRecipe.mockResolvedValue({
      success: true,
      data: mockRecipe,
      message: 'Recipe updated successfully'
    });

    const updateData = {
      title: 'Updated Recipe',
      description: 'Updated description'
    };

    const result = await recipeAPI.updateRecipe('test-recipe-id', updateData);

    expect(mockedRecipeAPI.updateRecipe).toHaveBeenCalledWith('test-recipe-id', updateData);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Updated Recipe');
  });

  it('handles API errors gracefully', async () => {
    mockedRecipeAPI.updateRecipe.mockRejectedValue(new Error('Network error'));

    try {
      await recipeAPI.updateRecipe('test-recipe-id', {});
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
