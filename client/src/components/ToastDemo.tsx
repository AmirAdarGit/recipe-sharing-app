import React from 'react';
import { useToast } from '../hooks/useToast';

/**
 * Toast Demo Component
 * Demonstrates all types of toast notifications
 * Useful for testing and showcasing the toast system
 */
const ToastDemo: React.FC = () => {
  const toast = useToast();

  const handleBasicToasts = (): void => {
    toast.success('This is a success message!');
    setTimeout(() => toast.error('This is an error message!'), 500);
    setTimeout(() => toast.warning('This is a warning message!'), 1000);
    setTimeout(() => toast.info('This is an info message!'), 1500);
  };

  const handleAuthToasts = (): void => {
    toast.authSuccess('login');
    setTimeout(() => toast.authError('login', 'Invalid credentials provided'), 500);
  };

  const handleRecipeToasts = (): void => {
    toast.recipe.createSuccess();
    setTimeout(() => toast.recipe.updateError(), 500);
    setTimeout(() => toast.recipe.deleteSuccess(), 1000);
  };

  const handleProfileToasts = (): void => {
    toast.profile.updateSuccess();
    setTimeout(() => toast.profile.photoUploadError(), 500);
    setTimeout(() => toast.profile.preferencesSaved(), 1000);
  };

  const handleValidationToasts = (): void => {
    toast.validation.requiredFields();
    setTimeout(() => toast.validation.invalidEmail(), 500);
    setTimeout(() => toast.validation.passwordMismatch(), 1000);
    setTimeout(() => toast.validation.weakPassword(), 1500);
  };

  const handleLoadingToast = (): void => {
    const toastId = toast.loading('Processing your request...');

    setTimeout(() => {
      toast.updateToSuccess(toastId, 'Request completed successfully!');
    }, 3000);
  };

  const handleAsyncOperation = async (): Promise<void> => {
    try {
      await toast.asyncOperation(
        () => new Promise<void>(resolve => setTimeout(resolve, 2000)),
        {
          loadingMessage: 'Saving your data...',
          successMessage: 'Data saved successfully!',
          errorMessage: 'Failed to save data!'
        }
      );
    } catch (error) {
      console.log('Operation failed:', error);
    }
  };

  const handlePromiseToast = (): void => {
    const mockApiCall = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
      }, 2000);
    });

    toast.promise(mockApiCall, {
      loading: 'Making API call...',
      success: 'API call successful!',
      error: 'API call failed!'
    });
  };

  const handleConditionalToast = () => {
    const isLoggedIn = Math.random() > 0.5;
    toast.conditional(isLoggedIn, 'Welcome back!', 'success');
    toast.conditional(!isLoggedIn, 'Please log in to continue', 'warning');
  };

  const handleDismissAll = () => {
    toast.dismissAll();
  };

  return (
    <div className="toast-demo" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Toast Notification Demo</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        
        {/* Basic Toasts */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Basic Toasts</h3>
          <button 
            onClick={handleBasicToasts}
            style={buttonStyle}
          >
            Show All Types
          </button>
        </div>

        {/* Authentication Toasts */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Auth Toasts</h3>
          <button 
            onClick={handleAuthToasts}
            style={buttonStyle}
          >
            Show Auth Messages
          </button>
        </div>

        {/* Recipe Toasts */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Recipe Toasts</h3>
          <button 
            onClick={handleRecipeToasts}
            style={buttonStyle}
          >
            Show Recipe Messages
          </button>
        </div>

        {/* Profile Toasts */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Profile Toasts</h3>
          <button 
            onClick={handleProfileToasts}
            style={buttonStyle}
          >
            Show Profile Messages
          </button>
        </div>

        {/* Validation Toasts */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Validation Toasts</h3>
          <button 
            onClick={handleValidationToasts}
            style={buttonStyle}
          >
            Show Validation Errors
          </button>
        </div>

        {/* Loading Toast */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Loading Toast</h3>
          <button 
            onClick={handleLoadingToast}
            style={buttonStyle}
          >
            Show Loading → Success
          </button>
        </div>

        {/* Async Operation */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Async Operation</h3>
          <button 
            onClick={handleAsyncOperation}
            style={buttonStyle}
          >
            Run Async Operation
          </button>
        </div>

        {/* Promise Toast */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Promise Toast</h3>
          <button 
            onClick={handlePromiseToast}
            style={buttonStyle}
          >
            Random Promise
          </button>
        </div>

        {/* Conditional Toast */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Conditional Toast</h3>
          <button 
            onClick={handleConditionalToast}
            style={buttonStyle}
          >
            Random Condition
          </button>
        </div>

        {/* Dismiss All */}
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Dismiss All</h3>
          <button 
            onClick={handleDismissAll}
            style={{ ...buttonStyle, backgroundColor: '#ef4444' }}
          >
            Clear All Toasts
          </button>
        </div>

      </div>

      {/* Usage Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '15px' }}>Usage Instructions</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>Basic Usage:</strong></p>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`import { useToast } from '../hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation successful!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong!');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Button styling
const buttonStyle = {
  padding: '8px 12px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  width: '100%',
  transition: 'background-color 0.2s'
};

export default ToastDemo;
