/**
 * fetch-icons.mjs — the 3D card art for the main menu, fetched once at build time
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     npm run icons            # fetch what is missing
 *     npm run icons -- --force # re-fetch everything
 *
 * WHERE THE ART COMES FROM
 *   Microsoft's Fluent Emoji, the 3D set — the glossy, clay-rendered look the
 *   reference card design was drawn in. MIT licensed: free to ship, provided
 *   the copyright notice travels with it, which the ⓘ credits page does.
 *   https://github.com/microsoft/fluentui-emoji
 *
 * THIS IS A BUILD STEP, NOT A RUNTIME ONE
 *   Same reasoning as fetch-pexels.mjs and fetch-sketchfab.mjs: the wall has
 *   no internet. Each image is downloaded once into assets/new/icons/ and
 *   shipped inside the installer. A card whose icon is missing falls back to
 *   its emoji, so nothing on the menu ever renders empty.
 *
 * NAMES
 *   Fluent names its folders by the emoji's Unicode name ("Ringed planet"), and
 *   the file inside is that name lower-cased with underscores. Each card lists
 *   candidates in order; the first that exists wins. That is cheaper than being
 *   exactly right about Unicode names up front, and a miss is reported, not
 *   silently skipped.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = decodeURIComponent(new URL('..', import.meta.url).pathname)
  .replace(/^\/([A-Za-z]:)/, '$1');
const OUT = join(ROOT, 'assets', 'new', 'icons');
const CREDITS = join(OUT, 'credits.json');
const BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';

/* card key (the data-game / data-category value) -> Fluent candidates */
const WANT = {
  'canvas':              ['Artist palette'],
  'solar-system':        ['Ringed planet'],
  'coloring-book':       ['Crayon'],
  'particle-playground': ['Sparkles'],
  'goalkeeper':          ['Soccer ball'],
  'fruit-ninja':         ['Watermelon'],
  'jungle':              ['Palm tree', 'Deciduous tree'],
  'daily-skills':        ['House with garden', 'House'],
  'learning':            ['Books', 'Open book'],
  'underwater-explorer': ['Tropical fish', 'Water wave'],
  'music-maker':         ['Musical notes', 'Musical note'],
  'creature-creator':    ['Pencil', 'Crayon'],
  'butterfly-tracker':   ['Butterfly'],
  'balloon-popper':      ['Balloon'],
  'fish-it':             ['Fishing pole'],
  'puzzle-balance':      ['Balance scale'],
  'pre-primary':         ['Lion'],
  'primary':             ['School'],
  'secondary':           ['Graduation cap'],
  'vocational':          ['Drum'],
  'money-counter':       ['Shopping cart'],
  'shape-sorter':        ['Star', 'Large orange diamond', 'Puzzle piece'],
  'video-360-player':    ['Clapper board', 'Film projector'],

  // the three menu tabs
  'tab-learn':           ['Light bulb'],
  'tab-play':            ['Kite', 'Teddy bear'],
  'tab-explore':         ['Telescope', 'Compass'],

  // login.html session choices
  'login-guest':         ['Rocket'],
  'login-online':        ['Locked with key', 'Key'],
  'login-class':         ['Children crossing', 'People hugging'],
  'login-individual':    ['Child', 'Teddy bear'],
  'login-signin':        ['School', 'Books'],
  'login-student':       ['Glowing star', 'Star'],
};

function fileFor(name) {
  return name.toLowerCase().replace(/ /g, '_') + '_3d.png';
}

async function tryFetch(name) {
  /* Emoji with skin tones ("Child") keep their art one folder deeper, under
     Default/, with a _default suffix — try the plain layout, then that one. */
  const dir = BASE + encodeURIComponent(name);
  const urls = [
    dir + '/3D/' + fileFor(name),
    dir + '/Default/3D/' + fileFor(name).replace(/\.png$/, '_default.png'),
  ];
  for (const url of urls) {
    const r = await fetch(url);
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    // jsDelivr can answer 200 with a small error page; a real PNG starts with 0x89 'P'
    if (buf.length < 2000 || buf[0] !== 0x89 || buf[1] !== 0x50) continue;
    return { url, buf };
  }
  return null;
}

async function main() {
  const force = process.argv.includes('--force');
  mkdirSync(OUT, { recursive: true });
  const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};

  let ok = 0, skipped = 0;
  const misses = [];
  for (const [key, names] of Object.entries(WANT)) {
    const dest = join(OUT, key + '.png');
    if (!force && existsSync(dest)) { skipped++; continue; }
    let got = null, used = null;
    for (const n of names) {
      got = await tryFetch(n);
      if (got) { used = n; break; }
    }
    if (!got) { misses.push(key + ' (' + names.join(' / ') + ')'); continue; }
    writeFileSync(dest, got.buf);
    credits[key] = { emoji: used, source: got.url };
    ok++;
    console.log(`  ok    ${key.padEnd(22)} ${used}  (${Math.round(got.buf.length / 1024)} KB)`);
  }

  credits._licence = 'Fluent Emoji — Copyright (c) Microsoft Corporation. MIT License.';
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2), 'utf8');

  console.log(`\n${ok} fetched, ${skipped} already present.`);
  if (misses.length) {
    console.log('MISSING (these cards fall back to their emoji):');
    misses.forEach((m) => console.log('   ' + m));
  }
}

main();
