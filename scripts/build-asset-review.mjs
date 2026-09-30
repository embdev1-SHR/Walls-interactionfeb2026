/* ============================================================
   build-asset-review.mjs — generates asset-review.html
   ------------------------------------------------------------
   Scope: the pre-primary (pp-*) and primary (pri-*) activities.
   None of these existed in the Feb-Mar build, so this is exactly
   the "new content" art. The original activities are signed off
   and pulling them in would bury what still needs a decision.

   Two indirections this has to respect, or it reports art as
   missing when it is really there:

     · animal-data.js also points outside assets/new — at
       '../assets/animals img/' and the older IMG folder.
     · a 3D slot like 'houses/bungalow.glb' is not a file. It is
       a key in js/model-manifest.js that resolves to something
       like assets/new/models/houses/bungalow/scene.gltf.

   Run:  node scripts/build-asset-review.mjs          (build)
         node scripts/build-asset-review.mjs --serve  (build + serve)
   ============================================================ */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel  = (p) => path.relative(ROOT, p).split(path.sep).join('/');

/* ---- which activities are in scope ------------------------- */
const GAMES = fs.readdirSync(path.join(ROOT, 'games'))
  .filter((f) => /^(pp-|pri-)/.test(f) && f.endsWith('.html'));

const DATA_MODULES = ['js/animal-data.js', 'js/flower-data.js'];

/* ---- 3D slot -> real file, from the generated manifest ------ */
const slotToFile = new Map();
{
  const mf = path.join(ROOT, 'js/model-manifest.js');
  if (fs.existsSync(mf)) {
    const src = fs.readFileSync(mf, 'utf8');
    const body = src.slice(src.indexOf('{'), src.indexOf('};') + 1);
    for (const m of body.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
      slotToFile.set(m[1].toLowerCase(), 'assets/new/models/' + m[2]);
    }
  }
}

/* ---- collect every asset reference ------------------------- */
const ASSET_RE = /['"]([\w\-./%\s]+\.(?:webp|png|jpg|jpeg|svg|glb|gltf))['"]/gi;
const byBase = new Map();   // basename        -> Set(source)
const bySlot = new Map();   // manifest slot   -> Set(source)

function scan(file, label) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const m of src.matchAll(ASSET_RE)) {
    const raw = decodeURIComponent(m[1]).toLowerCase();
    const base = raw.split('/').pop();

    /* A slot may be written whole ('houses/tent.glb') or assembled from a
       prefix variable, in which case only 'tent.glb' is literal in the file.
       Match on the tail, but only when it is unambiguous. */
    let slotKey = slotToFile.has(raw) ? raw : null;
    if (!slotKey) {
      const tail = [...slotToFile.keys()].filter((k) => k.endsWith('/' + base));
      if (tail.length === 1) slotKey = tail[0];
    }
    if (slotKey) {
      if (!bySlot.has(slotKey)) bySlot.set(slotKey, new Set());
      bySlot.get(slotKey).add(label);
      continue;
    }
    if (!byBase.has(base)) byBase.set(base, new Set());
    byBase.get(base).add(label);
  }
}
GAMES.forEach((g) => scan('games/' + g, g.replace(/\.html$/, '')));
DATA_MODULES.forEach((d) => { if (fs.existsSync(path.join(ROOT, d))) scan(d, path.basename(d)); });

/* ---- walk every asset root, not just assets/new ------------- */
const MEDIA = /\.(webp|png|jpg|jpeg|svg|glb|gltf)$/i;
const onDisk = [];
for (const root of ['assets', '3dmodels']) {
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (MEDIA.test(e.name)) onDisk.push(full);
    }
  })(path.join(ROOT, root));
}

function categoryOf(p) {
  const parts = rel(p).split('/');
  if (parts[0] === '3dmodels') return 'models/legacy-3dmodels';
  const i = parts.indexOf('images');
  if (i >= 0 && parts[i + 1] && MEDIA.test(parts[parts.length - 1]) && parts.length > i + 2) return parts[i + 1];
  if (i >= 0 && parts[i + 1]) return parts[i + 1].match(MEDIA) ? 'images' : parts[i + 1];
  if (parts.includes('models')) return 'models/' + (parts[parts.indexOf('models') + 1] || '');
  return parts.slice(0, 2).join('/');
}

/* A scene.gltf is meaningless as a label — name it by its folder. */
function labelOf(p) {
  const base = path.basename(p);
  if (/^scene\.(gltf|glb|bin)$/i.test(base)) return path.basename(path.dirname(p)) + '/' + base;
  return base;
}

const slotOwners = new Map();  // resolved path (lower) -> Set(source)
for (const [slot, who] of bySlot) {
  const f = slotToFile.get(slot).toLowerCase();
  if (!slotOwners.has(f)) slotOwners.set(f, new Set());
  who.forEach((w) => slotOwners.get(f).add(w));
}

const items = onDisk.map((p) => {
  const r = rel(p);
  const base = path.basename(p).toLowerCase();
  const used = new Set([
    ...(byBase.get(base) || []),
    ...(slotOwners.get(r.toLowerCase()) || [])
  ]);
  return {
    path: r,
    name: labelOf(p),
    cat: categoryOf(p),
    bytes: fs.statSync(p).size,
    is3d: /\.(glb|gltf)$/i.test(p),
    used: [...used].sort()
  };
});

/* Referenced but absent — the real gaps. */
const haveBase = new Set(items.map((i) => path.basename(i.path).toLowerCase()));
const missing = [...byBase.entries()]
  .filter(([b]) => !haveBase.has(b))
  .map(([b, s]) => ({ name: b, used: [...s].sort() }))
  .sort((a, b) => a.name.localeCompare(b.name));

/* Slots with no downloaded model at all. */
const unresolvedSlots = [...bySlot.entries()]
  .filter(([s]) => !fs.existsSync(path.join(ROOT, slotToFile.get(s))))
  .map(([s, w]) => ({ name: s + '  (3D slot, not downloaded)', used: [...w].sort() }));

items.sort((a, b) => (a.cat + a.name).localeCompare(b.cat + b.name));

const manifest = {
  generated: new Date().toISOString(),
  games: GAMES.map((g) => g.replace(/\.html$/, '')),
  items,
  missing: missing.concat(unresolvedSlots)
};

const html = fs.readFileSync(path.join(ROOT, 'scripts/asset-review.tmpl.html'), 'utf8')
  .replace('/*__MANIFEST__*/null', JSON.stringify(manifest));
fs.writeFileSync(path.join(ROOT, 'asset-review.html'), html, 'utf8');

const used = items.filter((i) => i.used.length).length;
console.log('asset-review.html written');
console.log('  activities in scope : ' + GAMES.length);
console.log('  assets on disk      : ' + items.length + '  (' + used + ' referenced, ' + (items.length - used) + ' orphan)');
console.log('  referenced, MISSING : ' + manifest.missing.length);

/* ---- optional static server (modules + fetch need http) ----- */
if (process.argv.includes('--serve')) {
  const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
    '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
    '.webp':'image/webp', '.svg':'image/svg+xml', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json',
    '.bin':'application/octet-stream', '.css':'text/css' };
  const PORT = 4177;
  http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  }).listen(PORT, () => console.log('\n  review it at  http://localhost:' + PORT + '/asset-review.html\n  (ctrl+C to stop)'));
}
