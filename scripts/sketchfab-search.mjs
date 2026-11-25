/**
 * sketchfab-search.mjs — look before downloading
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node --env-file=.env.local scripts/sketchfab-search.mjs <outDir> "<query>" ["<query>" …]
 *
 * For each query: the downloadable, usably-licensed results (same licence
 * rules as fetch-sketchfab.mjs — CC0 / CC-BY / CC-BY-SA; never NonCommercial
 * or NoDerivatives), with polygon count and archive size, and each one's
 * thumbnail saved as <outDir>/<query>/<NN>.jpg plus candidates.json, so the
 * choice is made by eye. Downloading is fetch-sketchfab.mjs's job.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, ...queries] = process.argv.slice(2);
const token = process.env.SKETCHFAB_API_TOKEN;
if (!token) { console.error('SKETCHFAB_API_TOKEN is not set (.env.local)'); process.exit(1); }
const OK = /cc0|public domain|cc[- ]?by(?![- ]?(nc|nd))|attribution(?!.*(non|no))/i;
const BAD = /non[- ]?commercial|\bnc\b|no[- ]?deriv|\bnd\b/i;

for (const q of queries) {
  const r = await fetch('https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&q=' +
    encodeURIComponent(q), { headers: { Authorization: `Token ${token}` } });
  if (!r.ok) { console.log(q, 'HTTP', r.status); continue; }
  const res = (await r.json()).results || [];
  const out = join(dir, q.replace(/[^a-z0-9]+/gi, '_'));
  mkdirSync(out, { recursive: true });
  const list = [];
  console.log(`\n"${q}"`);
  for (const m of res) {
    const lic = (m.license && (m.license.label || m.license.slug)) || '';
    if (BAD.test(lic) || !OK.test(lic)) continue;
    const nn = String(list.length).padStart(2, '0');
    const th = (m.thumbnails && m.thumbnails.images || []).sort((a, b) => Math.abs(a.width - 400) - Math.abs(b.width - 400))[0];
    if (th) {
      try { writeFileSync(join(out, nn + '.jpg'), Buffer.from(await (await fetch(th.url)).arrayBuffer())); } catch (e) {}
    }
    const arch = m.archives && (m.archives.gltf || m.archives.glb);
    const mb = arch && arch.size ? (arch.size / 1048576).toFixed(1) : '?';
    list.push({ nn, uid: m.uid, name: m.name, license: lic, faces: m.faceCount, mb, author: m.user && m.user.displayName });
    console.log(`  ${nn}  ${String(m.faceCount).padStart(7)} faces  ${String(mb).padStart(5)} MB  ${lic.padEnd(10)}  ${m.name.slice(0, 50)}`);
    if (list.length >= 10) break;
  }
  writeFileSync(join(out, 'candidates.json'), JSON.stringify({ query: q, list }, null, 1));
}
