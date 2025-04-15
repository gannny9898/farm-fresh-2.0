/**
 * Farmers JavaScript
 * Handles loading and displaying farmers
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load farmers
    loadFarmers();
    
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
 * Load farmers from localStorage
 */
function loadFarmers() {
    if (!isLoggedIn()) {
        const farmersContainer = document.getElementById('farmers-container');
        if (farmersContainer) {
            farmersContainer.innerHTML = `
                <div class="login-prompt">
                    <h2>Please Login to View Farmers</h2>
                    <p>To access our farmers' directory and make purchases, please login or create an account.</p>
                    <div class="auth-buttons">
                        <a href="login.html" class="login-btn">Login</a>
                        <a href="register.html" class="register-btn">Register</a>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    const farmersContainer = document.getElementById('farmers-container');
    if (!farmersContainer) return;
    
    // Get registered users from localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Filter only farmers
    const farmers = users.filter(user => user.user_type === 'farmer');
    
    if (farmers.length === 0) {
        farmersContainer.innerHTML = '<p class="no-farmers">No farmers available.</p>';
        return;
    }
    
    // Get filter values from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    const searchQuery = urlParams.get('search');
    const sortBy = urlParams.get('sort') || 'name-asc';
    
    // Filter farmers
    let filteredFarmers = farmers;
    
    if (categoryFilter && categoryFilter !== 'all') {
        filteredFarmers = filteredFarmers.filter(farmer => 
            farmer.product_categories && 
            farmer.product_categories.includes(parseInt(categoryFilter))
        );
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredFarmers = filteredFarmers.filter(farmer => 
            (farmer.full_name && farmer.full_name.toLowerCase().includes(query)) || 
            (farmer.farm_name && farmer.farm_name.toLowerCase().includes(query)) ||
            (farmer.farm_location && farmer.farm_location.toLowerCase().includes(query)) ||
            (farmer.description && farmer.description.toLowerCase().includes(query))
        );
    }
    
    // Sort farmers
    sortFarmers(filteredFarmers, sortBy);
    
    // Update filter form with current values
    updateFilterForm(categoryFilter, searchQuery, sortBy);
    
    // Display farmers
    displayFarmers(filteredFarmers);
}

/**
 * Display farmers in the container
 */
function displayFarmers(farmers) {
    const farmersContainer = document.getElementById('farmers-container');
    
    if (farmers.length === 0) {
        farmersContainer.innerHTML = '<p class="no-farmers">No farmers match your filters.</p>';
        return;
    }
    
    // Get reviews for rating calculation
    const allReviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
    
    let farmersHTML = '';
    
    farmers.forEach(farmer => {
        // Calculate average rating
        const farmerReviews = allReviews[farmer.id] || [];
        let averageRating = 0;
        
        if (farmerReviews.length > 0) {
            const totalRating = farmerReviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / farmerReviews.length;
        }
        
        // Generate category badges
        let categoriesHTML = '';
        if (farmer.product_categories && farmer.product_categories.length > 0) {
            const categoryNames = {
                1: 'Vegetables',
                2: 'Fruits',
                3: 'Dairy Products',
                4: 'Grains',
                5: 'Herbs'
            };
            
            farmer.product_categories.forEach(catId => {
                const categoryName = categoryNames[catId] || 'Other';
                categoriesHTML += `<span class="category-badge">${categoryName}</span>`;
            });
        }
        
        // Generate organic badge
        const organicBadge = farmer.organic_certified ? 
            '<span class="organic-badge"><i class="fas fa-leaf"></i> Organic Certified</span>' : '';
        
        farmersHTML += `
            <div class="farmer-card">
                <div class="farmer-image">
                    <img src="${farmer.profile_photo || 'https://via.placeholder.com/300'}" alt="${farmer.full_name}">
                </div>
                <div class="farmer-info">
                    <h3 class="farmer-name">${farmer.full_name}</h3>
                    <h4 class="farm-name">${farmer.farm_name || 'Farm Name Not Available'}</h4>
                    <p class="farm-location"><i class="fas fa-map-marker-alt"></i> ${farmer.farm_location || 'Location Not Available'}</p>
                    
                    <div class="farmer-rating">
                        ${generateStarRating(averageRating)}
                        <span class="rating-count">(${farmerReviews.length} ${farmerReviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                    
                    <div class="farmer-categories">
                        ${categoriesHTML}
                    </div>
                    
                    ${organicBadge}
                    
                    <a href="farmer-profile.html?id=${farmer.id}" class="view-profile-btn">View Profile</a>
                </div>
            </div>
        `;
    });
    
    farmersContainer.innerHTML = farmersHTML;
}

/**
 * Generate HTML for star rating
 */
function generateStarRating(rating) {
    const fullStar = '★';
    const emptyStar = '☆';
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    
    let starsHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            starsHTML += `<span class="star">${fullStar}</span>`;
        } else {
            starsHTML += `<span class="star empty">${emptyStar}</span>`;
        }
    }
    
    return starsHTML;
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
        window.location.href = `farmers.html${params.toString() ? '?' + params.toString() : ''}`;
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
 * Sort farmers based on sort option
 */
function sortFarmers(farmers, sortBy) {
    // Get reviews for rating calculation
    const allReviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
    
    // Calculate average rating for each farmer
    farmers.forEach(farmer => {
        const farmerReviews = allReviews[farmer.id] || [];
        let averageRating = 0;
        
        if (farmerReviews.length > 0) {
            const totalRating = farmerReviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / farmerReviews.length;
        }
        
        farmer.averageRating = averageRating;
    });
    
    switch (sortBy) {
        case 'name-asc':
            farmers.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
            break;
        case 'name-desc':
            farmers.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
            break;
        case 'rating-asc':
            farmers.sort((a, b) => a.averageRating - b.averageRating);
            break;
        case 'rating-desc':
            farmers.sort((a, b) => b.averageRating - a.averageRating);
            break;
        default:
            farmers.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    }
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
    const user = window.AccessControl ? window.AccessControl.getCurrentUser() : JSON.parse(localStorage.getItem('user'));
    const authLinks = document.querySelector('.auth-links');
    const userProfile = document.querySelector('.user-profile');
    const dashboardLink = document.querySelector('#dashboard-link');
    const cartLink = document.querySelector('.cart-link');
    
    if (user) {
        // User is logged in
        if (authLinks) authLinks.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            // Update user name and profile image if available
            const userNameElement = userProfile.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = user.full_name || user.username || 'User';
            }
            const profileImg = userProfile.querySelector('.profile-img');
            if (profileImg && user.profile_image) {
                profileImg.src = user.profile_image;
            }
        }
        if (dashboardLink) {
            dashboardLink.style.display = 'block';
        }
        if (cartLink) {
            cartLink.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (authLinks) authLinks.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (dashboardLink) {
            dashboardLink.style.display = 'none';
        }
        if (cartLink) {
            cartLink.style.display = 'none';
        }
    }
}

// Function to check if user is logged in
function isLoggedIn() {
    const user = window.AccessControl ? window.AccessControl.getCurrentUser() : JSON.parse(localStorage.getItem('user'));
    return !!user;
}

// Function to handle protected actions
function handleProtectedAction(action) {
    if (!isLoggedIn()) {
        showNotification('Please login or register to access this feature', 'warning');
        window.location.href = 'login.html';
        return false;
    }
    return true;
} 