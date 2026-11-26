/* js/play/scenes3d.js — the 3D experiences of the play runtime (ES module).
   three.js is vendored in js/vendor/three (offline). Each experience renders
   into a host element and talks to the page through a small api:
     api.ask(o, speak)   show a prompt     api.step(node)  one step done
     api.right(node)     api.wrong(node)   api.play(src)   api.say(o)
     api.T(o)            text in the current language
     api.R(path)         asset path (or its packed copy in the one-file build) */
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import * as SkeletonUtils from '../vendor/three/utils/SkeletonUtils.js';

const L4 = (en, ml, hi, kn) => ({ en, ml, hi, kn });
const cache = {};

/* Load a .glb or .gltf. In the one-file build every file is a data: URI in
   window.PREVIEW_ASSETS; a URL modifier points the loader's requests at them. */
function load(path) {
  if (cache[path]) return cache[path];
  const packed = window.PREVIEW_ASSETS || null;
  const mgr = new THREE.LoadingManager();
  if (packed) mgr.setURLModifier((u) => { const k = decodeURIComponent(u).replace(/^\.\//, ''); return packed[k] || u; });
  const loader = new GLTFLoader(mgr);
  const dir = path.slice(0, path.lastIndexOf('/') + 1);
  cache[path] = new Promise((res, rej) => {
    if (packed && packed[path] && /\.gltf$/.test(path)) {
      fetch(packed[path]).then((r) => r.text()).then((txt) => loader.parse(txt, dir, res, rej)).catch(rej);
    } else loader.load(packed && packed[path] ? packed[path] : path, res, undefined, rej);
  });
  return cache[path];
}
function fitHeight(obj, h) { const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3()); const k = h / (s.y || 1); obj.scale.multiplyScalar(k);
  const b2 = new THREE.Box3().setFromObject(obj), c = b2.getCenter(new THREE.Vector3()); obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= b2.min.y; return obj; }

function stage(host) {
  const w = host.clientWidth, h = host.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1)); renderer.setSize(w, h); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none';
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 400);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8fbf6a, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(8, 18, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 20, bottom: -20, far: 80 }); scene.add(sun);
  const clock = new THREE.Clock(), ticks = [];
  let alive = true;
  (function loop() { if (!alive) return; if (!document.body.contains(host)) { alive = false; renderer.dispose(); return; }
    const dt = Math.min(clock.getDelta(), 0.05); ticks.forEach((f) => f(dt, clock.elapsedTime)); renderer.render(scene, camera); requestAnimationFrame(loop); })();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e, list) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(list, true)[0]; if (!hit) return null; let o = hit.object; while (o && !o.userData.pick) o = o.parent; return o; }
  /* a DOM label that follows a 3D point */
  function follow(el, obj, dy) { host.appendChild(el); const v = new THREE.Vector3();
    ticks.push(() => { if (!el.isConnected) return; obj.getWorldPosition(v); v.y += dy || 0; v.project(camera);
      el.style.left = ((v.x + 1) / 2 * host.clientWidth) + 'px'; el.style.top = ((1 - v.y) / 2 * host.clientHeight) + 'px'; }); }
  return { renderer, scene, camera, ticks, pick, follow, sun };
}
const ground = (scene, col, size) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(size || 200, size || 200), new THREE.MeshStandardMaterial({ color: col, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g; };
const box = (w, h, d, col, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: col, roughness: .8 })); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
const cyl = (r, h, col, x, y, z) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), new THREE.MeshStandardMaterial({ color: col, roughness: .7 })); m.position.set(x, y, z); m.castShadow = true; return m; };
function tree(x, z, s) { const g = new THREE.Group(); g.add(cyl(.18 * s, 1.6 * s, 0x8a5a2b, 0, .8 * s, 0));
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.1 * s, 18, 14), new THREE.MeshStandardMaterial({ color: 0x3fae3f, roughness: 1 })); top.position.y = 2.2 * s; top.castShadow = true; g.add(top); g.position.set(x, 0, z); return g; }

