/**
 * build-preview.js — pack ui-preview.html into ONE self-contained file
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   env -u ELECTRON_RUN_AS_NODE <electron binary> scripts/build-preview.js
 *
 * Writes ui-preview-standalone.html: every script, font, photo and sound the
 * preview uses, inlined as data, so the file opens on any device with no
 * folder and no server. Photos are shrunk to 720px (they are shown at most
 * ~650px on the 1080-high wall). The 3D experiences come too: three.js and the
 * models used by js/play/scenes3d.js, with model textures shrunk to 1024px. The baked
 * voices are left out (Owly's bubble still shows every line).
 *
 * Runs in a hidden window (show:false) only to ask the page for its asset list.
 */
const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'ui-preview-standalone.html');
const MAX = 720;

for (const ch of ['store:get', 'store:all', 'store:set', 'store:delete', 'device:id', 'capture-page']) ipcMain.handle(ch, () => null);

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf' };

function dataURI(rel, max) {
  const file = path.join(ROOT, decodeURIComponent(rel));
  if (!fs.existsSync(file)) { console.log('  missing', rel); return null; }
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    const img = nativeImage.createFromPath(file);
    if (!img.isEmpty()) {
      const { width, height } = img.getSize();
      const k = Math.min(1, (max || MAX) / Math.max(width, height));
      const small = k < 1 ? img.resize({ width: Math.round(width * k), height: Math.round(height * k), quality: 'best' }) : img;
      // photos as JPEG; PNGs with transparency (Owly, menu icons) stay PNG
      if (ext === '.png' || max) return 'data:image/png;base64,' + small.toPNG().toString('base64');
      return 'data:image/jpeg;base64,' + small.toJPEG(72).toString('base64');
    }
  }
  return 'data:' + (MIME[ext] || 'application/octet-stream') + ';base64,' + fs.readFileSync(file).toString('base64');
}

