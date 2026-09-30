/* ============================================================
   three-up.js — the 1/2/3 player split-screen harness
   ------------------------------------------------------------
   Every secondary activity is "split to 3 scenes", so the panel
   layout, the per-player state, the touch routing and the win
   banners belong in one place rather than copied into nine files.

   The layout is lifted from puzzle-balance, which is the old
   activity that does three-up best: flex row, hairline dividers,
   a colour banner per panel, header pills for scores, a body that
   owns its own touches, and a hint strip along the bottom.

   Two things this adds on top of that:

     · POPUPS ARE PER PANEL. A child tapping in panel 2 must get
       the explanation inside panel 2 — a single page-wide modal
       would interrupt the other two players. TRIUP.popup(p, …)
       renders inside that panel only.

     · NOTHING INTERACTIVE SITS IN THE TOP BAND. On a wall the top
       of the screen is out of reach for a small child, so panel
       bodies align their content to the lower portion. Tune with
       --tu-reach.

   Usage
   ─────
     TRIUP.start({
       title:  { en:'Body Parts', ml:'ശരീരഭാഗങ്ങൾ' },
       pick:   true,                  // show the 1/2/3 chooser first
       hint:   { en:'Tap a part', ml:'ഒരു ഭാഗം തൊടൂ' },
       build:  function (p, body, api) { ... }   // fill one panel
     });

   Inside build(): api.pill(p,'score',0), api.popup(p,{…}),
   api.win(p,{…}), api.crown(p), api.players, api.each(fn).
   ============================================================ */
