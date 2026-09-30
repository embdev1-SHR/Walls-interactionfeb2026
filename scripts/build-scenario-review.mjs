/* ============================================================
   build-scenario-review.mjs — generates scenario-review.html
   ------------------------------------------------------------
   The sign-off loop for the activities themselves, not their art:

       I rebuild  ->  mark it 'done'  ->  you open the page, play
       it in the preview  ->  Approve, or Redo with a note  ->  the
       note comes back to me as the brief for round two.

   State lives in two files, deliberately split:

     scenario-status.json   what I did        (mine)
     scenario-review.json   what you decided  (yours)

   Keeping them apart means a rebuild never silently clears your
   verdict, and your verdict never gets overwritten when I touch
   the activity again. If I edit something you already approved,
   the page flags it as CHANGED SINCE APPROVAL rather than quietly
   showing green — which is the failure mode that let four files
   get rebuilt on an unverified engine last time.

   Run:  node scripts/build-scenario-review.mjs          (build)
         node scripts/build-scenario-review.mjs --serve  (build + serve)
   ============================================================ */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (...a) => path.join(ROOT, ...a);

const GAMES = fs.readdirSync(P('games'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.slice(0, -5))
  .sort();

const MODULE = (g) =>
  g.startsWith('pp-')  ? 'pre-primary' :
  g.startsWith('pri-') ? 'primary'     :
  g.startsWith('sec-') ? 'secondary'   :
  g.startsWith('voc-') ? 'vocational'  :
  ['vehicles', 'fruits-vegetables'].includes(g) ? 'primary' : 'original';

/* ---- seed the status file on first run --------------------- */
const STATUS_F = P('scenario-status.json');
const REMOVE   = ['voc-card-handover', 'voc-cake-share', 'voc-card-craft', 'voc-photo'];
const KEEP     = ['sec-name-build'];

if (!fs.existsSync(STATUS_F)) {
  const seed = {};
  for (const g of GAMES) {
    seed[g] =
      REMOVE.includes(g) ? { state: 'remove', note: 'you asked for this one to go' } :
      KEEP.includes(g)   ? { state: 'done',   note: 'you said keep this one' } :
      MODULE(g) === 'original'
                         ? { state: 'legacy', note: 'original Feb-Mar activity, already signed off' }
                         : { state: 'todo',   note: '' };
  }
  fs.writeFileSync(STATUS_F, JSON.stringify(seed, null, 2) + '\n');
  console.log('seeded scenario-status.json');
}

const status = JSON.parse(fs.readFileSync(STATUS_F, 'utf8'));
const review = fs.existsSync(P('scenario-review.json'))
  ? JSON.parse(fs.readFileSync(P('scenario-review.json'), 'utf8'))
  : {};

const items = GAMES.map((g) => {
  const f = P('games', g + '.html');
  const src = fs.readFileSync(f, 'utf8');
  const title = (src.match(/<title>(.*?)<\/title>/) || [, g])[1].replace(/&amp;/g, '&').trim();
  const ml = (src.match(/ml\s*:\s*['"]([^'"]{2,44})['"]/) || [, ''])[1];
  const st = status[g] || { state: 'todo', note: '' };
  const v  = review[g] || null;

  /* An approval is only as good as the file it was given to. */
  const mtime = Math.floor(fs.statSync(f).mtimeMs / 1000);
  const stale = !!(v && v.at && mtime > Math.floor(new Date(v.at).getTime() / 1000) + 2);

  return {
    id: g, title, ml,
    module: MODULE(g),
    lines: src.split('\n').length,
    bytes: fs.statSync(f).size,
    state: st.state,
    note: st.note || '',
    mtime,
    verdict: v,
    stale
  };
});

const manifest = { generated: new Date().toISOString(), items };

const html = fs.readFileSync(P('scripts/scenario-review.tmpl.html'), 'utf8')
  .replace('/*__MANIFEST__*/null', JSON.stringify(manifest));
fs.writeFileSync(P('scenario-review.html'), html, 'utf8');

const tally = {};
items.forEach((i) => { tally[i.state] = (tally[i.state] || 0) + 1; });
console.log('scenario-review.html written');
console.log('  activities : ' + items.length);
Object.entries(tally).sort().forEach(([k, v]) => console.log('    ' + k.padEnd(8) + ' ' + v));
const stales = items.filter((i) => i.stale).length;
if (stales) console.log('  ' + stales + ' changed since you reviewed them');

/* ---- optional static server -------------------------------- */
if (process.argv.includes('--serve')) {
  const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
    '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
    '.webp':'image/webp', '.svg':'image/svg+xml', '.glb':'model/gltf-binary',
    '.gltf':'model/gltf+json', '.bin':'application/octet-stream', '.css':'text/css',
    '.mp3':'audio/mpeg', '.wav':'audio/wav', '.ogg':'audio/ogg',
    '.ttf':'font/ttf', '.woff':'font/woff', '.woff2':'font/woff2' };
  const PORT = 4178;
  http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);

    /* The page POSTs verdicts straight back into the repo, so they
       survive a cleared browser and can be committed and diffed. */
    if (req.method === 'POST' && url === '/save') {
      let b = '';
      req.on('data', (c) => { b += c; });
      req.on('end', () => {
        try {
          fs.writeFileSync(P('scenario-review.json'), JSON.stringify(JSON.parse(b), null, 2) + '\n');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        } catch (e) { res.writeHead(400); res.end('{"ok":false}'); }
      });
      return;
    }

    const p = path.join(ROOT, url);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  }).listen(PORT, () => console.log('\n  review it at  http://localhost:' + PORT + '/scenario-review.html\n  (ctrl+C to stop)'));
}
