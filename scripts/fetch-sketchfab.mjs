/**
 * fetch-sketchfab.mjs — 3D models for the wall, fetched once at build time
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     node scripts/fetch-sketchfab.mjs --list          # what is missing (no key needed)
 *     node --env-file=.env.local scripts/fetch-sketchfab.mjs        # fetch what is missing
 *     node --env-file=.env.local scripts/fetch-sketchfab.mjs tent   # re-pick named slots
 *
 * Needs `SKETCHFAB_API_TOKEN` in `.env.local`
 * (Sketchfab → Settings → Password & API → API token).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * THIS IS A BUILD STEP, NOT A RUNTIME ONE
 *
 * Same reasoning as fetch-pexels.mjs and the baked Malayalam voice: the wall
 * has no internet. Models are downloaded once, committed, and shipped inside
 * the installer.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * LICENSING IS NOT OPTIONAL HERE
 *
 * Unlike Pexels, Sketchfab models carry per-model licences. Most downloadable
 * ones are CC-BY, which REQUIRES visible attribution wherever the model is
 * shown — this app is installed in a centre, so that obligation is real.
 *
 * Every download therefore records author, licence and model URL into
 * `assets/new/models/credits.json`, and anything that is not a licence we can
 * actually honour is skipped rather than quietly used. CC-BY-ND (no
 * derivatives) is excluded because normalising and re-scaling a model for the
 * viewer is arguably a derivative.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * SIZE DISCIPLINE
 *
 * vehicles.html already learned this the hard way: its supplied models run to
 * 34 MB each, 113 MB for ten, which is why it creates a viewer only on popup
 * open and destroys it on close. Sketchfab reports a file size before download,
 * so anything over MAX_MB is skipped with a note rather than silently bloating
 * the installer. Prefer a simple model that loads instantly on a wall PC.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

/* decodeURIComponent is load-bearing. `import.meta.url` is a file: URL, so the
   spaces in "Auticare old dashboard" arrive as %20; without decoding, every
   mkdir and write lands in a phantom "D:/git/Auticare%20old%20dashboard" tree
   and the script cheerfully reports success while the repo gets nothing. */
const ROOT = decodeURIComponent(new URL('..', import.meta.url).pathname)
  .replace(/^\/([A-Za-z]:)/, '$1');
const MDL = join(ROOT, 'assets', 'new', 'models');
const CREDITS = join(MDL, 'credits.json');

/** Anything bigger than this is not worth the install size on a wall PC. */
const MAX_MB = 18;

/** Licences we can actually honour.
 *
 *  BAD_LICENCE is checked FIRST and deliberately catches NonCommercial. An
 *  earlier version of this file only excluded no-derivatives, and because
 *  "CC Attribution-NonCommercial" begins with "CC Attribution" it sailed
 *  through the allow-list and a NonCommercial model was downloaded. This app
 *  ships with a licence manager and a paid install, so NonCommercial is not a
 *  detail — it is the difference between shippable and not.
 *
 *  NoDerivatives is excluded too: normalising and re-scaling a model for the
 *  viewer is arguably a derivative work. */
const OK_LICENCE = /^(CC0|CC BY|CC Attribution|Free Standard|Public Domain)/i;
const BAD_LICENCE = /NonCommercial|\bNC\b|NoDeriv|\bND\b/i;

/* ──────────────────────────────────────────────────────────────────────────
   THE SLOTS
   path relative to assets/new/models/  ->  search query
   Queries are deliberately plain: Sketchfab search rewards simple nouns, and
   an over-specific query returns nothing downloadable at all.
   ────────────────────────────────────────────────────────────────────────── */
const WANT = {
  'houses/mud-house.glb':     'mud hut thatched house',
  /* "apartment building" returned a 156 MB architectural model and
     "modern house" a 13.7 MB one. Adding "simple"/"cartoon" biases Sketchfab
     towards game-ready assets, which is what a wall PC wants anyway. */
  'houses/apartment.glb':     'simple apartment block cartoon',
  'houses/bungalow.glb':      'bungalow house low poly',
  'houses/modern-house.glb':  'simple modern house cartoon low poly',
  'houses/tent.glb':          'camping tent',

  'rooms/kitchen.glb':        'kitchen room interior low poly',
  'rooms/bedroom.glb':        'bedroom interior low poly',
  'rooms/bathroom.glb':       'simple bathroom cartoon low poly',
  'rooms/living-room.glb':    'living room interior low poly',

  'plants/tree.glb':          'tree low poly',
  'plants/flower.glb':        'flower plant low poly',

  'body/human.glb':           'human body cartoon low poly',
};