function inlineScript(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/<\/script/gi, '<\\/script');
  return '<script>/* ' + rel + ' */\n' + src + '\n</script>';
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1600, height: 400, webPreferences: { nodeIntegration: true, contextIsolation: false, backgroundThrottling: false } });
  await win.loadFile(path.join(ROOT, 'ui-preview.html'));
  const list = await win.webContents.executeJavaScript('window.__previewAssets()');
  win.destroy();

  const assets = {};
  let bytes = 0;
  for (const rel of list) { const d = dataURI(rel); if (d) { assets[rel] = d; bytes += d.length; } }
  /* the 3D experiences: every model and sound js/play/scenes3d.js names, and for .gltf
     models their .bin and textures (textures shrunk to 1024px) */
  const src3d = fs.readFileSync(path.join(ROOT, 'js/play/scenes3d.js'), 'utf8');
  const files3d = [...new Set(src3d.match(/(?:3dmodels|assets)\/[\w\/.\- ]+?\.(?:glb|gltf|mp3)/g) || [])];
  for (const rel of files3d) {
    if (rel.endsWith('.gltf')) {
      const dir = path.dirname(rel), g = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      assets[rel] = 'data:model/gltf+json;base64,' + Buffer.from(JSON.stringify(g)).toString('base64');
      for (const b of g.buffers || []) if (b.uri && !b.uri.startsWith('data:')) assets[dir + '/' + b.uri] = dataURI(dir + '/' + decodeURIComponent(b.uri));
      for (const im of g.images || []) if (im.uri && !im.uri.startsWith('data:')) assets[dir + '/' + im.uri] = dataURI(dir + '/' + decodeURIComponent(im.uri), 1024);
    } else { const d = dataURI(rel); if (d) assets[rel] = d; }
  }
  bytes = Object.values(assets).reduce((a, d) => a + d.length, 0);
  console.log(list.length + ' assets, ' + (bytes / 1048576).toFixed(1) + ' MB packed');

  let html = fs.readFileSync(path.join(ROOT, 'ui-preview.html'), 'utf8');
  // the stylesheet inline, fonts into it
  html = html.replace('<link rel="stylesheet" href="js/play/play.css">', () => '<style>' + fs.readFileSync(path.join(ROOT, 'js/play/play.css'), 'utf8').replace(/url\(\.\.\/\.\.\/(assets\/fonts\/[^)]+\.ttf)\)/g, (m, rel) => 'url(' + dataURI(rel) + ')') + '</style>');
  // no model-viewer (the 3D here is three.js) and no baked voices in the one-file build
  html = html.replace(/<script type="module" src="js\/vendor\/model-viewer\.min\.js"><\/script>\n?/, '');
  html = html.replace(/<script type="importmap">[^<]*<\/script>\n?/, '');
  /* three.js + js/play/scenes3d.js as modules from blob: URLs. A module needs a real URL
     to import from, so each file becomes a blob and its relative imports are
     pointed at the blobs before it; 'three' is mapped by an import map added
     before the first module loads. */
  const T3 = 'js/vendor/three/';
  const mods = {
    core: fs.readFileSync(path.join(ROOT, T3 + 'build/three.core.min.js'), 'utf8'),
    module: fs.readFileSync(path.join(ROOT, T3 + 'build/three.module.min.js'), 'utf8'),
    bgu: fs.readFileSync(path.join(ROOT, T3 + 'utils/BufferGeometryUtils.js'), 'utf8'),
    gltf: fs.readFileSync(path.join(ROOT, T3 + 'loaders/GLTFLoader.js'), 'utf8'),
    skel: fs.readFileSync(path.join(ROOT, T3 + 'utils/SkeletonUtils.js'), 'utf8'),
    ui3d: src3d
  };
  const boot = `<script>(function () {
  var M = ${JSON.stringify(mods).replace(/<\/script/gi, '<\\/script')};
  function blob(t) { return URL.createObjectURL(new Blob([t], { type: 'text/javascript' })); }
  var core = blob(M.core), three = blob(M.module.split('./three.core.min.js').join(core));
  var bgu = blob(M.bgu), gltf = blob(M.gltf.split('../utils/BufferGeometryUtils.js').join(bgu)), skel = blob(M.skel);
  var im = document.createElement('script'); im.type = 'importmap'; im.textContent = JSON.stringify({ imports: { three: three } }); document.head.appendChild(im);
  var ui = blob(M.ui3d.split('../vendor/three/loaders/GLTFLoader.js').join(gltf).split('../vendor/three/utils/SkeletonUtils.js').join(skel));
  window.addEventListener('DOMContentLoaded', function () { var s = document.createElement('script'); s.type = 'module'; s.src = ui; document.body.appendChild(s); });
})();</script>`;
  html = html.replace('<script type="module" src="js/play/scenes3d.js"></script>', '');
  html = html.replace('</head>', () => boot + '\n</head>');
  html = html.replace(/<script src="js\/voice-manifest\.js"><\/script>\n?/, '').replace(/<script src="js\/voice-clips\.js"><\/script>\n?/, '');
  for (const rel of ['js/i18n-data.js', 'js/wall-settings.js', 'js/menu-data.js', 'js/animal-data.js']) {
    html = html.replace('<script src="' + rel + '"></script>', () => inlineScript(rel));
  }
  html = html.replace('<script src="js/play/engine.js"></script>', () =>
    '<script>window.PREVIEW_NO_3D = true;\nwindow.PREVIEW_ASSETS = ' + JSON.stringify(assets) + ';</script>\n' + inlineScript('js/play/engine.js'));
  // the Owly <img> in the markup
  html = html.replace('src="assets/avatar/owly-happy.png"', () => 'src="' + assets['assets/avatar/owly-happy.png'] + '"');
  html = html.replace('<title>Blueroom UI Preview</title>', '<title>Blueroom UI Preview</title>\n<!-- ONE-FILE BUILD of ui-preview.html (scripts/build-preview.js). Edit js/play/ (engine.js, scenes3d.js, play.css), then rebuild. -->');

  const left = html.match(/(src|href)="(?!data:|#)[^"]+\.(js|css|png|jpg|ttf|mp3)"/g);
  if (left) console.log('  still external:', left);
  fs.writeFileSync(OUT, html);
  console.log('wrote ' + path.relative(ROOT, OUT) + ' (' + (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB)');
  app.quit();
});
app.on('window-all-closed', () => {});
