class Navbar {
  constructor() {
    this.loadNavbarTemplate().then(() => {
      this.initializeNavbar();
    }).catch(error => {
      console.error('Failed to load navbar:', error);
    });
  }

  async loadNavbarTemplate() {
    try {
      console.log('Loading navbar template...');
      
      // Get the navbar container
      const container = document.getElementById('navbar-container');
      if (!container) {
        throw new Error('Navbar container not found');
      }
      
      // Try multiple possible paths to find the navbar template
      const possiblePaths = [
        './public/templates/navbar.html',
        '../public/templates/navbar.html',
        '/public/templates/navbar.html',
        'public/templates/navbar.html'
      ];
      
      let html = null;
      
      // Try each path until one works
      for (const path of possiblePaths) {
        try {
          console.log(`Trying to load navbar from: ${path}`);
          const response = await fetch(path);
          
          if (response.ok) {
            html = await response.text();
            console.log(`Successfully loaded navbar from: ${path}`);
            break;
          }
        } catch (err) {
          console.warn(`Failed to load navbar from ${path}:`, err.message);
        }
      }
      
      // If we couldn't load the navbar from any path, use hardcoded HTML as a last resort
      if (!html) {
        console.warn('All paths failed, using hardcoded navbar HTML');
        html = this.getHardcodedNavbarHTML();
      }
      
      // Insert the navbar HTML
      container.innerHTML = html;
      
      // Fix logo path if needed based on current page
      this.fixLogoPaths();
      
      // Load navbar styles
      await this.loadStyles();
      
      console.log('Navbar template loaded successfully');
    } catch (error) {
      console.error('Error loading navbar template:', error);
      throw error;
    }
  }
  
  getHardcodedNavbarHTML() {
    // This is a last resort fallback if all fetch attempts fail
    return `
      <nav class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="index.html" class="flex items-center space-x-2">
            <img src="./public/images/farm-logo.svg" alt="Farm Fresh Logo" class="w-10 h-10 logo-image">
            <span class="text-xl font-bold text-primary">Farm Fresh</span>
          </a>

          <button class="lg:hidden flex flex-col space-y-1.5" id="mobile-menu-button">
            <span class="block w-6 h-0.5 bg-secondary rounded-full transition-all"></span>
            <span class="block w-6 h-0.5 bg-secondary rounded-full transition-all"></span>
            <span class="block w-6 h-0.5 bg-secondary rounded-full transition-all"></span>
          </button>

          <div class="hidden lg:flex items-center space-x-8">
            <a href="index.html" class="text-secondary hover:text-primary font-medium transition-colors duration-300">Home</a>
            <a href="products.html" class="text-secondary hover:text-primary font-medium transition-colors duration-300">Products</a>
            <a href="farmers.html" class="text-secondary hover:text-primary font-medium transition-colors duration-300">Farmers</a>
            <a href="about.html" class="text-secondary hover:text-primary font-medium transition-colors duration-300">About</a>
            <a href="contact.html" class="text-secondary hover:text-primary font-medium transition-colors duration-300">Contact</a>
          </div>

          <div class="hidden lg:flex items-center space-x-4">
            <div class="auth-links hidden">
              <a href="login.html" class="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300">Login</a>
              <a href="register.html" class="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300">Register</a>
            </div>

            <div class="user-profile flex items-center space-x-4">
              <a href="cart.html" class="relative text-secondary hover:text-primary transition-colors duration-300">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center cart-count">0</span>
              </a>
              <div class="relative group">
                <button class="flex items-center space-x-2 focus:outline-none">
                  <i class="fas fa-user-circle text-2xl text-secondary"></i>
                  <span class="user-name font-medium">User Name</span>
                  <i class="fas fa-chevron-down text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                  <a href="#" id="dashboard-link" class="block px-4 py-3 text-secondary hover:bg-gray-50 hover:text-primary transition-colors duration-300">Dashboard</a>
                  <a href="profile.html" class="block px-4 py-3 text-secondary hover:bg-gray-50 hover:text-primary transition-colors duration-300">Profile</a>
                  <a href="orders.html" class="block px-4 py-3 text-secondary hover:bg-gray-50 hover:text-primary transition-colors duration-300">Orders</a>
                  <a href="#" id="logout-btn" class="block px-4 py-3 text-secondary hover:bg-gray-50 hover:text-primary transition-colors duration-300">Logout</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile menu, show/hide based on menu state -->
        <div class="lg:hidden hidden bg-white border-t border-gray-100" id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a href="index.html" class="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50">Home</a>
            <a href="products.html" class="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50">Products</a>
            <a href="farmers.html" class="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50">Farmers</a>
            <a href="about.html" class="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50">About</a>
            <a href="contact.html" class="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-gray-50">Contact</a>
          </div>
        </div>
      </nav>
    `;
  }
  
