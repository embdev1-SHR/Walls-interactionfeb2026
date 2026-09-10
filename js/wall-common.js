/**
 * wall-common.js — shared furniture for the Blueroom wall activities
 * ══════════════════════════════════════════════════════════════════
 *
 * WHY THIS EXISTS
 *   The Pangappara brief asks for the same teacher controls on almost
 *   every page ("Height Shift Up/Down", "Target Scaling Zoom In/Out"),
 *   the same non-punitive feedback rules, and the same Malayalam-first
 *   presentation. games/vehicles.html and games/fruits-vegetables.html
 *   already solved all of that; this module is that solution lifted out
 *   so the Primary and Secondary activities share one implementation
 *   instead of seventeen copies.
 *
 * RELATIONSHIP TO js/pre-primary-common.js
 *   PP is NOT replaced and NOT modified. It renders an older two-button
 *   toolbar that the shipped pp-* games depend on. This module is purely
 *   additive; the two can coexist on different pages. Do not load both.
 *
 * OFFLINE
 *   Every sound here is synthesized in the Web Audio API. Nothing in
 *   this file fetches anything except the optional Google font link,
 *   which degrades to the OS Malayalam font when there is no network.
 *
 * TYPICAL USE
 *   <script src="../js/tts-engine.js"></script>
 *   <script src="../js/wall-common.js"></script>
 *   WALL.init();
 *   WALL.toolbar({ lang:true, voice:true, size:true, height:true,
 *                  heightTarget:'#board', reset:resetAll, home:true });
 *   WALL.onLang(render);          // fires immediately, then on change
 */
