// Handle login/register form switching
function showForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.querySelector('[onclick="showForm(\'login\')"]');
    const registerTab = document.querySelector('[onclick="showForm(\'register\')"]');

    if (formType === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const userTypeSelect = document.getElementById('user-type');
    const farmerFields = document.getElementById('farmer-fields');
    const customerFields = document.getElementById('customer-fields');
    const categoryError = document.querySelector('.category-error');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
                
                // Get form data
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value;
                
                // Validate form data
                if (!email) {
                    throw new Error('Please enter your email');
                }
                
                if (!password) {
                    throw new Error('Please enter your password');
                }
                
                // Debug info
                const debugContent = document.getElementById('debug-content');
                if (debugContent) {
                    debugContent.textContent = `Attempting login with email: ${email}\n`;
                    document.getElementById('debug-info').classList.add('show');
                }
                
                console.log('Login attempt:', { email });
                
                // Send login request
                const requestData = JSON.stringify({ email, password });
                console.log('Request data:', requestData);
                
                if (debugContent) {
                    debugContent.textContent += `Request data: ${requestData}\n`;
                }
                
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: requestData
                });
                
                console.log('Response status:', response.status);
                
                if (debugContent) {
                    debugContent.textContent += `Response status: ${response.status}\n`;
                }
                
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (debugContent) {
                    debugContent.textContent += `Content-Type: ${contentType || 'none'}\n`;
                }
                
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response received:', text);
                    
                    if (debugContent) {
                        debugContent.textContent += `Non-JSON response received: ${text}\n`;
                    }
                    
                    throw new Error('Server returned non-JSON response. Please try again later.');
                }
                
                const result = await response.json();
                console.log('Response data:', result);
                
                if (debugContent) {
                    debugContent.textContent += `Response data: ${JSON.stringify(result, null, 2)}\n`;
                }
                
                if (response.ok) {
                    // Save user data and token to localStorage
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);
                    
                    // Show success message
                    showNotification('Login successful! Redirecting...', 'success');
                    
                    if (debugContent) {
                        debugContent.textContent += 'Login successful! Redirecting...\n';
                    }
                    
                    // Redirect to appropriate page based on user type
                    setTimeout(() => {
                        if (result.user.user_type === 'farmer') {
                            window.location.href = 'farmer-dashboard.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                
                const debugContent = document.getElementById('debug-content');
                if (debugContent) {
                    debugContent.textContent += `Error: ${error.message || 'Unknown error'}\n`;
                    document.getElementById('debug-info').classList.add('show');
                }
                
                showNotification(error.message || 'Login failed. Please try again.', 'error');
            } finally {
                // Restore button state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Login';
                submitBtn.disabled = false;
            }
        });
    }

    if (registerForm) {
        // Toggle conditional fields based on user type
        userTypeSelect?.addEventListener('change', function() {
            if (this.value === 'farmer') {
                farmerFields?.classList.remove('hidden');
                customerFields?.classList.add('hidden');
            } else if (this.value === 'customer') {
                customerFields?.classList.remove('hidden');
                farmerFields?.classList.add('hidden');
            }
        });

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted'); // Debug log 1
            
            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Registering...';
                submitBtn.disabled = true;

                // Validate form data
                const formData = {
                    email: document.getElementById('register-email').value.trim(),
                    password: document.getElementById('register-password').value,
                    full_name: document.getElementById('register-name').value.trim(),
                    phone: document.getElementById('register-phone').value.trim(),
                    user_type: userTypeSelect.value
                };

                // Validate required fields
                for (const [key, value] of Object.entries(formData)) {
                    if (!value) {
                        throw new Error(`Please fill in ${key.replace('_', ' ')}`);
                    }
                }

                console.log('Form data collected:', formData); // Debug log 2

                // Add user type specific data
                if (formData.user_type === 'farmer') {
                    // Get selected categories
                    const categoryCheckboxes = document.querySelectorAll('input[name="farm-products[]"]:checked');
                    console.log('Category checkboxes:', categoryCheckboxes);
                    
                    const selectedCategories = Array.from(categoryCheckboxes)
                        .map(checkbox => parseInt(checkbox.value));
                    
                    console.log('Selected categories:', selectedCategories);

                    if (selectedCategories.length === 0) {
                        showNotification('Please select at least one product category', 'error');
                        throw new Error('Please select at least one product category');
                    }

                    formData.farm_name = document.getElementById('farm-name').value.trim();
                    formData.farm_location = document.getElementById('farm-location').value.trim();
                    formData.product_categories = selectedCategories;

                    // Validate farmer-specific fields
                    if (!formData.farm_name || !formData.farm_location) {
                        throw new Error('Please fill in all farmer details');
                    }
                } else if (formData.user_type === 'customer') {
                    formData.delivery_address = document.getElementById('delivery-address').value.trim();
                    
                    // Validate customer-specific fields
                    if (!formData.delivery_address) {
                        throw new Error('Please fill in delivery address');
                    }
                }

                console.log('Sending data to:', 'api/register.php'); // Debug log 4
                
                // Send registration request with relative URL
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Response status:', response.status); // Debug log 5
                
                let result;
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response received:', text);
                    throw new Error('Server returned non-JSON response. Check server logs.');
                }
                
                result = await response.json();
                console.log('Response data:', result); // Debug log 7

                if (response.ok) {
                    showNotification('Registration successful! Please login.', 'success');
                    // Clear form
                    registerForm.reset();
                    // Switch to login form after a short delay
                    setTimeout(() => {
                        showForm('login');
                    }, 2000);
                } else {
                    throw new Error(result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification(error.message || 'Registration failed. Please try again.', 'error');
            } finally {
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Shopping Cart functionality
let cart = [];

// Toggle user-specific fields in registration form
function toggleUserFields() {
    const userType = document.getElementById('user-type').value;
    const farmerFields = document.getElementById('farmer-fields');
    const customerFields = document.getElementById('customer-fields');

    if (farmerFields && customerFields) {
        if (userType === 'farmer') {
            farmerFields.classList.remove('hidden');
            customerFields.classList.add('hidden');
            // Make farmer-specific fields required
            if (document.getElementById('farm-name')) {
                document.getElementById('farm-name').required = true;
            }
            if (document.getElementById('farm-location')) {
                document.getElementById('farm-location').required = true;
            }
            // Make customer-specific fields not required
            if (document.getElementById('delivery-address')) {
                document.getElementById('delivery-address').required = false;
            }
        } else if (userType === 'customer') {
            farmerFields.classList.add('hidden');
            customerFields.classList.remove('hidden');
            // Make customer-specific fields required
            if (document.getElementById('delivery-address')) {
                document.getElementById('delivery-address').required = true;
            }
            // Make farmer-specific fields not required
            if (document.getElementById('farm-name')) {
                document.getElementById('farm-name').required = false;
            }
            if (document.getElementById('farm-location')) {
                document.getElementById('farm-location').required = false;
            }
        } else {
            farmerFields.classList.add('hidden');
            customerFields.classList.add('hidden');
        }
    }
}

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to handle category selection
function handleCategorySelection() {
    const categoryItems = document.querySelectorAll('.category-item input[type="checkbox"]');
    const categoryError = document.getElementById('category-error');
    
    if (!categoryItems.length || !categoryError) {
        console.log('Category items or error element not found');
        return [];
    }
    
    console.log('Found', categoryItems.length, 'category items');
    
    // Initial check
    updateCategoryError();
    
    // Add event listeners
    categoryItems.forEach(item => {
        item.addEventListener('change', function() {
            console.log('Category changed:', this.value, 'Checked:', this.checked);
            updateCategoryError();
        });
    });
    
    function updateCategoryError() {
        const selectedCategories = Array.from(categoryItems)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        console.log('Selected categories:', selectedCategories);
        
        // Show error if no categories are selected
        if (selectedCategories.length === 0) {
            categoryError.style.display = 'block';
            categoryError.classList.add('show');
        } else {
            categoryError.style.display = 'none';
            categoryError.classList.remove('show');
        }
        
        return selectedCategories;
    }
}

// Validate form before submission
function validateFarmerForm() {
    const categoryItems = document.querySelectorAll('.category-item input[type="checkbox"]:checked');
    const categoryError = document.getElementById('category-error');
    
    if (categoryItems.length === 0) {
        if (categoryError) {
            categoryError.style.display = 'block';
            categoryError.classList.add('show');
        }
        showNotification('Please select at least one product category', 'error');
        return false;
    }
    
    return true;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') && localStorage.getItem('user');
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('You have been logged out', 'success');
    window.location.href = 'index.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.querySelector('.login-link');
    if (!loginLink) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        // Create user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <button class="user-menu-btn">
                <span class="user-name">${user.full_name}</span>
                <span class="dropdown-icon">▼</span>
            </button>
            <div class="user-menu-dropdown">
                <a href="profile.html">My Profile</a>
                <a href="#" id="logout-button">Logout</a>
            </div>
        `;
        
        // Replace login link with user menu
        loginLink.parentNode.replaceChild(userMenu, loginLink);
        
        // Add event listener for logout button
        document.getElementById('logout-button').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        // Toggle dropdown on click
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const userMenuDropdown = document.querySelector('.user-menu-dropdown');
        
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userMenuDropdown.classList.remove('active');
        });
    } else {
        // If there's a user menu, replace it with login link
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.className = 'login-link';
            loginLink.textContent = 'Login';
            userMenu.parentNode.replaceChild(loginLink, userMenu);
        }
    }

    // Update cart count
    updateCartCount();
}

// Initialize cart
function initCart() {
    loadCartFromLocalStorage();
    updateCartCount();
    
    // If on cart page, display cart items
    if (window.location.pathname.includes('cart.html')) {
        updateCartDisplay();
    }
}

// Enhanced Shopping Cart functionality
function addToCart(productId, name, price, image, farmer) {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            productId, 
            name, 
            price: parseFloat(price.replace(/[^0-9.-]+/g, "")), 
            image, 
            farmer,
            quantity: 1 
        });
    }
    
    updateCartCount();
    saveCartToLocalStorage();
    showCartNotification();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartDisplay();
    updateCartCount();
    saveCartToLocalStorage();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        updateCartDisplay();
        saveCartToLocalStorage();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartContainer = document.querySelector('.cart-container');
    
    if (!cartItems) return; // Not on cart page
    
    if (cart.length === 0) {
        cartContainer.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        return;
    }
    
    cartContainer.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="farmer">${item.farmer}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.productId}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.productId}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item" onclick="removeFromCart('${item.productId}')">Remove</button>
            </div>
        </div>
    `).join('');
    
    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cart.length > 0 ? 50 : 0;
    const total = subtotal + deliveryFee;
    
    if (document.getElementById('cart-subtotal')) {
        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = itemCount;
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function showCartNotification() {
    showNotification('Item added to cart!', 'success');
}

// Checkout function
function checkout() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Show checkout in progress notification
    showNotification('Processing your order...', 'success');
    
    // Get current user
    const user = getCurrentUser();
    
    // Create order object
    const order = {
        id: generateOrderId(),
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        items: [...cart],
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryFee: 50,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50,
        status: 'pending',
        orderDate: new Date().toISOString(),
        deliveryAddress: user.delivery_address || user.farm_location || '',
        paymentMethod: 'Cash on Delivery'
    };
    
    // Save order to localStorage
    saveOrderToLocalStorage(order);
    
    // In a real application, you would send the order data to the server here
    setTimeout(() => {
        // Clear the cart
        cart = [];
        saveCartToLocalStorage();
        updateCartDisplay();
        updateCartCount();
        
        // Show success message
        showNotification('Order placed successfully!', 'success');
        
        // Redirect to a thank you page or home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 2000);
}

// Generate a unique order ID
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Save order to localStorage
function saveOrderToLocalStorage(order) {
    // Get existing orders
    let orders = getOrdersFromLocalStorage();
    
    // Add new order
    orders.push(order);
    
    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Get orders from localStorage
function getOrdersFromLocalStorage() {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
}

// Get orders for current user
function getCurrentUserOrders() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const orders = getOrdersFromLocalStorage();
    return orders.filter(order => order.userId === user.id);
}

// Get order by ID
function getOrderById(orderId) {
    const orders = getOrdersFromLocalStorage();
    return orders.find(order => order.id === orderId);
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    let orders = getOrdersFromLocalStorage();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        return true;
    }
    
    return false;
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (targetId === '#' || !targetId) return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Get the navbar height for offset
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                
                // Calculate the target position with offset
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                // Scroll to the target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Lazy loading for images to improve scrolling performance
function initLazyLoading() {
    // Check if the browser supports IntersectionObserver
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        function lazyLoad() {
            lazyImages.forEach(img => {
                if (img.getBoundingClientRect().top <= window.innerHeight && img.getBoundingClientRect().bottom >= 0) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            
            // If all images are loaded, remove the scroll event listener
            if (lazyImages.length === 0) {
                window.removeEventListener('scroll', lazyLoad);
            }
        }
        
        // Load initial images
        lazyLoad();
        
        // Add scroll event listener
        window.addEventListener('scroll', lazyLoad);
    }
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on login status
    updateNavigation();
    
    // Initialize cart functionality
    initCart();
    
    // Initialize scroll to top button
    initScrollToTop();
    
    // Initialize smooth scroll for anchor links
    initSmoothScroll();
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Add event listeners to "Add to Cart" buttons if on products page
    if (window.location.pathname.includes('products.html') || window.location.pathname.includes('index.html')) {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            // Check if the button already has an onclick attribute
            if (!button.hasAttribute('onclick')) {
                button.addEventListener('click', function() {
                    const productCard = this.closest('.product-card');
                    const productId = productCard.dataset.productId;
                    const name = productCard.querySelector('h3').textContent;
                    const price = productCard.querySelector('.price').textContent;
                    const image = productCard.querySelector('img').src;
                    const farmer = productCard.querySelector('.farmer').textContent;
                    
                    addToCart(productId, name, price, image, farmer);
                });
            }
        });
    }
    
    // Initialize category selection handling if on login/register page
    if (window.location.pathname.includes('login.html')) {
        handleCategorySelection();
    }
    
    // Check if we're on the profile page
    if (window.location.pathname.includes('profile.html')) {
        // Redirect to login if not logged in
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
});

// Function to toggle debug info
function toggleDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.classList.toggle('show');
    }
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu-btn')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Initialize all components
    initScrollToTop();
    initSmoothScroll();
    initIntersectionAnimations();
    initSearchSuggestions();
    setupProductInteractions();
});

