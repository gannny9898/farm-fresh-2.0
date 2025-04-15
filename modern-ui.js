// Initialize Three.js scene
let scene, camera, renderer, geometry, material, mesh;

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to hero section
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        heroCanvas.appendChild(renderer.domElement);
    }
    
    // Create geometry
    geometry = new THREE.IcosahedronGeometry(1, 1);
    material = new THREE.MeshPhongMaterial({
        color: 0x00b894,
        wireframe: true,
        wireframeLinewidth: 2
    });
    
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    }
}

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animate-in elements
document.querySelectorAll('.animate-in').forEach(element => {
    observer.observe(element);
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });
});

// Form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
        }
    });
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Product grid population
const products = [
    {
        name: 'Product One',
        description: 'Modern and sleek design solution.',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        name: 'Product Two',
        description: 'Innovative technology platform.',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        name: 'Product Three',
        description: 'Advanced user interface kit.',
        image: 'https://via.placeholder.com/300x200'
    }
];

function populateProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card animate-in';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <a href="#" class="button">Learn More</a>
            `;
            productGrid.appendChild(card);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    populateProducts();
}); 