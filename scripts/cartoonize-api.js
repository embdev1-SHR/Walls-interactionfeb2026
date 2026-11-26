/**
 * cartoonize-api.js — redraw the activity photos as friendly cartoons, using
 * the FLUX.2 [klein] notebook's /restyle endpoint (notebookc67c12769a.ipynb).
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   env -u ELECTRON_RUN_AS_NODE node_modules/electron/dist/Electron.app/Contents/MacOS/Electron \
 *       scripts/cartoonize-api.js --url https://<tunnel> [--key <X-API-Key>] [--only animals,helpers] [--limit 3] [--redo]
 *
 * Runs under Electron (no window) only to re-encode the result as JPEG.
 *  · Each original is copied first to _originals/<same path> (not shipped in the
 *    installer), so `--restore` puts every photo back.
 *  · Style: scripts/style-refs/*.png (the quiz reference images) are sent as the
 *    style references; the subject comes from the file name.
 *  · Resumable: finished files are listed in _originals/cartoonized.json and
 *    skipped next time (use --redo to do them again).
 *  · Real money (currency/) and any backdrops are never touched.
 */
const { app, nativeImage } = require('electron');
const fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'new', 'images');
const ORIG = path.join(ROOT, '_originals');
const DONE_FILE = path.join(ORIG, 'cartoonized.json');
const SKIP = ['currency', 'backdrops'];

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) : d; };
const URL_ = String(arg('url', '')).replace(/\/+$/, ''), KEY = arg('key', ''), ONLY = arg('only', ''), LIMIT = +arg('limit', 0), REDO = !!arg('redo', false), RESTORE = !!arg('restore', false);

function list() {
  const out = [];
  for (const d of fs.readdirSync(IMG)) {
    if (SKIP.includes(d) || (ONLY && !String(ONLY).split(',').includes(d))) continue;
    const dir = path.join(IMG, d); if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (/\.(jpe?g|png|webp)$/i.test(f)) out.push(path.join(d, f));
  }
  return out.sort();
}
const subject = (rel) => path.basename(rel).replace(/\.[a-z]+$/i, '').replace(/[-_]+/g, ' ').replace(/\b\d+\b/g, '').trim();

app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const files = list();
  if (RESTORE) { let n = 0; for (const rel of files) { const o = path.join(ORIG, 'assets', 'new', 'images', rel); if (fs.existsSync(o)) { fs.copyFileSync(o, path.join(IMG, rel)); n++; } }
    try { fs.unlinkSync(DONE_FILE); } catch (e) {} console.log('restored', n, 'originals'); app.quit(); return; }
  if (!URL_) { console.log('usage: --url https://<tunnel> [--key K] [--only a,b] [--limit N] [--redo] | --restore'); app.quit(); return; }
  const headers = { 'ngrok-skip-browser-warning': '1' }; if (KEY && KEY !== true) headers['X-API-Key'] = KEY;
  try { const h = await (await fetch(URL_ + '/health', { headers })).json(); console.log('API:', h.model, '|', h.placement, '| busy', h.busy); }
  catch (e) { console.log('Cannot reach the API at', URL_, '-', e.message); app.quit(); return; }
  const refs = fs.readdirSync(path.join(__dirname, 'style-refs')).filter((f) => /\.(png|jpe?g)$/i.test(f)).map((f) => path.join(__dirname, 'style-refs', f));
  let done = {}; try { done = JSON.parse(fs.readFileSync(DONE_FILE, 'utf8')); } catch (e) {}
  fs.mkdirSync(ORIG, { recursive: true });
  let n = 0, fail = 0;
  for (const rel of files) {
    if (LIMIT && n >= LIMIT) break;
    if (done[rel] && !REDO) continue;
    const src = path.join(IMG, rel), keep = path.join(ORIG, 'assets', 'new', 'images', rel);
    fs.mkdirSync(path.dirname(keep), { recursive: true });
    if (!fs.existsSync(keep)) fs.copyFileSync(src, keep);                  // back up the original once
    const fd = new FormData();
    const orig = fs.readFileSync(keep);
    fd.append('image', new Blob([orig]), path.basename(rel));
    refs.forEach((r) => fd.append('refs', new Blob([fs.readFileSync(r)]), path.basename(r)));
    fd.append('prompt', `The picture shows: ${subject(rel)}. Make it a bright, clean, cute cartoon illustration for young children, ` +
      'soft shading, simple shapes, clear outlines, plain soft background. Keep the subject recognisable and whole. ' +
      'Only the subject: no text, no letters, no buttons, no frames, no user-interface elements.');
    fd.append('size', '768'); fd.append('seed', '7');
    const t0 = Date.now();
    try {
      const r = await fetch(URL_ + '/restyle', { method: 'POST', body: fd, headers });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 160));
      const png = Buffer.from(await r.arrayBuffer());
      const im = nativeImage.createFromBuffer(png);
      const ext = path.extname(rel).toLowerCase();
      fs.writeFileSync(src, ext === '.png' ? im.toPNG() : im.toJPEG(86));   // same name, same type; webp files get JPEG data (Chromium reads it fine)
      done[rel] = new Date().toISOString(); fs.writeFileSync(DONE_FILE, JSON.stringify(done, null, 1));
      n++; console.log(`ok   ${rel}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    } catch (e) { fail++; console.log(`FAIL ${rel}  ${e.message}`); if (fail >= 5 && n === 0) { console.log('stopping: the API keeps failing'); break; } }
  }
  console.log(`done: ${n} cartoonized, ${fail} failed. Originals in _originals/ (--restore puts them back).`);
  app.quit();
});
