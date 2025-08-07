import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecipeEditor } from '../hooks/useRecipeEditor';
import RecipeForm from '../components/RecipeForm';
import './EditRecipe.css';

const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    recipe,
    loading,
    saving,
    error,
    formData,
    handleSubmit,
    handleCancel
  } = useRecipeEditor(id);



  // Loading state
  if (loading) {
    return (
      <div className="edit-recipe-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe || !formData) {
    return (
      <div className="edit-recipe-page">
        <div className="container">
          <div className="error-state">
            <h2>Error Loading Recipe</h2>
            <p>{error || 'Recipe not found'}</p>
            <button
              className="btn btn-primary"
              onClick={handleCancel}
            >
              Back to My Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-recipe-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Recipe</h1>
          <p>Update your recipe details</p>
        </div>

        <RecipeForm
          initialData={formData}
          isEditing={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditRecipe;