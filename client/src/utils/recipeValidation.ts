// Recipe form validation utilities

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
  images: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
    uploadedAt: Date;
  }>;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates recipe form data
 */
export const validateRecipeForm = (data: Partial<RecipeFormData>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Recipe title is required' });
  } else if (data.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Recipe title must be at least 3 characters long' });
  } else if (data.title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Recipe title must be less than 100 characters' });
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Recipe description is required' });
  } else if (data.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Recipe description must be at least 10 characters long' });
  } else if (data.description.trim().length > 500) {
    errors.push({ field: 'description', message: 'Recipe description must be less than 500 characters' });
  }

  // Ingredients validation
  if (!data.ingredients || data.ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'At least one ingredient is required' });
  } else {
    data.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name || ingredient.name.trim().length === 0) {
        errors.push({ 
          field: `ingredients[${index}].name`, 
          message: `Ingredient ${index + 1} name is required` 
        });
      }
      if (!ingredient.quantity || ingredient.quantity <= 0) {
        errors.push({ 
          field: `ingredients[${index}].quantity`, 
          message: `Ingredient ${index + 1} quantity must be greater than 0` 
        });
      }
      if (!ingredient.unit || ingredient.unit.trim().length === 0) {
        errors.push({ 
          field: `ingredients[${index}].unit`, 
          message: `Ingredient ${index + 1} unit is required` 
        });
      }
    });
  }

  // Instructions validation
  if (!data.instructions || data.instructions.length === 0) {
    errors.push({ field: 'instructions', message: 'At least one instruction is required' });
  } else {
    data.instructions.forEach((instruction, index) => {
      if (!instruction.instruction || instruction.instruction.trim().length === 0) {
        errors.push({ 
          field: `instructions[${index}].instruction`, 
          message: `Instruction ${index + 1} is required` 
        });
      } else if (instruction.instruction.trim().length < 5) {
        errors.push({ 
          field: `instructions[${index}].instruction`, 
          message: `Instruction ${index + 1} must be at least 5 characters long` 
        });
      }
    });
  }

  // Cooking time validation
  if (data.prepTime !== undefined && data.prepTime < 0) {
    errors.push({ field: 'prepTime', message: 'Prep time cannot be negative' });
  }
  if (data.cookTime !== undefined && data.cookTime < 0) {
    errors.push({ field: 'cookTime', message: 'Cook time cannot be negative' });
  }
  if ((data.prepTime || 0) + (data.cookTime || 0) === 0) {
    errors.push({ field: 'cookingTime', message: 'Either prep time or cook time must be greater than 0' });
  }

  // Servings validation
  if (!data.servings || data.servings < 1) {
    errors.push({ field: 'servings', message: 'Servings must be at least 1' });
  } else if (data.servings > 50) {
    errors.push({ field: 'servings', message: 'Servings cannot exceed 50' });
  }

  // Category validation
  if (!data.category || data.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Recipe category is required' });
  }

  // Cuisine validation
  if (!data.cuisine || data.cuisine.trim().length === 0) {
    errors.push({ field: 'cuisine', message: 'Recipe cuisine is required' });
  }

  // Difficulty validation
  if (!data.difficulty) {
    errors.push({ field: 'difficulty', message: 'Recipe difficulty is required' });
  } else if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    errors.push({ field: 'difficulty', message: 'Recipe difficulty must be easy, medium, or hard' });
  }

  // Notes validation (optional but with length limit)
  if (data.notes && data.notes.length > 1000) {
    errors.push({ field: 'notes', message: 'Notes must be less than 1000 characters' });
  }

  // Tags validation (optional but with limits)
  if (data.tags && data.tags.length > 10) {
    errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates individual form fields for real-time validation
 */
export const validateField = (fieldName: string, value: any, formData?: Partial<RecipeFormData>): ValidationError | null => {
  switch (fieldName) {
    case 'title':
      if (!value || value.trim().length === 0) {
        return { field: 'title', message: 'Recipe title is required' };
      }
      if (value.trim().length < 3) {
        return { field: 'title', message: 'Recipe title must be at least 3 characters long' };
      }
      if (value.trim().length > 100) {
        return { field: 'title', message: 'Recipe title must be less than 100 characters' };
      }
      break;

    case 'description':
      if (!value || value.trim().length === 0) {
        return { field: 'description', message: 'Recipe description is required' };
      }
      if (value.trim().length < 10) {
        return { field: 'description', message: 'Recipe description must be at least 10 characters long' };
      }
      if (value.trim().length > 500) {
        return { field: 'description', message: 'Recipe description must be less than 500 characters' };
      }
      break;

    case 'servings':
      if (!value || value < 1) {
        return { field: 'servings', message: 'Servings must be at least 1' };
      }
      if (value > 50) {
        return { field: 'servings', message: 'Servings cannot exceed 50' };
      }
      break;

    case 'prepTime':
      if (value < 0) {
        return { field: 'prepTime', message: 'Prep time cannot be negative' };
      }
      break;

    case 'cookTime':
      if (value < 0) {
        return { field: 'cookTime', message: 'Cook time cannot be negative' };
      }
      break;

    case 'category':
      if (!value || value.trim().length === 0) {
        return { field: 'category', message: 'Recipe category is required' };
      }
      break;

    case 'cuisine':
      if (!value || value.trim().length === 0) {
        return { field: 'cuisine', message: 'Recipe cuisine is required' };
      }
      break;

    case 'difficulty':
      if (!value) {
        return { field: 'difficulty', message: 'Recipe difficulty is required' };
      }
      if (!['easy', 'medium', 'hard'].includes(value)) {
        return { field: 'difficulty', message: 'Recipe difficulty must be easy, medium, or hard' };
      }
      break;

    case 'notes':
      if (value && value.length > 1000) {
        return { field: 'notes', message: 'Notes must be less than 1000 characters' };
      }
      break;

    default:
      return null;
  }

  return null;
};

/**
 * Checks if the form has unsaved changes
 */
export const hasUnsavedChanges = (currentData: RecipeFormData, originalData: RecipeFormData): boolean => {
  // Simple deep comparison for form data
  return JSON.stringify(currentData) !== JSON.stringify(originalData);
};

/**
 * Sanitizes form data before submission
 */
export const sanitizeFormData = (data: RecipeFormData): RecipeFormData => {
  return {
    ...data,
    title: data.title.trim(),
    description: data.description.trim(),
    notes: data.notes.trim(),
    ingredients: data.ingredients.map(ingredient => ({
      ...ingredient,
      name: ingredient.name.trim(),
      unit: ingredient.unit.trim(),
      notes: ingredient.notes?.trim() || ''
    })),
    instructions: data.instructions.map(instruction => ({
      ...instruction,
      instruction: instruction.instruction.trim()
    })),
    tags: data.tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
  };
};
