/**
 * Fallback script that provides essential functionality if external libraries fail to load
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if AOS (Animate On Scroll) library is loaded
    if (typeof AOS === 'undefined') {
        console.log('AOS not loaded, applying fallback animations');
        applyFallbackAnimations();
    }

    // Check if mobile menu is initialized
    if (!document.querySelector('.mobile-menu-btn')) {
        console.log('Mobile menu not initialized, applying fallback');
        initMobileMenu();
    }

    // Initialize essential features regardless of other scripts
    initEssentialFeatures();
});

// Apply simple animations if AOS is not available
function applyFallbackAnimations() {
    // Get all elements that should be animated
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get animation type from data-aos attribute
                const animationType = entry.target.getAttribute('data-aos') || 'fade-up';
                
                // Apply animation class
                entry.target.classList.add('animated', animationType);
                
                // Unobserve after animation is applied
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    });
    
    // Observe all animated elements
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add necessary animation styles
    addFallbackStyles();
}

// Add fallback animation styles to the page
function addFallbackStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .animated {
            animation-duration: 0.8s;
            animation-fill-mode: both;
        }
        
        .fade-up {
            animation-name: fadeUp;
        }
        
        .fade-down {
            animation-name: fadeDown;
        }
        
        .fade-right {
            animation-name: fadeRight;
        }
        
        .fade-left {
            animation-name: fadeLeft;
        }
        
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeRight {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeLeft {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize mobile menu if not already done
function initMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    if (navbar && navLinks && !document.querySelector('.mobile-menu-btn')) {
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Insert button before nav links
        navbar.insertBefore(mobileMenuBtn, navLinks);
        
        // Add event listener
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !e.target.closest('.nav-links') && 
                !e.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
}

// Initialize essential features for good user experience
function initEssentialFeatures() {
    // Ensure scroll to top button works
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Ensure FAQ accordions work
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });
    
    // Ensure cart functionality works
    updateCartCounter();
}

// Update cart counter
function updateCartCounter() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        // Get cart data from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        
        // Update counter
        cartCountElement.textContent = itemCount;
    }
} 