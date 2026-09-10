/**
 * model-popup.js — tap-to-open 3D viewer with a guided tour
 * ══════════════════════════════════════════════════════════════════
 *
 * WHY LOCAL three.js AND NOT <model-viewer>
 *   games/vehicles.html uses <model-viewer> from ajax.googleapis.com.
 *   That works on a desk and dies on the wall: this app is required to
 *   run with no internet, and a CDN <model-viewer> silently never
 *   defines the element, so the popup opens empty with no error.
 *
 *   three.js is already vendored (node_modules/three) AND already listed
 *   in package.json build.files, so it ships inside the installer. Two
 *   files are needed and both are packaged:
 *       three/build/three.module.js
 *       three/examples/jsm/loaders/GLTFLoader.js
 *   Controls are hand-rolled rather than OrbitControls — partly to avoid
 *   adding a fourth file to build.files, mostly because OrbitControls'
 *   pan/dolly lets a child fling the model off-screen with no way back.
 *   Here: one finger spins, two fingers zoom, and that is all.
 *
 * DEGRADES WHEN THERE IS NO MODEL
 *   No house .glb files exist in this repo yet. If `src` is absent or
 *   fails to load, the popup shows the card's photo/emoji large with a
 *   short note instead of a black void. The activity stays usable and
 *   the missing model is obvious rather than mysterious.
 *
 * THE TOUR
 *   A fixed camera keyframe path — front, side, back, high three-quarter,
 *   then a slow push toward the front door. Works on any model because
 *   the frames are computed from the model's own bounding sphere rather
 *   than authored per-asset.
 *
 * USE
 *   <script type="importmap"> … three + three/addons/ … </script>
 *   <script type="module" src="../js/model-popup.js"></script>
 *   MODEL3D.open({
 *     title: {en,ml}, fact: {en,ml},
 *     src: '../assets/new/models/houses/mud-house.glb',
 *     fallback: { emoji:'🛖', img:'…/mud-house.jpg' }
 *   });
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const W = window.WALL;

/* ═══════════════════════════════════════════════════════════════
   STYLE
   ═══════════════════════════════════════════════════════════════ */
