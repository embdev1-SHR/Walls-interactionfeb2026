const canvas = document.getElementById('canvas-3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff);
camera.position.z = 50;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xBAE1FF, 0.5, 100);
pointLight1.position.set(-20, 20, 20);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xFFB3BA, 0.5, 100);
pointLight2.position.set(20, -20, 20);
scene.add(pointLight2);

const planetColors = [
    0xBAE1FF,
    0xFFB3BA,
    0xE0BBE4,
    0xBAFFC9,
    0xFFF9C4,
    0xFFDEBA,
    0xFEC8D8,
    0xD4A5A5,
    0xC5CAE9,
    0xB2DFDB
];

const spheres = [];
const sphereCount = 35;

for (let i = 0; i < sphereCount; i++) {
    const size = 2 + Math.random() * 5;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        shininess: 100,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.3
    });

    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40 - 10
    );

    sphere.userData = {
        originalX: sphere.position.x,
        originalY: sphere.position.y,
        originalZ: sphere.position.z,
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatRange: 1.5 + Math.random() * 2.5,
        offset: Math.random() * Math.PI * 2
    };

    scene.add(sphere);
    spheres.push(sphere);
}

let time = 0;
function animateLoading() {
    time += 0.005;

    spheres.forEach((sphere, index) => {
        sphere.position.y = sphere.userData.originalY +
            Math.sin(time * sphere.userData.floatSpeed + sphere.userData.offset) * sphere.userData.floatRange;

        sphere.position.x = sphere.userData.originalX +
            Math.sin(time * 0.5 + sphere.userData.offset) * 1;

        const scale = 1 + Math.sin(time + index) * 0.02;
        sphere.scale.set(scale, scale, scale);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animateLoading);
}

animateLoading();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

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