(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════════════════ */
  var SIZE_STEPS  = [0.75, 0.88, 1.0, 1.15, 1.35, 1.6];
  var HEIGHT_STEP = 34;
  var HEIGHT_MAX  = 120;

  var state = { sizeIdx: 2, height: 0, ml: true, voice: true };

  var sizeCbs = [], heightCbs = [], langCbs = [], voiceCbs = [];
  var heightEls = [];

  function fire(list, arg) {
    for (var i = 0; i < list.length; i++) {
      try { list[i](arg); } catch (e) { console.warn('[WALL] callback failed', e); }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     TOUCH — dual click + touchend with the ghost-click guard.
     Every tappable thing on the wall goes through this.
     ═══════════════════════════════════════════════════════════════ */
  function bindTouch(el, fn) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      fn(e);
    });
    el.addEventListener('touchend', function (e) { e.preventDefault(); fn(e); });
  }

  /* ═══════════════════════════════════════════════════════════════
     LANGUAGE — Malayalam first, per the brief.
     WALL.t({en:'Rose', ml:'റോസപ്പൂവ്'}) returns the active string.
     ═══════════════════════════════════════════════════════════════ */
  function isMl() { return state.ml; }

  function t(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    if (state.ml) return obj.ml || obj.en || '';
    return obj.en || obj.ml || '';
  }

  /** Both languages stacked — the big label plus its translation. */
  function tBoth(obj) {
    if (!obj || typeof obj === 'string') return { main: t(obj), alt: '' };
    return state.ml
      ? { main: obj.ml || obj.en || '', alt: obj.en || '' }
      : { main: obj.en || obj.ml || '', alt: obj.ml || '' };
  }

  /* Every visible word in the teacher toolbar, both languages. The wall
     is run by Malayalam-speaking teachers, so these follow the toggle
     like the activity content does rather than sitting in English. */
  var TB_TEXT = {
    back:    { en: '↩ Back',    ml: '↩ പിന്നോട്ട്' },
    voice:   { en: '🔊 Voice',  ml: '🔊 ശബ്ദം' },
    size:    { en: 'SIZE',      ml: 'വലുപ്പം' },
    height:  { en: 'HEIGHT',    ml: 'ഉയരം' },
    reset:   { en: '↺ Restart', ml: '↺ വീണ്ടും' },
    home:    { en: '🏠 Menu',   ml: '🏠 മെനു' }
  };

  var tbOpts = null;

  function relabelToolbar() {
    if (!tbOpts) return;
    var set = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('wallLang',  state.ml ? '🌐 ML' : '🌐 EN');
    set('wallVoice', t(TB_TEXT.voice));
    set('wallReset', t(TB_TEXT.reset));
    set('wallHome',  t(TB_TEXT.home));
    // a page may pass its own menu label as {en, ml}
    if (tbOpts.menu) set('wallMenu', t(tbOpts.menu.label) || t(TB_TEXT.back));
    var caps = document.querySelectorAll('#wallToolbar .wall-tb-cap[data-cap]');
    [].forEach.call(caps, function (c) {
      c.textContent = t(TB_TEXT[c.getAttribute('data-cap')]);
    });
  }

  function setLang(ml) {
    state.ml = !!ml;
    document.body.classList.toggle('wall-ml', state.ml);
    relabelToolbar();
    fire(langCbs, state.ml);
  }

  function onLang(cb) { langCbs.push(cb); cb(state.ml); }

  /* ═══════════════════════════════════════════════════════════════
     SIZE + HEIGHT — the brief's "Target Scaling" and "Height Shift"
     ═══════════════════════════════════════════════════════════════ */
  function scale() { return SIZE_STEPS[state.sizeIdx]; }

  function applySize() {
    document.documentElement.style.setProperty('--wall-scale', scale());
    fire(sizeCbs, scale());
  }

  function bumpSize(dir) {
    var next = state.sizeIdx + dir;
    if (next < 0 || next >= SIZE_STEPS.length) return;
    state.sizeIdx = next;
    applySize();
  }

  function applyHeight() {
    for (var i = 0; i < heightEls.length; i++) {
      heightEls[i].style.transform = 'translateY(' + state.height + 'px)';
    }
    document.documentElement.style.setProperty('--wall-lift', state.height + 'px');
    fire(heightCbs, state.height);
  }

  function bumpHeight(dir) {
    // dir -1 = up the wall, +1 = down toward shorter children
    state.height = Math.max(-HEIGHT_MAX, Math.min(HEIGHT_MAX, state.height + dir * HEIGHT_STEP));
    applyHeight();
  }

  function heightTarget(elOrSel) {
    var el = typeof elOrSel === 'string' ? document.querySelector(elOrSel) : elOrSel;
    if (el && heightEls.indexOf(el) === -1) heightEls.push(el);
    applyHeight();
  }

  function onSize(cb)   { sizeCbs.push(cb);   cb(scale()); }
  function onHeight(cb) { heightCbs.push(cb); cb(state.height); }

  /* ═══════════════════════════════════════════════════════════════
     AUDIO — everything synthesized. No files, no 404s, no network.
     ═══════════════════════════════════════════════════════════════ */
  var _ac = null;
  function ac() {
    if (_ac === null) {
      try {
        _ac = new (global.AudioContext || global.webkitAudioContext)();
      } catch (e) { _ac = false; }
    }
    if (_ac && _ac.state === 'suspended') { try { _ac.resume(); } catch (e) {} }
    return _ac || null;
  }

  function tone(freq, dur, type, vol, delay) {
    var a = ac(); if (!a) return;
    var t0 = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.13, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  /** Short filtered noise burst — the basis of applause and water. */
  function noise(dur, vol, decay, delay) {
    var a = ac(); if (!a) return;
    var len = Math.max(1, Math.floor(a.sampleRate * dur));
    var buf = a.createBuffer(1, len, a.sampleRate);
    var d = buf.getChannelData(0);
    for (var s = 0; s < len; s++) {
      d[s] = (Math.random() * 2 - 1) * Math.exp(-s / (a.sampleRate * (decay || 0.05)));
    }
    var src = a.createBufferSource(), g = a.createGain();
    src.buffer = buf; src.connect(g); g.connect(a.destination);
    g.gain.value = vol || 0.09;
    src.start(a.currentTime + (delay || 0));
  }

  var sfx = {
    /** Neutral card tap. */
    tap: function () { tone(680, 0.08, 'sine', 0.09); },

    /** Letter lands in a slot / item snaps home. */
    pop: function () {
      var a = ac(); if (!a) return;
      var t0 = a.currentTime;
      var o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(430, t0);
      o.frequency.exponentialRampToValueAtTime(900, t0 + 0.09);
      g.gain.setValueAtTime(0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      o.start(t0); o.stop(t0 + 0.18);
      tone(1320, 0.16, 'triangle', 0.06, 0.05);
    },

    /** A card has been explored — the star lands. */
    star: function () {
      tone(880, 0.10, 'triangle', 0.11, 0.00);
      tone(1175, 0.16, 'triangle', 0.10, 0.07);
    },

    /** Bright rising triad for a correct match. */
    correct: function () {
      tone(659,  0.13, 'triangle', 0.15, 0.00);
      tone(880,  0.13, 'triangle', 0.15, 0.09);
      tone(1175, 0.24, 'triangle', 0.14, 0.18);
    },

    /**
     * Wrong answer. The brief forbids buzzers, red marks and error
     * tones three separate times — this is a soft downward nudge and
     * must stay that way.
     */
    nudge: function () {
      tone(330, 0.13, 'sine', 0.06);
      tone(294, 0.16, 'sine', 0.05, 0.09);
    },

    /** Gentle chime while tracing — call repeatedly as the finger moves. */
    trace: function (progress) {
      tone(520 + (progress || 0) * 420, 0.06, 'sine', 0.05);
    },

    /** Water splash + bubbles (fish letter, bathroom tap). */
    splash: function () {
      noise(0.35, 0.10, 0.09);
      tone(300, 0.18, 'sine', 0.07, 0.05);
      tone(900, 0.10, 'sine', 0.05, 0.16);
      tone(1400, 0.08, 'sine', 0.04, 0.26);
    },

    /** Rising arpeggio plus a 3-burst applause bed. */
    celebrate: function () {
      [523, 659, 784, 1047, 1319].forEach(function (f, i) {
        tone(f, 0.45, 'triangle', 0.11, i * 0.09);
      });
      for (var k = 0; k < 3; k++) noise(0.25, 0.09, 0.035, 0.5 + k * 0.16);
    }
  };

  /**
   * Optional recorded sound with a synthesized fallback.
   * The brief lists real recordings we may never receive; every one of
   * them goes through here so a missing file is a shrug, not a break.
   *
   *   var bell = WALL.sound('../assets/new/audio/doorbell.mp3', WALL.sfx.tap);
   *   bell();
   */
  function sound(url, fallback) {
    var el = null, ok = false;
    try {
      el = new Audio(url);
      el.preload = 'auto';
      el.addEventListener('canplaythrough', function () { ok = true; });
      el.addEventListener('error', function () { ok = false; });
    } catch (e) { el = null; }
    return function () {
      if (!state.voice && false) return;   // sound effects are not gated by the voice toggle
      if (ok && el) {
        try {
          var c = el.cloneNode();
          c.volume = 0.7;
          c.play().catch(function () {});
          return;
        } catch (e) { /* fall through */ }
      }
      if (fallback) fallback();
    };
  }

  /* ═══════════════════════════════════════════════════════════════
     SPEECH — wraps TTSEngine and honours the Voice toggle.
     Speech is never load-bearing: the wall machine may have no ml-IN
     voice at all, so nothing may depend on it having been heard.
     ═══════════════════════════════════════════════════════════════ */
  function voiceOn() { return state.voice; }

  function setVoice(on) {
    state.voice = !!on;
    var b = document.getElementById('wallVoice');
    if (b) b.classList.toggle('off', !state.voice);
    if (!state.voice && global.speechSynthesis) {
      try { global.speechSynthesis.cancel(); } catch (e) {}
    }
    fire(voiceCbs, state.voice);
  }

  function onVoice(cb) { voiceCbs.push(cb); cb(state.voice); }

  /**
   * say('Rose') | say({en:'Rose', ml:'റോസപ്പൂവ്'})
   * Picks the language from the current toggle unless one is forced.
   */
  function say(text, forceLang, word) {
    if (!state.voice) return;
    if (!global.TTSEngine) return;
    var str, lang;
    if (text && typeof text === 'object') {
      str  = t(text);
      lang = (state.ml && text.ml) ? 'ml' : 'en';
    } else {
      str  = text;
      lang = forceLang || (state.ml ? 'ml' : 'en');
    }
    if (!str) return;
    try { global.TTSEngine.speak(str, lang, word || null); } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════════
     VISUAL FX
     ═══════════════════════════════════════════════════════════════ */
  var CONFETTI = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc'];

  function burst(cx, cy, colors, n) {
    colors = colors || CONFETTI;
    for (var i = 0; i < (n || 12); i++) {
      var s = document.createElement('div');
      s.className = 'wall-spark';
      var size = 5 + Math.random() * 7,
          ang  = Math.random() * Math.PI * 2,
          dist = 28 + Math.random() * 60;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.setProperty('--sx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--sy', (Math.sin(ang) * dist - 22) + 'px');
      s.style.setProperty('--sd', (0.55 + Math.random() * 0.4) + 's');
      document.body.appendChild(s);
      s.addEventListener('animationend', function () { this.remove(); });
    }
  }

  function burstAt(el, colors, n) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, colors, n);
  }

  /**
   * The brief's "Finish" step, verbatim: floating balloons plus a
   * 3-second applause. Optionally scoped to one panel's rectangle so
   * multi-player boards celebrate independently.
   */
  function celebrate(rect, silent) {
    // silent=true keeps the balloons but drops the applause, for the
    // boards the brief marks "no sound effects".
    if (!silent) sfx.celebrate();
    var left = 0, width = global.innerWidth;
    if (rect && rect.width) { left = rect.left; width = rect.width; }
    for (var i = 0; i < 14; i++) {
      (function (i) {
        setTimeout(function () {
          var b = document.createElement('div');
          b.className = 'wall-balloon';
          b.style.left = (left + Math.random() * Math.max(40, width - 48)) + 'px';
          b.style.background = CONFETTI[i % CONFETTI.length];
          b.style.setProperty('--rd', (3.4 + Math.random() * 2) + 's');
          b.style.setProperty('--rr', ((Math.random() - 0.5) * 40) + 'deg');
          document.body.appendChild(b);
          b.addEventListener('animationend', function () { this.remove(); });
        }, i * 130);
      })(i);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     STYLE INJECTION
     ═══════════════════════════════════════════════════════════════ */
  function injectFont() {
    if (document.getElementById('wall-font-link')) return;
    var link = document.createElement('link');
    link.id = 'wall-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&' +
                'family=Noto+Sans+Malayalam:wght@400;700;900&display=swap';
    document.head.appendChild(link);
  }

  function injectCSS() {
    if (document.getElementById('wall-common-style')) return;
    var s = document.createElement('style');
    s.id = 'wall-common-style';
    s.textContent = [
      ':root{--wall-scale:1;--wall-lift:0px}',
      'body.wall-ml{font-family:"Noto Sans Malayalam","Baloo 2",system-ui,sans-serif}',

      /* ── teacher toolbar (right-middle, collapsible) ───────────── */
      '#wallToolbar{position:fixed;right:8px;top:50%;transform:translateY(-50%);z-index:500;',
      '  display:flex;flex-direction:column;align-items:flex-end;gap:6px;touch-action:auto}',
      '#wallTbToggle{width:42px;height:42px;border-radius:50%;border:2px solid rgba(127,180,220,.8);',
      '  background:rgba(255,255,255,.9);color:#1c4a75;font-size:17px;font-weight:900;',
      '  cursor:pointer;touch-action:auto;box-shadow:0 3px 10px rgba(20,60,95,.22);',
      '  display:flex;align-items:center;justify-content:center;transition:transform .2s}',
      '#wallTbToggle:active{transform:scale(.9)}',
      '.wall-tb-body{display:none;flex-direction:column;gap:5px;align-items:stretch;',
      '  padding:8px;border-radius:16px;background:rgba(255,255,255,.94);',
      '  border:2px solid rgba(127,180,220,.55);box-shadow:0 8px 24px rgba(20,60,95,.26)}',
      '#wallToolbar.open .wall-tb-body{display:flex}',
      '.wall-tb{padding:7px 11px;border-radius:13px;border:2px solid #7fb4dc;',
      '  background:linear-gradient(135deg,#eaf5ff,#c8e2f7);color:#1c4a75;font-weight:900;',
      '  font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap;touch-action:auto}',
      '.wall-tb:active{transform:scale(.94)}',
      '.wall-tb.off{opacity:.45}',
      '.wall-tb-row{display:flex;gap:5px}',
      '.wall-tb-row .wall-tb{flex:1;text-align:center;padding:7px 6px}',
      '.wall-tb-cap{font-size:9px;font-weight:800;color:#5d87a8;letter-spacing:.5px;text-align:center}',

      /* ── FX ───────────────────────────────────────────────────── */
      '.wall-spark{position:fixed;pointer-events:none;z-index:900;border-radius:50%;',
      '  animation:wallSparkFly var(--sd) ease-out forwards}',
      '@keyframes wallSparkFly{0%{transform:translate(-50%,-50%) scale(0);opacity:1}',
      '  60%{opacity:1}',
      '  100%{transform:translate(calc(-50% + var(--sx)),calc(-50% + var(--sy))) scale(1);opacity:0}}',
      '.wall-balloon{position:fixed;bottom:-140px;width:48px;height:62px;',
      '  border-radius:50% 50% 48% 48%;z-index:990;pointer-events:none;',
      '  animation:wallRise var(--rd) ease-in forwards}',
      '@keyframes wallRise{0%{transform:translateY(0) rotate(0);opacity:0}',
      '  12%{opacity:.95}',
      '  100%{transform:translateY(-118vh) rotate(var(--rr));opacity:0}}',
      '.wall-touch-ring{position:fixed;width:56px;height:56px;',
      '  border:3px solid rgba(56,189,248,.45);border-radius:50%;pointer-events:none;',
      '  z-index:9999;transform:translate(-50%,-50%) scale(0);',
      '  animation:wallRingPop .45s ease forwards}',
      '@keyframes wallRingPop{to{transform:translate(-50%,-50%) scale(2.2);opacity:0}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function injectTouchRings() {
    document.addEventListener('touchstart', function (e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var tch = e.changedTouches[i];
        var ring = document.createElement('div');
        ring.className = 'wall-touch-ring';
        ring.style.left = tch.clientX + 'px';
        ring.style.top  = tch.clientY + 'px';
        document.body.appendChild(ring);
        ring.addEventListener('animationend', function () { this.remove(); });
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     TOOLBAR
     opts = { menu:{label,onTap}, lang, voice, size, height,
              heightTarget, reset:fn, home }
     ═══════════════════════════════════════════════════════════════ */
  function toolbar(opts) {
    opts = opts || {};
    if (document.getElementById('wallToolbar')) return;
    tbOpts = opts;

    var wrap = document.createElement('div');
    wrap.id = 'wallToolbar';

    var html = ['<button id="wallTbToggle" aria-label="Teacher controls">☰</button>',
                '<div class="wall-tb-body">'];

    if (opts.menu)   html.push('<button class="wall-tb" id="wallMenu">' +
                               (t(opts.menu.label) || t(TB_TEXT.back)) + '</button>');
    if (opts.lang)   html.push('<button class="wall-tb" id="wallLang">🌐 ML</button>');
    if (opts.voice)  html.push('<button class="wall-tb" id="wallVoice">' +
                               t(TB_TEXT.voice) + '</button>');
    if (opts.size)   html.push('<div class="wall-tb-cap" data-cap="size">' +
                               t(TB_TEXT.size) + '</div>',
                               '<div class="wall-tb-row">' +
                               '<button class="wall-tb" id="wallSmaller">➖</button>' +
                               '<button class="wall-tb" id="wallBigger">➕</button></div>');
    if (opts.height) html.push('<div class="wall-tb-cap" data-cap="height">' +
                               t(TB_TEXT.height) + '</div>',
                               '<div class="wall-tb-row">' +
                               '<button class="wall-tb" id="wallUp">⬆</button>' +
                               '<button class="wall-tb" id="wallDown">⬇</button></div>');
    if (opts.reset)  html.push('<button class="wall-tb" id="wallReset">' +
                               t(TB_TEXT.reset) + '</button>');
    if (opts.home !== false)
                     html.push('<button class="wall-tb" id="wallHome">' +
                               t(TB_TEXT.home) + '</button>');
    html.push('</div>');

    wrap.innerHTML = html.join('');
    document.body.appendChild(wrap);

    var close = function () { wrap.classList.remove('open'); };

    bindTouch(document.getElementById('wallTbToggle'),
              function () { wrap.classList.toggle('open'); });

    if (opts.menu) bindTouch(document.getElementById('wallMenu'),
                             function () { close(); opts.menu.onTap && opts.menu.onTap(); });
    if (opts.lang) bindTouch(document.getElementById('wallLang'),
                             function () { setLang(!state.ml); });
    if (opts.voice) bindTouch(document.getElementById('wallVoice'),
                              function () { setVoice(!state.voice); });
    if (opts.size) {
      bindTouch(document.getElementById('wallBigger'),  function () { bumpSize(1); });
      bindTouch(document.getElementById('wallSmaller'), function () { bumpSize(-1); });
    }
    if (opts.height) {
      bindTouch(document.getElementById('wallUp'),   function () { bumpHeight(-1); });
      bindTouch(document.getElementById('wallDown'), function () { bumpHeight(1); });
    }
    if (opts.reset) bindTouch(document.getElementById('wallReset'),
                              function () { close(); opts.reset(); });
    if (opts.home !== false) bindTouch(document.getElementById('wallHome'), home);

    if (opts.heightTarget) heightTarget(opts.heightTarget);

    setLang(state.ml);
    setVoice(state.voice);
    applySize();
  }

  /* ═══════════════════════════════════════════════════════════════
     MISC
     ═══════════════════════════════════════════════════════════════ */
  function param(key) {
    return new URLSearchParams(global.location.search).get(key);
  }

  function home() { global.location.href = '../index.html'; }

  /** Shared across sec-name-id and sec-postman: the class name list. */
  var NAME_KEY = 'auticareWallNames';
  function names() {
    try { return JSON.parse(localStorage.getItem(NAME_KEY)) || []; }
    catch (e) { return []; }
  }
  function setNames(list) {
    try { localStorage.setItem(NAME_KEY, JSON.stringify(list || [])); } catch (e) {}
  }

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;
    injectFont();
    injectCSS();
    injectTouchRings();
    document.body.classList.toggle('wall-ml', state.ml);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') home();
    });
  }

  global.WALL = {
    init: init,
    bindTouch: bindTouch,
    toolbar: toolbar,

    isMl: isMl, t: t, tBoth: tBoth, setLang: setLang, onLang: onLang,
    voiceOn: voiceOn, setVoice: setVoice, onVoice: onVoice, say: say,

    scale: scale, onSize: onSize, onHeight: onHeight, heightTarget: heightTarget,

    sfx: sfx, tone: tone, noise: noise, sound: sound,
    burst: burst, burstAt: burstAt, celebrate: celebrate,

    param: param, home: home, names: names, setNames: setNames,
    SIZE_STEPS: SIZE_STEPS
  };
})(typeof window !== 'undefined' ? window : globalThis);
