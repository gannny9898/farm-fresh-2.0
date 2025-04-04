// Mock API implementation
// This script overrides the fetch function to simulate API requests

// Mock user database
const mockUsers = [
    {
        id: 1,
        email: 'customer@example.com',
        password: 'password123',
        full_name: 'John Customer',
        user_type: 'customer',
        registration_date: '2023-01-15T08:30:00Z',
        phone: '+91 9876543210',
        address: '123 Customer St, City',
        profile_photo: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
        id: 2,
        email: 'farmer@example.com',
        password: 'password123',
        full_name: 'Raj Farmer',
        user_type: 'farmer',
        registration_date: '2022-11-20T10:15:00Z',
        phone: '+91 8765432109',
        address: '456 Farm Rd, Village',
        farm_name: 'Green Harvest Farms',
        farm_location: 'Nashik, Maharashtra',
        description: 'We grow organic vegetables and fruits using sustainable farming practices. Our farm has been in the family for three generations.',
        product_categories: [1, 2, 5], // Vegetables, Fruits, Herbs
        organic_certified: true,
        profile_photo: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
        id: 3,
        email: 'admin@example.com',
        password: 'password123',
        full_name: 'Admin User',
        user_type: 'admin',
        registration_date: '2022-10-01T09:00:00Z',
        phone: '+91 7654321098',
        address: '789 Admin Ave, City',
        profile_photo: 'https://randomuser.me/api/portraits/women/1.jpg'
    }
];

// Initialize localStorage if not already set
if (!localStorage.getItem('registeredUsers')) {
    localStorage.setItem('registeredUsers', JSON.stringify(mockUsers));
}

// Initialize reviews if not already set
if (!localStorage.getItem('farmer_reviews')) {
    const initialReviews = {
        '2': [
            {
                id: 1,
                reviewer_id: 1,
                reviewer_name: 'John Customer',
                rating: 4,
                comment: 'Great quality vegetables! The tomatoes were especially fresh and flavorful.',
                date: '2023-05-15T14:30:00Z'
            },
            {
                id: 2,
                reviewer_id: 3,
                reviewer_name: 'Admin User',
                rating: 5,
                comment: 'Excellent service and top-notch organic produce. Highly recommended!',
                date: '2023-06-20T11:45:00Z'
            }
        ]
    };
    localStorage.setItem('farmer_reviews', JSON.stringify(initialReviews));
}

// Initialize farm photos if not already set
if (!localStorage.getItem('farm_photos')) {
    const initialPhotos = {
        '2': [
            {
                id: 1,
                user_id: 2,
                photo_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                date: '2023-04-10T09:20:00Z'
            },
            {
                id: 2,
                user_id: 2,
                photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                date: '2023-04-15T10:30:00Z'
            },
            {
                id: 3,
                user_id: 1,
                photo_url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                date: '2023-05-20T15:45:00Z'
            }
        ]
    };
    localStorage.setItem('farm_photos', JSON.stringify(initialPhotos));
}

