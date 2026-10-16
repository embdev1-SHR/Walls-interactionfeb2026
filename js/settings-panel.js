/**
 * settings-panel.js — the language & voice panel on the main menu
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A round 🌐 button on the RIGHT-MIDDLE edge of the menu opens a panel with:
 *   · four big language buttons — English, हिन्दी, മലയാളം, ಕನ್ನಡ — each in its
 *     own script, so a teacher finds hers without reading the others
 *   · Volume, Speed and Pitch sliders, with pictures at each end (🔈🔊, 🐢🐇,
 *     🐻🐤) so the direction is obvious without words
 *   · Test voice — Owly says a line with the current settings
 * Choosing a language re-labels the whole menu at once and Owly says hello
 * in it. Everything is stored by js/wall-settings.js; this file is only the
 * controls, plus the menu's own words (card names, panel labels).
 *
 * The card names and panel words are { en, ml } pairs here, like all other
 * content, so scripts/i18n-collect.mjs and the voice scripts treat them the
 * same way; Hindi and Kannada come from content/i18n.
 */
(function (global) {
  'use strict';

  var S = global.WALL_SETTINGS;
  if (!S) return;

  /* ── the menu's words ─────────────────────────────────────────────────── */
  var CARDS = {
    'canvas':              { name: { en: 'Free Canvas', ml: 'ചിത്രം വരയ്ക്കാം' }, desc: 'Drawing' },
    'solar-system':        { name: { en: 'Solar System', ml: 'സൗരയൂഥം' }, desc: 'Space' },
    'coloring-book':       { name: { en: 'Coloring Book', ml: 'നിറം കൊടുക്കാം' }, desc: 'Colours' },
    'particle-playground': { name: { en: 'Particles', ml: 'മിന്നും കണങ്ങൾ' }, desc: 'Play' },
    'goalkeeper':          { name: { en: 'Goalkeeper', ml: 'ഗോൾകീപ്പർ' }, desc: 'Sports' },
    'fruit-ninja':         { name: { en: 'Fruit Ninja', ml: 'ഫ്രൂട്ട് നിഞ്ച' }, desc: 'Action' },
    'jungle':              { name: { en: 'Jungle', ml: 'കാട്' }, desc: 'Explore' },
    'daily-skills':        { name: { en: 'Daily Skills', ml: 'ദൈനംദിന കഴിവുകൾ' }, desc: 'Life skills' },
    'learning':            { name: { en: 'Learning', ml: 'പഠനം' }, desc: 'ABC & 123' },
    'underwater-explorer': { name: { en: 'Sea Explorer', ml: 'കടലിനടിയിൽ' }, desc: 'Ocean' },
    'music-maker':         { name: { en: 'Music Maker', ml: 'സംഗീതം' }, desc: 'Sounds' },
    'creature-creator':    { name: { en: 'Trace It', ml: 'എഴുതി പഠിക്കാം' }, desc: 'Writing' },
    'butterfly-tracker':   { name: { en: 'Butterfly Tracker', ml: 'ചിത്രശലഭം' }, desc: 'Follow' },
    'balloon-popper':      { name: { en: 'Balloon Popper', ml: 'ബലൂൺ പൊട്ടിക്കാം' }, desc: 'Pop!' },
    'fish-it':             { name: { en: 'Fish It', ml: 'മീൻ പിടിക്കാം' }, desc: 'Catch' },
    'puzzle-balance':      { name: { en: 'Puzzle Balance', ml: 'പസിൽ' }, desc: 'Thinking' },
    'pre-primary':         { name: { en: 'Pre-Primary', ml: 'പ്രീ-പ്രൈമറി' }, desc: 'First steps' },
    'primary':             { name: { en: 'Primary', ml: 'പ്രൈമറി' }, desc: 'Next steps' },
    'secondary':           { name: { en: 'Secondary', ml: 'സെക്കൻഡറി' }, desc: 'Big steps' },
    'vocational':          { name: { en: 'Vocational', ml: 'തൊഴിൽപരിചയം' }, desc: 'Work skills' },
    'kannada':             { name: { en: 'Kannada', ml: 'കന്നഡ' }, desc: 'ಕನ್ನಡ' },
    'money-counter':       { name: { en: 'Money Counter', ml: 'പണം എണ്ണാം' }, desc: 'Shopping' },
    'shape-sorter':        { name: { en: 'Shape Sorter', ml: 'ആകൃതികൾ' }, desc: 'Shapes & colours' },
    'video-360-player':    { name: { en: '360° Videos', ml: '360° വീഡിയോ' }, desc: 'Watch' }
  };
  var UI = {
    settings: { en: 'Settings', ml: 'ക്രമീകരണങ്ങൾ' },
    language: { en: 'Language', ml: 'ഭാഷ' },
    volume:   { en: 'Volume', ml: 'ശബ്ദത്തിന്റെ അളവ്' },
    speed:    { en: 'Speed', ml: 'വേഗത' },
    pitch:    { en: 'Pitch', ml: 'സ്വരം' },
    test:     { en: 'Test voice', ml: 'ശബ്ദം കേൾക്കാം' },
    reset:    { en: 'Reset', ml: 'പഴയപടി' },
    done:     { en: 'Done', ml: 'ശരി' },
    loading:  { en: 'Getting ready', ml: 'തയ്യാറാകുന്നു…' }
  };

  /** The chosen language big, plus a small second line (English, or
      Malayalam under English) — the same rule Owly's bubble follows. */
  function both(obj) {
    var main = S.tr(obj);
    var alt = S.lang() === 'en' ? (obj.ml || '') : S.englishOf(obj);
    return { main: main, alt: alt && alt !== main ? alt : '' };
  }

  function keyOf(card) { return card.dataset.game || card.dataset.category || ''; }

  /* ── re-label the menu in the chosen language ────────────────────────── */
  function relabelMenu() {
    var lang = S.lang();
    document.querySelectorAll('.card-grid .game-card').forEach(function (c) {
      var d = CARDS[keyOf(c)];
      if (!d) return;
      var name = c.querySelector('.card-name'), sub = c.querySelector('.card-sub');
      if (name) name.textContent = S.tr(d.name);
      // English: what it is ("Sports"); any other language: its English name
      if (sub) sub.textContent = lang === 'en' ? d.desc : d.name.en;
    });
    var ld = document.getElementById('loading-dots');
    if (ld) {
      var b = both(UI.loading);
      var ml = ld.querySelector('.ld-ml'), en = ld.querySelector('.ld-en');
      if (ml) ml.textContent = b.main;
      if (en) en.textContent = b.alt;
    }
    if (global.MENU_TABS && global.MENU_TABS.relabel) global.MENU_TABS.relabel();
    relabelPanel();
  }

  /* ── the button and the panel ─────────────────────────────────────────── */
  var CSS = [
    '#setBtn{position:fixed;right:clamp(10px,1.2vw,20px);top:50%;transform:translateY(-50%);z-index:10040;',
    '  width:clamp(64px,5.4vw,84px);height:clamp(64px,5.4vw,84px);border-radius:50%;cursor:pointer;',
    '  background:#fff;border:5px solid #8B5CF6;box-shadow:0 7px 0 #6D28D9,0 12px 22px rgba(0,0,0,.22);',
    '  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;',
    '  font-family:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation;',
    '  transition:transform .14s ease, box-shadow .14s ease}',
    '#setBtn:active{transform:translateY(calc(-50% + 5px));box-shadow:0 2px 0 #6D28D9}',
    '#setBtn .g{font-size:clamp(28px,2.4vw,38px);line-height:1}',
    '#setBtn .c{font-size:clamp(11px,.9vw,14px);font-weight:800;color:#6D28D9;line-height:1;margin-top:2px;letter-spacing:.06em}',
    '#setScrim{position:fixed;inset:0;z-index:10045;background:rgba(20,30,60,.28);opacity:0;pointer-events:none;transition:opacity .25s}',
    '#setScrim.open{opacity:1;pointer-events:auto}',
    '#setPanel{position:fixed;right:clamp(10px,1.2vw,20px);top:50%;z-index:10046;',
    '  width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;',
    '  transform:translate(calc(100% + 40px),-50%);transition:transform .32s cubic-bezier(.34,1.2,.64,1);',
    '  background:#fff;border:6px solid #8B5CF6;border-radius:36px;box-shadow:0 12px 0 #6D28D9,0 26px 50px rgba(20,30,80,.35);',
    '  padding:18px 22px 22px;color:#2B2D42;',
    "  font-family:'Baloo Chettan 2','Baloo 2','Baloo Tamma 2','Nunito','Nirmala UI',sans-serif}",
    '#setPanel.open{transform:translate(0,-50%)}',
    '#setPanel h2{display:flex;align-items:center;gap:10px;font-size:26px;font-weight:800;margin:0 0 6px}',
    '#setPanel h2 .x{margin-left:auto;width:46px;height:46px;border-radius:50%;border:3px solid #E5E0FA;background:#F6F3FF;',
    '  font-size:22px;cursor:pointer;color:#6D28D9;font-family:inherit}',
    '#setPanel .lbl{font-size:15px;font-weight:800;color:#6D28D9;letter-spacing:.04em;margin:14px 2px 8px}',
    '#setPanel .langs{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
    '#setPanel .lang{min-height:74px;border-radius:22px;border:4px solid #DDD6FE;background:#fff;cursor:pointer;',
    '  box-shadow:0 6px 0 #DDD6FE;display:flex;flex-direction:column;align-items:center;justify-content:center;',
    '  font-family:inherit;color:#2B2D42;transition:transform .12s, box-shadow .12s, background .2s}',
    '#setPanel .lang .n{font-size:26px;font-weight:800;line-height:1.1}',
    '#setPanel .lang .e{font-size:13px;font-weight:700;opacity:.6}',
    '#setPanel .lang.on{background:#8B5CF6;border-color:#8B5CF6;color:#fff;box-shadow:0 6px 0 #6D28D9}',
    '#setPanel .lang.on .e{opacity:.9}',
    '#setPanel .lang:active{transform:translateY(5px);box-shadow:0 1px 0 #DDD6FE}',
    '#setPanel .row{display:flex;align-items:center;gap:10px}',
    '#setPanel .row .ic{font-size:28px;width:36px;text-align:center}',
    '#setPanel .row .v{min-width:54px;text-align:right;font-weight:800;color:#6D28D9;font-size:16px}',
    '#setPanel input[type=range]{flex:1;-webkit-appearance:none;appearance:none;height:16px;border-radius:999px;',
    '  background:linear-gradient(90deg,#8B5CF6 var(--p,50%),#EDE9FE var(--p,50%));outline:none;touch-action:none}',
    '#setPanel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:38px;height:38px;border-radius:50%;',
    '  background:#fff;border:5px solid #8B5CF6;box-shadow:0 3px 8px rgba(0,0,0,.25);cursor:pointer}',
    '#setPanel .acts{display:flex;gap:12px;margin-top:20px}',
    '#setPanel .acts button{flex:1;min-height:58px;border-radius:999px;font-family:inherit;font-size:18px;font-weight:800;cursor:pointer;',
    '  border:4px solid #8B5CF6;background:#8B5CF6;color:#fff;box-shadow:0 6px 0 #6D28D9;transition:transform .12s, box-shadow .12s}',
    '#setPanel .acts button.ghost{background:#fff;color:#6D28D9;border-color:#DDD6FE;box-shadow:0 6px 0 #DDD6FE}',
    '#setPanel .acts button:active{transform:translateY(5px);box-shadow:0 1px 0 #6D28D9}',
    '@media (prefers-reduced-motion:reduce){#setPanel{transition:none}}'
  ].join('');

  var btn, panel, scrim;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var SLIDERS = [
    { key: 'volume', lo: '🔈', hi: '🔊', fmt: function (v) { return Math.round(v * 100) + '%'; } },
    { key: 'speed',  lo: '🐢', hi: '🐇', fmt: function (v) { return v.toFixed(2).replace(/0$/, '') + '×'; } },
    { key: 'pitch',  lo: '🐻', hi: '🐤', fmt: function (v) { return v.toFixed(2).replace(/0$/, '') + '×'; } }
  ];

  function build() {
    if (document.getElementById('setBtn')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    btn = el('button', '', '<span class="g">🌐</span><span class="c"></span>');
    btn.id = 'setBtn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Language and voice settings');
    scrim = el('div'); scrim.id = 'setScrim';
    panel = el('div'); panel.id = 'setPanel'; panel.setAttribute('role', 'dialog');

    var html = '<h2><span>⚙️</span><span data-ui="settings"></span>' +
               '<button class="x" type="button" aria-label="Close">✕</button></h2>' +
               '<div class="lbl" data-ui="language"></div><div class="langs">';
    S.LANGS.forEach(function (l) {
      html += '<button class="lang" type="button" data-lang="' + l.code + '"><span class="n">' + l.native +
              '</span><span class="e">' + l.en + '</span></button>';
    });
    html += '</div>';
    SLIDERS.forEach(function (sl) {
      var r = S.RANGE[sl.key];
      html += '<div class="lbl" data-ui="' + sl.key + '"></div><div class="row"><span class="ic">' + sl.lo + '</span>' +
              '<input type="range" data-key="' + sl.key + '" min="' + r[0] + '" max="' + r[1] + '" step="0.05">' +
              '<span class="ic">' + sl.hi + '</span><span class="v" data-v="' + sl.key + '"></span></div>';
    });
    html += '<div class="acts"><button type="button" class="ghost" data-act="reset"><span data-ui="reset"></span></button>' +
            '<button type="button" data-act="test">🔊 <span data-ui="test"></span></button></div>';
    panel.innerHTML = html;

    document.body.appendChild(btn); document.body.appendChild(scrim); document.body.appendChild(panel);

    btn.addEventListener('click', open);
    scrim.addEventListener('click', close);
    panel.querySelector('.x').addEventListener('click', close);
    panel.querySelectorAll('.lang').forEach(function (b) {
      b.addEventListener('click', function () { chooseLang(b.dataset.lang); });
    });
    panel.querySelectorAll('input[type=range]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var o = {}; o[inp.dataset.key] = parseFloat(inp.value);
        S.setVoice(o); syncSliders();
      });
      // on release, let the teacher hear what she just set
      inp.addEventListener('change', test);
    });
    panel.querySelector('[data-act=test]').addEventListener('click', test);
    panel.querySelector('[data-act=reset]').addEventListener('click', function () { S.resetVoice(); syncSliders(); test(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    syncSliders();
    relabelPanel();
  }

  function syncSliders() {
    if (!panel) return;
    var v = S.get();
    SLIDERS.forEach(function (sl) {
      var inp = panel.querySelector('input[data-key="' + sl.key + '"]');
      var r = S.RANGE[sl.key];
      inp.value = v[sl.key];
      inp.style.setProperty('--p', ((v[sl.key] - r[0]) / (r[1] - r[0]) * 100) + '%');
      panel.querySelector('[data-v="' + sl.key + '"]').textContent = sl.fmt(v[sl.key]);
    });
  }

  function relabelPanel() {
    if (btn) btn.querySelector('.c').textContent = S.lang().toUpperCase();
    if (!panel) return;
    panel.querySelectorAll('[data-ui]').forEach(function (n) { n.textContent = S.tr(UI[n.dataset.ui]); });
    panel.querySelectorAll('.lang').forEach(function (b) {
      var on = b.dataset.lang === S.lang();
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function chooseLang(code) {
    S.setLang(code);                       // fires onChange -> relabelMenu
    if (global.GUIDE) { try { GUIDE.say(S.LINES.hello, { hold: 3000 }); GUIDE.cheer(); } catch (e) {} }
  }

  function test() {
    if (global.GUIDE) { try { GUIDE.say(S.LINES.test, { hold: 2600 }); } catch (e) {} }
    else if (global.WALL) { try { WALL.say(S.LINES.test); } catch (e) {} }
  }

  function open() { syncSliders(); relabelPanel(); panel.classList.add('open'); scrim.classList.add('open'); }
  function close() { if (!panel) return; panel.classList.remove('open'); scrim.classList.remove('open'); }

  S.onChange(function (what) { if (what === 'lang') relabelMenu(); else syncSliders(); });

  function start() { build(); relabelMenu(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  global.SETTINGS_PANEL = { open: open, close: close, relabel: relabelMenu };
})(typeof window !== 'undefined' ? window : globalThis);