  getBasePath() {
    // Get the current path to determine if we're in a subdirectory
    const path = window.location.pathname;
    const parts = path.split('/');
    
    // Remove the file name and empty strings
    const directories = parts.filter(part => part && !part.includes('.'));
    
    // If we're in a subdirectory, we need to go up one level
    if (directories.length > 0) {
      return '../';
    }
    
    return './';
  }
  
  fixLogoPaths() {
    console.log('Fixing logo paths...');
    
    // Find all logo images with the logo-image class
    const logoImages = document.querySelectorAll('.logo-image');
    
    if (logoImages.length === 0) {
      console.warn('No logo images found to fix');
      return;
    }
    
    console.log(`Found ${logoImages.length} logo images to fix`);
    
    // Try multiple possible paths for the logo
    const possiblePaths = [
      './public/images/farm-logo.svg',
      '../public/images/farm-logo.svg',
      '/public/images/farm-logo.svg',
      'public/images/farm-logo.svg'
    ];
    
    // Fix each logo image
    logoImages.forEach(logoImg => {
      // Get current path and adjust logo path based on current location
      const currentPath = window.location.pathname;
      const isInSubfolder = currentPath.split('/').length > 2;
      
      if (isInSubfolder) {
        // If in subfolder, use relative path with ../ to go up one level
        logoImg.src = '../public/images/farm-logo.svg';
      } else {
        // If in root, use the standard path
        logoImg.src = './public/images/farm-logo.svg';
      }
    });
  }

  async loadStyles() {
    // Ensure navbar styles are loaded
    const basePath = this.getBasePath();
    const cssPath = `${basePath}public/css/navbar.css`;
    
    // Check if the stylesheet is already loaded (with any path)
    const existingLink = document.querySelector('link[href*="navbar.css"]');
    
    if (!existingLink) {
      console.log(`Loading navbar styles from: ${cssPath}`);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      document.head.appendChild(link);
    } else {
      console.log('Navbar styles already loaded');
    }
  }

  initializeNavbar() {
    console.log('Initializing navbar elements...');
    
    // Mobile menu button
    this.mobileMenuButton = document.getElementById('mobile-menu-button');
    this.mobileMenu = document.getElementById('mobile-menu');
    
    // Navigation elements
    this.navLinks = document.querySelector('.nav-links');
    this.authLinks = document.querySelector('.auth-links');
    this.userProfile = document.querySelector('.user-profile');
    this.cartCount = document.querySelector('.cart-count');
    this.dashboardLink = document.getElementById('dashboard-link');
    this.logoutBtn = document.getElementById('logout-btn');
    
    // Log which elements were found
    console.log('Mobile menu button found:', !!this.mobileMenuButton);
    console.log('Mobile menu found:', !!this.mobileMenu);
    console.log('Auth links found:', !!this.authLinks);
    console.log('User profile found:', !!this.userProfile);
    console.log('Cart count found:', !!this.cartCount);
    console.log('Dashboard link found:', !!this.dashboardLink);
    console.log('Logout button found:', !!this.logoutBtn);
    
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.updateAuthDisplay();
    this.updateCartCount();
    this.setupActiveLinks();
    this.setupDashboardRedirect();
    this.setupLogout();
  }