// Initialize products if not already set
if (!localStorage.getItem('products')) {
    const initialProducts = [
        {
            id: 1,
            name: 'Organic Tomatoes',
            description: 'Fresh, locally grown organic tomatoes.',
            price: 60,
            unit: 'kg',
            category: 1, // Vegetables
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            farmer_id: 2,
            stock: 50
        },
        {
            id: 2,
            name: 'Fresh Apples',
            description: 'Crisp and sweet apples picked at peak ripeness.',
            price: 120,
            unit: 'kg',
            category: 2, // Fruits
            image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            farmer_id: 2,
            stock: 75
        },
        {
            id: 3,
            name: 'Organic Milk',
            description: 'Fresh organic milk from grass-fed cows.',
            price: 80,
            unit: 'L',
            category: 3, // Dairy
            image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            farmer_id: 2,
            stock: 30
        },
        {
            id: 4,
            name: 'Brown Rice',
            description: 'Nutritious whole grain brown rice.',
            price: 90,
            unit: 'kg',
            category: 4, // Grains
            image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            farmer_id: 2,
            stock: 100
        },
        {
            id: 5,
            name: 'Fresh Basil',
            description: 'Aromatic fresh basil leaves.',
            price: 40,
            unit: 'bunch',
            category: 5, // Herbs
            image: 'https://images.unsplash.com/photo-1527792492728-08d07d021a9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            farmer_id: 2,
            stock: 40
        }
    ];
    
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

// Store original fetch function
const originalFetch = window.fetch;

// Helper function to create mock responses with headers
function createMockResponse(status, ok, data) {
    return {
        ok: ok,
        status: status,
        headers: {
            get: function(name) {
                if (name.toLowerCase() === 'content-type') {
                    return 'application/json';
                }
                return null;
            }
        },
        json: () => Promise.resolve(data)
    };
}

// Override fetch function
window.fetch = function(url, options = {}) {
    console.log(`Mock API: Intercepted fetch request to ${url}`);
    
    // Parse request
    const method = options.method || 'GET';
    let body = {};
    
    if (options.body) {
        try {
            body = JSON.parse(options.body);
            console.log('Request body:', body);
        } catch (e) {
            console.error('Error parsing request body:', e);
        }
    }
    
    // Handle login API
    if (url.includes('api/login.php')) {
        return handleLogin(body);
    }
    
    // Handle registration API
    if (url.includes('api/register.php')) {
        return handleRegistration(body);
    }
    
    // Handle farmer profile API
    if (url.includes('api/farmer-profile.php')) {
        return handleFarmerProfile(body);
    }
    
    // Handle reviews API
    if (url.includes('api/reviews.php')) {
        return handleReviews(body);
    }
    
    // Handle photos API
    if (url.includes('api/photos.php')) {
        return handlePhotos(body);
    }
    
    // Handle products API
    if (url.includes('api/products.php')) {
        return handleProducts(body);
    }
    
    // If no mock handler, pass through to original fetch
    console.log('No mock handler for this URL, passing through to original fetch');
    return originalFetch(url, options);
};

// Handle login requests
function handleLogin(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { email, password } = body;
            
            // Get registered users from localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            
            // Find user with matching email and password
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Create a copy of user without password
                const { password, ...userWithoutPassword } = user;
                
                resolve(createMockResponse(200, true, {
                    success: true,
                    message: 'Login successful',
                    user: userWithoutPassword,
                    token: 'mock-jwt-token-' + Date.now()
                }));
            } else {
                resolve(createMockResponse(401, false, {
                    success: false,
                    message: 'Invalid email or password'
                }));
            }
        }, 500); // Simulate network delay
    });
}

// Handle registration requests
function handleRegistration(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Get registered users from localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            
            // Check if email already exists
            const emailExists = users.some(u => u.email === body.email);
            
            if (emailExists) {
                resolve(createMockResponse(400, false, {
                    success: false,
                    message: 'Email already registered'
                }));
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                ...body,
                registration_date: new Date().toISOString()
            };
            
            // Add additional fields based on user type
            if (newUser.user_type === 'farmer') {
                newUser.farm_name = body.farm_name || '';
                newUser.farm_location = body.farm_location || '';
                newUser.description = '';
                newUser.product_categories = body.product_categories || [];
                newUser.organic_certified = body.organic_certified || false;
            }
            
            // Add user to database
            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // Create a copy of user without password
            const { password, ...userWithoutPassword } = newUser;
            
            resolve(createMockResponse(201, true, {
                success: true,
                message: 'Registration successful',
                user: userWithoutPassword
            }));
        }, 800); // Simulate network delay
    });
}

// Handle farmer profile requests
function handleFarmerProfile(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { farmerId, action } = body;
            
            // Get registered users from localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            
            // Find farmer with matching ID
            const farmerIndex = users.findIndex(u => u.user_type === 'farmer' && u.id == farmerId);
            
            if (farmerIndex === -1) {
                resolve(createMockResponse(404, false, {
                    success: false,
                    message: 'Farmer not found'
                }));
                return;
            }
            
            // Handle different actions
            switch (action) {
                case 'get':
                    // Return farmer profile
                    const { password, ...farmerWithoutPassword } = users[farmerIndex];
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Farmer profile retrieved',
                        farmer: farmerWithoutPassword
                    }));
                    break;
                
                case 'update':
                    // Update farmer profile
                    const { profile } = body;
                    
                    // Update allowed fields
                    if (profile) {
                        const allowedFields = ['farm_name', 'farm_location', 'description', 'product_categories', 'organic_certified', 'phone', 'address'];
                        
                        allowedFields.forEach(field => {
                            if (profile[field] !== undefined) {
                                users[farmerIndex][field] = profile[field];
                            }
                        });
                        
                        // Save updated users
                        localStorage.setItem('registeredUsers', JSON.stringify(users));
                        
                        // Return updated farmer
                        const { password: pwd, ...updatedFarmer } = users[farmerIndex];
                        
                        resolve(createMockResponse(200, true, {
                            success: true,
                            message: 'Farmer profile updated',
                            farmer: updatedFarmer
                        }));
                    } else {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'No profile data provided'
                        }));
                    }
                    break;
                
                default:
                    resolve(createMockResponse(400, false, {
                        success: false,
                        message: 'Invalid action'
                    }));
            }
        }, 600);
    });
}

