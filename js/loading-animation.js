// Epic 3D Loading Animation - Ready Player One Style
const canvas = document.getElementById('canvas-3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 50;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
pointLight1.position.set(20, 20, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
pointLight2.position.set(-20, -20, 20);
scene.add(pointLight2);

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 5000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Position
    positions[i3] = (Math.random() - 0.5) * 200;
    positions[i3 + 1] = (Math.random() - 0.5) * 200;
    positions[i3 + 2] = (Math.random() - 0.5) * 200;

    // Color
    const colorChoice = Math.random();
    if (colorChoice < 0.33) {
        colors[i3] = 0; // R
        colors[i3 + 1] = 1; // G (cyan)
        colors[i3 + 2] = 1; // B
    } else if (colorChoice < 0.66) {
        colors[i3] = 1; // R (magenta)
        colors[i3 + 1] = 0; // G
        colors[i3 + 2] = 1; // B
    } else {
        colors[i3] = 1; // R (yellow)
        colors[i3 + 1] = 1; // G
        colors[i3 + 2] = 0; // B
    }

    // Size
    sizes[i] = Math.random() * 3;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particlesMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Create geometric shapes
const shapes = [];
const geometries = [
    new THREE.TetrahedronGeometry(3, 0),
    new THREE.OctahedronGeometry(3, 0),
    new THREE.IcosahedronGeometry(3, 0),
    new THREE.DodecahedronGeometry(3, 0)
];

for (let i = 0; i < 15; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        emissive: Math.random() * 0x333333,
        shininess: 100,
        transparent: true,
        opacity: 0.7,
        wireframe: Math.random() > 0.5
    });

    const shape = new THREE.Mesh(geometry, material);
    shape.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
    );
    shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    shape.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        }
    };

    scene.add(shape);
    shapes.push(shape);
}

// Central energy sphere
const sphereGeometry = new THREE.SphereGeometry(8, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.6,
    shininess: 100
});
const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(centralSphere);

// Wireframe sphere around central sphere
const wireframeGeometry = new THREE.SphereGeometry(12, 16, 16);
const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const wireframeSphere = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
scene.add(wireframeSphere);

// Animation
let time = 0;
function animateLoading() {
    time += 0.01;

    // Rotate particles
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0003;

    // Animate particle positions
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + positions[i3]) * 0.02;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Rotate shapes
    shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;

        // Pulse effect
        const scale = 1 + Math.sin(time * 2) * 0.1;
        shape.scale.set(scale, scale, scale);
    });

    // Animate central sphere
    const sphereScale = 1 + Math.sin(time * 3) * 0.2;
    centralSphere.scale.set(sphereScale, sphereScale, sphereScale);
    centralSphere.rotation.y += 0.01;

    // Animate wireframe sphere
    wireframeSphere.rotation.y -= 0.008;
    wireframeSphere.rotation.x += 0.005;
    const wireScale = 1 + Math.cos(time * 2.5) * 0.15;
    wireframeSphere.scale.set(wireScale, wireScale, wireScale);

    // Animate lights
    pointLight1.position.x = Math.sin(time) * 30;
    pointLight1.position.y = Math.cos(time) * 30;
    pointLight2.position.x = Math.cos(time) * 30;
    pointLight2.position.y = Math.sin(time) * 30;

    // Camera movement
    camera.position.z = 50 + Math.sin(time * 0.5) * 5;
    camera.position.x = Math.sin(time * 0.3) * 3;
    camera.position.y = Math.cos(time * 0.3) * 3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animateLoading);
}

animateLoading();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Show main menu after loading
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');

    loadingScreen.style.transition = 'opacity 1s ease-out';
    loadingScreen.style.opacity = '0';

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainMenu.style.display = 'block';
        mainMenu.style.opacity = '0';

        setTimeout(() => {
            mainMenu.style.transition = 'opacity 1s ease-in';
            mainMenu.style.opacity = '1';
        }, 50);
    }, 1000);
}, 3000);
