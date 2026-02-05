const menuCanvas = document.getElementById('menu-canvas');
const menuScene = new THREE.Scene();
const menuCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const menuRenderer = new THREE.WebGLRenderer({ canvas: menuCanvas, antialias: true, alpha: false });

menuRenderer.setSize(window.innerWidth, window.innerHeight);
menuRenderer.setPixelRatio(window.devicePixelRatio);
menuRenderer.setClearColor(0xffffff);
menuCamera.position.z = 60;

const menuAmbientLight = new THREE.AmbientLight(0xffffff, 1.2);
menuScene.add(menuAmbientLight);

const menuPointLight1 = new THREE.PointLight(0xBAE1FF, 0.5, 100);
menuPointLight1.position.set(-20, 20, 20);
menuScene.add(menuPointLight1);

const menuPointLight2 = new THREE.PointLight(0xFFB3BA, 0.5, 100);
menuPointLight2.position.set(20, -20, 20);
menuScene.add(menuPointLight2);

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

const menuSpheres = [];
const menuSphereCount = 40;

for (let i = 0; i < menuSphereCount; i++) {
    const size = 2 + Math.random() * 5;
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        shininess: 100,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.35
    });

    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 50 - 10
    );

    sphere.userData = {
        originalX: sphere.position.x,
        originalY: sphere.position.y,
        originalZ: sphere.position.z,
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatRange: 1.5 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2
    };

    menuScene.add(sphere);
    menuSpheres.push(sphere);
}

let menuTime = 0;
function animateMenu() {
    menuTime += 0.005;

    menuSpheres.forEach((sphere, index) => {
        sphere.position.y = sphere.userData.originalY +
            Math.sin(menuTime * sphere.userData.floatSpeed + sphere.userData.offset) * sphere.userData.floatRange;

        sphere.position.x = sphere.userData.originalX +
            Math.sin(menuTime * 0.5 + sphere.userData.offset) * 1;

        const scale = 1 + Math.sin(menuTime + index) * 0.02;
        sphere.scale.set(scale, scale, scale);
    });

    menuRenderer.render(menuScene, menuCamera);
    requestAnimationFrame(animateMenu);
}

setTimeout(() => {
    animateMenu();
}, 3000);

window.addEventListener('resize', () => {
    menuCamera.aspect = window.innerWidth / window.innerHeight;
    menuCamera.updateProjectionMatrix();
    menuRenderer.setSize(window.innerWidth, window.innerHeight);
});
