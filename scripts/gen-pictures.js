/**
 * gen-pictures.js — draw new cartoon pictures from text prompts with the FLUX.2
 * notebook API (/restyle on a blank canvas + scripts/style-refs/ as the style).
 *
 *   env -u ELECTRON_RUN_AS_NODE node_modules/electron/dist/Electron.app/Contents/MacOS/Electron \
 *       scripts/gen-pictures.js --url https://<tunnel> --spec scripts/facp-pictures.json [--only a,b] [--redo] [--mode edit]
 *
 * spec: { "outDir": "assets/new/images/facp", "pictures": { "name": "what to draw", ... } }
 * Existing files are skipped unless --redo. Output: <outDir>/<name>.jpg (768x768).
 */
const { app, nativeImage } = require('electron');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) : d; };
const URL_ = String(arg('url', '')).replace(/\/+$/, ''), KEY = arg('key', ''), SPEC = arg('spec', ''), ONLY = arg('only', ''), REDO = !!arg('redo', false), MODE = arg('mode', 'restyle');
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const spec = JSON.parse(fs.readFileSync(path.resolve(ROOT, SPEC), 'utf8'));
  const out = path.resolve(ROOT, spec.outDir); fs.mkdirSync(out, { recursive: true });
  const headers = {}; if (KEY && KEY !== true) headers['X-API-Key'] = KEY;
  // a plain warm-white 768 canvas
  const sz = 768, raw = Buffer.alloc(sz * sz * 4); for (let i = 0; i < raw.length; i += 4) { raw[i] = 246; raw[i + 1] = 248; raw[i + 2] = 252; raw[i + 3] = 255; }
  const canvas = nativeImage.createFromBitmap(raw, { width: sz, height: sz }).toPNG();
  const refs = fs.readdirSync(path.join(__dirname, 'style-refs')).filter((f) => /\.(png|jpe?g)$/i.test(f)).map((f) => fs.readFileSync(path.join(__dirname, 'style-refs', f)));
  const only = ONLY ? String(ONLY).split(',') : null;
  let n = 0, fail = 0;
  for (const [name, what] of Object.entries(spec.pictures)) {
    if (only && !only.includes(name)) continue;
    const dst = path.join(out, name + '.jpg');
    if (fs.existsSync(dst) && !REDO) continue;
    const fd = new FormData();
    fd.append('image', new Blob([canvas]), 'canvas.png');
    const p = `Draw on this blank canvas: ${what}. A bright, clean, cute cartoon illustration for young children, ` +
      'soft shading, simple shapes, clear outlines, plain soft pastel background, centred, whole subject visible. ' +
      'Indian setting and Indian people where people appear. No text, no letters, no numbers, no frames, no user-interface elements.';
    if (MODE === 'edit') { fd.append('prompt', p); fd.append('raw_prompt', 'true'); }
    else { refs.forEach((r, i) => fd.append('refs', new Blob([r]), 'ref' + i + '.png')); fd.append('prompt', p); }
    fd.append('size', '768'); fd.append('seed', String(spec.seed || 11));
    const t0 = Date.now();
    try {
      const r = await fetch(URL_ + '/' + MODE, { method: 'POST', body: fd, headers });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 160));
      fs.writeFileSync(dst, nativeImage.createFromBuffer(Buffer.from(await r.arrayBuffer())).toJPEG(86));
      n++; console.log(`ok   ${name}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    } catch (e) { fail++; console.log(`FAIL ${name}  ${e.message}`); if (fail >= 4 && n === 0) break; }
  }
  console.log(`done: ${n} drawn, ${fail} failed`);
  app.quit();
});
