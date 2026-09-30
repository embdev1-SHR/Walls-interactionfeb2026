/* ============================================================
   probe.js — load a real activity in Electron and report the DOM
   ------------------------------------------------------------
   Written because a rendering bug in voc-job-hats was reported
   three times and guessed at twice. There is no substitute for
   loading the page in the engine that actually runs it.

   Reports, for whatever selectors are asked for: how many nodes
   exist, their rendered box sizes, and any console error or
   failed resource load. A node that exists but measures 0x0 is
   the case that looks identical to "nothing rendered" from the
   room, and is invisible to a syntax check.

     npx electron scripts/probe.js games/voc-job-hats.html ".hat,.hats,.worker"
   ============================================================ */
const { app, BrowserWindow } = require('electron');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const page = process.argv[2] || 'games/voc-job-hats.html';
const sel  = process.argv[3] || '.hat';
const PICK_ARG = process.argv.find((a) => a.startsWith('--pick'));
const AUTO_PICK = !!PICK_ARG;
/* --pick picks 1 player, --pick=3 picks three. The panel count changes every
   width on the page, so a layout can be fine at one and broken at three. */
const PICK_N = PICK_ARG && PICK_ARG.includes('=') ? parseInt(PICK_ARG.split('=')[1], 10) : 1;

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1920, height: 1080, show: false,
    webPreferences: { offscreen: true, nodeIntegration: false, contextIsolation: true }
  });

  const errors = [];
  win.webContents.on('console-message', (_e, level, message) => {
    if (level >= 2) errors.push('console: ' + message);
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    errors.push('failed load: ' + desc + ' ' + url);
  });

  await win.loadFile(path.join(ROOT, page));
  await new Promise((r) => setTimeout(r, 1200));

  /* Most of these activities open on the 1/2/3 player chooser, so nothing
     under test exists until a count is picked. */
  if (AUTO_PICK) {
    await win.webContents.executeJavaScript(`
      (function () {
        var bs = document.querySelectorAll('.tu-pick-b');
        var b = bs[${PICK_N} - 1] || bs[0];
        if (b) { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'picked ' + b.textContent; }
        return 'no chooser';
      })();
    `).then((r) => console.log('chooser:', r));
    await new Promise((r) => setTimeout(r, 1200));
  }

  const report = await win.webContents.executeJavaScript(`
    (function () {
      var out = {};
      ${JSON.stringify(sel)}.split(',').forEach(function (s) {
        s = s.trim();
        var nodes = Array.prototype.slice.call(document.querySelectorAll(s));
        out[s] = {
          count: nodes.length,
          boxes: nodes.slice(0, 6).map(function (n) {
            var r = n.getBoundingClientRect();
            var cs = getComputedStyle(n);
            return Math.round(r.width) + 'x' + Math.round(r.height) +
                   ' vis=' + cs.visibility + ' disp=' + cs.display +
                   ' op=' + cs.opacity +
                   (n.tagName === 'IMG' ? ' natural=' + n.naturalWidth + 'x' + n.naturalHeight : '') +
                   ' kids=' + n.children.length +
                   (n.children[0] ? '<' + n.children[0].tagName.toLowerCase() + '>' : '');
          })
        };
      });
      out.__globals = {
        JOB_ICONS: typeof JOB_ICONS,
        TRIUP: typeof TRIUP,
        WALL: typeof WALL,
        JOBS_DATA: typeof JOBS_DATA
      };
      return out;
    })();
  `).catch((e) => ({ evalError: String(e) }));

  console.log('\n=== ' + page + ' ===');
  console.log(JSON.stringify(report, null, 2));
  if (errors.length) {
    console.log('\n--- errors ---');
    errors.forEach((e) => console.log('  ' + e));
  } else {
    console.log('\nno console errors');
  }
  app.quit();
});
