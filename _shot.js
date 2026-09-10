/* Electron smoke-test harness: load a game page, report console errors,
   dump a DOM summary, and save a screenshot.
   usage: electron shot.js <abs page path> <out.png> */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');

const target = process.argv[2];
const out = process.argv[3] || 'shot.png';
const action = process.argv[4] || null;

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1600, height: 950, show: false,
    webPreferences: { offscreen: true, backgroundThrottling: false,
                     nodeIntegration: true, contextIsolation: false,
                     webgl: true, webSecurity: false, allowRunningInsecureContent: true }
  });

  const errors = [];
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (level >= 2) errors.push(`[${level}] ${message} @${String(sourceId).split(/[\\/]/).pop()}:${line}`);
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    errors.push(`FAIL_LOAD ${code} ${desc} ${url}`);
  });

  try {
    const qi = target.indexOf('?');
    if (qi >= 0) await win.loadFile(target.slice(0, qi), { search: target.slice(qi + 1) });
    else await win.loadFile(target);
  } catch (e) {
    console.log('LOAD_ERROR ' + e.message);
  }

  await new Promise(r => setTimeout(r, 2200));
  if (action) {
    try { const ar = await win.webContents.executeJavaScript(action);
          console.log('ACTION_RESULT ' + JSON.stringify(ar)); }
    catch (e) { console.log('ACTION_ERROR ' + e.message); }
    await new Promise(r => setTimeout(r, 1500));
  }

  const info = await win.webContents.executeJavaScript(`(() => {
    const q = s => document.querySelectorAll(s).length;
    const txt = s => { const e = document.querySelector(s); return e ? e.textContent.trim().slice(0,70) : null; };
    return {
      cards: q('.deck-card'),
      tabs: q('.deck-tab'),
      artSvg: q('.deck-art svg'),
      artImg: q('.deck-art img'),
      toolbar: !!document.getElementById('wallToolbar'),
      toolbarBtns: q('.wall-tb'),
      title: txt('h1'),
      firstLabel: txt('.deck-label'),
      firstSub: txt('.deck-sub'),
      bodyH: document.body.scrollHeight,
      hasWALL: typeof WALL, hasDECK: typeof DECK
    };
  })()`).catch(e => ({ evalError: e.message }));

  console.log('INFO ' + JSON.stringify(info, null, 1));
  console.log('ERRORS ' + JSON.stringify(errors, null, 1));

  try {
    const img = await win.webContents.capturePage();
    fs.writeFileSync(out, img.toPNG());
    console.log('SHOT ' + out + ' bytes=' + fs.statSync(out).size);
  } catch (e) {
    console.log('SHOT_ERROR ' + e.message);
  }

  app.quit();
});