function injectCSS() {
  if (document.getElementById('m3d-style')) return;
  const s = document.createElement('style');
  s.id = 'm3d-style';
  s.textContent = `
  #m3d{position:fixed;inset:0;z-index:850;display:none;
       background:rgba(12,20,32,.94);
       align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:22px}
  #m3d.on{display:flex}
  #m3dName{text-align:center;font-weight:900;color:#fff;font-size:34px;line-height:1.15}
  #m3dName span{display:block;font-size:21px;opacity:.7;font-weight:700}
  #m3dStage{position:relative;width:min(88vw,900px);height:min(58vh,540px);
            border-radius:26px;overflow:hidden;
            background:linear-gradient(160deg,#e8f1fa,#cfe3f5);
            box-shadow:0 20px 50px rgba(0,0,0,.45)}
  #m3dStage canvas{width:100%;height:100%;display:block;touch-action:none}
  #m3dLoad{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
           flex-direction:column;gap:12px;color:#1c4a75;font-weight:800;font-size:18px}
  .m3d-spin{width:46px;height:46px;border-radius:50%;border:6px solid rgba(28,74,117,.2);
            border-top-color:#1c4a75;animation:m3dSpin .9s linear infinite}
  @keyframes m3dSpin{to{transform:rotate(360deg)}}
  #m3dFallback{position:absolute;inset:0;display:none;flex-direction:column;
               align-items:center;justify-content:center;gap:14px;padding:20px;text-align:center}
  #m3dFallback.on{display:flex}
  #m3dFallback .art{font-size:min(30vh,240px);line-height:1}
  #m3dFallback .art img{max-width:min(52vw,420px);max-height:34vh;object-fit:contain;
                        border-radius:18px}
  #m3dFallback .note{font-weight:800;color:#31536f;font-size:16px;opacity:.75;max-width:420px}
  #m3dFact{color:#dbeafe;font-weight:700;font-size:19px;text-align:center;max-width:820px;
           line-height:1.4;min-height:26px}
  #m3dBar{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
  .m3d-btn{padding:14px 30px;border-radius:20px;border:none;cursor:pointer;
           font-family:inherit;font-weight:900;font-size:19px;color:#fff;
           background:linear-gradient(135deg,#60a5fa,#2563eb);touch-action:manipulation}
  .m3d-btn:active{transform:scale(.95)}
  .m3d-btn.tour{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#4a2c00}
  .m3d-btn.tour.on{background:linear-gradient(135deg,#4ade80,#16a34a);color:#fff}
  .m3d-btn.close{background:linear-gradient(135deg,#fca5a5,#ef4444)}
  .m3d-btn[disabled]{opacity:.4;pointer-events:none}
  #m3dHint{color:#93c5fd;font-weight:800;font-size:15px;opacity:.85}
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════
   DOM
   ═══════════════════════════════════════════════════════════════ */
let root, stage, nameEl, factEl, loadEl, fbEl, tourBtn, closeBtn, hintEl;

function build() {
  if (root) return;
  injectCSS();
  root = document.createElement('div');
  root.id = 'm3d';
  root.innerHTML = `
    <div id="m3dName"></div>
    <div id="m3dStage">
      <div id="m3dLoad"><div class="m3d-spin"></div><span></span></div>
      <div id="m3dFallback"><div class="art"></div><div class="note"></div></div>
    </div>
    <div id="m3dFact"></div>
    <div id="m3dHint"></div>
    <div id="m3dBar">
      <button class="m3d-btn tour" id="m3dTour"></button>
      <button class="m3d-btn close" id="m3dClose"></button>
    </div>`;
  document.body.appendChild(root);

  stage    = root.querySelector('#m3dStage');
  nameEl   = root.querySelector('#m3dName');
  factEl   = root.querySelector('#m3dFact');
  loadEl   = root.querySelector('#m3dLoad');
  fbEl     = root.querySelector('#m3dFallback');
  tourBtn  = root.querySelector('#m3dTour');
  closeBtn = root.querySelector('#m3dClose');
  hintEl   = root.querySelector('#m3dHint');

  const tap = (el, fn) => (W ? W.bindTouch(el, fn)
                             : el.addEventListener('click', fn));
  tap(closeBtn, close);
  tap(tourBtn, toggleTour);
}

function ml() { return W ? W.isMl() : true; }
function t(o) { return W ? W.t(o) : (o && (o.ml || o.en)) || ''; }

function paintChrome() {
  closeBtn.textContent = ml() ? '✕ അടയ്ക്കുക' : '✕ Close';
  tourBtn.textContent  = tourOn ? (ml() ? '⏹ ടൂർ നിർത്തുക' : '⏹ Stop tour')
                                : (ml() ? '🎥 ചുറ്റും കാണാം' : '🎥 Take a tour');
  hintEl.textContent   = hasModel
    ? (ml() ? 'വിരൽ കൊണ്ട് തിരിക്കാം' : 'Drag to turn it around')
    : '';
}

/* ═══════════════════════════════════════════════════════════════
   THREE SCENE — one renderer, reused across every popup so the GPU
   context is created once instead of per open.
   ═══════════════════════════════════════════════════════════════ */
let renderer, scene, camera, root3, current, raf = 0;
let hasModel = false;

function initGL() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, 1, 0.05, 500);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9bb0, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe3ff, 0.8);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  root3 = new THREE.Group();
  scene.add(root3);

  wireControls();
}

function resize() {
  if (!renderer) return;
  const r = stage.getBoundingClientRect();
  if (!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();
}

/* ═══════════════════════════════════════════════════════════════
   CONTROLS — one finger spins, two fingers zoom. Nothing else, so a
   child cannot lose the model off-screen.
   ═══════════════════════════════════════════════════════════════ */
let yaw = 0.6, pitch = 0.22, dist = 3.2, minDist = 1, maxDist = 12;
let dragging = false, lastX = 0, lastY = 0, pinch0 = 0, dist0 = 0;

function wireControls() {
  const el = renderer.domElement;
  const pts = new Map();

  el.addEventListener('pointerdown', e => {
    pts.set(e.pointerId, e);
    el.setPointerCapture(e.pointerId);
    if (pts.size === 1) { dragging = true; lastX = e.clientX; lastY = e.clientY; stopTour(); }
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      dist0 = dist;
    }
  });

  el.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);

    if (pts.size >= 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinch0 > 0) dist = clamp(dist0 * (pinch0 / d), minDist, maxDist);
      return;
    }
    if (!dragging) return;
    yaw   -= (e.clientX - lastX) * 0.008;
    pitch  = clamp(pitch - (e.clientY - lastY) * 0.006, -0.45, 1.15);
    lastX = e.clientX; lastY = e.clientY;
  });

  const up = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch0 = 0;
    if (pts.size === 0) dragging = false;
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);

  el.addEventListener('wheel', e => {
    e.preventDefault();
    stopTour();
    dist = clamp(dist * (e.deltaY > 0 ? 1.12 : 0.89), minDist, maxDist);
  }, { passive: false });
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ═══════════════════════════════════════════════════════════════
   THE TOUR — camera keyframes derived from the model's own bounding
   sphere, so it works on any .glb without per-asset authoring.
   ═══════════════════════════════════════════════════════════════ */
let tourOn = false, tourT = 0, baseDist = 3.2;

const LEGS = [
  { yaw: 0.00, pitch: 0.16, d: 1.00, hold: 1.6 },  // front
  { yaw: 1.57, pitch: 0.20, d: 1.00, hold: 1.4 },  // side
  { yaw: 3.14, pitch: 0.18, d: 1.05, hold: 1.4 },  // back
  { yaw: 4.71, pitch: 0.22, d: 1.00, hold: 1.4 },  // other side
  { yaw: 6.00, pitch: 0.70, d: 1.15, hold: 1.6 },  // high three-quarter
  { yaw: 6.28, pitch: 0.10, d: 0.42, hold: 2.0 }   // push in to the door
];

function toggleTour() {
  if (!hasModel) return;
  tourOn ? stopTour() : startTour();
}
function startTour() {
  tourOn = true; tourT = 0;
  tourBtn.classList.add('on');
  paintChrome();
  if (W) W.sfx.tap();
}
function stopTour() {
  if (!tourOn) return;
  tourOn = false;
  tourBtn.classList.remove('on');
  paintChrome();
}

function stepTour(dt) {
  tourT += dt;
  let acc = 0, i = 0;
  for (; i < LEGS.length; i++) {
    if (tourT < acc + LEGS[i].hold) break;
    acc += LEGS[i].hold;
  }
  if (i >= LEGS.length) { stopTour(); return; }

  const a = LEGS[i];
  const b = LEGS[Math.min(i + 1, LEGS.length - 1)];
  let k = (tourT - acc) / a.hold;
  k = k * k * (3 - 2 * k);                     // smoothstep

  yaw   = a.yaw + (b.yaw - a.yaw) * k;
  pitch = a.pitch + (b.pitch - a.pitch) * k;
  dist  = baseDist * (a.d + (b.d - a.d) * k);
}

/* ═══════════════════════════════════════════════════════════════
   RENDER LOOP
   ═══════════════════════════════════════════════════════════════ */
let lastT = 0;
function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0);
  lastT = now;

  if (tourOn) stepTour(dt);
  else if (!dragging) yaw += dt * 0.18;          // gentle idle spin

  camera.position.set(
    Math.sin(yaw) * Math.cos(pitch) * dist,
    Math.sin(pitch) * dist,
    Math.cos(yaw) * Math.cos(pitch) * dist
  );
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

/* ═══════════════════════════════════════════════════════════════
   LOADING
   ═══════════════════════════════════════════════════════════════ */
const loader = new GLTFLoader();

function clearModel() {
  if (!current) return;
  root3.remove(current);
  current.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); });
        m.dispose();
      });
    }
  });
  current = null;
}

/** Centre the model on the origin and scale it to a predictable size. */
function fit(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z) || 1;

  obj.position.sub(centre);
  const s = 2 / span;
  obj.scale.setScalar(s);
  obj.position.multiplyScalar(s);
  // sit it a touch low so a house reads as standing on the ground
  obj.position.y -= (size.y * s) * 0.08;

  baseDist = 3.1;
  dist = baseDist;
  minDist = 1.1;
  maxDist = 9;
}

function showFallback(fb, note) {
  hasModel = false;
  loadEl.style.display = 'none';
  fbEl.classList.add('on');
  const art = fbEl.querySelector('.art');
  art.innerHTML = '';
  if (fb && fb.img) {
    const img = document.createElement('img');
    img.src = fb.img;
    img.addEventListener('error', () => { art.textContent = (fb && fb.emoji) || '🏠'; });
    art.appendChild(img);
  } else {
    art.textContent = (fb && fb.emoji) || '🏠';
  }
  fbEl.querySelector('.note').textContent = note || '';
  tourBtn.setAttribute('disabled', '');
  paintChrome();
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC
   ═══════════════════════════════════════════════════════════════ */
function open(opts) {
  build();
  opts = opts || {};

  const b = W ? W.tBoth(opts.title) : { main: '', alt: '' };
  nameEl.innerHTML = b.main + (b.alt && b.alt !== b.main ? `<span>${b.alt}</span>` : '');
  factEl.textContent = t(opts.fact);

  root.classList.add('on');
  fbEl.classList.remove('on');
  tourBtn.removeAttribute('disabled');
  yaw = 0.6; pitch = 0.22; tourOn = false;
  tourBtn.classList.remove('on');

  if (!opts.src) {
    showFallback(opts.fallback,
      ml() ? '3D മാതൃക ഇനി ചേർക്കാനുണ്ട്' : '3D model not added yet');
    return;
  }

  initGL();
  resize();
  hasModel = false;
  loadEl.style.display = 'flex';
  loadEl.querySelector('span').textContent = ml() ? 'വരുന്നു…' : 'Loading…';
  clearModel();

  if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); }

  loader.load(
    opts.src,
    gltf => {
      current = gltf.scene;
      fit(current);
      root3.add(current);
      hasModel = true;
      loadEl.style.display = 'none';
      resize();
      paintChrome();
      if (opts.autoTour) startTour();
    },
    undefined,
    () => {
      // missing or broken .glb — never leave the child staring at a void
      showFallback(opts.fallback,
        ml() ? '3D മാതൃക ഇനി ചേർക്കാനുണ്ട്' : '3D model not added yet');
    }
  );

  paintChrome();
}

function close() {
  if (!root) return;
  stopTour();
  root.classList.remove('on');
  clearModel();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (typeof close.onClose === 'function') close.onClose();
}

window.addEventListener('resize', resize);
if (W) W.onLang(() => { if (root && root.classList.contains('on')) paintChrome(); });

window.MODEL3D = { open, close, isOpen: () => !!root && root.classList.contains('on') };
