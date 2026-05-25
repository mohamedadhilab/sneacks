/**
 * SNEACKS - Reusable Premium Frontend Validation System
 * Designed with global event delegation, dynamic error layouts,
 * and seamless alignment with backend Joi schemas.
 */

(function () {
  // Regex patterns matching userValidation.js Joi patterns
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^[0-9]{10}$/;
  const PINCODE_REGEX = /^[0-9]{6}$/;

  /**
   * Helper to determine where to place the error message in the DOM.
   * If the input is wrapped in a helper container (like password eye toggle wrap),
   * we place the error after the wrapper to prevent layout distortion.
   */
  function getErrorInsertionTarget(input) {
    const passwordWrap = input.closest('.password-input-wrap');
    if (passwordWrap) return passwordWrap;

    const inputWrapper = input.closest('.input-wrapper');
    if (inputWrapper) return inputWrapper;

    const inputGroup = input.closest('.input-group');
    const formGroup = input.closest('.form-group');

    // Default to directly after the input element
    return input;
  }

  /**
   * Safe check if element is visible on page
   */
  function isElementVisible(el) {
    if (el.type === 'hidden') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  // Define Validator Namespace
  window.Validator = {
    /**
     * Show premium inline error message
     */
    showError: function (input, message) {
      if (!input || !message) return;

      // Add invalid styling class
      input.classList.remove('validation-valid-input');
      input.classList.add('validation-invalid-input');

      const target = getErrorInsertionTarget(input);
      let errorContainer = target.parentElement.querySelector(`.validation-error-message[data-for="${input.name || input.id}"]`);

      // Create error element if it doesn't exist
      if (!errorContainer) {
        errorContainer = document.createElement('span');
        errorContainer.className = 'validation-error-message';
        errorContainer.setAttribute('data-for', input.name || input.id);
        
        // Insert directly after the target (either the input itself or its wrapper)
        target.parentNode.insertBefore(errorContainer, target.nextSibling);
      }

      // Update text content
      errorContainer.textContent = message;

      // Trigger animations in a microtask
      requestAnimationFrame(() => {
        errorContainer.classList.add('active');
      });
    },

    /**
     * Clear error styling and animate message closure
     */
    clearError: function (input) {
      if (!input) return;

      input.classList.remove('validation-invalid-input');
      
      const target = getErrorInsertionTarget(input);
      const errorContainer = target.parentElement.querySelector(`.validation-error-message[data-for="${input.name || input.id}"]`);

      if (errorContainer) {
        errorContainer.classList.remove('active');
        // Optional: Remove error node after animation completes
        errorContainer.addEventListener('transitionend', function handler() {
          if (!errorContainer.classList.contains('active')) {
            errorContainer.remove();
          }
          errorContainer.removeEventListener('transitionend', handler);
        });
      }
    },

    /**
     * Validator: Required field
     */
    validateRequired: function (input, message) {
      const val = input.value ? input.value.trim() : '';
      if (!val) {
        const defaultMsg = `${input.placeholder || 'This field'} is required`;
        this.showError(input, message || defaultMsg);
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Email format
     */
    validateEmail: function (input, message) {
      const val = input.value ? input.value.trim() : '';
      if (!val) {
        return this.validateRequired(input, message);
      }
      if (!EMAIL_REGEX.test(val)) {
        this.showError(input, message || 'Enter a valid email');
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Password strength
     */
    validatePassword: function (input, message) {
      const val = input.value || '';
      if (!val) {
        return this.validateRequired(input, message);
      }
      if (val.length < 6) {
        this.showError(input, message || 'Password must be at least 6 characters');
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Phone number (10 digits)
     */
    validatePhone: function (input, message) {
      const val = input.value ? input.value.trim() : '';
      // Allow empty phone if not required
      if (!val && !input.hasAttribute('required')) {
        this.clearError(input);
        return true;
      }
      if (!val) {
        return this.validateRequired(input, message);
      }
      if (!PHONE_REGEX.test(val)) {
        this.showError(input, message || 'Phone number must be 10 digits');
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Pincode (6 digits)
     */
    validatePincode: function (input, message) {
      const val = input.value ? input.value.trim() : '';
      if (!val) {
        return this.validateRequired(input, message);
      }
      if (!PINCODE_REGEX.test(val)) {
        this.showError(input, message || 'Pincode must be 6 digits');
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Minimum length
     */
    validateMinLength: function (input, minLength, message) {
      const val = input.value ? input.value.trim() : '';
      if (!val) {
        return this.validateRequired(input, message);
      }
      if (val.length < minLength) {
        this.showError(input, message || `Must be at least ${minLength} characters`);
        return false;
      }
      this.clearError(input);
      return true;
    },

    /**
     * Validator: Confirm password matching
     */
    validateConfirmPassword: function (confirmInput, passwordInput, message) {
      const passVal = passwordInput ? passwordInput.value : '';
      const confirmVal = confirmInput.value || '';
      if (!confirmVal) {
        this.showError(confirmInput, 'Confirm password is required');
        return false;
      }
      if (passVal !== confirmVal) {
        this.showError(confirmInput, message || 'Passwords do not match');
        return false;
      }
      this.clearError(confirmInput);
      return true;
    },

    /**
     * Determines if a field should undergo validation rules
     */
    isValidateable: function (input) {
      if (!input || input.disabled || input.type === 'hidden' || input.type === 'submit' || input.type === 'button') {
        return false;
      }
      // Check if it is a standard input, textarea or select
      const tag = input.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select';
    },

    /**
     * Evaluates validation rules for a single input element
     * Returns true if valid, false if invalid.
     */
    validateField: function (input) {
      if (!this.isValidateable(input)) return true;
      if (!isElementVisible(input) && input.type !== 'file') return true;

      const name = input.name || '';
      const type = input.type || '';

      // Check required
      if (input.hasAttribute('required')) {
        const val = input.value ? input.value.trim() : '';
        if (!val) {
          // Custom error messages aligned with userValidation Joi errors
          let reqMsg = 'This field is required';
          if (name === 'email') reqMsg = 'Email is required';
          else if (name === 'password' || name === 'currentPassword' || name === 'newPassword') reqMsg = 'Password is required';
          else if (name === 'confirmPassword') reqMsg = 'Confirm password is required';
          else if (name === 'name' || name === 'full_name') reqMsg = 'Name is required';
          else if (name === 'phone' || name === 'phone_number') reqMsg = 'Phone number is required';
          else if (name === 'pincode') reqMsg = 'Pincode is required';
          else if (name === 'category_name') reqMsg = 'Category name is required';
          else if (name === 'product_name') reqMsg = 'Product name is required';
          else if (name === 'description') reqMsg = 'Description is required';
          else if (name === 'brand') reqMsg = 'Brand is required';
          else if (name === 'price') reqMsg = 'Price is required';
          else if (name === 'sizes') reqMsg = 'Size is required';
          else if (name === 'stocks') reqMsg = 'Stock is required';
          else if (name === 'otp') reqMsg = 'OTP is required';

          this.showError(input, reqMsg);
          return false;
        }
      }

      // Check Email
      if (type === 'email' || name === 'email') {
        return this.validateEmail(input);
      }

      // Check Password (ignore confirm fields here, handled separately)
      if (type === 'password' && !name.toLowerCase().includes('confirm')) {
        // Change password might have currentPassword or newPassword
        if (name === 'newPassword') {
          return this.validatePassword(input, 'New password must be at least 6 characters');
        }
        return this.validatePassword(input);
      }

      // Check Confirm Password
      if (name === 'confirmPassword' || name === 'confirm_password') {
        const form = input.closest('form');
        let passInput = null;
        if (form) {
          passInput = form.querySelector('input[name="password"]') || form.querySelector('input[name="newPassword"]') || form.querySelector('input[type="password"]');
        }
        return this.validateConfirmPassword(input, passInput);
      }

      // Check Phone
      if (type === 'tel' || name === 'phone' || name === 'phone_number') {
        return this.validatePhone(input);
      }

      // Check Pincode
      if (name === 'pincode') {
        return this.validatePincode(input);
      }

      // Check minlength attribute
      if (input.hasAttribute('minlength')) {
        const min = parseInt(input.getAttribute('minlength'), 10);
        let minMsg = `Must be at least ${min} characters`;
        if (name === 'name' || name === 'full_name') minMsg = 'Name must be at least 3 characters';
        else if (name === 'address') minMsg = 'Address must be at least 5 characters';
        else if (name === 'product_name') minMsg = 'Product name must be at least 3 characters';
        else if (name === 'description') minMsg = 'Description must be at least 20 characters';
        
        return this.validateMinLength(input, min, minMsg);
      }

      // Check OTP
      if (name === 'otp') {
        const val = input.value ? input.value.trim() : '';
        if (val && !/^[0-9]{6}$/.test(val)) {
          this.showError(input, 'OTP must be 6 digits');
          return false;
        }
      }

      // Check Category / Product Price
      if (name === 'price') {
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          this.showError(input, 'Price must be greater than 0');
          return false;
        }
      }

      // Custom file validation helper (if file inputs have limits or size bounds)
      if (type === 'file' && input.hasAttribute('required') && (!input.files || input.files.length === 0)) {
        this.showError(input, 'Please select a file to upload');
        return false;
      }

      this.clearError(input);
      return true;
    },

    /**
     * Validates all visible fields in a form.
     * Focuses first invalid field.
     * Returns true if all valid, false if any invalid.
     */
    validateForm: function (form) {
      if (!form) return true;

      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      let firstInvalidInput = null;

      inputs.forEach(input => {
        // Evaluate validation for each input
        if (this.isValidateable(input)) {
          const fieldValid = this.validateField(input);
          if (!fieldValid) {
            isValid = false;
            if (!firstInvalidInput) {
              firstInvalidInput = input;
            }
          }
        }
      });

      // Focus first invalid input to enhance form UX
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }

      return isValid;
    }
  };

  // ==========================================================================
  // Global Event Delegation & Initialization
  // ==========================================================================

  // Prevent browser native popup tooltips globally and hook event delegation
  document.addEventListener('DOMContentLoaded', () => {
    // Disable native validation globally for existing/initial forms
    document.querySelectorAll('form').forEach(form => {
      form.setAttribute('novalidate', 'true');
    });

    // Watch DOM for dynamically injected forms (modals, ajax layouts)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'FORM') {
                node.setAttribute('novalidate', 'true');
              } else {
                node.querySelectorAll('form').forEach(form => {
                  form.setAttribute('novalidate', 'true');
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Intercept form submissions globally
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form && form.tagName === 'FORM') {
      // Ensure novalidate is explicitly active
      form.setAttribute('novalidate', 'true');

      // Let specific checkout or custom components opt-out if needed (e.g. data-no-auto-validate)
      if (form.hasAttribute('data-no-auto-validate')) {
        return;
      }

      const isValid = window.Validator.validateForm(form);
      if (!isValid) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true); // Capture phase to run before standard listeners

  // Monitor real-time input fields for instant feedback and error removal
  document.addEventListener('input', function (e) {
    const input = e.target;
    if (window.Validator.isValidateable(input)) {
      window.Validator.validateField(input);
    }
  }, true);

  // Validate on blur to ensure user gets feedback when moving past fields
  document.addEventListener('blur', function (e) {
    const input = e.target;
    if (window.Validator.isValidateable(input)) {
      window.Validator.validateField(input);
    }
  }, true);
})();
