/**
 * render-kannada-icon.js — the menu art for the Kannada card
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     npx electron scripts/render-kannada-icon.js
 *
 * Fluent Emoji (the 3D set the other cards use) has nothing for a Kannada
 * letter, so this draws one: a glossy toy alphabet block with ಅ on it, in
 * Karnataka's yellow and red, lit from the top-left like the Fluent art so it
 * sits beside it naturally. Rendered once, offscreen, with the bundled Baloo
 * Tamma 2 font, to assets/new/icons/kannada.png (512 x 512, transparent).
 * A build step like fetch-icons.mjs — nothing here runs on the wall.
 */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'new', 'icons', 'kannada.png');
const FONT = 'file:///' + path.join(ROOT, 'assets', 'fonts', 'BalooTamma2.ttf').replace(/\\/g, '/').replace(/ /g, '%20');

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Tamma';src:url('${FONT}');font-weight:400 800}
html,body{margin:0;width:512px;height:512px;background:transparent;overflow:hidden}
.block{position:absolute;left:56px;top:40px;width:380px;height:380px;border-radius:84px;
  background:radial-gradient(120% 100% at 28% 18%,#FFF3A6 0%,#FFD43B 38%,#F5B400 72%,#D98E00 100%);
  box-shadow:inset -18px -26px 0 rgba(170,90,0,.28),inset 14px 16px 0 rgba(255,255,255,.45),
    0 34px 0 #C2410C,0 34px 0 2px #9A3412,0 58px 46px rgba(80,30,0,.35)}
.block::before{content:'';position:absolute;left:44px;top:30px;width:150px;height:70px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0));transform:rotate(-18deg)}
.ltr{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:'Tamma';font-weight:800;font-size:300px;line-height:1;padding-top:38px;
  background:linear-gradient(180deg,#FF5A4E 0%,#E11D2E 55%,#B5121F 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 7px 0 rgba(120,10,20,.55)) drop-shadow(0 0 1px #7f0d17)}
</style></head><body><div class="block"><div class="ltr">ಅ</div></div></body></html>`;

app.on('ready', async () => {
  const w = new BrowserWindow({
    width: 512, height: 512, show: false, transparent: true, frame: false,
    backgroundColor: '#00000000', useContentSize: true,
    webPreferences: { offscreen: false, backgroundThrottling: false }
  });
  const tmp = path.join(app.getPath('temp'), 'kannada-icon.html');
  fs.writeFileSync(tmp, HTML, 'utf8');
  await w.loadFile(tmp);
  await w.webContents.executeJavaScript('document.fonts.ready.then(()=>document.fonts.check("300px Tamma"))')
    .then((ok) => { if (!ok) console.warn('! Baloo Tamma 2 did not load - letter fell back to a system font'); });
  await new Promise((r) => setTimeout(r, 400));
  const img = await w.webContents.capturePage();
  fs.writeFileSync(OUT, img.resize({ width: 512, height: 512 }).toPNG());
  console.log('wrote ' + path.relative(ROOT, OUT));
  app.quit();
});
