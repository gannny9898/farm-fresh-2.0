/**
 * Farm Fresh Dashboard Content Manager
 * Handles loading role-specific content for the dashboard
 */

// Initialize dashboard content
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (!document.querySelector('.dashboard-container')) {
        return;
    }
    
    // Get current user
    const user = window.AccessControl.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load role-specific content
    loadRoleSpecificContent(user.user_type);
});

/**
 * Load role-specific content for the dashboard
 * @param {string} userRole - The user's role (admin, farmer, customer)
 */
function loadRoleSpecificContent(userRole) {
    // Create role-specific welcome section
    createWelcomeSection(userRole);
    
    // Create role-specific stats
    createRoleSpecificStats(userRole);
    
    // Create role-specific quick actions
    createQuickActions(userRole);
}

/**
 * Create a welcome section with role-specific guidance
 * @param {string} userRole - The user's role
 */
function createWelcomeSection(userRole) {
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (!dashboardHeader) return;
    
    // Create welcome message container
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-container';
    
    let welcomeMessage = '';
    let actionItems = '';
    
    // Create role-specific welcome message
    switch(userRole) {
        case 'admin':
            welcomeMessage = `
                <h2>Welcome to the Admin Dashboard</h2>
                <p>From here, you can manage all aspects of the Farm Fresh platform.</p>
            `;
            actionItems = `
                <ul class="action-items">
                    <li>View and manage all users</li>
                    <li>Monitor all orders and update their status</li>
                    <li>Manage product listings</li>
                    <li>View system analytics</li>
                </ul>
            `;
            break;
            
        case 'farmer':
            welcomeMessage = `
                <h2>Welcome to your Farmer Dashboard</h2>
                <p>Manage your farm products and track orders from customers.</p>
            `;
            actionItems = `
                <ul class="action-items">
                    <li>Add new products to your inventory</li>
                    <li>Update product prices and availability</li>
                    <li>View and manage orders for your products</li>
                    <li>Track your sales performance</li>
                </ul>
            `;
            break;
            
        case 'customer':
            welcomeMessage = `
                <h2>Welcome to your Customer Dashboard</h2>
                <p>Track your orders and manage your account.</p>
            `;
            actionItems = `
                <ul class="action-items">
                    <li>View your order history</li>
                    <li>Track current orders</li>
                    <li>Update your delivery preferences</li>
                    <li>Manage your account settings</li>
                </ul>
            `;
            break;
    }
    
    // Set welcome container content
    welcomeContainer.innerHTML = `
        <div class="welcome-message">
            ${welcomeMessage}
        </div>
        <div class="welcome-actions">
            <h3>Quick Start</h3>
            ${actionItems}
        </div>
    `;
    
    // Insert after dashboard header
    dashboardHeader.parentNode.insertBefore(welcomeContainer, dashboardHeader.nextSibling);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .welcome-container {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
        }
        
        .welcome-message {
            flex: 1;
            min-width: 300px;
        }
        
        .welcome-message h2 {
            margin-top: 0;
            color: #2c3e50;
        }
        
        .welcome-actions {
            flex: 1;
            min-width: 300px;
        }
        
        .welcome-actions h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        
        .action-items {
            padding-left: 1.5rem;
        }
        
        .action-items li {
            margin-bottom: 0.5rem;
            color: #555;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Create role-specific stats for the dashboard
 * @param {string} userRole - The user's role
 */
function createRoleSpecificStats(userRole) {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    // Clear existing stats for non-admin users
    if (userRole !== 'admin') {
        statsGrid.innerHTML = '';
    }
    
    // Create role-specific stats
    switch(userRole) {
        case 'farmer':
            // Get farmer-specific data
            const farmerProducts = window.AccessControl.filterDataForCurrentUser(
                JSON.parse(localStorage.getItem('products')) || [], 
                'products'
            );
            
            const farmerOrders = window.AccessControl.filterDataForCurrentUser(
                JSON.parse(localStorage.getItem('orders')) || [], 
                'orders'
            );
            
            // Calculate farmer-specific stats
            const totalProducts = farmerProducts.length;
            const totalOrders = farmerOrders.length;
            const totalRevenue = farmerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            const averageRating = 4.7; // Mock data
            
            // Create farmer-specific stat cards
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>My Products</h3>
                    <div class="value">${totalProducts}</div>
                </div>
                <div class="stat-card">
                    <h3>Orders Received</h3>
                    <div class="value">${totalOrders}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Revenue</h3>
                    <div class="value">₹${totalRevenue.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Average Rating</h3>
                    <div class="value">${averageRating} ⭐</div>
                </div>
            `;
            break;
            
        case 'customer':
            // Get customer-specific data
            const customerOrders = window.AccessControl.filterDataForCurrentUser(
                JSON.parse(localStorage.getItem('orders')) || [], 
                'orders'
            );
            
            // Calculate customer-specific stats
            const totalCustomerOrders = customerOrders.length;
            const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            const pendingOrders = customerOrders.filter(order => order.status === 'pending').length;
            const deliveredOrders = customerOrders.filter(order => order.status === 'delivered').length;
            
            // Create customer-specific stat cards
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>Total Orders</h3>
                    <div class="value">${totalCustomerOrders}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Spent</h3>
                    <div class="value">₹${totalSpent.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending Orders</h3>
                    <div class="value">${pendingOrders}</div>
                </div>
                <div class="stat-card">
                    <h3>Delivered Orders</h3>
                    <div class="value">${deliveredOrders}</div>
                </div>
            `;
            break;
    }
}

/**
 * Create role-specific quick actions
 * @param {string} userRole - The user's role
 */
function createQuickActions(userRole) {
    const quickActions = document.querySelector('.quick-actions .action-buttons');
    if (!quickActions) return;
    
    // Clear existing actions for non-admin users
    if (userRole !== 'admin') {
        quickActions.innerHTML = '';
    }
    
    // Create role-specific quick actions
    switch(userRole) {
        case 'farmer':
            quickActions.innerHTML = `
                <button onclick="showAddProductForm()" class="action-btn">
                    <span class="action-icon">➕</span>
                    Add New Product
                </button>
                <button onclick="exportDataFile('orders')" class="action-btn export-btn">
                    <span class="action-icon">🛒</span>
                    Export My Orders
                </button>
                <button onclick="showUpdateInventoryForm()" class="action-btn">
                    <span class="action-icon">📦</span>
                    Update Inventory
                </button>
                <button onclick="window.DataManager.updateAllStats()" class="action-btn refresh-btn">
                    <span class="action-icon">🔄</span>
                    Refresh Stats
                </button>
            `;
            break;
            
        case 'customer':
            quickActions.innerHTML = `
                <button onclick="window.location.href='products.html'" class="action-btn">
                    <span class="action-icon">🛒</span>
                    Shop Products
                </button>
                <button onclick="showUpdateProfileForm()" class="action-btn">
                    <span class="action-icon">👤</span>
                    Update Profile
                </button>
                <button onclick="showUpdateAddressForm()" class="action-btn">
                    <span class="action-icon">📍</span>
                    Update Address
                </button>
                <button onclick="window.DataManager.updateAllStats()" class="action-btn refresh-btn">
                    <span class="action-icon">🔄</span>
                    Refresh Stats
                </button>
            `;
            break;
    }
    
    // Add placeholder functions for the new buttons
    if (userRole === 'farmer') {
        window.showAddProductForm = function() {
            alert('Add Product form will be implemented here');
        };
        
        window.showUpdateInventoryForm = function() {
            alert('Update Inventory form will be implemented here');
        };
    }
    
    if (userRole === 'customer') {
        window.showUpdateProfileForm = function() {
            alert('Update Profile form will be implemented here');
        };
        
        window.showUpdateAddressForm = function() {
            alert('Update Address form will be implemented here');
        };
    }
} 