/* ══════════ ZOO WALK ══════════ */
const ZOO = [
  ['elephant', '3dmodels/elephant__gajah.glb', 3.0, L4('Elephant', 'ആന', 'हाथी', 'ಆನೆ')],
  ['monkey', '3dmodels/monkey.glb', 1.1, L4('Monkey', 'കുരങ്ങൻ', 'बंदर', 'ಕೋತಿ')],
  ['tiger', '3dmodels/tiger.glb', 1.5, L4('Tiger', 'കടുവ', 'बाघ', 'ಹುಲಿ')],
  ['deer', '3dmodels/Deer.glb', 1.8, L4('Deer', 'മാൻ', 'हिरण', 'ಜಿಂಕೆ')],
  ['zebra', '3dmodels/zebra.glb', 2.0, L4('Zebra', 'സീബ്ര', 'ज़ेबरा', 'ಜೀಬ್ರಾ')],
  ['camel', '3dmodels/camel.glb', 2.6, L4('Camel', 'ഒട്ടകം', 'ऊँट', 'ಒಂಟೆ')],
  ['lion', '3dmodels/lion_lowpoly.glb', 1.7, L4('Lion', 'സിംഹം', 'शेर', 'ಸಿಂಹ')],
  ['rabbit', '3dmodels/rabbit.glb', .7, L4('Rabbit', 'മുയൽ', 'खरगोश', 'ಮೊಲ')],
  ['wolf', '3dmodels/wolf.glb', 1.3, L4('Wolf', 'ചെന്നായ', 'भेड़िया', 'ತೋಳ')],
  ['hen', '3dmodels/hen.glb', .8, L4('Hen', 'കോഴി', 'मुर्गी', 'ಕೋಳಿ')]
];
const ZOO_SND = { elephant: 'assets/Audio/animals/elephant.mp3', tiger: 'assets/Audio/animals/tiger.mp3', lion: 'assets/new/audio/animals/lion-roar.mp3', monkey: 'assets/new/audio/animals/monkey-chatter.mp3', hen: 'assets/new/audio/animals/cluck.mp3', camel: 'assets/Audio/animals/camel.mp3' };
function zoo(host, api) {
  const S = stage(host), { scene, camera } = S, GAP = 9;
  scene.background = new THREE.Color(0xbfe9ff); scene.fog = new THREE.Fog(0xbfe9ff, 40, 110);
  ground(scene, 0x8ed664, 400);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(GAP * ZOO.length + 60, 4.2), new THREE.MeshStandardMaterial({ color: 0xe8c98a, roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.set(GAP * ZOO.length / 2, .01, 4.5); path.receiveShadow = true; scene.add(path);
  const picks = [], seen = {};
  ZOO.forEach((a, i) => {
    const x = i * GAP, pen = new THREE.Group(); pen.position.set(x, 0, 0); scene.add(pen);
    const sand = new THREE.Mesh(new THREE.CircleGeometry(3.8, 40), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd9c48a : 0xb6e08a, roughness: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.y = .02; sand.receiveShadow = true; pen.add(sand);
    for (let k = -4; k <= 4; k++) { pen.add(box(.14, 1, .14, 0x8a5a2b, k * .9, .5, 2.6)); } pen.add(box(7.4, .12, .1, 0xa86d36, 0, .85, 2.6)); pen.add(box(7.4, .12, .1, 0xa86d36, 0, .45, 2.6));
    const sign = box(1.6, .7, .1, 0xffd23f, -3.2, 1.4, 2.7); pen.add(sign); pen.add(cyl(.06, 1.1, 0x8a5a2b, -3.2, .55, 2.7));
    pen.add(tree(-2.6, -2.4, .9 + (i % 3) * .2)); pen.add(tree(2.9, -2.8, 1.1 - (i % 2) * .2));
    load(a[1]).then((g) => {
      const m = SkeletonUtils.clone(g.scene); m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      const holder = new THREE.Group(); holder.add(fitHeight(m, a[2])); holder.rotation.y = .5 - (i % 3) * .3; holder.userData = { pick: true, i };
      pen.add(holder); picks.push(holder);
      if (g.animations && g.animations.length) { const mix = new THREE.AnimationMixer(m); mix.clipAction(g.animations[0]).play(); S.ticks.push((dt) => mix.update(dt)); }
      else S.ticks.push((dt, t) => { holder.position.y = Math.abs(Math.sin(t * 2 + i)) * .05; });
    }).catch(() => {});
  });
  /* walk: the camera eases toward the chosen pen; three pens fit on the wall */
  let at = 0, cx = 0;
  camera.position.set(0, 3.2, 14); S.ticks.push((dt, t) => { const tx = at * GAP; cx += (tx - cx) * Math.min(1, dt * 2.4); camera.position.x = cx; camera.position.y = 3.2 + (Math.abs(tx - cx) > .1 ? Math.abs(Math.sin(t * 9)) * .08 : 0); camera.lookAt(cx, 1.2, 0); });
  const card = document.createElement('div'); card.className = 'z-card'; host.appendChild(card);
  function walk(d) { at = Math.max(0, Math.min(ZOO.length - 1, at + d)); api.tap(); }
  const nav = (txt, d, side) => { const b = document.createElement('button'); b.className = 'z-nav ' + side; b.textContent = txt; b.addEventListener('click', () => walk(d)); host.appendChild(b); };
  nav('◀', -1, 'l'); nav('▶', 1, 'r');
  S.renderer.domElement.addEventListener('click', (e) => { const o = S.pick(e, picks); if (!o) return; const a = ZOO[o.userData.i];
    at = o.userData.i; if (ZOO_SND[a[0]]) api.play(api.R(ZOO_SND[a[0]])); else api.pop();
    let k = 0; const hop = (dt) => { k += dt; o.position.y = Math.sin(Math.min(1, k * 3) * Math.PI) * .6; }; S.ticks.push(hop); setTimeout(() => { const j = S.ticks.indexOf(hop); if (j >= 0) S.ticks.splice(j, 1); }, 400);
    card.innerHTML = '<b>' + api.T(a[3]) + '</b>'; card.classList.remove('show'); void card.offsetWidth; card.classList.add('show'); api.ask(a[3], false);
    if (!seen[a[0]]) { seen[a[0]] = 1; api.step(card); } });
  return { total: ZOO.length };
}

/* ══════════ MY BODY ══════════ */
const PARTS = [
  ['head', .95, 0, .1, L4('Head', 'തല', 'सिर', 'ತಲೆ')], ['eyes', .86, .12, .5, L4('Eyes', 'കണ്ണുകൾ', 'आँखें', 'ಕಣ್ಣುಗಳು')], ['nose', .82, 0, .55, L4('Nose', 'മൂക്ക്', 'नाक', 'ಮೂಗು')],
  ['mouth', .77, 0, .5, L4('Mouth', 'വായ', 'मुँह', 'ಬಾಯಿ')], ['ears', .84, .44, 0, L4('Ears', 'ചെവികൾ', 'कान', 'ಕಿವಿಗಳು')], ['tummy', .5, 0, .5, L4('Tummy', 'വയർ', 'पेट', 'ಹೊಟ್ಟೆ')],
  ['hands', .42, .62, .2, L4('Hands', 'കൈകൾ', 'हाथ', 'ಕೈಗಳು')], ['knees', .22, .2, .4, L4('Knees', 'കാൽമുട്ടുകൾ', 'घुटने', 'ಮಂಡಿಗಳು')], ['feet', .03, .22, .5, L4('Feet', 'പാദങ്ങൾ', 'पैर', 'ಪಾದಗಳು')]
];
const WHERE = L4('Where is the', 'എവിടെ', 'कहाँ है', 'ಎಲ್ಲಿದೆ');
function body(host, api) {
  const S = stage(host), { scene, camera } = S;
  scene.background = null; ground(scene, 0xfff1c9, 80).material.color.set(0xf7e1b5);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshStandardMaterial({ color: 0x8fd3f4 })); rug.rotation.x = -Math.PI / 2; rug.position.y = .01; rug.receiveShadow = true; scene.add(rug);
  camera.position.set(0, 2.2, 8.5); camera.lookAt(0, 2.2, 0);
  const holder = new THREE.Group(); scene.add(holder);
  let order = [], cur = null, H = 2.9, Wd = 1;
  const dots = [];
  load('assets/new/models/body/boy/scene.gltf').then((g) => {
    const root = g.scene; root.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    fitHeight(root, H); holder.add(root);
    const sz = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()), k = 1; Wd = sz.x;
    PARTS.forEach((p) => { [p[2] ? -1 : 0, p[2] ? 1 : null].forEach((side) => { if (side === null) return;
      const a = new THREE.Object3D(); a.position.set((side || 0) * p[2] * Wd / 2, p[1] * H, p[3] * sz.z * .6); holder.add(a);
      const d = document.createElement('button'); d.className = 'b-dot'; d.dataset.part = p[0]; S.follow(d, a, 0); dots.push(d);
      d.addEventListener('click', () => tapPart(p, d)); }); });
    order = PARTS.slice().sort(() => Math.random() - .5); next();
  }).catch(() => api.ask(L4('3D body could not load', '3D ലോഡ് ആയില്ല', '3D लोड नहीं हुआ', '3D ಲೋಡ್ ಆಗಲಿಲ್ಲ'), false));
  S.ticks.push((dt, t) => { holder.rotation.y = Math.sin(t * .5) * .2; });
  function next() { cur = order.shift(); if (!cur) return; api.ask({ en: 'Where are the ' + cur[4].en.toLowerCase() + '?', ml: cur[4].ml + ' ' + WHERE.ml + '?', hi: cur[4].hi + ' ' + WHERE.hi + '?', kn: cur[4].kn + ' ' + WHERE.kn + '?' }); }
  function tapPart(p, d) { if (!cur) return;
    if (p !== cur) { api.wrong(d); return; }
    dots.filter((x) => x.dataset.part === p[0]).forEach((x) => { x.classList.add('found'); x.textContent = api.T(p[4]); });
    api.right(d); api.say(p[4]); let k = 0; const jump = (dt) => { k += dt; holder.position.y = Math.sin(Math.min(1, k * 2.5) * Math.PI) * .4; }; S.ticks.push(jump);
    setTimeout(() => { const j = S.ticks.indexOf(jump); if (j >= 0) S.ticks.splice(j, 1); holder.position.y = 0; }, 500);
    cur = null; api.step(d, next); }
  return { total: PARTS.length };
}

/* ══════════ TRAFFIC LIGHT ══════════ */
/* where the lamps sit on the model, as fractions of its height (tuned by eye) */
const TL_LAMP = { red: .917, yellow: .849, green: .78, x: -.15, r: .026, rot: 0 };
const TL = { red: L4('Red: STOP and wait', 'ചുവപ്പ്: നിൽക്കൂ', 'लाल: रुको', 'ಕೆಂಪು: ನಿಲ್ಲಿ'), yellow: L4('Yellow: get ready', 'മഞ്ഞ: തയ്യാറാകൂ', 'पीला: तैयार रहो', 'ಹಳದಿ: ಸಿದ್ಧರಾಗಿ'), green: L4('Green: now we can cross', 'പച്ച: ഇനി കടക്കാം', 'हरा: अब पार करो', 'ಹಸಿರು: ಈಗ ದಾಟಬಹುದು') };
const WAIT = L4('Wait for the GREEN man!', 'പച്ച വെളിച്ചം വരെ കാത്തിരിക്കൂ!', 'हरी बत्ती का इंतज़ार करो!', 'ಹಸಿರು ದೀಪಕ್ಕೆ ಕಾಯಿರಿ!');
const GO = L4('Tap the child to cross when it is GREEN!', 'പച്ചയാകുമ്പോൾ കുട്ടിയെ തൊട്ട് റോഡ് കടത്തൂ!', 'हरी बत्ती हो तो बच्चे को छूकर सड़क पार कराओ!', 'ಹಸಿರಾದಾಗ ಮಗುವನ್ನು ಮುಟ್ಟಿ ರಸ್ತೆ ದಾಟಿಸಿ!');
function traffic(host, api) {
  /* ROAD SAFETY — a straight, simple street. The road runs into the wall in the
     middle screen with a zebra crossing; the car waits there. Each side screen
     has a pedestrian signal and a PUSH button. The child presses the button,
     waits for the green man, then really walks across the wall and touches the
     other side's button before the light turns red. If they do not get there,
     the car honks and drives through and they try again — never a crash. */
  const S = stage(host), { scene, renderer } = S;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const cam = new THREE.OrthographicCamera(-28.9, 28.9, 5.4, -5.4, .1, 200); cam.position.set(0, 9, 30); cam.lookAt(0, 1.6, 0);
  S.camera.copy(cam); S.camera.updateProjectionMatrix = cam.updateProjectionMatrix.bind(S.camera);
  scene.background = new THREE.Color(0xa9d8ff);
  const mat = (c, r) => new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? .9 : r });
  const slab = (w, d, c, x, z, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, .2, d), mat(c)); m.position.set(x, (y || 0) - .1, z); m.receiveShadow = true; scene.add(m); return m; };
  slab(14, 80, 0x3d4247, 0, -20);                                   // road, running into the wall
  slab(24, 80, 0xb9bcc0, -19, -20, .25); slab(24, 80, 0xb9bcc0, 19, -20, .25);   // sidewalks, raised
  slab(.5, 80, 0xe8e8e8, -7.2, -20, .3); slab(.5, 80, 0xe8e8e8, 7.2, -20, .3);    // kerbs
  for (let x = -6; x <= 6; x += 1.5) slab(.8, 5, 0xffffff, x, 2.2, .02);         // zebra crossing
  for (let z = -60; z < -4; z += 5) slab(.25, 2.6, 0xffd23f, 0, z, .02);          // centre line
  slab(14, .5, 0xffffff, 0, -1.2, .02);                                           // stop line
  [[-24, -9], [-14, -9], [14, -9], [24, -9]].forEach((p, i) => scene.add(tree(p[0], p[1] + (i % 2) * 2, 1.6)));
  /* buildings along the back */
  load('assets/new/models/street/buildings/scene.gltf').then((b) => { [-22, -12, 12, 22].forEach((x, n) => { const m = SkeletonUtils.clone(b.scene); const bx = new THREE.Box3().setFromObject(m), bs = bx.getSize(new THREE.Vector3());
    const k = 9 / Math.max(bs.x, bs.z); m.scale.setScalar(k); if (bs.z > bs.x) m.rotation.y = Math.PI / 2; const h = new THREE.Group(); h.add(m);
    const b2 = new THREE.Box3().setFromObject(h), c2 = b2.getCenter(new THREE.Vector3()); m.position.set(-c2.x, -b2.min.y + .3, -c2.z); h.position.set(x, 0, -16 - (n % 2) * 3); scene.add(h); }); }).catch(() => {});
  /* the cars' traffic light beside the road */
  const lamps = {}; const pole = new THREE.Group(); pole.position.set(8.2, .3, -.6); scene.add(pole);
  load('assets/new/models/street/traffic-light/scene.gltf').then((t) => { const H = 6, m = fitHeight(t.scene, H); m.traverse((o) => { if (o.isMesh) o.castShadow = true; }); pole.add(m);
    const b = new THREE.Box3().setFromObject(m); [['red', 0xff3b30, TL_LAMP.red], ['yellow', 0xffcc00, TL_LAMP.yellow], ['green', 0x34c759, TL_LAMP.green]].forEach((c) => {
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(TL_LAMP.r * H, 24, 18), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: c[1], emissiveIntensity: 0 }));
      s2.position.set(TL_LAMP.x * H, c[2] * H, b.max.z + .02); pole.add(s2); lamps[c[0]] = s2; }); carLight('green'); }).catch(() => {});
  function carLight(c) { Object.keys(lamps).forEach((k) => { lamps[k].material.emissiveIntensity = k === c ? 2.6 : 0; lamps[k].material.color.set(k === c ? lamps[k].material.emissive : 0x222222); }); }
  /* the car, waiting behind the stop line, facing us */
  let car = null; const CAR_WAIT = -4.2;
  load('assets/new/models/car.glb').then((cg) => { const m = fitHeight(SkeletonUtils.clone(cg.scene), 1.9); m.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()); car = new THREE.Group(); car.add(m); if (sz.x > sz.z) m.rotation.y = Math.PI / 2; car.position.set(-3.2, 0, CAR_WAIT); scene.add(car); }).catch(() => {});
  /* the two sides: a pedestrian signal and a big PUSH button each, at child height */
  const side = (cls) => { const d = document.createElement('div'); d.className = 'rs-side ' + cls;
    d.innerHTML = '<div class="rs-sig"><div class="rs-man red">🚶</div><div class="rs-count"></div></div><button class="rs-push"><span>PUSH</span></button>'; host.appendChild(d); return d; };
  const L = side('l'), R = side('r'); let start = L, end = R, phase = 'idle', timer = 0, round = 0, GREEN = 14;
  const T2 = { press: L4('Press the button to cross!', 'റോഡ് കടക്കാൻ ബട്ടൺ അമർത്തൂ!', 'सड़क पार करने के लिए बटन दबाओ!', 'ರಸ್ತೆ ದಾಟಲು ಬಟನ್ ಒತ್ತಿ!'),
    wait: L4('Wait for the green man…', 'പച്ച വെളിച്ചം വരെ കാത്തിരിക്കൂ…', 'हरी बत्ती का इंतज़ार करो…', 'ಹಸಿರು ದೀಪಕ್ಕೆ ಕಾಯಿರಿ…'),
    walk: L4('Green! Walk across and touch the other side!', 'പച്ച! നടന്ന് മറുവശം തൊടൂ!', 'हरा! चलकर दूसरी तरफ़ छुओ!', 'ಹಸಿರು! ನಡೆದು ಆ ಕಡೆ ಮುಟ್ಟಿ!'),
    safe: L4('Safe! Well done!', 'സുരക്ഷിതം! കൊള്ളാം!', 'सुरक्षित! शाबाश!', 'ಸುರಕ್ಷಿತ! ಭೇಷ್!'),
    late: L4('The car is coming! Cross quickly on green. Try again!', 'വണ്ടി വരുന്നു! പച്ചയിൽ വേഗം കടക്കൂ. വീണ്ടും ശ്രമിക്കൂ!', 'गाड़ी आ रही है! हरी बत्ती पर जल्दी पार करो। फिर से!', 'ವಾಹನ ಬರುತ್ತಿದೆ! ಹಸಿರಿನಲ್ಲಿ ಬೇಗ ದಾಟಿ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!'),
    red: L4('Red man: wait!', 'ചുവപ്പ്: നിൽക്കൂ!', 'लाल: रुको!', 'ಕೆಂಪು: ನಿಲ್ಲಿ!') };
  function man(c) { [L, R].forEach((d) => { const m = d.querySelector('.rs-man'); m.className = 'rs-man ' + c; m.textContent = c === 'green' ? '🚶' : '🧍'; }); }
  function ready() { phase = 'idle'; man('red'); carLight('green'); [L, R].forEach((d) => d.classList.remove('go', 'target')); start.classList.add('go'); api.ask(T2.press); }
  function honk() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .35].forEach((d) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = 420; g.gain.value = .08; o.connect(g); g.connect(a.destination); o.start(a.currentTime + d); o.stop(a.currentTime + d + .25); }); } catch (e) {} }
  function press(d) {
    if (phase === 'idle' && d === start) { phase = 'waiting'; api.tap(); start.classList.remove('go'); api.ask(T2.wait); carLight('yellow');
      setTimeout(() => { carLight('red'); setTimeout(() => { phase = 'walk'; timer = GREEN; man('green'); end.classList.add('target'); api.ask(T2.walk); }, 900); }, 1600); return; }
    if (phase === 'walk' && d === end) { phase = 'done'; end.classList.remove('target'); man('red'); api.right(end.querySelector('.rs-push')); api.ask(T2.safe);
      round++; api.step(end.querySelector('.rs-push'), () => { const t = start; start = end; end = t; ready(); }); return; }
    if (phase !== 'walk') { api.wrong(d.querySelector('.rs-push')); if (phase === 'idle') api.ask(T2.press, false); else api.ask(T2.red, false); }
  }
  L.querySelector('.rs-push').addEventListener('click', () => press(L)); R.querySelector('.rs-push').addEventListener('click', () => press(R));
  S.ticks.push((dt) => {
    if (phase === 'walk') { timer -= dt; const n = Math.max(0, Math.ceil(timer)); [L, R].forEach((d) => { d.querySelector('.rs-count').textContent = n; });
      if (timer <= 0) { phase = 'late'; man('red'); [L, R].forEach((d) => { d.querySelector('.rs-count').textContent = ''; d.classList.remove('target'); }); carLight('green'); honk(); api.ask(T2.late); } }
    else [L, R].forEach((d) => { d.querySelector('.rs-count').textContent = ''; });
    if (car) { if (phase === 'late') { car.position.z += dt * 14; if (car.position.z > 30) { car.position.z = -60; } if (car.position.z < CAR_WAIT && car.position.z > -60 + 1) { /* coming back round */ } }
      else if (car.position.z > CAR_WAIT + .01 && car.position.z < 30) { car.position.z += dt * 14; if (car.position.z >= 30) car.position.z = -60; }
      else if (car.position.z < CAR_WAIT) { car.position.z = Math.min(CAR_WAIT, car.position.z + dt * 14); if (phase === 'late' ) {} }
      if (phase === 'late' && car.position.z <= CAR_WAIT && car.position.z > -59 && car.userData.went) { ready(); car.userData.went = false; }
      if (phase === 'late' && car.position.z > 10) car.userData.went = true; }
  });
  ready();
  return { total: 4 };
}

