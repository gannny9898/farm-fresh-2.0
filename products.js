/**
 * Products JavaScript
 * Handles loading and displaying products
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load products
    loadProducts();
    
    // Set up filter form
    setupFilterForm();
    
    // Set up sort dropdown
    setupSortDropdown();
    
    // Update cart count
    updateCartCount();

    // Update navigation based on login status
    updateNavigation();
});

/**
 * Load products from localStorage
 */
function loadProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products available.</p>';
        return;
    }
    
    // Get filter values from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    const searchQuery = urlParams.get('search');
    const sortBy = urlParams.get('sort') || 'name-asc';
    
    // Filter products
    let filteredProducts = products;
    
    if (categoryFilter && categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category == categoryFilter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }
    
    // Sort products
    filteredProducts = sortProducts(filteredProducts, sortBy);
    
    // Display products
    displayProducts(filteredProducts);
}

/**
 * Display products in the container
 */
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
                <p class="text-gray-600 font-medium text-lg">No products match your filters.</p>
                <button onclick="window.location.href='products.html'" class="mt-4 inline-flex items-center text-primary hover:text-primary-dark">
                    <i class="fas fa-undo mr-2"></i> Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    // Get registered users to find farmer names
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    let productsHTML = '';
    
    products.forEach(product => {
        // Find farmer name
        const farmer = users.find(user => user.id == product.farmer_id);
        const farmerName = farmer ? farmer.full_name : 'Unknown Farmer';
        
        // Get category color
        let categoryColor = '';
        switch(product.category) {
            case '1': categoryColor = 'bg-green-500'; break;
            case '2': categoryColor = 'bg-orange-500'; break;
            case '3': categoryColor = 'bg-blue-500'; break;
            case '4': categoryColor = 'bg-yellow-500'; break;
            case '5': categoryColor = 'bg-purple-500'; break;
            default: categoryColor = 'bg-gray-500';
        }
        
        productsHTML += `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group" data-product-id="${product.id}">
                <div class="relative">
                    <img src="${product.image || 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Product'}" 
                         alt="${product.name}" 
                         class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105">
                    <div class="absolute top-3 left-3 ${categoryColor} text-white text-xs font-semibold px-2 py-1 rounded-full">
                        ${getCategoryName(product.category)}
                    </div>
                    <button class="absolute top-3 right-3 bg-white/80 text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onclick="addToWishlist('${product.id}')" aria-label="Add to wishlist">
                        <i class="fas fa-heart text-sm"></i>
                    </button>
                </div>
                <div class="p-5">
                    <h3 class="text-lg font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors">${product.name}</h3>
                    <div class="flex items-center mb-3">
                        <img src="https://via.placeholder.com/50/4CAF50/FFFFFF?text=F" alt="Farmer" class="w-5 h-5 rounded-full mr-1 border border-green-200">
                        <a href="farmer-profile.html?id=${product.farmer_id}" class="text-xs text-gray-500 hover:text-primary transition-colors">
                            By ${farmerName}
                        </a>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-lg font-bold text-primary">₹${product.price}<span class="text-xs text-gray-500">/${product.unit || 'unit'}</span></div>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">In Stock</span>
                    </div>
                    <button class="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 hover:shadow add-to-cart-btn" 
                            data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = productsHTML;
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

/**
 * Set up filter form
 */
function setupFilterForm() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categorySelect = document.getElementById('category-filter');
        const searchInput = document.getElementById('search-filter');
        const sortSelect = document.getElementById('sort-filter');
        
        const category = categorySelect.value;
        const search = searchInput.value.trim();
        const sort = sortSelect.value;
        
        // Build URL with filter parameters
        const url = new URL(window.location.href);
        const params = new URLSearchParams();
        
        if (category && category !== 'all') {
            params.set('category', category);
        }
        
        if (search) {
            params.set('search', search);
        }
        
        if (sort) {
            params.set('sort', sort);
        }
        
        // Update URL and reload page
        window.location.href = `products.html${params.toString() ? '?' + params.toString() : ''}`;
    });
}

/**
 * Update filter form with current values
 */
function updateFilterForm(category, search, sort) {
    const categorySelect = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-filter');
    const sortSelect = document.getElementById('sort-filter');
    
    if (categorySelect && category) {
        categorySelect.value = category;
    }
    
    if (searchInput && search) {
        searchInput.value = search;
    }
    
    if (sortSelect && sort) {
        sortSelect.value = sort;
    }
}

/**
 * Set up sort dropdown
 */
function setupSortDropdown() {
    const sortSelect = document.getElementById('sort-filter');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const form = document.getElementById('filter-form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

/**
 * Sort products based on sort option
 */
function sortProducts(products, sortBy) {
    switch (sortBy) {
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
        default:
            products.sort((a, b) => a.name.localeCompare(b.name));
    }
    return products;
}

/**
 * Get category name from category ID
 */
function getCategoryName(categoryId) {
    const categories = {
        1: 'Vegetables',
        2: 'Fruits',
        3: 'Dairy Products',
        4: 'Grains',
        5: 'Herbs'
    };
    
    return categories[categoryId] || 'Other';
}

/**
 * Add product to cart
 */
function addToCart(productId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification('Please login to add items to cart', 'warning');
        window.location.href = 'login.html';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            farmer: product.farmer,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart', 'success');
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Function to redirect to appropriate dashboard based on user type
function redirectToDashboard() {
    const user = window.AccessControl ? window.AccessControl.getCurrentUser() : JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Redirect based on user type
    if (user.user_type === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (user.user_type === 'farmer') {
        window.location.href = 'farmer-dashboard.html';
    } else {
        window.location.href = 'customer-dashboard.html';
    }
}

// Function to update navigation based on login status
function updateNavigation() {
    // Implementation of updateNavigation function
}

/**
 * Function to check if user is logged in
 */
function isLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user;
}

/**
 * Add product to wishlist
 */
function addToWishlist(productId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification('Please login to add items to wishlist', 'warning');
        window.location.href = 'login.html';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingItem = wishlist.find(item => item.id === productId);
    
    if (existingItem) {
        // If already in wishlist, remove it
        wishlist = wishlist.filter(item => item.id !== productId);
        showNotification('Product removed from wishlist', 'success');
    } else {
        // Add to wishlist
        wishlist.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            farmer_id: product.farmer_id
        });
        showNotification('Product added to wishlist', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}