// Scroll to Top Button
function initScrollToTop() {
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });
}

// Intersection Observer for Scroll Animations
function initIntersectionAnimations() {
    // If AOS is not loaded or running, provide fallback animations
    if (!window.AOS) {
        const animateElements = document.querySelectorAll('.feature-card, .product-card, .category-card, [data-aos]');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateElements.forEach(el => {
            observer.observe(el);
        });
    }
}

// Cart Functionality
function addToCart(productId, name, price, image, farmer) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name,
            price,
            image,
            farmer,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        
        // Add animation
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 300);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification') || createNotificationElement();
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function createNotificationElement() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
    return notification;
}

// Search Suggestions Functionality
function initSearchSuggestions() {
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!searchInput || !suggestionsContainer) return;
    
    // Sample product data (in a real app, this would come from an API)
    const products = [
        'Organic Tomatoes',
        'Fresh Carrots',
        'Seasonal Apples',
        'Organic Milk',
        'Free Range Eggs',
        'Fresh Spinach',
        'Organic Potatoes',
        'Brown Rice',
        'Whole Wheat Bread',
        'Greek Yogurt'
    ];
    
    searchInput.addEventListener('input', () => {
        const value = searchInput.value.trim().toLowerCase();
        
        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';
        
        if (value.length < 2) {
            suggestionsContainer.classList.remove('active');
            return;
        }
        
        // Filter products that match the input
        const filteredProducts = products.filter(product => 
            product.toLowerCase().includes(value)
        );
        
        if (filteredProducts.length > 0) {
            // Create and append suggestion items
            filteredProducts.forEach(product => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                
                // Highlight the matching part
                const regex = new RegExp(`(${value})`, 'gi');
                const highlightedText = product.replace(regex, '<strong>$1</strong>');
                
                suggestionItem.innerHTML = highlightedText;
                
                suggestionItem.addEventListener('click', () => {
                    searchInput.value = product;
                    suggestionsContainer.classList.remove('active');
                });
                
                suggestionsContainer.appendChild(suggestionItem);
            });
            
            suggestionsContainer.classList.add('active');
        } else {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-container')) {
            suggestionsContainer.classList.remove('active');
        }
    });
    
    // Handle keyboard navigation in suggestions
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        if (!suggestions.length) return;
        
        const highlightedItem = suggestionsContainer.querySelector('.highlighted');
        let nextItem;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!highlightedItem) {
                    suggestions[0].classList.add('highlighted');
                } else {
                    highlightedItem.classList.remove('highlighted');
                    nextItem = highlightedItem.nextElementSibling || suggestions[0];
                    nextItem.classList.add('highlighted');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (!highlightedItem) {
                    suggestions[suggestions.length - 1].classList.add('highlighted');
                } else {
                    highlightedItem.classList.remove('highlighted');
                    nextItem = highlightedItem.previousElementSibling || suggestions[suggestions.length - 1];
                    nextItem.classList.add('highlighted');
                }
                break;
                
            case 'Enter':
                if (highlightedItem) {
                    e.preventDefault();
                    searchInput.value = highlightedItem.textContent;
                    suggestionsContainer.classList.remove('active');
                }
                break;
                
            case 'Escape':
                suggestionsContainer.classList.remove('active');
                break;
        }
    });
}

