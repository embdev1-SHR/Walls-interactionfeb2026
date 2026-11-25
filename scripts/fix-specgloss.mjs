/**
 * fix-specgloss.mjs — make old Sketchfab models render in today's viewer
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/fix-specgloss.mjs [dir]      (default assets/new/models)
 *
 * Some Sketchfab exports use KHR_materials_pbrSpecularGlossiness. three.js —
 * and so model-viewer 3.x — dropped that extension, and such a model renders
 * plain white (the dog in 3D Animal Explorer did). This rewrites each such
 * material to standard metallic-roughness, using the diffuse texture as the
 * base colour; the specular/glossiness map is dropped (a matte finish suits a
 * furry animal anyway). Oversized PNG textures are re-encoded as JPEG at most
 * 2048 px, which also keeps the installer smaller.
 * Build-time only; it edits the .gltf in place and is safe to run twice.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || join(ROOT, 'assets', 'new', 'models');
const EXT = 'KHR_materials_pbrSpecularGlossiness';

function walk(d, out = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith('.gltf')) out.push(p);
  }
  return out;
}

for (const f of walk(base)) {
  const before = readFileSync(f, 'utf8');
  const j = JSON.parse(before);
  const usedTex = new Set();
  for (const m of j.materials || []) {
    const sg = m.extensions && m.extensions[EXT];
    if (!sg) continue;
    m.pbrMetallicRoughness = {
      baseColorFactor: sg.diffuseFactor || [1, 1, 1, 1],
      metallicFactor: 0,
      roughnessFactor: 0.85
    };
    if (sg.diffuseTexture) { m.pbrMetallicRoughness.baseColorTexture = sg.diffuseTexture; usedTex.add(sg.diffuseTexture.index); }
    delete m.extensions[EXT];
    if (!Object.keys(m.extensions).length) delete m.extensions;
  }
  for (const k of ['extensionsUsed', 'extensionsRequired']) {
    if (j[k]) { j[k] = j[k].filter((x) => x !== EXT); if (!j[k].length) delete j[k]; }
  }
  // shrink the colour textures that are still used; PNG -> JPEG
  const dir = dirname(f);
  for (const ti of usedTex) {
    const img = j.images[j.textures[ti].source];
    if (!img.uri || !/\.png$/i.test(img.uri)) continue;
    const src = join(dir, decodeURIComponent(img.uri));
    if (!existsSync(src)) continue;
    const jpgUri = img.uri.replace(/\.png$/i, '.jpg');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', "scale='min(2048,iw)':-1", '-q:v', '3', join(dir, decodeURIComponent(jpgUri))]);
    img.uri = jpgUri;
    img.mimeType = 'image/jpeg';
  }
  // drop textures and images no material uses any more (the old gloss maps)
  const texUsed = new Set();
  JSON.stringify(j.materials || [], (k, v) => { if (v && typeof v === 'object' && typeof v.index === 'number' && 'index' in v) texUsed.add(v.index); return v; });
  if (j.textures) {
    const texMap = {}, newTex = [];
    j.textures.forEach((t, i) => { if (texUsed.has(i)) { texMap[i] = newTex.length; newTex.push(t); } });
    const imgUsed = new Set(newTex.map((t) => t.source));
    const imgMap = {}, newImg = [];
    (j.images || []).forEach((im, i) => { if (imgUsed.has(i)) { imgMap[i] = newImg.length; newImg.push(im); } });
    newTex.forEach((t) => { t.source = imgMap[t.source]; });
    j.textures = newTex; j.images = newImg;
    JSON.stringify(j.materials || [], (k, v) => { if (v && typeof v === 'object' && typeof v.index === 'number' && texMap[v.index] !== undefined && !v.__done) { v.index = texMap[v.index]; v.__done = 1; } return v; });
    JSON.stringify(j.materials || [], (k, v) => { if (v && typeof v === 'object') delete v.__done; return v; });
  }
  // delete image files nothing references any more
  const keep = new Set((j.images || []).map((i) => i.uri).filter(Boolean));
  const after = JSON.stringify(j, null, 1);
  if (after === JSON.stringify(JSON.parse(before), null, 1)) continue;   // nothing to do
  writeFileSync(f, after);
  const texDir = join(dir, 'textures');
  if (existsSync(texDir)) {
    for (const e of readdirSync(texDir)) if (!keep.has('textures/' + e)) { unlinkSync(join(texDir, e)); }
  }
  console.log('converted', f.replace(ROOT, '').replace(/\\/g, '/'));
}
