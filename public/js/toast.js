/**
 * SNEACKS - Reusable Premium Toast Utility
 * Built with duplicate prevention and luxury visual aesthetics
 */

(function () {
  // Set to cache active toast message texts to prevent duplicate spamming
  const activeToastMessages = new Set();

  /**
   * Helper function to show a custom styled toast notification
   * @param {string} message - Notification text
   * @param {string} type - "success" | "error" | "warning" | "info"
   * @param {number} duration - Display time in ms
   */
  function triggerToast(message, type = 'info', duration = 3000) {
    if (!message) return;
    
    const trimmedMessage = message.trim();

    // Prevent duplicate toast if the exact message is already on screen
    if (activeToastMessages.has(trimmedMessage)) {
      return;
    }

    // Add to active set
    activeToastMessages.add(trimmedMessage);

    // If Toastify library is not available, fall back to default alert/log
    if (typeof Toastify === 'undefined') {
      console.warn('Toastify is not loaded. Fallback message:', message);
      if (type === 'error') {
        alert(message);
      }
      activeToastMessages.delete(trimmedMessage);
      return;
    }

    // Map types to validation.css classes and FontAwesome icons
    let className = 'toast-info';
    let iconHTML = '';
    switch (type) {
      case 'success':
        className = 'toast-success';
        iconHTML = '<span class="toast-icon-wrap"><i class="fas fa-check"></i></span>';
        break;
      case 'error':
        className = 'toast-error';
        iconHTML = '<span class="toast-icon-wrap"><i class="fas fa-times"></i></span>';
        break;
      case 'warning':
        className = 'toast-warning';
        iconHTML = '<span class="toast-icon-wrap"><i class="fas fa-exclamation-triangle"></i></span>';
        break;
      case 'info':
        className = 'toast-info';
        iconHTML = '<span class="toast-icon-wrap"><i class="fas fa-info-circle"></i></span>';
        break;
    }

    // Create DOM node for Toastify to render HTML elements instead of raw text
    const container = document.createElement('div');
    container.className = 'premium-toast-content';
    container.innerHTML = `
      ${iconHTML}
      <span class="toast-message">${trimmedMessage}</span>
    `;

    Toastify({
      node: container,
      duration: duration,
      close: true,
      gravity: 'top', // top or bottom
      position: 'right', // left, center, right
      stopOnFocus: true, // Prevent auto-dismiss on hover
      className: className, // Apply custom class mapping to overrides
      callback: function () {
        // Remove message from set after toast closes
        activeToastMessages.delete(trimmedMessage);
      }
    }).showToast();
  }

  // Define global Toast namespace
  window.Toast = {
    success: function (message, duration = 3000) {
      triggerToast(message, 'success', duration);
    },
    error: function (message, duration = 4000) {
      triggerToast(message, 'error', duration);
    },
    warning: function (message, duration = 3500) {
      triggerToast(message, 'warning', duration);
    },
    info: function (message, duration = 3000) {
      triggerToast(message, 'info', duration);
    }
  };

  // Support legacy global showToast if other files call it directly
  window.showToast = function (text, type) {
    if (window.Toast && typeof window.Toast[type] === 'function') {
      window.Toast[type](text);
    } else {
      triggerToast(text, type);
    }
  };
})();
