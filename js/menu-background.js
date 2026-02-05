// Animated background for main menu
const menuCanvas = document.getElementById('menu-canvas');
const menuScene = new THREE.Scene();
const menuCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const menuRenderer = new THREE.WebGLRenderer({ canvas: menuCanvas, antialias: true, alpha: true });

menuRenderer.setSize(window.innerWidth, window.innerHeight);
menuRenderer.setPixelRatio(window.devicePixelRatio);
menuCamera.position.z = 30;

// Lighting
const menuAmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
menuScene.add(menuAmbientLight);

const menuPointLight = new THREE.PointLight(0x00ffff, 1.5, 100);
menuPointLight.position.set(0, 0, 30);
menuScene.add(menuPointLight);

// Create flowing particles
const menuParticlesGeometry = new THREE.BufferGeometry();
const menuParticleCount = 2000;
const menuPositions = new Float32Array(menuParticleCount * 3);
const menuColors = new Float32Array(menuParticleCount * 3);
const menuSizes = new Float32Array(menuParticleCount);
const menuVelocities = new Float32Array(menuParticleCount * 3);

for (let i = 0; i < menuParticleCount; i++) {
    const i3 = i * 3;

    // Position
    menuPositions[i3] = (Math.random() - 0.5) * 100;
    menuPositions[i3 + 1] = (Math.random() - 0.5) * 100;
    menuPositions[i3 + 2] = (Math.random() - 0.5) * 100;

    // Velocity
    menuVelocities[i3] = (Math.random() - 0.5) * 0.02;
    menuVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    menuVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    // Color
    const hue = Math.random();
    if (hue < 0.5) {
        menuColors[i3] = 0;
        menuColors[i3 + 1] = 1;
        menuColors[i3 + 2] = 1;
    } else {
        menuColors[i3] = 1;
        menuColors[i3 + 1] = 0;
        menuColors[i3 + 2] = 1;
    }

    // Size
    menuSizes[i] = Math.random() * 2;
}

menuParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(menuPositions, 3));
menuParticlesGeometry.setAttribute('color', new THREE.BufferAttribute(menuColors, 3));
menuParticlesGeometry.setAttribute('size', new THREE.BufferAttribute(menuSizes, 1));
menuParticlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(menuVelocities, 3));

const menuParticlesMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const menuParticles = new THREE.Points(menuParticlesGeometry, menuParticlesMaterial);
menuScene.add(menuParticles);

// Create grid
const gridSize = 100;
const gridDivisions = 20;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0xff00ff);
gridHelper.position.y = -20;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.2;
menuScene.add(gridHelper);

// Animation
let menuTime = 0;
function animateMenu() {
    menuTime += 0.01;

    // Rotate particles slowly
    menuParticles.rotation.y += 0.0002;

    // Move particles
    const positions = menuParticles.geometry.attributes.position.array;
    const velocities = menuParticles.geometry.attributes.velocity.array;

    for (let i = 0; i < menuParticleCount; i++) {
        const i3 = i * 3;

        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        // Wrap around
        if (Math.abs(positions[i3]) > 50) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > 50) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > 50) velocities[i3 + 2] *= -1;
    }
    menuParticles.geometry.attributes.position.needsUpdate = true;

    // Animate grid
    gridHelper.rotation.y += 0.001;

    // Gentle camera sway
    menuCamera.position.x = Math.sin(menuTime * 0.2) * 2;
    menuCamera.position.y = Math.cos(menuTime * 0.15) * 2;
    menuCamera.lookAt(0, 0, 0);

    // Animate light
    menuPointLight.intensity = 1.5 + Math.sin(menuTime) * 0.3;

    menuRenderer.render(menuScene, menuCamera);
    requestAnimationFrame(animateMenu);
}

// Start animation when menu is visible
setTimeout(() => {
    animateMenu();
}, 3000);

// Handle window resize
window.addEventListener('resize', () => {
    menuCamera.aspect = window.innerWidth / window.innerHeight;
    menuCamera.updateProjectionMatrix();
    menuRenderer.setSize(window.innerWidth, window.innerHeight);
});
