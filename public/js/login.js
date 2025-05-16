import { validateForm, showLoading, hideLoading, handleApiError } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const loginValidationRules = {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  };

  const registerValidationRules = {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
    full_name: { required: true },
    phone: { required: true, phone: true },
    user_type: { required: true },
    farm_name: { required: false },
    farm_location: { required: false },
    address: { required: false }
  };

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    };

    const { isValid, errors } = validateForm(formData, loginValidationRules);
    
    if (!isValid) {
      Object.entries(errors).forEach(([field, message]) => {
        const element = document.getElementById(`login-${field}-error`);
        if (element) element.textContent = message;
      });
      return;
    }

    try {
      showLoading('login-submit');
      const response = await window.apiService.login(formData.email, formData.password);
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        
        switch (response.user.user_type) {
          case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
          case 'farmer':
            window.location.href = 'farmer-dashboard.html';
            break;
          case 'customer':
            window.location.href = 'customer-dashboard.html';
            break;
          default:
            window.location.href = 'index.html';
        }
      }
    } catch (error) {
      await handleApiError(error);
    } finally {
      hideLoading('login-submit');
    }
  });

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
      email: document.getElementById('register-email').value,
      password: document.getElementById('register-password').value,
      full_name: document.getElementById('register-name').value,
      phone: document.getElementById('register-phone').value,
      user_type: document.getElementById('user-type').value
    };

    // Update validation rules based on user type
    if (userData.user_type === 'farmer') {
      registerValidationRules.farm_name.required = true;
      registerValidationRules.farm_location.required = true;
      userData.farm_name = document.getElementById('farm-name').value;
      userData.farm_location = document.getElementById('farm-location').value;
    } else if (userData.user_type === 'customer') {
      registerValidationRules.address.required = true;
      userData.address = document.getElementById('delivery-address').value;
    }

    const { isValid, errors } = validateForm(userData, registerValidationRules);
    
    if (!isValid) {
      Object.entries(errors).forEach(([field, message]) => {
        const element = document.getElementById(`register-${field}-error`);
        if (element) element.textContent = message;
      });
      return;
    }

    try {
      showLoading('register-submit');
      const response = await window.apiService.register(userData);
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        showNotification('Registration successful! Redirecting...', 'success');
        
        setTimeout(() => {
          switch (response.user.user_type) {
            case 'farmer':
              window.location.href = 'farmer-dashboard.html';
              break;
            case 'customer':
              window.location.href = 'customer-dashboard.html';
              break;
            default:
              window.location.href = 'index.html';
          }
        }, 1500);
      }
    } catch (error) {
      await handleApiError(error);
    } finally {
      hideLoading('register-submit');
    }
  });

  // Clear error messages when input changes
  document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', function() {
      const errorElement = document.getElementById(`${element.id}-error`);
      if (errorElement) errorElement.textContent = '';
    });
  });

  // Toggle user type specific fields
  document.getElementById('user-type').addEventListener('change', function() {
    const userType = this.value;
    const farmerFields = document.getElementById('farmer-fields');
    const customerFields = document.getElementById('customer-fields');
    
    if (userType === 'farmer') {
      farmerFields.style.display = 'block';
      customerFields.style.display = 'none';
    } else if (userType === 'customer') {
      farmerFields.style.display = 'none';
      customerFields.style.display = 'block';
    } else {
      farmerFields.style.display = 'none';
      customerFields.style.display = 'none';
    }
  });
}); 