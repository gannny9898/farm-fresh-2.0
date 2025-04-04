/**
 * Farmer Profile JavaScript
 * Handles loading farmer data, displaying reviews, and submitting new reviews
 */

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get farmer ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const farmerId = urlParams.get('id');
    
    if (!farmerId) {
        showError('Farmer ID is missing. Please go back and try again.');
        return;
    }
    
    // Load farmer data
    loadFarmerData(farmerId);
    
    // Set up tab switching
    setupTabs();
    
    // Set up review form submission
    setupReviewForm(farmerId);
    
    // Set up profile photo upload
    setupPhotoUpload(farmerId);
    
    // Set up farm photos upload
    setupFarmPhotosUpload(farmerId);
    
    // Update cart count
    updateCartCount();
});

/**
 * Load farmer data from localStorage or mock API
 * @param {string} farmerId - The ID of the farmer to load
 */
function loadFarmerData(farmerId) {
    // First check in registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    let farmer = registeredUsers.find(user => user.id === parseInt(farmerId) && user.user_type === 'farmer');
    
    // If not found in registered users, check mock API users
    if (!farmer) {
        const mockUsers = [
            {
                id: 1002,
                email: 'farmer@example.com',
                password: 'password123',
                full_name: 'John Smith',
                phone: '5551234567',
                user_type: 'farmer',
                farm_name: 'Smith Family Farm',
                farm_location: 'Countryside, CA',
                farming_since: '2010',
                organic_certified: true,
                product_categories: [1, 2, 5], // Vegetables, Fruits, Herbs
                farm_description: 'We are a family-owned farm dedicated to growing the freshest organic produce using sustainable farming practices. Our farm has been in the family for three generations.',
                registration_date: '2023-01-15T10:30:00Z'
            }
        ];
        
        farmer = mockUsers.find(user => user.id === parseInt(farmerId));
    }
    
    if (!farmer) {
        showError('Farmer not found. Please go back and try again.');
        return;
    }
    
    // Populate farmer profile data
    populateFarmerProfile(farmer);
    
    // Load farmer products
    loadFarmerProducts(farmer);
    
    // Load farmer reviews
    loadFarmerReviews(farmerId);
    
    // Load farm photos
    loadFarmPhotos(farmerId);
}

/**
 * Populate the farmer profile with data
 * @param {Object} farmer - The farmer data object
 */
function populateFarmerProfile(farmer) {
    // Set farm name and details
    document.getElementById('farm-name').textContent = farmer.farm_name || 'Unnamed Farm';
    document.getElementById('farmer-name').textContent = farmer.full_name || 'Unknown Farmer';
    document.getElementById('farm-location').textContent = farmer.farm_location || 'Unknown Location';
    document.getElementById('farming-since').textContent = farmer.farming_since ? `Since ${farmer.farming_since}` : 'Unknown';
    document.getElementById('organic-certified').style.display = farmer.organic_certified ? 'inline-flex' : 'none';
    
    // Set profile image if available
    if (farmer.profile_image) {
        document.getElementById('farmer-image').src = farmer.profile_image;
    }
    
    // Set farm description in About tab
    const aboutContent = document.querySelector('.tab-content[data-tab="about"]');
    if (aboutContent) {
        aboutContent.innerHTML = `
            <h3>About ${farmer.farm_name || 'This Farm'}</h3>
            <p>${farmer.farm_description || 'No description available.'}</p>
            <div class="farm-details">
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${farmer.farm_location || 'Unknown'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Farming Experience:</span>
                    <span class="detail-value">${farmer.farming_since ? `Since ${farmer.farming_since}` : 'Unknown'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">${farmer.phone || 'Not available'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${farmer.email || 'Not available'}</span>
                </div>
            </div>
        `;
    }
    
    // Update average rating
    updateAverageRating(farmer.id);
}

/**
 * Load products from this farmer
 * @param {string} farmerId - The ID of the farmer
 */
