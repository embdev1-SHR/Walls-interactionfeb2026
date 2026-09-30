/* ============================================================
   sweep.js — load every activity and report what is broken
   ------------------------------------------------------------
   The probe checks one page. This checks all of them, in one
   Electron process, because launching the runtime 85 times takes
   longer than the whole sweep.

   For each activity it reports:
     · uncaught errors and failed resource loads
     · whether anything interactive rendered at all
     · elements that exist but measure 0x0 — the failure that
       looks identical to "nothing there" from across the room,
       and the one that survived three rounds of review on
       voc-job-hats because a syntax check cannot see it

   Activities that open on the 1/2/3 chooser are picked through
   at three players, which is the setting that broke the hats.

     npx electron scripts/sweep.js            all games
     npx electron scripts/sweep.js pp-        only matching
   ============================================================ */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
/* argv[0] is the electron binary and argv[1] this script, so the optional
   filter is argv[2] and nothing else. */
const filter = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : null;

const GAMES = fs.readdirSync(path.join(ROOT, 'games'))
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !filter || f.includes(filter))
  .sort();

/* Anything a child is meant to touch. If none of these exist the page
   rendered nothing playable, whatever else it managed. */
const INTERACTIVE =
  '.pk-card,.tile,.hat,.tool,.card,.room,.place,.step,.slot,.egg,.pen,.pad,.bloom,' +
  '.helper,.key,.k,.lt,.ls,.hot,.item,.worker,.scene,canvas,button';

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1920, height: 1080, show: false,
    webPreferences: { offscreen: true, nodeIntegration: false, contextIsolation: true }
  });

  const results = [];

  for (const file of GAMES) {
    const id = file.replace(/\.html$/, '');
    const errors = [];
    const onMsg = (_e, level, message) => {
      /* Offscreen rendering blocks autoplay and the GL layer chatters about
         driver performance; neither is a defect in an activity. Filtering
         them is what makes a real error visible in an 85-page sweep. */
      var NOISE = /Security Warning|audio mapping|Autoplay|favicon|Audio playback failed|GL Driver Message|WebGL|AudioContext|user (gesture|activation)/i;
      if (level >= 2 && !NOISE.test(message)) {
        errors.push(message.split('\n')[0].slice(0, 90));
      }
    };
    const onFail = (_e, _c, desc, url) => {
      if (!/favicon/.test(url)) errors.push('load failed: ' + desc + ' ' + url.split('/').pop());
    };
    win.webContents.on('console-message', onMsg);
    win.webContents.on('did-fail-load', onFail);

    try {
      await win.loadFile(path.join(ROOT, 'games', file));
      await new Promise((r) => setTimeout(r, 900));

      /* Most three-panel activities show nothing until a count is chosen. */
      const picked = await win.webContents.executeJavaScript(`
        (function () {
          var bs = document.querySelectorAll('.tu-pick-b');
          if (!bs.length) return false;
          (bs[2] || bs[0]).dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        })();
      `);
      if (picked) await new Promise((r) => setTimeout(r, 1100));

      const r = await win.webContents.executeJavaScript(`
        (function () {
          var nodes = Array.prototype.slice.call(document.querySelectorAll(${JSON.stringify(INTERACTIVE)}));
          var visible = 0, zero = 0;
          nodes.forEach(function (n) {
            var b = n.getBoundingClientRect();
            if (b.width > 2 && b.height > 2) visible++;
            else zero++;
          });
          var imgs = Array.prototype.slice.call(document.images);
          /* An <img> with no src yet is complete with naturalWidth 0, which is
             not a failure - plenty of activities create the element first and
             set the source when a round starts. Only a element that was ASKED
             to load something and came back empty is broken. */
          var brokenImg = imgs.filter(function (i) {
            return i.complete && i.naturalWidth === 0 && i.getAttribute('src');
          }).length;
          var brokenSrc = imgs.filter(function (i) {
            return i.complete && i.naturalWidth === 0 && i.getAttribute('src');
          }).map(function (i) { return i.getAttribute('src').split('/').pop(); }).slice(0, 3);
          var zeroImg = imgs.filter(function (i) {
            var b = i.getBoundingClientRect();
            return i.naturalWidth > 0 && (b.width < 2 || b.height < 2);
          }).length;
          return { brokenSrc: brokenSrc, total: nodes.length, visible: visible, zero: zero,
                   imgs: imgs.length, brokenImg: brokenImg, zeroImg: zeroImg,
                   backdrop: !!document.querySelector('.wall-backdrop'),
                   panels: document.querySelectorAll('.tu-panel').length };
        })();
      `);
      results.push({ id, picked, errors, ...r });
    } catch (e) {
      results.push({ id, errors: errors.concat('LOAD THREW: ' + String(e).slice(0, 80)),
                     total: 0, visible: 0, zero: 0, imgs: 0, brokenImg: 0, zeroImg: 0 });
    }

    win.webContents.removeListener('console-message', onMsg);
    win.webContents.removeListener('did-fail-load', onFail);
  }

  /* ---- report: problems first, then the clean list ---- */
  const bad = results.filter((r) =>
    r.errors.length || r.visible === 0 || r.brokenImg > 0 || r.zeroImg > 0);
  const ok = results.filter((r) => !bad.includes(r));

  console.log('\n══════════ SWEEP: ' + results.length + ' activities ══════════');
  if (bad.length) {
    console.log('\n---- NEEDS ATTENTION (' + bad.length + ') ----');
    bad.forEach((r) => {
      const bits = [];
      if (r.visible === 0) bits.push('NOTHING INTERACTIVE RENDERED');
      if (r.brokenImg) bits.push(r.brokenImg + ' image(s) failed to load: ' + (r.brokenSrc||[]).join(', '));
      if (r.zeroImg) bits.push(r.zeroImg + ' image(s) sized 0x0');
      console.log('\n  ' + r.id);
      bits.forEach((b) => console.log('      ! ' + b));
      r.errors.slice(0, 3).forEach((e) => console.log('      ! ' + e));
    });
  } else {
    console.log('\n  nothing broken.');
  }

  console.log('\n---- CLEAN (' + ok.length + ') ----');
  ok.forEach((r) => {
    console.log('  ' + r.id.padEnd(22) +
      String(r.visible).padStart(3) + ' interactive' +
      (r.panels ? '  ' + r.panels + ' panels' : '') +
      (r.backdrop ? '  backdrop' : ''));
  });
  console.log('');
  app.quit();
});
