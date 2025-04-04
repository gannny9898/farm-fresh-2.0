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
    sortProducts(filteredProducts, sortBy);
    
    // Update filter form with current values
    updateFilterForm(categoryFilter, searchQuery, sortBy);
    
    // Display products
    displayProducts(filteredProducts);
}

/**
 * Display products in the container
 */
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products match your filters.</p>';
        return;
    }
    
    // Get registered users to find farmer names
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    let productsHTML = '';
    
    products.forEach(product => {
        // Find farmer name
        const farmer = users.find(user => user.id == product.farmer_id);
        const farmerName = farmer ? farmer.full_name : 'Unknown Farmer';
        
        productsHTML += `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">₹${product.price}/${product.unit || 'unit'}</p>
                    <p class="product-farmer">
                        <a href="farmer-profile.html?id=${product.farmer_id}" class="farmer-link">
                            By ${farmerName}
                        </a>
                    </p>
                    <p class="product-category">${getCategoryName(product.category)}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
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
    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    // Get registered users to find farmer name
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const farmer = users.find(user => user.id == product.farmer_id);
    const farmerName = farmer ? farmer.full_name : 'Unknown Farmer';
    
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id == productId);
    
    if (existingItemIndex !== -1) {
        // Update quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: `₹${product.price}`,
            image: product.image,
            farmer: farmerName,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification('Product added to cart!', 'success');
    
    // Update cart count
    updateCartCount();
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
    
    // All users now go to the same dashboard page
    window.location.href = 'admin-dashboard.html';
} 