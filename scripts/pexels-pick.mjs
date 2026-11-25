/**
 * pexels-pick.mjs — choose a photograph BY EYE, not by the first search hit
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node --env-file=.env.local scripts/pexels-pick.mjs search <slot> "<query>" <dir> [square|landscape|portrait]
 *       saves the first 15 results as small previews <dir>/<NN>.jpg and the
 *       list as <dir>/candidates.json — look at them, pick one
 *   node --env-file=.env.local scripts/pexels-pick.mjs take <slot> <NN> <dir>
 *       downloads candidate NN full-size to assets/new/images/<slot> and
 *       records the photographer in assets/new/images/credits.json
 *
 * WHY
 *   fetch-pexels.mjs takes the first result whose caption names the subject.
 *   That is how the room review found a "coop" that is chickens in a yard and a
 *   "pond" that is an aerial photo of a holiday park. A caption match is not a
 *   picture a child recognises; only looking is.
 *
 * Same rules as fetch-pexels.mjs: build time only (the wall has no internet),
 * JPEG via the CDN's fm=jpg, the key from .env.local and never printed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets', 'new', 'images');
const CREDITS = join(IMG, 'credits.json');

const [cmd, slot, arg, dir, orient = 'square'] = process.argv.slice(2);
const key = process.env.PEXELS_API_KEY;
if (!key) { console.error('PEXELS_API_KEY is not set (.env.local)'); process.exit(1); }
if (!cmd || !slot || !arg || !dir) { console.error('usage: search <slot> "<query>" <dir> | take <slot> <NN> <dir>'); process.exit(1); }

async function search() {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(arg)}&per_page=15&orientation=${orient}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) { console.error('HTTP ' + res.status); process.exit(1); }
  const photos = (await res.json()).photos || [];
  mkdirSync(dir, { recursive: true });
  const list = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const nn = String(i).padStart(2, '0');
    const prev = await fetch(p.src.medium + (p.src.medium.includes('?') ? '&' : '?') + 'fm=jpg');
    writeFileSync(join(dir, nn + '.jpg'), Buffer.from(await prev.arrayBuffer()));
    list.push({ nn, id: p.id, alt: p.alt, photographer: p.photographer, url: p.url, src: p.src.large2x || p.src.large });
  }
  writeFileSync(join(dir, 'candidates.json'), JSON.stringify({ slot, query: arg, orient, list }, null, 1));
  console.log(`${list.length} candidates for ${slot} ("${arg}") -> ${dir}`);
  list.forEach((c) => console.log(`  ${c.nn}  ${(c.alt || '').slice(0, 70)}`));
}

async function take() {
  const c = JSON.parse(readFileSync(join(dir, 'candidates.json'), 'utf8'));
  const pick = c.list.find((x) => x.nn === String(arg).padStart(2, '0'));
  if (!pick) { console.error('no candidate ' + arg); process.exit(1); }
  const bin = await fetch(pick.src + (pick.src.includes('?') ? '&' : '?') + 'fm=jpg');
  const buf = Buffer.from(await bin.arrayBuffer());
  if (buf.length < 5000 || buf[0] !== 0xff || buf[1] !== 0xd8) { console.error('not a JPEG'); process.exit(1); }
  const out = join(IMG, slot);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {};
  credits[slot] = { photographer: pick.photographer, url: pick.url, query: c.query, chosen: 'by eye' };
  writeFileSync(CREDITS, JSON.stringify(credits, null, 2), 'utf8');
  console.log(`${slot} <- #${pick.nn} by ${pick.photographer} (${Math.round(buf.length / 1024)} KB)`);
}

(cmd === 'search' ? search : take)().catch((e) => { console.error(e.message); process.exit(1); });