/* ────────────────────────────────────────────────────────────────────────── */

function loadCredits() {
  if (!existsSync(CREDITS)) return {};
  try { return JSON.parse(readFileSync(CREDITS, 'utf8')); } catch { return {}; }
}

/**
 * Is this slot already filled?
 *
 * The slot name (`houses/mud-house.glb`) is a label we choose, never a file on
 * disk — the archive unpacks to `houses/mud-house/scene.gltf`. Checking for the
 * slot name therefore always answered "missing", so every run re-downloaded
 * every model and burned the API quota. credits.json records what each slot
 * actually resolved to, so that is what gets checked.
 */
function have(slot, credits) {
  const info = credits && credits[slot];
  return !!(info && info.entry && existsSync(join(MDL, info.entry)));
}

function missing(credits) {
  return Object.keys(WANT).filter((s) => !have(s, credits));
}

async function api(url, token) {
  const r = await fetch(url, { headers: { Authorization: `Token ${token}` } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} on ${url}`);
  return r.json();
}

/** Pick the first result that is downloadable, licensed usably, and small. */
function choose(results) {
  const notes = [];
  for (const m of results) {
    const lic = (m.license && (m.license.label || m.license.slug)) || '';
    if (!m.isDownloadable) { notes.push(`${m.name}: not downloadable`); continue; }
    if (BAD_LICENCE.test(lic)) { notes.push(`${m.name}: ${lic} (no-derivatives)`); continue; }
    if (lic && !OK_LICENCE.test(lic)) { notes.push(`${m.name}: ${lic} (unclear)`); continue; }
    return { model: m, notes };
  }
  return { model: null, notes };
}

/**
 * Sketchfab hands back a zip of gltf + bin + textures, not a .glb. Expand it
 * and keep the folder: a .gltf with external files works fine from file://,
 * and repacking to .glb would need a converter this project does not have.
 * The slot path's .glb is rewritten to the real .gltf entry point.
 */
function unpack(zipPath, outDir) {
  mkdirSync(outDir, { recursive: true });
  execFileSync('powershell', ['-NoProfile', '-Command',
    `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outDir}' -Force`],
    { stdio: 'pipe' });
  rmSync(zipPath, { force: true });

  const walk = (d, out = []) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, f.name);
      if (f.isDirectory()) walk(p, out);
      else out.push(p);
    }
    return out;
  };
  const files = walk(outDir);
  const entry = files.find((f) => /\.(glb|gltf)$/i.test(f));
  return entry ? entry.replace(MDL + '\\', '').replace(/\\/g, '/') : null;
}

/**
 * Write js/model-manifest.js — slot name -> the file that actually exists.
 *
 * Activities ask for `houses/mud-house.glb`, which is a stable name we choose.
 * Sketchfab hands back a zip that unpacks to `houses/mud-house/scene.gltf`,
 * with its own .bin and textures beside it. Without this indirection every
 * activity would have to hard-code whatever each archive happened to contain,
 * and swapping one model for a better one later would mean editing activities.
 *
 * Generated as a <script> rather than JSON for the same reason as
 * js/voice-manifest.js: the app runs from file:// inside Electron, where
 * fetching a local JSON file is an avoidable way to fail.
 */
function writeManifest(credits) {
  const map = {};
  for (const [slot, info] of Object.entries(credits)) {
    if (info && info.entry) map[slot] = info.entry;
  }
  const out = [
    '/* GENERATED by scripts/fetch-sketchfab.mjs — do not edit by hand.',
    '   Maps the model slot an activity asks for to the file on disk.',
    '   A slot with no entry here simply has no model yet, and the activity',
    '   falls back to its photo and then its emoji. */',
    'window.MODEL_MANIFEST = ' + JSON.stringify(map, null, 1) + ';',
    '',
    '/* Resolve a slot to a real path, or null when nothing is downloaded. */',
    'window.modelSrc = function (slot) {',
    '  var m = window.MODEL_MANIFEST || {};',
    '  var rel = m[slot];',
    '  return rel ? "../assets/new/models/" + rel : null;',
    '};',
    ''
  ].join('\n');
  writeFileSync(join(ROOT, 'js', 'model-manifest.js'), out, 'utf8');
  console.log(`manifest -> js/model-manifest.js (${Object.keys(map).length} model(s))`);
}

