/**
 * Mock API Handlers for Farmer Profiles, Reviews, and Photos
 * This file contains handlers for the mock API endpoints related to farmer profiles
 */

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
                resolve({
                    ok: false,
                    status: 404,
                    json: () => Promise.resolve({
                        success: false,
                        message: 'Farmer not found'
                    })
                });
                return;
            }
            
            // Handle different actions
            switch (action) {
                case 'get':
                    // Return farmer profile
                    const { password, ...farmerWithoutPassword } = users[farmerIndex];
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            farmer: farmerWithoutPassword
                        })
                    });
                    break;
                    
                case 'update':
                    // Update farmer profile
                    const updatedFields = body.data || {};
                    
                    // Update allowed fields
                    const allowedFields = [
                        'full_name', 'phone', 'address', 'farm_name', 
                        'farm_location', 'description', 'product_categories', 
                        'organic_certified', 'profile_photo'
                    ];
                    
                    allowedFields.forEach(field => {
                        if (updatedFields[field] !== undefined) {
                            users[farmerIndex][field] = updatedFields[field];
                        }
                    });
                    
                    // Save updated users
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                    
                    // Return updated farmer profile
                    const { password: pwd, ...updatedFarmer } = users[farmerIndex];
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: 'Profile updated successfully',
                            farmer: updatedFarmer
                        })
                    });
                    break;
                    
                default:
                    resolve({
                        ok: false,
                        status: 400,
                        json: () => Promise.resolve({
                            success: false,
                            message: 'Invalid action'
                        })
                    });
            }
        }, 600); // Simulate network delay
    });
}

// Handle reviews requests
function handleReviews(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { farmerId, action } = body;
            
            // Get reviews from localStorage
            let reviews = JSON.parse(localStorage.getItem('farmer_reviews')) || {};
            
            // Initialize reviews for this farmer if not exists
            if (!reviews[farmerId]) {
                reviews[farmerId] = [];
            }
            
            // Handle different actions
            switch (action) {
                case 'get':
                    // Return reviews for farmer
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            reviews: reviews[farmerId] || []
                        })
                    });
                    break;
                    
                case 'add':
                    // Add new review
                    const newReview = {
                        id: Date.now(),
                        reviewer_id: body.reviewer_id,
                        reviewer_name: body.reviewer_name,
                        rating: body.rating,
                        comment: body.comment,
                        date: new Date().toISOString()
                    };
                    
                    // Check if user already left a review
                    const existingReviewIndex = reviews[farmerId].findIndex(
                        r => r.reviewer_id === body.reviewer_id
                    );
                    
                    if (existingReviewIndex !== -1) {
                        // Update existing review
                        reviews[farmerId][existingReviewIndex] = {
                            ...reviews[farmerId][existingReviewIndex],
                            rating: body.rating,
                            comment: body.comment,
                            date: new Date().toISOString()
                        };
                    } else {
                        // Add new review
                        reviews[farmerId].push(newReview);
                    }
                    
                    // Save updated reviews
                    localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
                            review: existingReviewIndex !== -1 ? reviews[farmerId][existingReviewIndex] : newReview
                        })
                    });
                    break;
                    
                case 'delete':
                    // Delete review
                    const reviewId = body.reviewId;
                    const reviewIndex = reviews[farmerId].findIndex(r => r.id == reviewId);
                    
                    if (reviewIndex === -1) {
                        resolve({
                            ok: false,
                            status: 404,
                            json: () => Promise.resolve({
                                success: false,
                                message: 'Review not found'
                            })
                        });
                        return;
                    }
                    
                    // Remove review
                    reviews[farmerId].splice(reviewIndex, 1);
                    
                    // Save updated reviews
                    localStorage.setItem('farmer_reviews', JSON.stringify(reviews));
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: 'Review deleted successfully'
                        })
                    });
                    break;
                    
                default:
                    resolve({
                        ok: false,
                        status: 400,
                        json: () => Promise.resolve({
                            success: false,
                            message: 'Invalid action'
                        })
                    });
            }
        }, 500); // Simulate network delay
    });
}

// Handle photos requests
function handlePhotos(body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { farmerId, action } = body;
            
            // Get photos from localStorage
            let photos = JSON.parse(localStorage.getItem('farm_photos')) || {};
            
            // Initialize photos for this farmer if not exists
            if (!photos[farmerId]) {
                photos[farmerId] = [];
            }
            
            // Handle different actions
            switch (action) {
                case 'get':
                    // Return photos for farmer
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            photos: photos[farmerId] || []
                        })
                    });
                    break;
                    
                case 'add':
                    // Add new photo
                    const newPhoto = {
                        id: Date.now(),
                        user_id: body.user_id,
                        photo_url: body.photo_url,
                        date: new Date().toISOString()
                    };
                    
                    // Add photo
                    photos[farmerId].push(newPhoto);
                    
                    // Save updated photos
                    localStorage.setItem('farm_photos', JSON.stringify(photos));
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: 'Photo added successfully',
                            photo: newPhoto
                        })
                    });
                    break;
                    
                case 'delete':
                    // Delete photo
                    const photoId = body.photoId;
                    const photoIndex = photos[farmerId].findIndex(p => p.id == photoId);
                    
                    if (photoIndex === -1) {
                        resolve({
                            ok: false,
                            status: 404,
                            json: () => Promise.resolve({
                                success: false,
                                message: 'Photo not found'
                            })
                        });
                        return;
                    }
                    
                    // Check if user is authorized to delete
                    if (body.user_id != photos[farmerId][photoIndex].user_id) {
                        resolve({
                            ok: false,
                            status: 403,
                            json: () => Promise.resolve({
                                success: false,
                                message: 'Not authorized to delete this photo'
                            })
                        });
                        return;
                    }
                    
                    // Remove photo
                    photos[farmerId].splice(photoIndex, 1);
                    
                    // Save updated photos
                    localStorage.setItem('farm_photos', JSON.stringify(photos));
                    
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({
                            success: true,
                            message: 'Photo deleted successfully'
                        })
                    });
                    break;
                    
                default:
                    resolve({
                        ok: false,
                        status: 400,
                        json: () => Promise.resolve({
                            success: false,
                            message: 'Invalid action'
                        })
                    });
            }
        }, 500); // Simulate network delay
    });
}

// Export handlers
window.handleFarmerProfile = handleFarmerProfile;
window.handleReviews = handleReviews;
window.handlePhotos = handlePhotos; 