/* ══════════ SEASONS EXPLORER ══════════
   A realistic scene across the whole wall: three scanned Ginkgo trees on a
   photo-scanned forest floor. Tap a season below and the trees, ground, sky,
   light and weather change. Tap a tree and it shakes. Then a short quiz. */
const SEASONS = [
  { k: 'spring', icon: '🌸', name: L4('Spring', 'വസന്തം', 'वसंत', 'ವಸಂತ'), tree: 'summer', sky: [0x9fd8ff, 0xe9f7ff], ground: 0x6fae4a, fx: 'petal', light: 1.0,
    facts: [L4('Flowers bloom', 'പൂക്കൾ വിരിയുന്നു', 'फूल खिलते हैं', 'ಹೂವುಗಳು ಅರಳುತ್ತವೆ'), L4('New leaves grow', 'പുതിയ ഇലകൾ വരുന്നു', 'नई पत्तियाँ आती हैं', 'ಹೊಸ ಎಲೆಗಳು ಬರುತ್ತವೆ')] },
  { k: 'summer', icon: '☀️', name: L4('Summer', 'വേനൽ', 'गर्मी', 'ಬೇಸಿಗೆ'), tree: 'summer', sky: [0x4fb6ff, 0xd8f0ff], ground: 0x8aa84a, fx: 'sun', light: 1.35,
    facts: [L4('It is hot and sunny', 'ചൂടും വെയിലും', 'गर्मी और धूप', 'ಬಿಸಿಲು ಮತ್ತು ಸೆಕೆ'), L4('We drink lots of water', 'ധാരാളം വെള്ളം കുടിക്കാം', 'खूब पानी पीते हैं', 'ಹೆಚ್ಚು ನೀರು ಕುಡಿಯುತ್ತೇವೆ')] },
  { k: 'monsoon', icon: '🌧️', name: L4('Monsoon', 'മഴക്കാലം', 'बरसात', 'ಮಳೆಗಾಲ'), tree: 'summer', sky: [0x5a6878, 0x9aa7b4], ground: 0x4f6e3a, fx: 'rain', light: .55,
    facts: [L4('It rains a lot', 'ധാരാളം മഴ പെയ്യുന്നു', 'बहुत बारिश होती है', 'ತುಂಬಾ ಮಳೆ ಬರುತ್ತದೆ'), L4('We use an umbrella', 'നമ്മൾ കുട ചൂടുന്നു', 'हम छाता लेते हैं', 'ನಾವು ಕೊಡೆ ಹಿಡಿಯುತ್ತೇವೆ')] },
  { k: 'autumn', icon: '🍂', name: L4('Autumn', 'ശരത്കാലം', 'पतझड़', 'ಶರತ್ಕಾಲ'), tree: 'autumn', sky: [0xffc58a, 0xfff0dc], ground: 0x9a6a2e, fx: 'leaf', light: 1.0,
    facts: [L4('Leaves turn yellow and fall', 'ഇലകൾ മഞ്ഞളിച്ച് വീഴുന്നു', 'पत्ते पीले होकर गिरते हैं', 'ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಉದುರುತ್ತವೆ'), L4('It gets cooler', 'തണുപ്പ് തുടങ്ങുന്നു', 'ठंडक बढ़ती है', 'ತಂಪಾಗುತ್ತದೆ')] },
  { k: 'winter', icon: '❄️', name: L4('Winter', 'ശൈത്യകാലം', 'सर्दी', 'ಚಳಿಗಾಲ'), tree: 'winter', sky: [0xb9c9da, 0xf2f6fa], ground: 0xf4f7fb, fx: 'snow', light: .9,
    facts: [L4('It is cold', 'നല്ല തണുപ്പ്', 'बहुत ठंड होती है', 'ತುಂಬಾ ಚಳಿ'), L4('We wear a sweater', 'നമ്മൾ സ്വെറ്റർ ഇടുന്നു', 'हम स्वेटर पहनते हैं', 'ನಾವು ಸ್ವೆಟರ್ ಧರಿಸುತ್ತೇವೆ')] }
];
const WHICH = L4('Which season is this?', 'ഇത് ഏത് കാലം?', 'यह कौन सा मौसम है?', 'ಇದು ಯಾವ ಋತು?');
function spriteTex(kind) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  if (kind === 'rain') { const gr = g.createLinearGradient(32, 0, 32, 64); gr.addColorStop(0, 'rgba(220,235,255,0)'); gr.addColorStop(1, 'rgba(220,235,255,.9)'); g.fillStyle = gr; g.fillRect(29, 0, 6, 64); }
  else if (kind === 'snow') { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  else if (kind === 'sun') { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 30); gr.addColorStop(0, 'rgba(255,250,200,.9)'); gr.addColorStop(1, 'rgba(255,240,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  else { g.fillStyle = kind === 'petal' ? '#ffb3cf' : '#e8a020'; g.beginPath(); g.ellipse(32, 32, 26, 14, .6, 0, Math.PI * 2); g.fill(); g.fillStyle = kind === 'petal' ? '#ff8fb8' : '#c26a10'; g.beginPath(); g.ellipse(32, 32, 26, 3, .6, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function seasons(host, api) {
  const S = stage(host), { scene, camera, renderer } = S, SCR = 15.2;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  camera.fov = 32; camera.near = .1; camera.far = 300; camera.position.set(0, 3.4, 17); camera.lookAt(0, 3.6, 0); camera.updateProjectionMatrix();
  const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { top: { value: new THREE.Color(0x9fd8ff) }, bot: { value: new THREE.Color(0xe9f7ff) } },
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 p; void main(){ gl_FragColor = vec4(mix(bot, top, clamp(p.y*1.6+.15,0.,1.)),1.); }' });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), skyMat));
  const hemi = scene.children.find((o) => o.isHemisphereLight), sun = S.sun; sun.position.set(14, 22, 10);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x6fae4a, roughness: 1 }); const gp = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat); gp.rotation.x = -Math.PI / 2; gp.receiveShadow = true; scene.add(gp);
  scene.fog = new THREE.Fog(0xe9f7ff, 40, 140);
  const trees = { summer: [], autumn: [], winter: [] }, floors = { ground: [], leaves: [] }, picks = [];
  /* the scanned forest floor, laid in a strip along the wall; the autumn leaf scan over it in autumn */
  [['ground', 'assets/new/models/seasons/ground/scene.gltf', 7], ['leaves', 'assets/new/models/seasons/leaves/scene.gltf', 5]].forEach(([k, path, size]) => {
    load(path).then((g) => { for (let i = -6; i <= 6; i++) for (let j = 0; j < 3; j++) { const m = SkeletonUtils.clone(g.scene); const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3());
      m.scale.multiplyScalar(size / Math.max(sz.x, sz.z)); m.scale.y *= Math.min(1, .35 / Math.max(.01, sz.y * size / Math.max(sz.x, sz.z))); const b2 = new THREE.Box3().setFromObject(m), c = b2.getCenter(new THREE.Vector3());
      m.position.set(i * size * .62 + (j % 2) * size * .3 - c.x, -b2.min.y - (k === 'leaves' ? .02 : .06) - (i + j) % 3 * .01, -j * size * .6 + 4 - c.z); m.rotation.y = ((i * 7 + j * 3) % 4) * Math.PI / 2;
      m.traverse((o) => { if (o.isMesh) o.receiveShadow = true; }); m.visible = k === 'ground'; scene.add(m); floors[k].push(m); } update(); }).catch(() => {}); });
  [['summer', 'tree-summer'], ['autumn', 'tree-autumn'], ['winter', 'tree-winter']].forEach(([k, f]) => {
    load('assets/new/models/seasons/' + f + '/scene.gltf').then((g) => { [-SCR, 0, SCR].forEach((x, i) => { const m = fitHeight(SkeletonUtils.clone(g.scene), i === 1 ? 10 : 8.5);
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); const h = new THREE.Group(); h.add(m); h.position.set(x, 0, i === 1 ? -1 : -3); h.rotation.y = i * 1.3;
      h.userData = { pick: true, k }; h.visible = false; scene.add(h); trees[k].push(h); picks.push(h); }); update(); }).catch(() => {}); });
  /* weather: one particle system, re-skinned per season */
  const N = 1400, pos = new Float32Array(N * 3), vel = new Float32Array(N); for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 60; pos[i * 3 + 1] = Math.random() * 16; pos[i * 3 + 2] = Math.random() * 14 - 6; vel[i] = .6 + Math.random() * .8; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ size: .35, transparent: true, depthWrite: false, map: spriteTex('petal') }); const pts = new THREE.Points(pg, pm); scene.add(pts);
  const TEX = { petal: spriteTex('petal'), leaf: spriteTex('leaf'), rain: spriteTex('rain'), snow: spriteTex('snow'), sun: spriteTex('sun') };
  let cur = SEASONS[0], wind = 0;
  S.ticks.push((dt, t) => { const fx = cur.fx, sp = fx === 'rain' ? 16 : fx === 'snow' ? 1.2 : fx === 'sun' ? .25 : 1.4;
    for (let i = 0; i < N; i++) { const j = i * 3; pos[j + 1] -= vel[i] * sp * dt; if (fx !== 'rain' && fx !== 'sun') pos[j] += Math.sin(t * 1.3 + i) * dt * (fx === 'snow' ? .4 : 1.1) + wind * dt;
      if (fx === 'sun') pos[j + 1] += Math.sin(t + i) * .004; if (pos[j + 1] < 0) { pos[j + 1] = 16; pos[j] = (Math.random() - .5) * 60; } }
    pg.attributes.position.needsUpdate = true; wind *= .97;
    [].concat(trees.summer, trees.autumn, trees.winter).forEach((h, i) => { if (h.userData.shake > 0) { h.userData.shake -= dt; h.rotation.z = Math.sin(t * 30) * .03 * h.userData.shake; } else h.rotation.z = 0; }); });
  function update() { const s = cur;
    Object.keys(trees).forEach((k) => trees[k].forEach((h) => { h.visible = k === s.tree; }));
    floors.ground.forEach((m) => { m.visible = true; m.traverse((o) => { if (o.isMesh && o.material) { o.material.color && o.material.color.set(s.k === 'winter' ? 0xffffff : s.k === 'monsoon' ? 0x8a9a8a : 0xffffff); o.material.emissive && o.material.emissive.set(s.k === 'winter' ? 0x5a6068 : 0x000000); } }); });
    floors.leaves.forEach((m) => { m.visible = s.k === 'autumn'; });
    groundMat.color.set(s.ground); skyMat.uniforms.top.value.set(s.sky[0]); skyMat.uniforms.bot.value.set(s.sky[1]); scene.fog.color.set(s.sky[1]);
    sun.intensity = 2.4 * s.light; if (hemi) hemi.intensity = 1.6 * s.light; sun.color.set(s.k === 'autumn' ? 0xffd9a8 : s.k === 'winter' ? 0xe8f0ff : 0xffffff);
    pm.map = TEX[s.fx]; pm.size = s.fx === 'rain' ? .5 : s.fx === 'snow' ? .3 : s.fx === 'sun' ? 1.2 : .4; pm.opacity = s.fx === 'sun' ? .5 : 1; pm.needsUpdate = true;
    pg.setDrawRange(0, s.fx === 'rain' ? N : s.fx === 'sun' ? 160 : s.fx === 'petal' ? 500 : 900); }
  /* season cards along the bottom of the middle screen, and a floating fact card */
  const bar = document.createElement('div'); bar.className = 'sea-bar'; host.appendChild(bar);
  const card = document.createElement('div'); card.className = 'sea-card'; host.appendChild(card);
  const seen = {}; let quiz = null, qn = 0;
  function show(s) { cur = s; update(); card.innerHTML = '<div class="sn">' + s.icon + ' ' + api.T(s.name) + '</div>' + s.facts.map((f) => '<div class="sf">✦ ' + api.T(f) + '</div>').join('');
    card.classList.remove('show'); void card.offsetWidth; card.classList.add('show'); }
  SEASONS.forEach((s) => { const b = document.createElement('button'); b.className = 'sea-btn sea-' + s.k; b.innerHTML = '<span class="si">' + s.icon + '</span><span class="st">' + api.T(s.name) + '</span>'; bar.appendChild(b);
    b.addEventListener('click', () => { api.tap();
      if (quiz) { if (s === quiz) { api.right(b); api.say(s.name); quiz = null; api.step(b, nextQ); } else api.wrong(b); return; }
      [].forEach.call(bar.children, (x) => x.classList.toggle('on', x === b)); show(s); api.say(s.name); api.ask(s.name, false);
      if (!seen[s.k]) { seen[s.k] = 1; api.step(b); if (Object.keys(seen).length === SEASONS.length) setTimeout(nextQ, 2400); } }); });
  function nextQ() { if (qn >= 3) return; qn++; let q; do { q = SEASONS[Math.random() * SEASONS.length | 0]; } while (q === cur && Math.random() < .8);
    quiz = q; [].forEach.call(bar.children, (x) => x.classList.remove('on')); card.classList.remove('show'); cur = q; update(); api.ask(WHICH); }
  /* tap a tree: it shakes and the weather gusts */
  renderer.domElement.addEventListener('click', (e) => { const o = S.pick(e, picks); if (!o) return; o.userData.shake = 1.2; wind = 6; api.pop(); });
  /* drag sideways to look around a little */
  let dx0 = null, yaw = 0; renderer.domElement.addEventListener('pointerdown', (e) => { dx0 = e.clientX; });
  renderer.domElement.addEventListener('pointermove', (e) => { if (dx0 === null) return; yaw = Math.max(-.25, Math.min(.25, yaw + (e.clientX - dx0) * .0006)); dx0 = e.clientX;
    camera.position.x = Math.sin(yaw) * 17; camera.position.z = Math.cos(yaw) * 17; camera.lookAt(0, 3.6, 0); });
  window.addEventListener('pointerup', () => { dx0 = null; });
  api.ask(L4('Tap a season to explore!', 'ഒരു കാലം തൊട്ട് നോക്കൂ!', 'कोई मौसम छूकर देखो!', 'ಒಂದು ಋತು ಮುಟ್ಟಿ ನೋಡಿ!'), false);
  show(SEASONS[0]); bar.children[0].classList.add('on');
  return { total: SEASONS.length + 3 };
}

window.WALL3D = { zoo, body, traffic, seasons };
window.dispatchEvent(new Event('wall3d-ready'));