// Handle reviews requests
function handleReviews(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { action, farmerId } = body;
            
            // Get reviews from localStorage
            const reviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
            
            // Initialize reviews for this farmer if not exists
            if (!reviews[farmerId]) {
                reviews[farmerId] = [];
            }
            
            switch (action) {
                case 'get':
                    // Return reviews for the farmer
                    resolve(createMockResponse(200, true, {
                        success: true,
                        reviews: reviews[farmerId] || []
                    }));
                    break;
                
                case 'add':
                    // Add a new review
                    const { rating, comment, userId, userName } = body;
                    
                    if (!rating || !comment || !userId || !userName) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Missing required fields'
                        }));
                        return;
                    }
                    
                    // Create new review
                    const newReview = {
                        id: Date.now(),
                        rating: parseFloat(rating),
                        comment,
                        user_id: userId,
                        user_name: userName,
                        date: new Date().toISOString()
                    };
                    
                    // Add review to the list
                    reviews[farmerId].push(newReview);
                    
                    // Save to localStorage
                    localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
                    
                    // Calculate average rating
                    const totalRating = reviews[farmerId].reduce((sum, review) => sum + review.rating, 0);
                    const averageRating = totalRating / reviews[farmerId].length;
                    
                    resolve(createMockResponse(201, true, {
                        success: true,
                        message: 'Review added successfully',
                        review: newReview,
                        averageRating
                    }));
                    break;
                
                case 'delete':
                    // Delete a review
                    const { reviewId } = body;
                    
                    if (!reviewId) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Review ID is required'
                        }));
                        return;
                    }
                    
                    // Find review index
                    const reviewIndex = reviews[farmerId].findIndex(r => r.id == reviewId);
                    
                    if (reviewIndex === -1) {
                        resolve(createMockResponse(404, false, {
                            success: false,
                            message: 'Review not found'
                        }));
                        return;
                    }
                    
                    // Remove review
                    reviews[farmerId].splice(reviewIndex, 1);
                    
                    // Save to localStorage
                    localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
                    
                    // Calculate average rating
                    const newTotalRating = reviews[farmerId].reduce((sum, review) => sum + review.rating, 0);
                    const newAverageRating = reviews[farmerId].length > 0 ? newTotalRating / reviews[farmerId].length : 0;
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Review deleted successfully',
                        averageRating: newAverageRating
                    }));
                    break;
                
                default:
                    resolve(createMockResponse(400, false, {
                        success: false,
                        message: 'Invalid action'
                    }));
            }
        }, 600);
    });
}

// Handle photos requests
function handlePhotos(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { action, farmerId } = body;
            
            // Get photos from localStorage
            const photos = JSON.parse(localStorage.getItem('farm_photos')) || {};
            
            // Initialize photos for this farmer if not exists
            if (!photos[farmerId]) {
                photos[farmerId] = [];
            }
            
            switch (action) {
                case 'get':
                    // Return photos for the farmer
                    resolve(createMockResponse(200, true, {
                        success: true,
                        photos: photos[farmerId] || []
                    }));
                    break;
                
                case 'add':
                    // Add a new photo
                    const { photoUrl, caption } = body;
                    
                    if (!photoUrl) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Photo URL is required'
                        }));
                        return;
                    }
                    
                    // Create new photo
                    const newPhoto = {
                        id: Date.now(),
                        url: photoUrl,
                        caption: caption || '',
                        date: new Date().toISOString()
                    };
                    
                    // Add photo to the list
                    photos[farmerId].push(newPhoto);
                    
                    // Save to localStorage
                    localStorage.setItem('farm_photos', JSON.stringify(photos));
                    
                    resolve(createMockResponse(201, true, {
                        success: true,
                        message: 'Photo added successfully',
                        photo: newPhoto
                    }));
                    break;
                
                case 'delete':
                    // Delete a photo
                    const { photoId } = body;
                    
                    if (!photoId) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Photo ID is required'
                        }));
                        return;
                    }
                    
                    // Find photo index
                    const photoIndex = photos[farmerId].findIndex(p => p.id == photoId);
                    
                    if (photoIndex === -1) {
                        resolve(createMockResponse(404, false, {
                            success: false,
                            message: 'Photo not found'
                        }));
                        return;
                    }
                    
                    // Remove photo
                    photos[farmerId].splice(photoIndex, 1);
                    
                    // Save to localStorage
                    localStorage.setItem('farm_photos', JSON.stringify(photos));
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Photo deleted successfully'
                    }));
                    break;
                
                case 'update':
                    // Update a photo caption
                    const { photoId: updatePhotoId, caption: newCaption } = body;
                    
                    if (!updatePhotoId) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Photo ID is required'
                        }));
                        return;
                    }
                    
                    // Find photo index
                    const updatePhotoIndex = photos[farmerId].findIndex(p => p.id == updatePhotoId);
                    
                    if (updatePhotoIndex === -1) {
                        resolve(createMockResponse(404, false, {
                            success: false,
                            message: 'Photo not found'
                        }));
                        return;
                    }
                    
                    // Update caption
                    photos[farmerId][updatePhotoIndex].caption = newCaption || '';
                    
                    // Save to localStorage
                    localStorage.setItem('farm_photos', JSON.stringify(photos));
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Photo updated successfully',
                        photo: photos[farmerId][updatePhotoIndex]
                    }));
                    break;
                
                default:
                    resolve(createMockResponse(400, false, {
                        success: false,
                        message: 'Invalid action'
                    }));
            }
        }, 600);
    });
}

