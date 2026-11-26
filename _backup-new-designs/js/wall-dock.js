/**
 * wall-dock.js — the one universal control on every screen
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Replaces the per-page ☰ teacher toolbar, the menu's 🌐 button, and every
 * page's own "← Menu / Back" buttons with ONE control that looks and behaves
 * the same everywhere:
 *
 *   · It always starts SMALL at the RIGHT-MIDDLE of the screen (the wall is a
 *     single 5780×1080 surface; right-middle is reachable and out of the play
 *     area). A teacher can drag it anywhere; it is not remembered, so the next
 *     screen starts it in the same known place again.
 *   · Tap it and it opens a compact panel:
 *        ◀ Back     — one STEP back, never a jump: the activity's own inner
 *                     step first (a round chooser, the player picker), then the
 *                     group the activity was opened from, then the main menu.
 *        🏠 Menu    — straight to the main menu.
 *        Language   — English · हिन्दी · മലയാളം · ಕನ್ನಡ
 *        Height     — move the activity up or down the wall (remembered for
 *                     the session, so it is set once per child, not per page)
 *        Size       — bigger / smaller (also remembered)
 *        Volume     — quieter / louder
 *   · The panel closes itself after a few seconds without a touch.
 *
 * Pages do not build it themselves: WALL.toolbar() (js/wall-common.js) now
 * mounts this dock, so every activity gets it without editing each file.
 *
 *   WALL_DOCK.onBack(fn)   fn() returns true if the page handled the step
 *                          (e.g. went from a round back to its chooser).
 *   WALL_DOCK.back()       run one step back programmatically.
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var S = function () { return global.WALL_SETTINGS || null; };
  var IN_GAMES = /\/games\//.test(global.location.pathname);
  var ROOT = IN_GAMES ? '../' : './';

  /* ── remembered teacher settings (session-wide) ──────────────────────── */
  var KEY = 'auticareWallFit';
  var HEIGHT_STEP = 40, HEIGHT_MAX = 320;
  var SIZE_STEPS = [0.8, 0.9, 1.0, 1.12, 1.25, 1.4];
  var fit = { height: 0, size: 2 };
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved) {
      if (typeof saved.height === 'number') fit.height = Math.max(-HEIGHT_MAX, Math.min(HEIGHT_MAX, saved.height));
      if (typeof saved.size === 'number' && SIZE_STEPS[saved.size]) fit.size = saved.size;
    }
  } catch (e) {}
  function saveFit() { try { sessionStorage.setItem(KEY, JSON.stringify(fit)); } catch (e) {} }

  /* ── the words on the dock, in all four languages via WALL_SETTINGS.tr ─ */
  var TXT = {
    back:   { en: 'Back',     ml: 'പിന്നോട്ട്' },
    menu:   { en: 'Menu',     ml: 'മെനു' },
    lang:   { en: 'Language', ml: 'ഭാഷ' },
    height: { en: 'Height',   ml: 'ഉയരം' },
    size:   { en: 'Size',     ml: 'വലുപ്പം' },
    volume: { en: 'Volume',   ml: 'ശബ്ദത്തിന്റെ അളവ്' },
    voice:  { en: 'Voice settings', ml: 'ശബ്ദം ക്രമീകരിക്കാം' },
    reset:  { en: 'Restart', ml: 'വീണ്ടും' }
  };
  function tr(o) { return S() ? S().tr(o) : o.en; }

  /* ── where Back goes ─────────────────────────────────────────────────── */
  var backHandlers = [];
  function onBack(fn) { if (typeof fn === 'function') backHandlers.push(fn); }

  /** The group this activity was opened from (set by the menu on launch). */
  function fromGroup() {
    try { return sessionStorage.getItem('auticareFromGroup') || ''; } catch (e) { return ''; }
  }

  function back() {
    // 1. the page's own inner steps, newest first
    for (var i = backHandlers.length - 1; i >= 0; i--) {
      try { if (backHandlers[i]() === true) return; } catch (e) {}
    }
    // 2. an activity goes back to the group it came from
    if (IN_GAMES || !/index\.html$|\/$/.test(global.location.pathname)) {
      var g = fromGroup(), fromPlay = false;
      try { fromPlay = sessionStorage.getItem('auticareFromPlay') === '1'; } catch (e) {}
      if (fromPlay) { global.location.href = ROOT + 'play.html' + (g ? '?map=' + encodeURIComponent(g) : ''); return; }
      global.location.href = ROOT + 'index.html' + (g ? '?open=' + encodeURIComponent(g) : '');
      return;
    }
    // 3. on the menu itself, game-loader registers the submenu steps via onBack
  }
  function home() {
    try { sessionStorage.removeItem('auticareFromGroup'); } catch (e) {}
    var fromPlay = false; try { fromPlay = sessionStorage.getItem('auticareFromPlay') === '1'; } catch (e) {}
    global.location.href = ROOT + (fromPlay ? 'play.html' : 'index.html');
  }

  /* ── size + height applied to the page ───────────────────────────────── */
  var liftEls = [];
  function liftTargets() {
    if (liftEls.length) return liftEls;
    var out = [], kids = doc.body ? doc.body.children : [];
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i], tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') continue;
      if (/^(wallDock|wallGuide|wallGuideBubble|wallGuideRing|setPanel|setScrim)$/.test(el.id) ||
          /\bwall-backdrop\b/.test(el.className || '')) continue;
      out.push(el);
    }
    return out;
  }
  var sizeCbs = [], heightCbs = [], anyCbs = [];
  function each(list, v) { list.forEach(function (cb) { try { cb(v); } catch (e) {} }); }
  /** what: 'size' | 'height' | undefined (both) */
  function applyFit(what) {
    var root = doc.documentElement;
    root.style.setProperty('--wall-lift', fit.height + 'px');
    root.style.setProperty('--wall-scale', SIZE_STEPS[fit.size]);
    liftTargets().forEach(function (el) {
      el.style.translate = fit.height ? '0 ' + fit.height + 'px' : '';
    });
    if (what !== 'height') each(sizeCbs, SIZE_STEPS[fit.size]);
    if (what !== 'size') each(heightCbs, fit.height);
    anyCbs.forEach(function (cb) { try { cb(fit.height, SIZE_STEPS[fit.size]); } catch (e) {} });
  }
  function onFit(cb)    { anyCbs.push(cb);    cb(fit.height, SIZE_STEPS[fit.size]); }
  function onSize(cb)   { sizeCbs.push(cb);   cb(SIZE_STEPS[fit.size]); }
  function onHeight(cb) { heightCbs.push(cb); cb(fit.height); }
  function liftTarget(el) {
    el = typeof el === 'string' ? doc.querySelector(el) : el;
    if (el && liftEls.indexOf(el) === -1) {
      // the default (every body child) was in force until now: undo it
      if (!liftEls.length) liftTargets().forEach(function (x) { x.style.translate = ''; });
      liftEls.push(el);
    }
    applyFit('height');
  }

  /* ── styles ──────────────────────────────────────────────────────────── */
  function css() {
    if (doc.getElementById('wall-dock-css')) return;
    var s = doc.createElement('style');
    s.id = 'wall-dock-css';
    s.textContent = [
      ':root{--dock-lane:84px}',
      '#wallDock{position:fixed;z-index:2147483000;right:18px;top:50%;transform:translateY(-50%);',
      '  font-family:"Baloo 2","Noto Sans Malayalam","Noto Sans Devanagari","Noto Sans Kannada",system-ui,sans-serif;',
      '  touch-action:none;user-select:none;-webkit-user-select:none}',
      '#wallDock .wd-knob{width:58px;height:58px;border-radius:50%;border:3px solid #fff;cursor:grab;',
      '  background:radial-gradient(circle at 35% 30%,#7aa8ff,#3b5bdb);color:#fff;font-size:26px;',
      '  display:flex;align-items:center;justify-content:center;',
      '  box-shadow:0 6px 18px rgba(30,50,120,.35),0 0 0 4px rgba(59,91,219,.18);transition:transform .15s}',
      '#wallDock .wd-knob:active{transform:scale(.92)}',
      '#wallDock.dragging .wd-knob{cursor:grabbing;transform:scale(1.08)}',
      '#wallDock .wd-panel{position:absolute;top:50%;right:70px;transform:translateY(-50%) scale(.9);',
      '  transform-origin:right center;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;',
      '  width:300px;padding:14px;border-radius:24px;background:rgba(255,255,255,.97);',
      '  box-shadow:0 18px 48px rgba(20,30,70,.3);border:2px solid #dfe6ff;display:flex;flex-direction:column;gap:10px}',
      '#wallDock.left .wd-panel{right:auto;left:70px;transform-origin:left center}',
      '#wallDock.open .wd-panel{opacity:1;pointer-events:auto;transform:translateY(-50%) scale(1)}',
      '#wallDock .wd-row{display:flex;gap:8px}',
      '#wallDock button{font-family:inherit;border:0;cursor:pointer;touch-action:manipulation}',
      '#wallDock .wd-big{flex:1;height:60px;border-radius:16px;font-size:21px;font-weight:800;color:#fff;',
      '  display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 0 rgba(0,0,0,.14)}',
      '#wallDock .wd-big:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(0,0,0,.14)}',
      '#wallDock .wd-back{background:#3b5bdb}',
      '#wallDock .wd-home{background:#22a06b;flex:0 0 96px}',
      '#wallDock .wd-reset{background:#8a97a6;font-size:18px;height:50px}',
      '#wallDock .wd-extra{background:#f08c00;font-size:18px;height:50px}',
      '#wallDock .wd-cap{font-size:13px;font-weight:800;color:#6b7499;letter-spacing:.04em;margin:2px 2px -4px}',
      '#wallDock .wd-lang{flex:1;height:48px;border-radius:13px;background:#eef2ff;color:#2b3a7a;',
      '  font-size:17px;font-weight:800;border:2px solid transparent}',
      '#wallDock .wd-lang.on{background:#3b5bdb;color:#fff}',
      '#wallDock .wd-step{display:flex;align-items:center;gap:8px}',
      '#wallDock .wd-step b{flex:1;text-align:center;font-size:16px;color:#2b3a7a}',
      '#wallDock .wd-sq{width:60px;height:48px;border-radius:13px;background:#eef2ff;color:#2b3a7a;font-size:22px;font-weight:900}',
      '#wallDock .wd-sq:active,#wallDock .wd-lang:active{transform:scale(.94)}',
      '#wallDock .wd-voice{height:44px;border-radius:13px;background:#f4f0ff;color:#5b3fc4;font-size:16px;font-weight:800}'
    ].join('\n');
    doc.head.appendChild(s);
  }

  /* ── the dock ────────────────────────────────────────────────────────── */
  var dock = null, closeTimer = null, mountOpts = {};
  function mount(opts) {
    opts = opts || {};
    mountOpts = opts;
    if (doc.getElementById('wallDock')) return;
    css();
    dock = doc.createElement('div');
    dock.id = 'wallDock';
    var langs = S() ? S().LANGS : [{ code: 'en', native: 'English' }];
    dock.innerHTML =
      '<div class="wd-knob" role="button" aria-label="Controls">☰</div>' +
      '<div class="wd-panel" role="dialog">' +
      '  <div class="wd-row">' +
      '    <button class="wd-big wd-back" data-act="back">◀ <span data-t="back"></span></button>' +
      (opts.home === false ? '' : '    <button class="wd-big wd-home" data-act="home" aria-label="Menu">🏠</button>') +
      '  </div>' +
      (opts.extra || opts.reset ? '  <div class="wd-row">' +
        (opts.extra ? '<button class="wd-big wd-extra" data-act="extra"></button>' : '') +
        (opts.reset ? '<button class="wd-big wd-reset" data-act="reset">↺ <span data-t="reset"></span></button>' : '') +
        '</div>' : '') +
      '  <div class="wd-cap" data-t="lang"></div>' +
      '  <div class="wd-row">' + langs.map(function (l) {
        return '<button class="wd-lang" data-lang="' + l.code + '">' + (l.code === 'en' ? 'EN' : l.native) + '</button>';
      }).join('') + '</div>' +
      '  <div class="wd-step"><button class="wd-sq" data-act="up" aria-label="Higher">⬆</button><b data-t="height"></b><button class="wd-sq" data-act="down" aria-label="Lower">⬇</button></div>' +
      '  <div class="wd-step"><button class="wd-sq" data-act="smaller" aria-label="Smaller">−</button><b data-t="size"></b><button class="wd-sq" data-act="bigger" aria-label="Bigger">+</button></div>' +
      (S() ? '  <div class="wd-step"><button class="wd-sq" data-act="quieter" aria-label="Quieter">🔈</button><b data-t="volume"></b><button class="wd-sq" data-act="louder" aria-label="Louder">🔊</button></div>' : '') +
      (global.SETTINGS_PANEL ? '  <button class="wd-voice" data-act="voice">🎚 <span data-t="voice"></span></button>' : '') +
      '</div>';
    doc.body.appendChild(dock);
    relabel();
    if (S()) S().onChange(function (w) { if (w === 'lang') relabel(); });

    wireDrag(dock.querySelector('.wd-knob'));
    dock.querySelector('.wd-panel').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      poke();
      var act = b.dataset.act;
      if (b.dataset.lang && S()) { S().setLang(b.dataset.lang); return; }
      if (act === 'back') { close(); back(); }
      else if (act === 'home') { close(); home(); }
      else if (act === 'voice') { close(); global.SETTINGS_PANEL.open(); }
      else if (act === 'up') { fit.height = Math.max(-HEIGHT_MAX, fit.height - HEIGHT_STEP); saveFit(); applyFit('height'); }
      else if (act === 'down') { fit.height = Math.min(HEIGHT_MAX, fit.height + HEIGHT_STEP); saveFit(); applyFit('height'); }
      else if (act === 'smaller') { fit.size = Math.max(0, fit.size - 1); saveFit(); applyFit('size'); }
      else if (act === 'bigger') { fit.size = Math.min(SIZE_STEPS.length - 1, fit.size + 1); saveFit(); applyFit('size'); }
      else if (act === 'reset' && mountOpts.reset) { close(); mountOpts.reset(); }
      else if (act === 'extra' && mountOpts.extra) { close(); mountOpts.extra.onTap(); }
      else if (act === 'quieter' || act === 'louder') {
        var v = S().get().volume + (act === 'louder' ? 0.1 : -0.1);
        S().setVoice({ volume: Math.round(v * 10) / 10 });
      }
    });
    applyFit();
  }

  function relabel() {
    if (!dock) return;
    [].forEach.call(dock.querySelectorAll('[data-t]'), function (n) { n.textContent = tr(TXT[n.dataset.t]); });
    var ex = dock.querySelector('.wd-extra');
    if (ex && mountOpts.extra) ex.textContent = tr(mountOpts.extra.label);
    var cur = S() ? S().lang() : 'en';
    [].forEach.call(dock.querySelectorAll('.wd-lang'), function (b) { b.classList.toggle('on', b.dataset.lang === cur); });
  }

  function open() { dock.classList.add('open'); relabel(); poke(); }
  function close() { if (dock) dock.classList.remove('open'); clearTimeout(closeTimer); }
  function poke() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 8000); }

  /* Tap opens/closes; a press that moves more than a few pixels is a drag.
     Kept inside the screen; the panel flips to the knob's other side when the
     knob is dragged to the left half. */
  function wireDrag(knob) {
    var sx, sy, ox, oy, moved = false, active = false;
    knob.addEventListener('pointerdown', function (e) {
      active = true; moved = false;
      var r = dock.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      try { knob.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    knob.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 10) return;
      moved = true;
      dock.classList.add('dragging');
      var w = global.innerWidth, h = global.innerHeight, k = 58;
      var x = Math.max(4, Math.min(w - k - 4, ox + dx));
      var y = Math.max(4, Math.min(h - k - 4, oy + dy));
      dock.style.left = x + 'px'; dock.style.top = y + 'px';
      dock.style.right = 'auto'; dock.style.transform = 'none';
      dock.classList.toggle('left', x < w / 2);
    });
    function end() {
      if (!active) return;
      active = false;
      dock.classList.remove('dragging');
      if (!moved) { if (dock.classList.contains('open')) close(); else open(); }
    }
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', end);
  }

  global.WALL_DOCK = {
    mount: mount, back: back, home: home, onBack: onBack,
    liftTarget: liftTarget, onFit: onFit, onSize: onSize, onHeight: onHeight,
    scale: function () { return SIZE_STEPS[fit.size]; },
    height: function () { return fit.height; },
    open: function () { if (dock) open(); }, close: close
  };
})(typeof window !== 'undefined' ? window : globalThis);