// Product Interactions
function setupProductInteractions() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.querySelector('img')?.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.querySelector('img')?.classList.remove('hover');
        });
    });
}

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const toggle = otherItem.querySelector('.faq-toggle i');
                        if (toggle) {
                            toggle.classList.remove('fa-minus');
                            toggle.classList.add('fa-plus');
                        }
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                
                const toggle = question.querySelector('.faq-toggle i');
                if (toggle) {
                    if (isActive) {
                        toggle.classList.remove('fa-minus');
                        toggle.classList.add('fa-plus');
                    } else {
                        toggle.classList.remove('fa-plus');
                        toggle.classList.add('fa-minus');
                    }
                }
            });
        }
    });
});

// Testimonial Slider
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length || !dots.length) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        slides[index].style.display = 'block';
        dots[index].classList.add('active');
        currentSlide = index;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopSlideshow() {
        clearInterval(slideInterval);
    }
    
    // Initialize first slide
    showSlide(0);
    startSlideshow();
    
    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopSlideshow();
            startSlideshow();
        });
    });
    
    // Pause slideshow on hover
    slides.forEach(slide => {
        slide.addEventListener('mouseenter', stopSlideshow);
        slide.addEventListener('mouseleave', startSlideshow);
    });
});

// Newsletter Form
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (isValidEmail(email)) {
                // In a real app, this would send the email to a server
                // For demo purposes, just show a success message
                emailInput.value = '';
                showNotification('Thank you for subscribing to our newsletter!');
            } else {
                showNotification('Please enter a valid email address.');
            }
        });
    }
});

// Helper function to validate email
function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

// Add to cart animation
function animateAddToCart(button, productCard) {
    button.classList.add('adding');
    
    setTimeout(() => {
        button.classList.remove('adding');
        button.classList.add('added');
        
        setTimeout(() => {
            button.classList.remove('added');
        }, 1500);
    }, 500);
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
}); 