function loadFarmerProducts(farmer) {
    const productsContent = document.querySelector('.tab-content[data-tab="products"]');
    if (!productsContent) return;
    
    // Get products from localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const farmerProducts = products.filter(product => product.farmer_id === parseInt(farmer.id));
    
    if (farmerProducts.length === 0) {
        productsContent.innerHTML = '<p>No products available from this farmer yet.</p>';
        return;
    }
    
    // Create product grid
    let productsHTML = '<div class="product-grid">';
    
    farmerProducts.forEach(product => {
        productsHTML += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)} / ${product.unit}</p>
                    <p class="product-category">${getCategoryName(product.category_id)}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
    });
    
    productsHTML += '</div>';
    productsContent.innerHTML = productsHTML;
    
    // Add event listeners to Add to Cart buttons
    const addToCartButtons = productsContent.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId, farmer.full_name, `$${farmer.price.toFixed(2)}`, farmer.profile_image, farmer.full_name);
        });
    });
}

/**
 * Get category name from category ID
 * @param {number} categoryId - The category ID
 * @returns {string} - The category name
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
 * @param {number} productId - The product ID to add to cart
 */
function addToCart(productId, productName, price, image, farmerName) {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Increment quantity if already in cart
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            farmer: farmerName,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification('Added to cart', 'success');
}

/**
 * Load reviews for this farmer
 * @param {string} farmerId - The ID of the farmer
 */
function loadFarmerReviews(farmerId) {
    const reviewsContent = document.querySelector('.tab-content[data-tab="reviews"]');
    if (!reviewsContent) return;
    
    // Get reviews from localStorage
    let reviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
    
    // Initialize reviews for this farmer if not exists
    if (!reviews[farmerId]) {
        reviews[farmerId] = [];
        localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
    }
    
    const farmerReviews = reviews[farmerId];
    
    // Update reviews container
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;
    
    if (farmerReviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to leave a review!</p>';
        return;
    }
    
    // Sort reviews by date (newest first)
    farmerReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let reviewsHTML = '';
    
    farmerReviews.forEach(review => {
        reviewsHTML += `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <span class="reviewer-name">${review.reviewer_name}</span>
                        <span class="review-date">${formatDate(review.date)}</span>
                    </div>
                    <div class="review-rating">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                </div>
            </div>
        `;
    });
    
    reviewsContainer.innerHTML = reviewsHTML;
    
    // Update average rating
    updateAverageRating(farmerId);
}

/**
 * Update the average rating display
 * @param {string} farmerId - The ID of the farmer
 */
function updateAverageRating(farmerId) {
    // Get reviews from localStorage
    const reviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
    const farmerReviews = reviews[farmerId] || [];
    
    // Calculate average rating
    let averageRating = 0;
    if (farmerReviews.length > 0) {
        const totalRating = farmerReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / farmerReviews.length;
    }
    
    // Update rating display
    const ratingElement = document.getElementById('average-rating');
    if (ratingElement) {
        ratingElement.innerHTML = generateStarRating(averageRating);
    }
    
    // Update rating text
    const ratingTextElement = document.getElementById('rating-text');
    if (ratingTextElement) {
        if (farmerReviews.length > 0) {
            ratingTextElement.textContent = `${averageRating.toFixed(1)} (${farmerReviews.length} review${farmerReviews.length !== 1 ? 's' : ''})`;
        } else {
            ratingTextElement.textContent = 'No reviews yet';
        }
    }
}

/**
 * Generate HTML for star rating
 * @param {number} rating - The rating value (0-5)
 * @returns {string} - HTML for star rating
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star full">★</span>';
    }
    
    // Half star
    if (halfStar) {
        starsHTML += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty">☆</span>';
    }
    
    return starsHTML;
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Set up tab switching functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            this.classList.add('active');
            document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
        });
    });
    
    // Activate first tab by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

/**
 * Set up review form submission
 * @param {string} farmerId - The ID of the farmer
 */