// Handle products requests
function handleProducts(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { action } = body;
            
            // Get products from localStorage
            const products = JSON.parse(localStorage.getItem('products')) || [];
            
            switch (action) {
                case 'get':
                    // Return all products or filtered by farmer_id
                    let filteredProducts = products;
                    
                    if (body.farmer_id) {
                        filteredProducts = products.filter(p => p.farmer_id == body.farmer_id);
                    }
                    
                    if (body.category) {
                        filteredProducts = filteredProducts.filter(p => p.category == body.category);
                    }
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        products: filteredProducts
                    }));
                    break;
                
                case 'add':
                    // Add a new product
                    const newProduct = {
                        id: Date.now(),
                        name: body.name,
                        description: body.description,
                        price: parseFloat(body.price),
                        unit: body.unit,
                        category: parseInt(body.category),
                        image: body.image || 'https://via.placeholder.com/300',
                        farmer_id: parseInt(body.farmer_id),
                        stock: parseInt(body.stock) || 0
                    };
                    
                    // Add product
                    products.push(newProduct);
                    
                    // Save to localStorage
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    resolve(createMockResponse(201, true, {
                        success: true,
                        message: 'Product added successfully',
                        product: newProduct
                    }));
                    break;
                
                case 'update':
                    // Update a product
                    const { product_id } = body;
                    
                    if (!product_id) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Product ID is required'
                        }));
                        return;
                    }
                    
                    // Find product index
                    const productIndex = products.findIndex(p => p.id == product_id);
                    
                    if (productIndex === -1) {
                        resolve(createMockResponse(404, false, {
                            success: false,
                            message: 'Product not found'
                        }));
                        return;
                    }
                    
                    // Update product fields
                    const updatedProduct = {
                        ...products[productIndex],
                        name: body.name || products[productIndex].name,
                        description: body.description || products[productIndex].description,
                        price: body.price ? parseFloat(body.price) : products[productIndex].price,
                        unit: body.unit || products[productIndex].unit,
                        category: body.category ? parseInt(body.category) : products[productIndex].category,
                        image: body.image || products[productIndex].image,
                        stock: body.stock ? parseInt(body.stock) : products[productIndex].stock
                    };
                    
                    // Update product
                    products[productIndex] = updatedProduct;
                    
                    // Save to localStorage
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Product updated successfully',
                        product: updatedProduct
                    }));
                    break;
                
                case 'delete':
                    // Delete a product
                    const { product_id: deleteId } = body;
                    
                    if (!deleteId) {
                        resolve(createMockResponse(400, false, {
                            success: false,
                            message: 'Product ID is required'
                        }));
                        return;
                    }
                    
                    // Find product index
                    const deleteIndex = products.findIndex(p => p.id == deleteId);
                    
                    if (deleteIndex === -1) {
                        resolve(createMockResponse(404, false, {
                            success: false,
                            message: 'Product not found'
                        }));
                        return;
                    }
                    
                    // Remove product
                    products.splice(deleteIndex, 1);
                    
                    // Save to localStorage
                    localStorage.setItem('products', JSON.stringify(products));
                    
                    resolve(createMockResponse(200, true, {
                        success: true,
                        message: 'Product deleted successfully'
                    }));
                    break;
                
                default:
                    resolve(createMockResponse(400, false, {
                        success: false,
                        message: 'Invalid action'
                    }));
            }
        }, 600);
    });
} 