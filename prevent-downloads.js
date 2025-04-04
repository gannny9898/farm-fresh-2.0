/**
 * Prevent Automatic Downloads
 * This script prevents any automatic file downloads in the Farm Fresh application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Prevent clicks on links that might trigger downloads
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href) return;
        
        // Skip if it's an internal navigation link
        if (href.startsWith('#') || 
            href === 'index.html' || 
            href === 'products.html' || 
            href === 'cart.html' || 
            href === 'login.html') return;
        
        // Check if the link has download attribute or points to a file
        const fileExtensions = ['.json', '.csv', '.xlsx', '.pdf', '.zip', '.txt', '.doc', '.xls'];
        const hasDownloadAttr = target.hasAttribute('download');
        const isFileLink = fileExtensions.some(ext => href.toLowerCase().includes(ext));
        
        // If it's a potential download link that's not explicitly needed for the app
        if (hasDownloadAttr || isFileLink) {
            // Allow essential downloads if marked with a special class
            const isEssentialFunction = target.classList.contains('essential-download');
            if (isEssentialFunction) return;
            
            e.preventDefault();
            e.stopPropagation();
            console.warn('Prevented download:', href);
            
            // Show notification if available
            if (window.showNotification) {
                window.showNotification('Download prevented: ' + href.split('/').pop(), 'info');
            }
            return false;
        }
    }, true);
    
    // Prevent form submissions that might trigger downloads
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        // Check if form has attributes suggesting file download
        if (form.getAttribute('action') && form.getAttribute('action').includes('download')) {
            // Allow essential downloads if marked with a special class
            const isEssentialFunction = form.classList.contains('essential-download-form');
            if (isEssentialFunction) return;
            
            e.preventDefault();
            e.stopPropagation();
            console.warn('Prevented form download submission');
            
            // Show notification if available
            if (window.showNotification) {
                window.showNotification('Download from form prevented', 'info');
            }
            return false;
        }
    }, true);
    
    // Override window.open to prevent popup downloads
    const originalWindowOpen = window.open;
    window.open = function(url, name, specs) {
        if (url && typeof url === 'string' && url.match(/\.(json|csv|xlsx|pdf|zip|txt|doc|xls)$/i)) {
            console.warn('Prevented window.open download:', url);
            
            // Show notification if available
            if (window.showNotification) {
                window.showNotification('Popup download prevented', 'info');
            }
            return null;
        }
        
        return originalWindowOpen.apply(this, arguments);
    };
    
    // Intercept fetch API to prevent download responses
    const originalFetch = window.fetch;
    window.fetch = function() {
        return originalFetch.apply(this, arguments).then(response => {
            // Check if response is a file download
            const contentType = response.headers.get('content-type');
            const contentDisposition = response.headers.get('content-disposition');
            
            if (contentDisposition && contentDisposition.includes('attachment')) {
                console.warn('Prevented fetch download response');
                
                // Show notification if available
                if (window.showNotification) {
                    window.showNotification('API download prevented', 'info');
                }
                
                // Return empty response instead of the download
                return new Response('{"status":"blocked","message":"Automatic downloads are disabled"}', {
                    status: 200,
                    headers: {'Content-Type': 'application/json'}
                });
            }
            
            return response;
        });
    };
    
    console.log('Download prevention initialized');
});

// Helper function to show notifications if not already defined
if (!window.showNotification) {
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: ${type === 'info' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };
} 