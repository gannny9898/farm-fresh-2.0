// Ensure navbar is initialized
function ensureNavbarInitialized() {
  if (!window.navbar) {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer && navbarContainer.children.length > 0) {
      window.navbar = Navbar.init();
    } else {
      // Try again in 100ms
      setTimeout(ensureNavbarInitialized, 100);
    }
  }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load navbar template
  fetch('templates/navbar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('navbar-container').innerHTML = html;
      ensureNavbarInitialized();
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
    });

  // Initialize other components
  if (typeof initComponents === 'function') {
    initComponents();
  }
});

// Handle page-specific initialization
function initComponents() {
  // Initialize AOS if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
      delay: 100,
      easing: 'ease-in-out'
    });
  }

  // Initialize other components based on page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  switch (currentPage) {
    case 'index.html':
      if (typeof initTestimonialSlider === 'function') initTestimonialSlider();
      if (typeof initFaqAccordions === 'function') initFaqAccordions();
      break;
    case 'products.html':
      if (typeof initProductFilters === 'function') initProductFilters();
      if (typeof loadProducts === 'function') loadProducts();
      break;
    case 'cart.html':
      if (typeof initCart === 'function') initCart();
      break;
    // Add other page-specific initializations
  }
}

// Handle storage events for real-time updates
window.addEventListener('storage', (e) => {
  if (!window.navbar) return;

  switch (e.key) {
    case 'cart':
      window.navbar.updateCartCount();
      break;
    case 'user':
      window.navbar.updateAuthDisplay();
      break;
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ensureNavbarInitialized,
    initComponents
  };
} 