let webglSupported = true;

try {
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!gl) webglSupported = false;
} catch (e) {
  webglSupported = false;
}

if (webglSupported) {
  try {
    const canvas3d = document.getElementById('canvas-3d');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: false });

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
      0xBAE1FF, 0xFFB3BA, 0xE0BBE4, 0xBAFFC9, 0xFFF9C4,
      0xFFDEBA, 0xFEC8D8, 0xD4A5A5, 0xC5CAE9, 0xB2DFDB
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
  } catch (e) {
    console.warn('WebGL loading animation failed, using 2D fallback:', e);
    webglSupported = false;
  }
}

if (!webglSupported) {
  const canvas3d = document.getElementById('canvas-3d');
  if (canvas3d) {
    canvas3d.width = window.innerWidth;
    canvas3d.height = window.innerHeight;
    const ctx2d = canvas3d.getContext('2d');

    const bubbles = [];
    const colorHex = ['#BAE1FF','#FFB3BA','#E0BBE4','#BAFFC9','#FFF9C4','#FFDEBA','#FEC8D8','#D4A5A5','#C5CAE9','#B2DFDB'];

    for (let i = 0; i < 35; i++) {
      bubbles.push({
        x: Math.random() * canvas3d.width,
        y: Math.random() * canvas3d.height,
        r: 20 + Math.random() * 50,
        color: colorHex[Math.floor(Math.random() * colorHex.length)],
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        opacity: 0.25 + Math.random() * 0.35
      });
    }

    let t = 0;
    function fallbackAnimate() {
      t += 0.01;
      ctx2d.fillStyle = '#ffffff';
      ctx2d.fillRect(0, 0, canvas3d.width, canvas3d.height);
      bubbles.forEach(b => {
        const dy = Math.sin(t * b.speed + b.offset) * 20;
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y + dy, b.r, 0, Math.PI * 2);
        ctx2d.globalAlpha = b.opacity;
        ctx2d.fillStyle = b.color;
        ctx2d.fill();
        ctx2d.globalAlpha = 1;
      });
      requestAnimationFrame(fallbackAnimate);
    }

    fallbackAnimate();

    window.addEventListener('resize', () => {
      canvas3d.width = window.innerWidth;
      canvas3d.height = window.innerHeight;
    });
  }
}

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
