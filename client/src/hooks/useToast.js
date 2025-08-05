import { useCallback } from 'react';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  updateToastToSuccess,
  updateToastToError,
  dismissAllToasts,
  dismissToast,
  showAuthSuccessToast,
  showAuthErrorToast,
  showApiErrorToast,
  AUTH_TOASTS,
  RECIPE_TOASTS,
  PROFILE_TOASTS,
  VALIDATION_TOASTS
} from '../utils/toast';

/**
 * Custom hook for managing toast notifications
 * Provides a convenient interface for showing different types of toasts
 */
export const useToast = () => {
  // Basic toast functions
  const success = useCallback((message, options = {}) => {
    return showSuccessToast(message, options);
  }, []);

  const error = useCallback((message, options = {}) => {
    return showErrorToast(message, options);
  }, []);

  const warning = useCallback((message, options = {}) => {
    return showWarningToast(message, options);
  }, []);

  const info = useCallback((message, options = {}) => {
    return showInfoToast(message, options);
  }, []);

  const loading = useCallback((message = 'Loading...') => {
    return showLoadingToast(message);
  }, []);

  // Update loading toasts
  const updateToSuccess = useCallback((toastId, message) => {
    updateToastToSuccess(toastId, message);
  }, []);

  const updateToError = useCallback((toastId, message) => {
    updateToastToError(toastId, message);
  }, []);

  // Dismiss functions
  const dismiss = useCallback((toastId) => {
    if (toastId) {
      dismissToast(toastId);
    } else {
      dismissAllToasts();
    }
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  // Authentication-specific toasts
  const authSuccess = useCallback((action) => {
    showAuthSuccessToast(action);
  }, []);

  const authError = useCallback((action, customMessage = null) => {
    showAuthErrorToast(action, customMessage);
  }, []);

  // API error handling
  const apiError = useCallback((error, fallbackMessage = 'An error occurred') => {
    showApiErrorToast(error, fallbackMessage);
  }, []);

  // Form validation toasts
  const validation = useCallback({
    requiredFields: () => warning(VALIDATION_TOASTS.REQUIRED_FIELDS),
    invalidEmail: () => warning(VALIDATION_TOASTS.INVALID_EMAIL),
    passwordMismatch: () => warning(VALIDATION_TOASTS.PASSWORD_MISMATCH),
    weakPassword: () => warning(VALIDATION_TOASTS.WEAK_PASSWORD),
    unsavedChanges: () => warning(VALIDATION_TOASTS.UNSAVED_CHANGES)
  }, [warning]);

  // Recipe-specific toasts
  const recipe = useCallback({
    createSuccess: () => success(RECIPE_TOASTS.CREATE_SUCCESS),
    createError: () => error(RECIPE_TOASTS.CREATE_ERROR),
    updateSuccess: () => success(RECIPE_TOASTS.UPDATE_SUCCESS),
    updateError: () => error(RECIPE_TOASTS.UPDATE_ERROR),
    deleteSuccess: () => success(RECIPE_TOASTS.DELETE_SUCCESS),
    deleteError: () => error(RECIPE_TOASTS.DELETE_ERROR),
    saveSuccess: () => success(RECIPE_TOASTS.SAVE_SUCCESS),
    unsaveSuccess: () => success(RECIPE_TOASTS.UNSAVE_SUCCESS),
    loadError: () => error(RECIPE_TOASTS.LOAD_ERROR)
  }, [success, error]);

  // Profile-specific toasts
  const profile = useCallback({
    updateSuccess: () => success(PROFILE_TOASTS.UPDATE_SUCCESS),
    updateError: () => error(PROFILE_TOASTS.UPDATE_ERROR),
    photoUploadSuccess: () => success(PROFILE_TOASTS.PHOTO_UPLOAD_SUCCESS),
    photoUploadError: () => error(PROFILE_TOASTS.PHOTO_UPLOAD_ERROR),
    preferencesSaved: () => success(PROFILE_TOASTS.PREFERENCES_SAVED)
  }, [success, error]);

  // Async operation helper
  const asyncOperation = useCallback(async (
    operation,
    {
      loadingMessage = 'Loading...',
      successMessage = 'Operation completed successfully!',
      errorMessage = 'Operation failed. Please try again.',
      showSuccessToast: showSuccess = true,
      showErrorToast: showError = true
    } = {}
  ) => {
    const toastId = loading(loadingMessage);
    
    try {
      const result = await operation();
      
      if (showSuccess) {
        updateToSuccess(toastId, successMessage);
      } else {
        dismiss(toastId);
      }
      
      return result;
    } catch (err) {
      if (showError) {
        updateToError(toastId, errorMessage);
      } else {
        dismiss(toastId);
      }
      throw err;
    }
  }, [loading, updateToSuccess, updateToError, dismiss]);

  // Promise-based toast helper
  const promise = useCallback((
    promise,
    {
      loading: loadingMessage = 'Loading...',
      success: successMessage = 'Success!',
      error: errorMessage = 'Something went wrong!'
    } = {}
  ) => {
    const toastId = loading(loadingMessage);
    
    return promise
      .then((result) => {
        updateToSuccess(toastId, successMessage);
        return result;
      })
      .catch((err) => {
        updateToError(toastId, errorMessage);
        throw err;
      });
  }, [loading, updateToSuccess, updateToError]);

  // Conditional toast helper
  const conditional = useCallback((condition, message, type = 'info') => {
    if (condition) {
      switch (type) {
        case 'success':
          return success(message);
        case 'error':
          return error(message);
        case 'warning':
          return warning(message);
        case 'info':
        default:
          return info(message);
      }
    }
  }, [success, error, warning, info]);

  return {
    // Basic toast functions
    success,
    error,
    warning,
    info,
    loading,
    
    // Update functions
    updateToSuccess,
    updateToError,
    
    // Dismiss functions
    dismiss,
    dismissAll,
    
    // Specialized toast functions
    authSuccess,
    authError,
    apiError,
    validation,
    recipe,
    profile,
    
    // Helper functions
    asyncOperation,
    promise,
    conditional,
    
    // Constants for easy access
    AUTH_TOASTS,
    RECIPE_TOASTS,
    PROFILE_TOASTS,
    VALIDATION_TOASTS
  };
};

export default useToast;
