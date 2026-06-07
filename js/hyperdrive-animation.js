const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const PALETTE = [
  { r: 99,  g: 102, b: 241 }, // indigo
  { r: 139, g: 92,  b: 246 }, // violet
  { r: 6,   g: 182, b: 212 }, // cyan
  { r: 236, g: 72,  b: 153 }, // pink
  { r: 245, g: 158, b: 11  }, // amber
  { r: 16,  g: 185, b: 129 }, // emerald
  { r: 59,  g: 130, b: 246 }, // blue
];

function randColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

// ── TUNNEL RINGS ─────────────────────────────────────────
class Ring {
  constructor(phase) {
    const c = randColor();
    this.r = c.r; this.g = c.g; this.b = c.b;
    this.speed = Math.random() * 3.5 + 2.5;
    this.maxR  = Math.max(canvas.width, canvas.height) * 0.95;
    // phase: 0-1 spread rings evenly across full extent at start
    this.radius = phase !== undefined ? phase * this.maxR : 0;
  }

  update(warp) {
    this.radius += this.speed * warp;
    if (this.radius > this.maxR) {
      const c = randColor();
      this.r = c.r; this.g = c.g; this.b = c.b;
      this.speed  = Math.random() * 3.5 + 2.5;
      this.maxR   = Math.max(canvas.width, canvas.height) * 0.95;
      this.radius = 0;
    }
  }

  draw() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const t  = this.radius / this.maxR;          // 0 → 1
    const alpha = Math.sin(t * Math.PI) * 0.55;  // peaks mid-travel
    if (alpha < 0.01) return;

    const lw = Math.max(0.5, (1 - t) * 2.8 + 0.5);

    // soft outer glow
    ctx.save();
    ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${alpha * 0.25})`;
    ctx.lineWidth   = lw * 5;
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // crisp ring
    ctx.strokeStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ── HYPERDRIVE STREAKS ────────────────────────────────────
class Streak {
  constructor(initial) {
    this.reset(initial);
  }

  reset(initial) {
    const spread = 1.8;
    this.x = (Math.random() - 0.5) * canvas.width  * spread;
    this.y = (Math.random() - 0.5) * canvas.height * spread;
    this.z = initial ? Math.random() * 2000 : 2000;
    const c = randColor();
    this.r = c.r; this.g = c.g; this.b = c.b;
    this.baseSpeed = Math.random() * 10 + 5;
  }

  update(warp) {
    this.z -= this.baseSpeed * warp;
    if (this.z <= 1) this.reset(false);
  }

  draw() {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    const k1 = 260 / this.z;
    const k2 = 260 / (this.z + this.baseSpeed * 4);

    const x1 = this.x * k1 + cx;
    const y1 = this.y * k1 + cy;
    const x2 = this.x * k2 + cx;
    const y2 = this.y * k2 + cy;

    const progress = 1 - this.z / 2000;
    const alpha    = Math.min(1, progress * 1.5);
    const lw       = Math.max(0.4, progress * 3.2);

    // gradient streak
    const grad = ctx.createLinearGradient(x2, y2, x1, y1);
    grad.addColorStop(0, `rgba(${this.r},${this.g},${this.b},0)`);
    grad.addColorStop(1, `rgba(${this.r},${this.g},${this.b},${alpha * 0.85})`);

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // bright dot at tip
    ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
    ctx.beginPath();
    ctx.arc(x1, y1, lw * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // soft halo on close streaks
    if (progress > 0.7) {
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${(progress - 0.7) * 0.16})`;
      ctx.beginPath();
      ctx.arc(x1, y1, lw * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── INIT ──────────────────────────────────────────────────
const RING_COUNT   = 12;
const STREAK_COUNT = 600;

// Evenly space rings across the tunnel at startup
const rings   = Array.from({ length: RING_COUNT },   (_, i) => new Ring(i / RING_COUNT));
const streaks = Array.from({ length: STREAK_COUNT }, ()     => new Streak(true));

let warp = 0.5;

// ── LOOP ──────────────────────────────────────────────────
function animate() {
  if (warp < 1.9) warp += 0.0016;

  // white trail fade — longer persistence = more dramatic
  ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw rings behind streaks
  rings.forEach(r => { r.update(warp); r.draw(); });

  // draw streaks on top
  streaks.forEach(s => { s.update(warp); s.draw(); });

  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  rings.forEach(r => r.maxR = Math.max(canvas.width, canvas.height) * 0.95);
});

animate();
