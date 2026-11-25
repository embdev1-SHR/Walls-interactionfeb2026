/**
 * pexels-batch.mjs — search many photo slots at once, for ranking and review
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node --env-file=.env.local scripts/pexels-batch.mjs <spec.json> <candDir>
 *
 * spec.json:  { "<slot under assets/new/images>": { "q": "search", "clip": "a photo of …",
 *                                                  "orient": "square|landscape|portrait" }, … }
 *
 * For every slot not already searched, saves the first 15 results as previews
 * in <candDir>/<slot with / -> __>/NN.jpg plus candidates.json — the same
 * layout scripts/pexels-pick.mjs `take` reads. Ranking (CLIP) and the human
 * check happen after; nothing is written to assets/ here.
 *
 * Build time only. Pexels allows 200 searches an hour; this pauses between
 * slots and stops cleanly on HTTP 429.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [specPath, dir] = process.argv.slice(2);
const key = process.env.PEXELS_API_KEY;
if (!key) { console.error('PEXELS_API_KEY is not set (.env.local)'); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, 'utf8'));

for (const [slot, s] of Object.entries(spec)) {
  const out = join(dir, slot.replace(/\//g, '__'));
  if (existsSync(join(out, 'candidates.json'))) continue;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(s.q)}&per_page=15&orientation=${s.orient || 'square'}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (res.status === 429) { console.log('rate limited — run again later'); break; }
  if (!res.ok) { console.log(`FAIL ${slot} HTTP ${res.status}`); continue; }
  const photos = (await res.json()).photos || [];
  mkdirSync(out, { recursive: true });
  const list = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i], nn = String(i).padStart(2, '0');
    try {
      const prev = await fetch(p.src.medium + (p.src.medium.includes('?') ? '&' : '?') + 'fm=jpg');
      writeFileSync(join(out, nn + '.jpg'), Buffer.from(await prev.arrayBuffer()));
      list.push({ nn, id: p.id, alt: p.alt, photographer: p.photographer, url: p.url, src: p.src.large2x || p.src.large });
    } catch (e) { /* one preview failing is not the slot failing */ }
  }
  writeFileSync(join(out, 'candidates.json'), JSON.stringify({ slot, query: s.q, clip: s.clip, orient: s.orient || 'square', list }, null, 1));
  console.log(`${String(list.length).padStart(2)}  ${slot}`);
  await new Promise((r) => setTimeout(r, 400));
}
