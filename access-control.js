/**
 * Farm Fresh Access Control System
 * Handles role-based access control for the application
 */

// Define user roles and their permissions
const ROLES = {
    ADMIN: 'admin',
    FARMER: 'farmer',
    CUSTOMER: 'customer'
};

// Define permissions for each role
const PERMISSIONS = {
    [ROLES.ADMIN]: {
        canAccessAdminDashboard: true,
        canViewAllUsers: true,
        canViewAllOrders: true,
        canViewAllProducts: true,
        canExportData: true,
        canDeleteUsers: true,
        canManageOrders: true
    },
    [ROLES.FARMER]: {
        canAccessAdminDashboard: false,
        canViewAllUsers: false,
        canViewAllOrders: false,
        canViewAllProducts: false,
        canExportData: false,
        canDeleteUsers: false,
        canManageOrders: false,
        canViewOwnProducts: true,
        canViewOwnOrders: true
    },
    [ROLES.CUSTOMER]: {
        canAccessAdminDashboard: false,
        canViewAllUsers: false,
        canViewAllOrders: false,
        canViewAllProducts: false,
        canExportData: false,
        canDeleteUsers: false,
        canManageOrders: false,
        canViewOwnOrders: true
    }
};

/**
 * Check if the current user has a specific permission
 * @param {string} permission - The permission to check
 * @returns {boolean} - Whether the user has the permission
 */
function hasPermission(permission) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const userRole = user.user_type || ROLES.CUSTOMER;
    const rolePermissions = PERMISSIONS[userRole] || PERMISSIONS[ROLES.CUSTOMER];
    
    return rolePermissions[permission] === true;
}

/**
 * Get the current logged-in user
 * @returns {Object|null} - The current user or null if not logged in
 */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Error getting current user:', e);
        return null;
    }
}

/**
 * Check if the current user is an admin
 * @returns {boolean} - Whether the user is an admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.user_type === ROLES.ADMIN;
}

/**
 * Check if the current user is a farmer
 * @returns {boolean} - Whether the user is a farmer
 */
function isFarmer() {
    const user = getCurrentUser();
    return user && user.user_type === ROLES.FARMER;
}

/**
 * Check if the current user is a customer
 * @returns {boolean} - Whether the user is a customer
 */
function isCustomer() {
    const user = getCurrentUser();
    return user && user.user_type === ROLES.CUSTOMER;
}

/**
 * Restrict access to a page based on user role
 * @param {Array} allowedRoles - Array of roles allowed to access the page
 * @param {string} redirectUrl - URL to redirect to if access is denied
 */
function restrictPageAccess(allowedRoles, redirectUrl = 'login.html') {
    const user = getCurrentUser();
    
    // If no user is logged in, redirect to login page
    if (!user) {
        window.location.href = redirectUrl;
        return;
    }
    
    // If user's role is not in the allowed roles, redirect
    if (!allowedRoles.includes(user.user_type)) {
        // If user is a farmer, redirect to farmer dashboard
        if (user.user_type === ROLES.FARMER) {
            window.location.href = 'farmer-dashboard.html';
            return;
        }
        
        // If user is a customer, redirect to customer dashboard
        if (user.user_type === ROLES.CUSTOMER) {
            window.location.href = 'customer-dashboard.html';
            return;
        }
        
        // Default redirect
        window.location.href = redirectUrl;
    }
}

/**
 * Filter data to only show what's relevant to the current user
 * @param {Array} data - The data to filter
 * @param {string} dataType - The type of data (users, orders, products)
 * @returns {Array} - The filtered data
 */
function filterDataForCurrentUser(data, dataType) {
    const user = getCurrentUser();
    if (!user) return [];
    
    // Admin can see all data
    if (user.user_type === ROLES.ADMIN) {
        return data;
    }
    
    // Filter based on data type and user role
    switch (dataType) {
        case 'users':
            // Non-admins can only see their own user data
            return data.filter(item => item.id === user.id);
            
        case 'orders':
            if (user.user_type === ROLES.CUSTOMER) {
                // Customers can only see their own orders
                return data.filter(item => item.userId === user.id);
            } else if (user.user_type === ROLES.FARMER) {
                // Farmers can only see orders that include their products
                return data.filter(order => {
                    // Check if any item in the order is from this farmer
                    return order.items && order.items.some(item => item.farmerId === user.id);
                });
            }
            break;
            
        case 'products':
            if (user.user_type === ROLES.FARMER) {
                // Farmers can only see their own products
                return data.filter(item => item.farmerId === user.id);
            }
            // Customers can see all products
            return data;
            
        default:
            return [];
    }
    
    return [];
}

// Export functions
window.AccessControl = {
    ROLES,
    PERMISSIONS,
    hasPermission,
    getCurrentUser,
    isAdmin,
    isFarmer,
    isCustomer,
    restrictPageAccess,
    filterDataForCurrentUser
}; 