(function (global) {
  'use strict';

  /* One hue per player. Kept saturated — these read as team colours
     from across a room, which is the point on a wall. */
  var COLOURS = ['#4f7bff', '#f0642f', '#22b07d'];
  var NAMES = [
    { en: 'Player 1', ml: 'കളിക്കാരൻ 1' },
    { en: 'Player 2', ml: 'കളിക്കാരൻ 2' },
    { en: 'Player 3', ml: 'കളിക്കാരൻ 3' }
  ];

  var cfg = null;
  var panels = [];        // { root, body, hdr, pills, hint }
  var store = [];         // free-form per-player state for the activity

  /* ── styles ─────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('tu-css')) return;
    var s = document.createElement('style');
    s.id = 'tu-css';
    s.textContent = [
      /* vh, not %. Padding percentages resolve against the containing block's
         WIDTH, so 32% was 192px at three players and 614px at one — the reach
         band has to be a share of HEIGHT to mean what it was measured to mean. */
      ':root{--tu-reach:30vh}',
      '.tu-wrap{position:fixed;inset:0;display:flex;flex-direction:row;z-index:1}',
      '.tu-div{width:3px;flex-shrink:0;background:linear-gradient(to bottom,transparent 4%,#dde2f4 28%,#dde2f4 72%,transparent 96%)}',
      '.tu-panel{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;overflow:hidden}',
      '.tu-banner{height:7px;flex-shrink:0}',
      '.tu-hdr{display:flex;align-items:center;justify-content:space-between;gap:6px;',
      '  padding:5px 9px 4px;flex-shrink:0;border-bottom:2px solid rgba(0,0,0,.05);background:rgba(255,255,255,.72)}',
      '.tu-name{font-weight:800;font-size:clamp(12px,2.6vw,17px)}',
      '.tu-pills{display:flex;gap:5px}',
      '.tu-pill{padding:2px 9px;border-radius:11px;font-weight:800;white-space:nowrap;',
      '  font-size:clamp(9px,1.8vw,12px);border:2px solid currentColor;background:#fff}',
      /* the reach rule: content hugs the lower part of the panel */
      '.tu-body{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;',
      '  justify-content:flex-end;gap:2.2vh;overflow:hidden;position:relative;',
      '  padding:var(--tu-reach) 3% 4.5vh}',
      '.tu-hint{flex-shrink:0;text-align:center;font-weight:800;color:#8b8fa8;',
      '  padding:4px 6px;background:rgba(255,255,255,.72);font-size:clamp(8px,1.6vw,12px)}',
      /* per-panel popup — never page-wide */
      '.tu-pop{position:absolute;inset:0;z-index:40;display:none;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:1.4vh;padding:6% 7%;',
      '  background:rgba(255,255,255,.95);backdrop-filter:blur(5px);text-align:center}',
      '.tu-pop.show{display:flex;animation:tuPop .22s ease-out}',
      '@keyframes tuPop{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:none}}',
      '.tu-pop img{max-width:74%;max-height:34vh;object-fit:contain;border-radius:14px}',
      '.tu-pop-t{font-weight:900;font-size:clamp(16px,3.6vw,30px)}',
      '.tu-pop-b{font-weight:700;font-size:clamp(11px,2.1vw,17px);color:#555b73;line-height:1.35}',
      '.tu-pop-x{margin-top:.6vh;border:0;border-radius:13px;padding:9px 26px;color:#fff;',
      '  font-weight:900;font-size:clamp(12px,2.2vw,17px);cursor:pointer}',
      '.tu-win{position:absolute;inset:0;z-index:50;display:none;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:1.2vh;padding:8%;text-align:center;',
      '  background:rgba(255,255,255,.94);backdrop-filter:blur(5px)}',
      '.tu-win.show{display:flex}',
      '.tu-crown{position:absolute;top:8px;right:10px;font-size:clamp(18px,3.4vw,30px);z-index:45}',
      /* player-count chooser */
      '.tu-pick{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:3.2vh;background:#f7f8fc}',
      '.tu-pick h2{font-weight:900;font-size:clamp(20px,4.4vw,38px);text-align:center;padding:0 6%}',
      '.tu-pick-row{display:flex;gap:2.4vw;flex-wrap:wrap;justify-content:center}',
      '.tu-pick-b{border:0;border-radius:22px;color:#fff;cursor:pointer;font-weight:900;',
      '  padding:3.4vh 5.2vw;font-size:clamp(17px,3.4vw,30px);box-shadow:0 8px 0 rgba(0,0,0,.13)}',
      '.tu-pick-b:active{transform:translateY(3px);box-shadow:0 5px 0 rgba(0,0,0,.13)}'
    ].join('');
    document.head.appendChild(s);
  }

  function txt(o) {
    if (!o) return '';
    return (global.WALL && WALL.t) ? WALL.t(o) : (o.en || o.ml || '');
  }

  /* ── build one panel ────────────────────────────────────── */
  function buildPanel(p, n) {
    var col = COLOURS[p];
    var root = document.createElement('div');
    root.className = 'tu-panel';
    root.dataset.player = p;

    var banner = document.createElement('div');
    banner.className = 'tu-banner';
    banner.style.background = col;

    var hdr = document.createElement('div');
    hdr.className = 'tu-hdr';
    var name = document.createElement('div');
    name.className = 'tu-name';
    name.style.color = col;
    /* With one player the panel is the whole wall, so the label is noise. */
    name.textContent = n > 1 ? txt(NAMES[p]) : '';
    var pills = document.createElement('div');
    pills.className = 'tu-pills';
    pills.style.color = col;
    hdr.appendChild(name); hdr.appendChild(pills);

    var body = document.createElement('div');
    body.className = 'tu-body';

    var hint = document.createElement('div');
    hint.className = 'tu-hint';
    hint.textContent = txt(cfg.hint);

    var pop = document.createElement('div');
    pop.className = 'tu-pop';
    var win = document.createElement('div');
    win.className = 'tu-win';

    root.appendChild(banner); root.appendChild(hdr);
    root.appendChild(body); root.appendChild(hint);
    root.appendChild(pop); root.appendChild(win);

    return { root: root, body: body, hdr: hdr, pills: pills, hint: hint, pop: pop, win: win, col: col };
  }

  /* ── the API handed to build() ──────────────────────────── */
  var api = {
    players: 1,
    colour: function (p) { return COLOURS[p]; },
    state: function (p) { return store[p]; },
    each: function (fn) { for (var p = 0; p < api.players; p++) fn(p, panels[p].body, api); },

    /** A labelled pill in the panel header — score, found count, timer. */
    pill: function (p, key, value) {
      var box = panels[p].pills;
      var el = box.querySelector('[data-k="' + key + '"]');
      if (!el) {
        el = document.createElement('span');
        el.className = 'tu-pill';
        el.dataset.k = key;
        box.appendChild(el);
      }
      el.textContent = value;
      return el;
    },

    /** Explanation card *inside this player's panel*, not page-wide. */
    popup: function (p, o) {
      var pop = panels[p].pop;
      pop.innerHTML = '';
      if (o.img) {
        var im = document.createElement('img');
        im.src = o.img; im.alt = '';
        pop.appendChild(im);
      }
      if (o.title) {
        var t = document.createElement('div');
        t.className = 'tu-pop-t'; t.style.color = panels[p].col;
        t.textContent = txt(o.title); pop.appendChild(t);
      }
      if (o.body) {
        var b = document.createElement('div');
        b.className = 'tu-pop-b'; b.textContent = txt(o.body);
        pop.appendChild(b);
      }
      var x = document.createElement('button');
      x.className = 'tu-pop-x';
      x.style.background = panels[p].col;
      x.textContent = txt(o.close || { en: 'Got it!', ml: 'മനസ്സിലായി!' });
      pop.appendChild(x);
      if (global.WALL) {
        WALL.bindTouch(x, function () { api.closePopup(p); if (o.onClose) o.onClose(); });
        /* Only panel 1 drives the voice. Three panels speaking at once is
           noise, not feedback — the other panels get the same card silently. */
        if (p === 0 && WALL.voiceOn && WALL.voiceOn() && WALL.say && o.say !== false) {
          WALL.say(txt(o.title));
        }
        WALL.sfx.tap();
      } else {
        x.onclick = function () { api.closePopup(p); if (o.onClose) o.onClose(); };
      }
      pop.classList.add('show');
    },
    closePopup: function (p) { panels[p].pop.classList.remove('show'); },

    /** End state for one panel; the others keep playing. */
    win: function (p, o) {
      var w = panels[p].win;
      w.innerHTML = '';
      var t = document.createElement('div');
      t.className = 'tu-pop-t'; t.style.color = panels[p].col;
      t.textContent = txt(o.title || { en: 'Well done!', ml: 'കൊള്ളാം!' });
      w.appendChild(t);
      if (o.body) {
        var b = document.createElement('div');
        b.className = 'tu-pop-b'; b.textContent = txt(o.body); w.appendChild(b);
      }
      if (o.again !== false) {
        var again = document.createElement('button');
        again.className = 'tu-pop-x';
        again.style.background = panels[p].col;
        again.textContent = txt(o.againLabel || { en: '↺ Again', ml: '↺ വീണ്ടും' });
        w.appendChild(again);
        var go = function () { w.classList.remove('show'); if (o.onAgain) o.onAgain(p); };
        if (global.WALL) WALL.bindTouch(again, go); else again.onclick = go;
      }
      w.classList.add('show');
      if (global.WALL) WALL.celebrate && WALL.celebrate();
    },

    crown: function (p) {
      if (panels[p].root.querySelector('.tu-crown')) return;
      var c = document.createElement('div');
      c.className = 'tu-crown'; c.textContent = '👑';
      panels[p].root.appendChild(c);
    },

    setHint: function (p, o) { panels[p].hint.textContent = txt(o); }
  };

  /* ── boot ───────────────────────────────────────────────── */
  function run(n) {
    api.players = n;
    panels = []; store = [];
    var wrap = document.createElement('div');
    wrap.className = 'tu-wrap';
    for (var p = 0; p < n; p++) {
      if (p) { var d = document.createElement('div'); d.className = 'tu-div'; wrap.appendChild(d); }
      var panel = buildPanel(p, n);
      panels.push(panel); store.push({});
      wrap.appendChild(panel.root);
    }
    document.body.appendChild(wrap);
    if (global.WALL && cfg.toolbar !== false) WALL.toolbar(cfg.toolbar || {});
    /* Each panel's content is built independently, so touches in one
       never reach another — no pointer-id bookkeeping needed. */
    for (var q = 0; q < n; q++) cfg.build(q, panels[q].body, api);
    if (cfg.onReady) cfg.onReady(api);
  }

  function chooser() {
    var box = document.createElement('div');
    box.className = 'tu-pick';
    var h = document.createElement('h2');
    h.textContent = txt(cfg.pickPrompt || { en: 'How many players?', ml: 'എത്ര കളിക്കാർ?' });
    var row = document.createElement('div');
    row.className = 'tu-pick-row';
    [1, 2, 3].forEach(function (n) {
      var b = document.createElement('button');
      b.className = 'tu-pick-b';
      b.style.background = COLOURS[n - 1];
      b.textContent = n;
      var go = function () { box.remove(); run(n); };
      if (global.WALL) WALL.bindTouch(b, go); else b.onclick = go;
      row.appendChild(b);
    });
    box.appendChild(h); box.appendChild(row);
    document.body.appendChild(box);
  }

  var TRIUP = {
    start: function (options) {
      cfg = options || {};
      injectCSS();
      if (global.WALL) WALL.init();
      if (cfg.title) document.title = txt(cfg.title);
      if (cfg.pick === false) run(cfg.players || 3); else chooser();
    },
    api: function () { return api; },
    COLOURS: COLOURS
  };

  global.TRIUP = TRIUP;
})(typeof window !== 'undefined' ? window : globalThis);
