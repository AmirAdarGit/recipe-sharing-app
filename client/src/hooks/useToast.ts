import { useCallback } from 'react';
import { Id, ToastOptions } from 'react-toastify';
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

// Type definitions for the hook
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AsyncOperationOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface PromiseToastOptions {
  loading?: string;
  success?: string;
  error?: string;
}

interface ValidationToasts {
  requiredFields: () => Id;
  invalidEmail: () => Id;
  passwordMismatch: () => Id;
  weakPassword: () => Id;
  unsavedChanges: () => Id;
}

interface RecipeToasts {
  createSuccess: () => Id;
  createError: () => Id;
  updateSuccess: () => Id;
  updateError: () => Id;
  deleteSuccess: () => Id;
  deleteError: () => Id;
  saveSuccess: () => Id;
  unsaveSuccess: () => Id;
  loadError: () => Id;
}

interface ProfileToasts {
  updateSuccess: () => Id;
  updateError: () => Id;
  photoUploadSuccess: () => Id;
  photoUploadError: () => Id;
  preferencesSaved: () => Id;
}

interface UseToastReturn {
  // Basic toast functions
  success: (message: string, options?: Partial<ToastOptions>) => Id;
  error: (message: string, options?: Partial<ToastOptions>) => Id;
  warning: (message: string, options?: Partial<ToastOptions>) => Id;
  info: (message: string, options?: Partial<ToastOptions>) => Id;
  loading: (message?: string) => Id;

  // Update functions
  updateToSuccess: (toastId: Id, message: string) => void;
  updateToError: (toastId: Id, message: string) => void;

  // Dismiss functions
  dismiss: (toastId?: Id) => void;
  dismissAll: () => void;

  // Specialized toast functions
  authSuccess: (action: 'login' | 'register' | 'logout') => void;
  authError: (action: 'login' | 'register' | 'unauthorized' | 'network', customMessage?: string | null) => void;
  apiError: (error: any, fallbackMessage?: string) => Id;
  validation: ValidationToasts;
  recipe: RecipeToasts;
  profile: ProfileToasts;

  // Helper functions
  asyncOperation: <T>(operation: () => Promise<T>, options?: AsyncOperationOptions) => Promise<T>;
  promise: <T>(promise: Promise<T>, options?: PromiseToastOptions) => Promise<T>;
  conditional: (condition: boolean, message: string, type?: ToastType) => Id | undefined;

  // Constants for easy access
  AUTH_TOASTS: typeof AUTH_TOASTS;
  RECIPE_TOASTS: typeof RECIPE_TOASTS;
  PROFILE_TOASTS: typeof PROFILE_TOASTS;
  VALIDATION_TOASTS: typeof VALIDATION_TOASTS;
}

/**
 * Custom hook for managing toast notifications
 * Provides a convenient interface for showing different types of toasts
 */
export const useToast = (): UseToastReturn => {
  // Basic toast functions
  const success = useCallback((message: string, options: Partial<ToastOptions> = {}): Id => {
    return showSuccessToast(message, options);
  }, []);

  const error = useCallback((message: string, options: Partial<ToastOptions> = {}): Id => {
    return showErrorToast(message, options);
  }, []);

  const warning = useCallback((message: string, options: Partial<ToastOptions> = {}): Id => {
    return showWarningToast(message, options);
  }, []);

  const info = useCallback((message: string, options: Partial<ToastOptions> = {}): Id => {
    return showInfoToast(message, options);
  }, []);

  const loading = useCallback((message: string = 'Loading...'): Id => {
    return showLoadingToast(message);
  }, []);

  // Update loading toasts
  const updateToSuccess = useCallback((toastId: Id, message: string): void => {
    updateToastToSuccess(toastId, message);
  }, []);

  const updateToError = useCallback((toastId: Id, message: string): void => {
    updateToastToError(toastId, message);
  }, []);

  // Dismiss functions
  const dismiss = useCallback((toastId?: Id): void => {
    if (toastId) {
      dismissToast(toastId);
    } else {
      dismissAllToasts();
    }
  }, []);

  const dismissAll = useCallback((): void => {
    dismissAllToasts();
  }, []);

  // Authentication-specific toasts
  const authSuccess = useCallback((action: 'login' | 'register' | 'logout'): void => {
    showAuthSuccessToast(action);
  }, []);

  const authError = useCallback((action: 'login' | 'register' | 'unauthorized' | 'network', customMessage: string | null = null): void => {
    showAuthErrorToast(action, customMessage);
  }, []);

  // API error handling
  const apiError = useCallback((error: any, fallbackMessage: string = 'An error occurred'): Id => {
    return showApiErrorToast(error, fallbackMessage);
  }, []);

  // Form validation toasts
  const validation: ValidationToasts = useCallback({
    requiredFields: () => warning(VALIDATION_TOASTS.REQUIRED_FIELDS),
    invalidEmail: () => warning(VALIDATION_TOASTS.INVALID_EMAIL),
    passwordMismatch: () => warning(VALIDATION_TOASTS.PASSWORD_MISMATCH),
    weakPassword: () => warning(VALIDATION_TOASTS.WEAK_PASSWORD),
    unsavedChanges: () => warning(VALIDATION_TOASTS.UNSAVED_CHANGES)
  }, [warning]);

  // Recipe-specific toasts
  const recipe: RecipeToasts = useCallback({
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
  const profile: ProfileToasts = useCallback({
    updateSuccess: () => success(PROFILE_TOASTS.UPDATE_SUCCESS),
    updateError: () => error(PROFILE_TOASTS.UPDATE_ERROR),
    photoUploadSuccess: () => success(PROFILE_TOASTS.PHOTO_UPLOAD_SUCCESS),
    photoUploadError: () => error(PROFILE_TOASTS.PHOTO_UPLOAD_ERROR),
    preferencesSaved: () => success(PROFILE_TOASTS.PREFERENCES_SAVED)
  }, [success, error]);

  // Async operation helper
  const asyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    {
      loadingMessage = 'Loading...',
      successMessage = 'Operation completed successfully!',
      errorMessage = 'Operation failed. Please try again.',
      showSuccessToast: showSuccess = true,
      showErrorToast: showError = true
    }: AsyncOperationOptions = {}
  ): Promise<T> => {
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
  const promise = useCallback(<T>(
    promiseToHandle: Promise<T>,
    {
      loading: loadingMessage = 'Loading...',
      success: successMessage = 'Success!',
      error: errorMessage = 'Something went wrong!'
    }: PromiseToastOptions = {}
  ): Promise<T> => {
    const toastId = loading(loadingMessage);

    return promiseToHandle
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
  const conditional = useCallback((condition: boolean, message: string, type: ToastType = 'info'): Id | undefined => {
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
