/**
 * Farm Fresh Real-Time Data Manager
 * Handles real-time data tracking and management for the application
 */

// Initialize the data manager
(function() {
    // Initialize data structures if they don't exist
    if (!localStorage.getItem('dataStats')) {
        localStorage.setItem('dataStats', JSON.stringify({
            totalUsers: 0,
            totalFarmers: 0,
            totalCustomers: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalRevenue: 0,
            lastUpdated: new Date().toISOString()
        }));
    }
    
    if (!localStorage.getItem('activityLog')) {
        localStorage.setItem('activityLog', JSON.stringify([]));
    }
    
    // Set up event listeners for data changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'registeredUsers') {
            updateUserStats();
            logActivity('user_registration', 'New user registered');
        } else if (e.key === 'orders') {
            updateOrderStats();
            logActivity('new_order', 'New order placed');
        } else if (e.key === 'products') {
            updateProductStats();
            logActivity('product_update', 'Product catalog updated');
        }
    });
    
    // Initialize stats on page load
    updateAllStats();
    
    console.log('Data Manager initialized');
})();

/**
 * Update all statistics
 */
function updateAllStats() {
    updateUserStats();
    updateOrderStats();
    updateProductStats();
}

/**
 * Update user statistics
 */
function updateUserStats() {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const predefinedUsers = [
        { user_type: 'customer' },
        { user_type: 'farmer' }
    ]; // Mock API has 2 predefined users
    
    const allUsers = [...predefinedUsers, ...registeredUsers];
    const farmers = allUsers.filter(user => user.user_type === 'farmer');
    const customers = allUsers.filter(user => user.user_type === 'customer');
    
    const stats = JSON.parse(localStorage.getItem('dataStats'));
    stats.totalUsers = allUsers.length;
    stats.totalFarmers = farmers.length;
    stats.totalCustomers = customers.length;
    stats.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('dataStats', JSON.stringify(stats));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('dataStats:updated', { detail: stats }));
}

/**
 * Update order statistics
 */
function updateOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const stats = JSON.parse(localStorage.getItem('dataStats'));
    stats.totalOrders = orders.length;
    stats.totalRevenue = totalRevenue;
    stats.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('dataStats', JSON.stringify(stats));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('dataStats:updated', { detail: stats }));
}

/**
 * Update product statistics
 */
function updateProductStats() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const stats = JSON.parse(localStorage.getItem('dataStats'));
    stats.totalProducts = products.length;
    stats.lastUpdated = new Date().toISOString();
    
    localStorage.setItem('dataStats', JSON.stringify(stats));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('dataStats:updated', { detail: stats }));
}

/**
 * Log activity in the system
 * @param {string} type - Type of activity
 * @param {string} description - Description of the activity
 * @param {Object} data - Additional data related to the activity
 */
function logActivity(type, description, data = {}) {
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    // Add new activity to the beginning of the array
    activityLog.unshift({
        id: Date.now(),
        type: type,
        description: description,
        data: data,
        timestamp: new Date().toISOString()
    });
    
    // Keep only the last 100 activities
    if (activityLog.length > 100) {
        activityLog.pop();
    }
    
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('activityLog:updated', { 
        detail: { activity: activityLog[0], log: activityLog } 
    }));
}

/**
 * Get recent activities
 * @param {number} limit - Maximum number of activities to return
 * @returns {Array} - Array of recent activities
 */
function getRecentActivities(limit = 10) {
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    return activityLog.slice(0, limit);
}

/**
 * Get system statistics
 * @returns {Object} - System statistics
 */
function getSystemStats() {
    return JSON.parse(localStorage.getItem('dataStats')) || {};
}

/**
 * Export data to JSON file
 * @param {string} dataType - Type of data to export (users, orders, products, all)
 */
function exportData(dataType = 'all') {
    let data = {};
    
    if (dataType === 'all') {
        // Export all data
        data = {
            users: JSON.parse(localStorage.getItem('registeredUsers')) || [],
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            products: JSON.parse(localStorage.getItem('products')) || [],
            stats: JSON.parse(localStorage.getItem('dataStats')) || {},
            activityLog: JSON.parse(localStorage.getItem('activityLog')) || []
        };
    } else {
        // Export specific data type
        switch(dataType) {
            case 'users':
                data = JSON.parse(localStorage.getItem('registeredUsers')) || [];
                break;
            case 'orders':
                data = JSON.parse(localStorage.getItem('orders')) || [];
                break;
            case 'products':
                data = JSON.parse(localStorage.getItem('products')) || [];
                break;
            case 'stats':
                data = JSON.parse(localStorage.getItem('dataStats')) || {};
                break;
            case 'activityLog':
                data = JSON.parse(localStorage.getItem('activityLog')) || [];
                break;
        }
    }
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-fresh-${dataType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    // Log the export activity
    logActivity('data_export', `Exported ${dataType} data`);
}

// Make functions available globally
window.DataManager = {
    updateAllStats,
    updateUserStats,
    updateOrderStats,
    updateProductStats,
    logActivity,
    getRecentActivities,
    getSystemStats,
    exportData
}; 