  setupMobileMenu() {
    if (this.mobileMenuButton && this.mobileMenu) {
      console.log('Setting up mobile menu toggle...');
      this.mobileMenuButton.addEventListener('click', () => {
        console.log('Mobile menu button clicked');
        this.mobileMenu.classList.toggle('hidden');
        
        // Animate hamburger icon
        const spans = this.mobileMenuButton.querySelectorAll('span');
        if (spans.length === 3) {
          spans[0].classList.toggle('rotate-45');
          spans[0].classList.toggle('translate-y-1.5');
          spans[1].classList.toggle('opacity-0');
          spans[2].classList.toggle('-rotate-45');
          spans[2].classList.toggle('-translate-y-1.5');
        }
      });
    } else {
      console.warn('Mobile menu elements not found, skipping mobile menu setup');
    }
  }

  updateAuthDisplay() {
    // Always show the user profile section regardless of login status
    if (this.userProfile) {
      this.userProfile.style.display = 'flex';
    }
    
    const user = this.getCurrentUser();
    
    if (user) {
      // Hide auth links since user is logged in
      if (this.authLinks) this.authLinks.style.display = 'none';
      
      // Update user name in profile
      const userName = this.userProfile.querySelector('.user-name');
      if (userName) userName.textContent = user.full_name || 'User';
      
      // Update dashboard link visibility and text
      if (this.dashboardLink) {
        this.dashboardLink.style.display = 'block';
        this.dashboardLink.textContent = `${user.user_type ? (user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)) : 'User'} Dashboard`;
      }
    } else {
      // For development purposes, create a mock user to ensure profile is always visible
      // In production, you might want to show a generic profile or login prompt instead
      const mockUser = {
        full_name: 'Guest User',
        user_type: 'customer'
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Hide auth links to avoid confusion with the profile section
      if (this.authLinks) this.authLinks.style.display = 'none';
      
      // Update user name for the mock user
      const userName = this.userProfile.querySelector('.user-name');
      if (userName) userName.textContent = 'Guest User';
      
      // Configure dashboard link for guest users
      if (this.dashboardLink) {
        this.dashboardLink.style.display = 'block';
        this.dashboardLink.textContent = 'Customer Dashboard';
      }
    }
  }

  setupDashboardRedirect() {
    if (this.dashboardLink) {
      this.dashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        const user = this.getCurrentUser();
        
        if (!user) {
          window.location.href = 'login.html';
          return;
        }
        
        switch (user.user_type) {
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
      });
    }
  }

  setupLogout() {
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      });
    }
  }

  updateCartCount() {
    if (this.cartCount) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      this.cartCount.textContent = totalItems;
    }
  }

  setupActiveLinks() {
    // Get the current page filename
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Select all navigation links
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
      if (link.id === 'dashboard-link') return; // Skip dashboard link
      
      // Get the link's target page
      const linkHref = link.getAttribute('href');
      
      // Check if current page matches the link's target
      if (currentPage === linkHref) {
        link.classList.add('active');
      } else if (currentPage.includes('dashboard') && linkHref === '#' && link.id === 'dashboard-link') {
        // Special case for dashboard link when on dashboard pages
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Handle special cases for dashboard pages
    const user = this.getCurrentUser();
    if (user && currentPage.includes(`${user.user_type}-dashboard.html`)) {
      // If on a dashboard page, ensure dashboard link is active
      const dashboardLink = document.getElementById('dashboard-link');
      if (dashboardLink) {
        dashboardLink.classList.add('active');
      }
    }
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  static init() {
    return new Navbar();
  }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if navbar is already being initialized
  if (!window.navbarInitializing) {
    window.navbarInitializing = true;
    
    // Check if navbar container exists
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
      console.error('Navbar container not found, cannot initialize navbar');
      window.navbarInitializing = false;
      return;
    }
    
    console.log('Initializing navbar...');
    
    // Initialize the navbar
    try {
      window.navbar = new Navbar();
      console.log('Navbar initialized successfully');
    } catch (error) {
      console.error('Failed to initialize navbar:', error);
    } finally {
      window.navbarInitializing = false;
    }
  } else {
    console.log('Navbar initialization already in progress');
  }
});

// Listen for cart updates
window.addEventListener('storage', (e) => {
  if (e.key === 'cart' && window.navbar) {
    window.navbar.updateCartCount();
  }
});

// Listen for auth changes
window.addEventListener('storage', (e) => {
  if (e.key === 'user' && window.navbar) {
    window.navbar.updateAuthDisplay();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navbar;
} 