async function main() {
  const args = process.argv.slice(2);
  const list = args.includes('--list');
  const named = args.filter((a) => !a.startsWith('--'));

  mkdirSync(MDL, { recursive: true });

  if (list) {
    const miss = missing(loadCredits());
    console.log(`${Object.keys(WANT).length} model slots, ${miss.length} missing:\n`);
    for (const p of miss) console.log(`  ${p.padEnd(28)} <- "${WANT[p]}"`);
    console.log(`\n${Object.keys(WANT).length - miss.length} present.`);
    return;
  }

  const token = process.env.SKETCHFAB_API_TOKEN;
  if (!token) {
    console.error('\n  SKETCHFAB_API_TOKEN is not set.\n');
    console.error('  Put it in .env.local (already gitignored):\n');
    console.error('      SKETCHFAB_API_TOKEN=your-token-here\n');
    console.error('  then run:  npm run models\n');
    process.exit(1);
  }

  const credits = loadCredits();
  const todo = named.length
    ? Object.keys(WANT).filter((p) => named.some((n) => p.includes(n)))
    : missing(credits);

  if (!todo.length) { console.log('nothing to fetch — all slots filled'); return; }
  console.log(`fetching ${todo.length} model(s)\n`);

  let ok = 0;
  for (const slot of todo) {
    const q = WANT[slot];
    try {
      const search = await api(
        'https://api.sketchfab.com/v3/search?type=models&downloadable=true&archives_flavours=false' +
        `&count=24&q=${encodeURIComponent(q)}`, token);

      const { model, notes } = choose(search.results || []);
      if (!model) {
        console.log(`  skip  ${slot.padEnd(26)} nothing usable for "${q}"`);
        notes.slice(0, 2).forEach((n) => console.log(`          ${n}`));
        continue;
      }

      const dl = await api(`https://api.sketchfab.com/v3/models/${model.uid}/download`, token);
      const src = dl.gltf || dl.glb;
      if (!src || !src.url) { console.log(`  skip  ${slot.padEnd(26)} no gltf archive offered`); continue; }

      const mb = (src.size || 0) / 1048576;
      if (mb > MAX_MB) {
        console.log(`  skip  ${slot.padEnd(26)} ${mb.toFixed(1)} MB > ${MAX_MB} MB cap`);
        continue;
      }

      const bin = Buffer.from(await (await fetch(src.url)).arrayBuffer());
      const outDir = join(MDL, dirname(slot), slot.split('/').pop().replace(/\.glb$/, ''));
      const zip = outDir + '.zip';
      mkdirSync(dirname(zip), { recursive: true });
      writeFileSync(zip, bin);

      const entry = unpack(zip, outDir);
      if (!entry) { console.log(`  skip  ${slot.padEnd(26)} archive had no .gltf/.glb`); continue; }

      credits[slot] = {
        entry,
        name: model.name,
        author: (model.user && model.user.displayName) || 'unknown',
        authorUrl: (model.user && model.user.profileUrl) || '',
        license: (model.license && (model.license.label || model.license.slug)) || 'unknown',
        modelUrl: model.viewerUrl || `https://sketchfab.com/3d-models/${model.uid}`,
        query: q,
        sizeMB: +mb.toFixed(1),
      };
      ok++;
      console.log(`  ok    ${slot.padEnd(26)} ${model.name.slice(0, 30).padEnd(32)} ${credits[slot].license}`);
    } catch (e) {
      console.log(`  FAIL  ${slot.padEnd(26)} ${String(e.message).slice(0, 60)}`);
    }
  }

  writeFileSync(CREDITS, JSON.stringify(credits, null, 2), 'utf8');
  writeManifest(credits);
  console.log(`\n${ok}/${todo.length} fetched. Credits -> assets/new/models/credits.json`);
  console.log('CC-BY models must be credited visibly in the app — credits.json has the names.');
}

main();
