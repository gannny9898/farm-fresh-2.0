// Loading state management
const loadingStates = new Map();

export const showLoading = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const originalContent = element.innerHTML;
  loadingStates.set(elementId, originalContent);
  
  element.disabled = true;
  element.innerHTML = '<span class="spinner"></span> Loading...';
};

export const hideLoading = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const originalContent = loadingStates.get(elementId);
  if (originalContent) {
    element.innerHTML = originalContent;
    element.disabled = false;
    loadingStates.delete(elementId);
  }
};

// Form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(formData)) {
    if (rules[field]) {
      const fieldRules = rules[field];
      
      if (fieldRules.required && !value) {
        errors[field] = `${field.replace('_', ' ')} is required`;
      }
      
      if (fieldRules.email && value && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors[field] = 'Invalid email format';
      }
      
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field.replace('_', ' ')} must be at least ${fieldRules.minLength} characters`;
      }
      
      if (fieldRules.numeric && value && isNaN(value)) {
        errors[field] = `${field.replace('_', ' ')} must be a number`;
      }
      
      if (fieldRules.phone && value && !value.match(/^\+?[\d\s-]{10,}$/)) {
        errors[field] = 'Invalid phone number format';
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Notification system
export const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// Error handling
export const handleApiError = async (error) => {
  console.error('API Error:', error);
  
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    try {
      const data = await error.response.json();
      message = data.message || message;
    } catch (e) {
      message = error.response.statusText;
    }
  }
  
  showNotification(message, 'error');
  return { success: false, message };
}; 