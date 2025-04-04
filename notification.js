/**
 * Notification Utility
 * Provides functions for showing notifications across the Farm Fresh application
 */

// Create a namespace for the notification utility
window.Notification = (function() {
    // Private variables
    let notificationElement = null;
    let notificationTimeout = null;
    
    // Create notification element if it doesn't exist
    function createNotificationElement() {
        if (!notificationElement) {
            notificationElement = document.createElement('div');
            notificationElement.id = 'notification';
            document.body.appendChild(notificationElement);
            
            // Add notification.css if not already included
            if (!document.querySelector('link[href="notification.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'notification.css';
                document.head.appendChild(link);
            }
        }
        return notificationElement;
    }
    
    // Show notification
    function show(message, type = 'info', duration = 3000) {
        // Valid notification types
        const validTypes = ['success', 'error', 'warning', 'info'];
        
        // Default to info if invalid type
        if (!validTypes.includes(type)) {
            type = 'info';
        }
        
        // Get or create notification element
        const notification = createNotificationElement();
        
        // Clear any existing timeout
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        // Remove any existing classes and add new ones
        notification.className = `notification ${type}`;
        
        // Set message
        notification.textContent = message;
        
        // Show notification (after a small delay to ensure transition works)
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after duration
        notificationTimeout = setTimeout(() => {
            hide();
        }, duration);
        
        return {
            // Allow manually hiding the notification
            hide: hide
        };
    }
    
    // Hide notification
    function hide() {
        if (notificationElement) {
            notificationElement.classList.remove('show');
            notificationElement.classList.add('hide');
            
            // Remove the hide class after animation completes
            setTimeout(() => {
                notificationElement.classList.remove('hide');
            }, 300);
        }
    }
    
    // Public API
    return {
        show: show,
        hide: hide,
        
        // Convenience methods for different notification types
        success: function(message, duration) {
            return show(message, 'success', duration);
        },
        
        error: function(message, duration) {
            return show(message, 'error', duration);
        },
        
        warning: function(message, duration) {
            return show(message, 'warning', duration);
        },
        
        info: function(message, duration) {
            return show(message, 'info', duration);
        }
    };
})(); 