function setupReviewForm(farmerId) {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    // Set up star rating selection
    const ratingStars = document.querySelectorAll('.rating-select .star');
    let selectedRating = 0;
    
    ratingStars.forEach((star, index) => {
        const ratingValue = index + 1;
        
        // Set data attribute for rating value
        star.setAttribute('data-rating', ratingValue);
        
        // Add hover effect
        star.addEventListener('mouseover', function() {
            // Highlight stars up to this one
            ratingStars.forEach((s, i) => {
                if (i < ratingValue) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        // Remove hover effect when mouse leaves rating container
        star.parentElement.addEventListener('mouseleave', function() {
            ratingStars.forEach(s => s.classList.remove('hover'));
        });
        
        // Handle click to select rating
        star.addEventListener('click', function() {
            selectedRating = ratingValue;
            
            // Update visual selection
            ratingStars.forEach((s, i) => {
                if (i < ratingValue) {
                    s.classList.add('selected');
                    s.textContent = '★';
                } else {
                    s.classList.remove('selected');
                    s.textContent = '☆';
                }
            });
            
            // Update hidden input
            document.getElementById('rating-value').value = selectedRating;
        });
    });
    
    // Handle form submission
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if user is logged in
        const currentUser = window.AccessControl ? window.AccessControl.getCurrentUser() : JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            showNotification('Please log in to leave a review', 'error');
            setTimeout(() => {
                window.location.href = `login.html?redirect=farmer-profile.html?id=${farmerId}`;
            }, 2000);
            return;
        }
        
        // Get form data
        const rating = parseInt(document.getElementById('rating-value').value);
        const comment = document.getElementById('review-comment').value.trim();
        
        // Validate form data
        if (!rating) {
            showNotification('Please select a rating', 'error');
            return;
        }
        
        if (!comment) {
            showNotification('Please enter a comment', 'error');
            return;
        }
        
        // Create review object
        const review = {
            farmer_id: parseInt(farmerId),
            reviewer_id: currentUser.id,
            reviewer_name: currentUser.full_name,
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        };
        
        // Save review to localStorage
        saveReview(review);
        
        // Reset form
        reviewForm.reset();
        ratingStars.forEach(star => {
            star.classList.remove('selected');
            star.textContent = '☆';
        });
        selectedRating = 0;
        
        // Show success message
        showNotification('Your review has been submitted', 'success');
        
        // Reload reviews
        loadFarmerReviews(farmerId);
    });
}

/**
 * Save review to localStorage
 * @param {Object} review - The review object to save
 */
function saveReview(review) {
    // Get existing reviews
    let reviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
    
    // Initialize reviews for this farmer if not exists
    if (!reviews[review.farmer_id]) {
        reviews[review.farmer_id] = [];
    }
    
    // Check if user has already reviewed this farmer
    const existingReviewIndex = reviews[review.farmer_id].findIndex(r => r.reviewer_id === review.reviewer_id);
    
    if (existingReviewIndex !== -1) {
        // Update existing review
        reviews[review.farmer_id][existingReviewIndex] = review;
    } else {
        // Add new review
        reviews[review.farmer_id].push(review);
    }
    
    // Save to localStorage
    localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success' or 'error')
 */
function showNotification(message, type) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Show error message on page
 * @param {string} message - The error message to display
 */
function showError(message) {
    const container = document.querySelector('.profile-container') || document.body;
    container.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
            <a href="products.html" class="back-btn">Back to Products</a>
        </div>
    `;
}

/**
 * Update cart count in navigation
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
 * Set up profile photo upload
 */
function setupPhotoUpload(farmerId) {
    const photoUploadTrigger = document.getElementById('photo-upload-trigger');
    const photoUploadInput = document.getElementById('photo-upload');
    const photoContainer = document.getElementById('profile-photo-container');
    
    if (!photoUploadTrigger || !photoUploadInput || !photoContainer) return;
    
    // Check if current user is the farmer
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser || currentUser.id != farmerId) {
        // Hide upload trigger if not the farmer
        photoUploadTrigger.style.display = 'none';
        return;
    }
    
    // Show upload trigger
    photoUploadTrigger.style.display = 'block';
    
    // Add event listener to trigger
    photoUploadTrigger.addEventListener('click', function() {
        photoUploadInput.click();
    });
    
    // Add event listener to file input
    photoUploadInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check file type
            if (!file.type.match('image.*')) {
                showNotification('Please select an image file', 'error');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }
            
            // Read file as data URL
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Update profile photo
                const photoImg = document.getElementById('farmer-photo');
                photoImg.src = e.target.result;
                
                // Save to localStorage
                updateFarmerPhoto(farmerId, e.target.result);
                
                // Show success message
                showNotification('Profile photo updated successfully!', 'success');
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Update farmer's profile photo in localStorage
 */
function updateFarmerPhoto(farmerId, photoDataUrl) {
    // Get farmers from localStorage
    const farmers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Find the farmer with the matching ID
    const farmerIndex = farmers.findIndex(f => f.id == farmerId);
    
    if (farmerIndex !== -1) {
        // Update profile photo
        farmers[farmerIndex].profile_photo = photoDataUrl;
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(farmers));
        
        // Update current user if it's the same farmer
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.id == farmerId) {
            currentUser.profile_photo = photoDataUrl;
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
    }
}

/**
 * Set up farm photos upload
 */
function setupFarmPhotosUpload(farmerId) {
    const photoUploadTrigger = document.getElementById('farm-photo-upload-trigger');
    const photoUploadInput = document.getElementById('farm-photo-upload');
    const photosContainer = document.getElementById('farm-photos');
    
    if (!photoUploadTrigger || !photoUploadInput || !photosContainer) return;
    
    // Check if current user is the farmer or a customer
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    if (!currentUser) {
        // Hide upload trigger if not logged in
        photoUploadTrigger.style.display = 'none';
        return;
    }
    
    // Show upload trigger for farmer or customers
    photoUploadTrigger.style.display = 'flex';
    
    // Add event listener to trigger
    photoUploadTrigger.addEventListener('click', function() {
        photoUploadInput.click();
    });
    
    // Add event listener to file input
    photoUploadInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check file type
            if (!file.type.match('image.*')) {
                showNotification('Please select an image file', 'error');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size should be less than 5MB', 'error');
                return;
            }
            
            // Read file as data URL
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Add farm photo
                addFarmPhoto(farmerId, e.target.result, currentUser.id);
                
                // Show success message
                showNotification('Farm photo added successfully!', 'success');
                
                // Reload farm photos
                loadFarmPhotos(farmerId);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Add a farm photo
 */
function addFarmPhoto(farmerId, photoDataUrl, userId) {
    // Get farm photos from localStorage
    let farmPhotos = JSON.parse(localStorage.getItem('farm_photos')) || {};
    
    // Initialize photos for this farmer if not exists
    if (!farmPhotos[farmerId]) {
        farmPhotos[farmerId] = [];
    }
    
    // Add new photo
    const newPhoto = {
        id: Date.now(),
        user_id: userId,
        photo_url: photoDataUrl,
        date: new Date().toISOString()
    };
    
    farmPhotos[farmerId].push(newPhoto);
    
    // Save to localStorage
    localStorage.setItem('farm_photos', JSON.stringify(farmPhotos));
}

/**
 * Load farm photos
 */
function loadFarmPhotos(farmerId) {
    const photosContainer = document.getElementById('farm-photos');
    if (!photosContainer) return;
    
    // Get farm photos from localStorage
    const farmPhotos = JSON.parse(localStorage.getItem('farm_photos')) || {};
    const farmerPhotos = farmPhotos[farmerId] || [];
    
    // Get upload trigger element
    const uploadTrigger = document.getElementById('farm-photo-upload-trigger');
    
    // Clear container except upload trigger
    while (photosContainer.firstChild) {
        photosContainer.removeChild(photosContainer.firstChild);
    }
    
    // Add upload trigger back
    photosContainer.appendChild(uploadTrigger);
    
    // Add file input back
    const fileInput = document.getElementById('farm-photo-upload');
    photosContainer.appendChild(fileInput);
    
    // Add photos
    farmerPhotos.forEach(photo => {
        const photoElement = document.createElement('img');
        photoElement.src = photo.photo_url;
        photoElement.alt = 'Farm Photo';
        photoElement.className = 'farm-photo';
        
        // Insert before upload trigger
        photosContainer.insertBefore(photoElement, uploadTrigger);
    });
} 