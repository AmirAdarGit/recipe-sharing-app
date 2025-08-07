import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { showWarningToast, VALIDATION_TOASTS } from '../utils/toast';
import ImageUpload from './ImageUpload';
import './RecipeForm.css';

// TypeScript interfaces
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

interface RecipeImage {
  url: string;
  filename: string;
  isPrimary: boolean;
  uploadedAt: Date;
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

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  isEditing?: boolean;
  onSubmit?: (data: RecipeFormData) => Promise<void>;
  onCancel?: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'main-course', label: 'Main Course' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'snack', label: 'Snack' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'side-dish', label: 'Side Dish' }
];

const CUISINE_OPTIONS: SelectOption[] = [
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'indian', label: 'Indian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'french', label: 'French' },
  { value: 'thai', label: 'Thai' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'american', label: 'American' },
  { value: 'korean', label: 'Korean' },
  { value: 'other', label: 'Other' }
];

const UNIT_OPTIONS: string[] = [
  'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
  'pound', 'pounds', 'ounce', 'ounces', 'gram', 'grams', 'kilogram', 'kilograms',
  'liter', 'liters', 'milliliter', 'milliliters', 'piece', 'pieces',
  'slice', 'slices', 'clove', 'cloves', 'pinch', 'dash', 'to taste'
];

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: 0, unit: 'cup' }],
    instructions: [{ stepNumber: 1, instruction: '' }],
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    difficulty: 'medium',
    category: 'main-course',
    cuisine: 'other',
    tags: [],
    notes: '',
    isPublic: true,
    images: [],
    ...initialData
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');

  // Validation functions
  const validateForm = (): boolean => {
    if (!formData.title.trim() || formData.title.length < 3 || formData.title.length > 100) {
      showWarningToast('Recipe name must be between 3 and 100 characters');
      return false;
    }

    if (!formData.description.trim()) {
      showWarningToast('Recipe description is required');
      return false;
    }

    if (formData.ingredients.length === 0 || !formData.ingredients.some(ing => ing.name.trim())) {
      showWarningToast('At least one ingredient is required');
      return false;
    }

    if (formData.instructions.length === 0 || !formData.instructions.some(inst => inst.instruction.trim())) {
      showWarningToast('At least one instruction step is required');
      return false;
    }

    return true;
  };

  // Ingredient management
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 0, unit: 'cup' }]
    }));
  };

  const removeIngredient = (index: number): void => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number): void => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  // Instruction management
  const addInstruction = (): void => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, {
        stepNumber: prev.instructions.length + 1,
        instruction: ''
      }]
    }));
  };

  const removeInstruction = (index: number): void => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions
          .filter((_, i) => i !== index)
          .map((inst, i) => ({ ...inst, stepNumber: i + 1 }))
      }));
    }
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: string | number): void => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  // Tag management
  const addTag = (): void => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) {
      toast.authError('login', 'Please log in to create recipes');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission logic will be implemented when we add the API call
        toast.success('Recipe saved successfully!');
        navigate('/my-recipes');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/my-recipes');
    }
  };

  return (
    <div className="recipe-form-container">
      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Recipe Name *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter recipe name (3-100 characters)"
              maxLength={100}
              required
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your recipe..."
              rows={3}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cuisine">Cuisine *</label>
              <select
                id="cuisine"
                value={formData.cuisine}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                required
              >
                {CUISINE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
              >
                {DIFFICULTY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="form-section">
          <h2>Ingredients *</h2>
          <p className="section-description">Add all ingredients needed for your recipe</p>

          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <div className="ingredient-fields">
                <div className="form-group ingredient-name">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    required
                  />
                </div>

                <div className="form-group ingredient-quantity">
                  <input
                    type="number"
                    value={ingredient.quantity || ''}
                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="Amount"
                    min="0"
                    step="0.25"
                    required
                  />
                </div>

                <div className="form-group ingredient-unit">
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    required
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group ingredient-notes">
                  <input
                    type="text"
                    value={ingredient.notes || ''}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn-remove"
                disabled={formData.ingredients.length === 1}
                title="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}

          <button type="button" onClick={addIngredient} className="btn-add">
            + Add Ingredient
          </button>
        </section>

        {/* Instructions Section */}
        <section className="form-section">
          <h2>Instructions *</h2>
          <p className="section-description">Provide step-by-step cooking instructions</p>

          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <div className="instruction-number">
                {instruction.stepNumber}
              </div>

              <div className="instruction-content">
                <div className="form-group">
                  <textarea
                    value={instruction.instruction}
                    onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                    placeholder="Describe this step in detail..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group instruction-duration">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={instruction.duration || ''}
                    onChange={(e) => updateInstruction(index, 'duration', parseInt(e.target.value) || undefined)}
                    placeholder="Optional"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="btn-remove"
                disabled={formData.instructions.length === 1}
                title="Remove step"
              >
                ×
              </button>
            </div>
          ))}

          <button type="button" onClick={addInstruction} className="btn-add">
            + Add Step
          </button>
        </section>

        {/* Timing and Servings */}
        <section className="form-section">
          <h2>Timing & Servings</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                value={formData.prepTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                value={formData.cookTime || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                min="1"
                max="50"
                required
              />
            </div>

            <div className="form-group total-time">
              <label>Total Time</label>
              <div className="time-display">
                {(formData.prepTime + formData.cookTime) || 0} minutes
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Images */}
        <section className="form-section">
          <h2>Recipe Images</h2>
          <p className="section-description">Add photos to showcase your recipe</p>
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
            maxImages={5}
            maxSizeInMB={5}
          />
        </section>

        {/* Tags and Notes */}
        <section className="form-section">
          <h2>Additional Information</h2>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyPress}
                placeholder="Add tags (press Enter)"
              />
              <button type="button" onClick={addTag} className="btn-add-tag">
                Add
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional tips, variations, or personal notes..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="privacy-toggle">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {formData.isPublic ? 'Public Recipe' : 'Private Recipe'}
              </span>
            </label>
            <p className="privacy-description">
              {formData.isPublic
                ? 'This recipe will be visible to all users'
                : 'This recipe will only be visible to you'
              }
            </p>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Saving...' : (isEditing ? 'Update Recipe' : 'Create Recipe')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
