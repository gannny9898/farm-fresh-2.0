// WebGL Animations for Farm Fresh
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if THREE.js is loaded and hero canvas exists
    if (typeof THREE !== 'undefined' && document.getElementById('hero-canvas')) {
        initHeroAnimation();
    } else {
        console.log('THREE.js not loaded or hero canvas not found');
    }
});

function initHeroAnimation() {
    // Canvas setup
    const canvas = document.getElementById('hero-canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create vegetables & fruits particles
    const particlesCount = 50;
    const particleGeometries = [
        new THREE.SphereGeometry(0.2, 8, 8),                 // Apple/Orange
        new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8),        // Carrot
        new THREE.BoxGeometry(0.25, 0.25, 0.25),             // Generic cube vegetable
        new THREE.TorusGeometry(0.15, 0.05, 8, 18),          // Onion ring
        new THREE.ConeGeometry(0.15, 0.3, 8),                // Strawberry shape
    ];
    
    // Colors for our produce
    const colors = [
        0xFF5733, // Red (tomato/apple)
        0x4CAF50, // Green (leafy vegetables)
        0xFFC107, // Yellow (corn/banana)
        0xFF9800, // Orange (carrot/orange)
        0x8BC34A, // Light green (cucumber/peas)
        0x795548, // Brown (potato)
        0xE91E63  // Pink (radish/dragonfruit)
    ];
    
    const particles = [];
    
    // Create particles and add to scene
    for (let i = 0; i < particlesCount; i++) {
        const randomGeometry = particleGeometries[Math.floor(Math.random() * particleGeometries.length)];
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });
        
        const particle = new THREE.Mesh(randomGeometry, material);
        
        // Position randomly but within visible area
        particle.position.x = (Math.random() - 0.5) * 20;
        particle.position.y = (Math.random() - 0.5) * 20;
        particle.position.z = (Math.random() - 0.5) * 10 - 5; // Mostly negative to be behind the camera
        
        // Random rotation
        particle.rotation.x = Math.random() * Math.PI;
        particle.rotation.y = Math.random() * Math.PI;
        
        // Add to scene and store
        scene.add(particle);
        particles.push({
            mesh: particle,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            movementSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.005
            }
        });
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Position camera
    camera.position.z = 5;
    
    // Animation function
    function animate() {
        requestAnimationFrame(animate);
        
        // Update particle positions and rotations
        particles.forEach(particle => {
            // Rotate
            particle.mesh.rotation.x += particle.rotationSpeed.x;
            particle.mesh.rotation.y += particle.rotationSpeed.y;
            particle.mesh.rotation.z += particle.rotationSpeed.z;
            
            // Move
            particle.mesh.position.x += particle.movementSpeed.x;
            particle.mesh.position.y += particle.movementSpeed.y;
            particle.mesh.position.z += particle.movementSpeed.z;
            
            // If particle moves out of view, reset position
            if (Math.abs(particle.mesh.position.x) > 10 || 
                Math.abs(particle.mesh.position.y) > 10 ||
                particle.mesh.position.z > 10 || 
                particle.mesh.position.z < -10) {
                
                // Send back to starting area
                particle.mesh.position.x = (Math.random() - 0.5) * 20;
                particle.mesh.position.y = (Math.random() - 0.5) * 20;
                particle.mesh.position.z = -10;
            }
        });
        
        // Very subtle camera movement
        camera.position.x = Math.sin(Date.now() * 0.0001) * 0.5;
        camera.position.y = Math.cos(Date.now() * 0.0001) * 0.3;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start animation loop
    animate();
}

// Create a product visualization for product detail pages
function initProductVisualization(containerId, productType) {
    // Only proceed if THREE is loaded and container exists
    if (typeof THREE === 'undefined' || !document.getElementById(containerId)) {
        return;
    }
    
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight || 300;
    
    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create product based on type
    let productMesh;
    
    switch(productType) {
        case 'vegetable':
            productMesh = createVegetable();
            break;
        case 'fruit':
            productMesh = createFruit();
            break;
        case 'dairy':
            productMesh = createDairy();
            break;
        default:
            productMesh = createGenericProduct();
    }
    
    scene.add(productMesh);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Position camera
    camera.position.z = 5;
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        productMesh.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Helper functions to create product meshes
    function createVegetable() {
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4CAF50,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add stem
        const stemGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 12);
        const stemMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x795548,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 1.5;
        
        mesh.add(stem);
        
        return mesh;
    }
    
    function createFruit() {
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xFF5733,
            roughness: 0.6,
            metalness: 0.1
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    function createDairy() {
        const group = new THREE.Group();
        
        // Create milk carton
        const cartonGeometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);
        const cartonMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            roughness: 0.3,
            metalness: 0.1
        });
        
        const carton = new THREE.Mesh(cartonGeometry, cartonMaterial);
        group.add(carton);
        
        // Create cap
        const capGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
        const capMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF9800,
            roughness: 0.5,
            metalness: 0.1
        });
        
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 1.4;
        group.add(cap);
        
        return group;
    }
    
    function createGenericProduct() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x9C27B0,
            roughness: 0.5,
            metalness: 0.2
        });
        
        return new THREE.Mesh(geometry, material);
    }
}

// Expose functions to global scope
window.FarmFreshAnimations = {
    initHeroAnimation: initHeroAnimation,
    initProductVisualization: initProductVisualization
}; 