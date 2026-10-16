/**
 * wall-settings.js — one language and one voice for the whole wall
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The teacher picks, once, on the main menu:
 *   · LANGUAGE   English, हिन्दी, മലയാളം or ಕನ್ನಡ — Owly, the menu and every
 *                activity follow it. ENGLISH ON EVERY LAUNCH (kept in
 *                sessionStorage, which Electron clears when the app closes).
 *   · VOLUME     everything the wall plays: voices, music, sound effects.
 *   · SPEED      how fast voices speak — never music.
 *   · PITCH      how high voices sound — independently of speed.
 * Volume, speed and pitch are remembered between launches (localStorage):
 * they describe the room and its speakers, not the session.
 *
 * Load it FIRST on every page, before tts-engine.js:
 *     <script src="../js/i18n-data.js"></script>
 *     <script src="../js/wall-settings.js"></script>
 *
 * HOW ONE SETTING REACHES 77 PAGES WITHOUT EDITING THEM
 *   It sits underneath the three ways the wall makes sound and adjusts each
 *   on the way out, so no activity needs to know it exists:
 *     speechSynthesis.speak()   device voices: rate, pitch, volume scaled
 *     HTMLMediaElement.play()   every <audio>/Audio(): volume scaled; baked
 *                               voice clips also get speed and pitch
 *     AudioContext.destination  Web Audio (effects, the menu score): routed
 *                               through one master gain
 *   And it translates: WALL.t(), WALL.say() and Owly ask tr() for the line in
 *   the chosen language (content/i18n tables, keyed by the English).
 *
 * SPEED AND PITCH WITHOUT CHIPMUNKS
 *   Changing playbackRate alone ties pitch to speed. Instead a baked clip is
 *   pitch-shifted once, offline (resample by p: higher and p× shorter), and
 *   then played with the browser's own time-stretch (preservesPitch) at
 *   speed/p — which restores the length the SPEED slider asked for while
 *   keeping the new pitch. Each (clip, pitch) is rendered once and cached.
 */
(function (global) {
  'use strict';

  var LANGS = [
    { code: 'en', native: 'English',  en: 'English',   bcp: 'en-IN' },
    { code: 'hi', native: 'हिन्दी',     en: 'Hindi',     bcp: 'hi-IN' },
    { code: 'ml', native: 'മലയാളം',   en: 'Malayalam', bcp: 'ml-IN' },
    { code: 'kn', native: 'ಕನ್ನಡ',     en: 'Kannada',   bcp: 'kn-IN' }
  ];
  var CODES = LANGS.map(function (l) { return l.code; });
  var LANG_KEY = 'auticareLang';             // sessionStorage: English each launch
  var VOICE_KEY = 'auticareVoiceSettings';   // localStorage: the room's preference
  var DEFAULTS = { volume: 0.9, speed: 1.0, pitch: 1.0 };
  var RANGE = { volume: [0, 1], speed: [0.6, 1.4], pitch: [0.75, 1.3] };

  /* What Owly says when the language changes, and when the teacher tests the
     voice. Plain { en, ml } pairs, so the voice scripts collect and bake them
     in all four languages like every other line. */
  var LINES = {
    hello: { en: "Hello! Let's talk together!", ml: 'നമസ്കാരം! നമുക്ക് ഒരുമിച്ച് സംസാരിക്കാം!' },
    test:  { en: 'This is my voice. Is it nice?', ml: 'ഇതാണ് എന്റെ ശബ്ദം. നല്ലതാണോ?' }
  };

  function clamp(v, k) { return Math.max(RANGE[k][0], Math.min(RANGE[k][1], v)); }

  /* ── state ─────────────────────────────────────────────────────────── */
  var voice = (function () {
    var v = {};
    try { v = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}') || {}; } catch (e) {}
    var out = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      out[k] = typeof v[k] === 'number' && isFinite(v[k]) ? clamp(v[k], k) : DEFAULTS[k];
    });
    return out;
  })();
  var lang = (function () {
    var l = null;
    try { l = sessionStorage.getItem(LANG_KEY); } catch (e) {}
    return CODES.indexOf(l) !== -1 ? l : 'en';
  })();

  var listeners = [];
  function fire(what) {
    listeners.forEach(function (cb) { try { cb(what, get()); } catch (e) {} });
  }
  function get() {
    return { lang: lang, volume: voice.volume, speed: voice.speed, pitch: voice.pitch };
  }
  function onChange(cb) { listeners.push(cb); }

  function setLang(code) {
    if (CODES.indexOf(code) === -1 || code === lang) return;
    lang = code;
    try { sessionStorage.setItem(LANG_KEY, code); } catch (e) {}
    try { document.documentElement.lang = code; } catch (e) {}
    fire('lang');
  }
  function cycleLang() { setLang(CODES[(CODES.indexOf(lang) + 1) % CODES.length]); }

  function setVoice(patch) {
    Object.keys(patch || {}).forEach(function (k) {
      if (k in DEFAULTS && typeof patch[k] === 'number') voice[k] = clamp(patch[k], k);
    });
    try { localStorage.setItem(VOICE_KEY, JSON.stringify(voice)); } catch (e) {}
    applyMasterGain();
    fire('voice');
  }
  function resetVoice() { setVoice(DEFAULTS); }

  /* ── translation ───────────────────────────────────────────────────── */
  function tables() { return global.I18N_TABLES || {}; }
  function mlToEn() { return global.I18N_ML_EN || {}; }

  /** The English a line is keyed by, whatever shape it arrived in. */
  function englishOf(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return mlToEn()[obj] || obj;
    return obj.en || obj.name || obj.word || (obj.ml && mlToEn()[obj.ml]) || '';
  }

  /**
   * tr({en, ml}) / tr('Rose') / tr('റോസ്') -> the line in the chosen language.
   * A line with no translation shows its English (Malayalam if it has no
   * English either) — never blank.
   */
  function tr(obj, code) {
    var L = code || lang;
    if (obj == null) return '';
    if (typeof obj === 'string') {
      var en = mlToEn()[obj];
      if (en) return tr({ en: en, ml: obj }, L);
      if (L === 'en' || L === 'ml') return obj;
      var t = tables()[L];
      return (t && t[obj]) || obj;
    }
    if (obj[L]) return obj[L];
    var key = englishOf(obj);
    if (L === 'ml') return obj.ml || key;
    if (L === 'en') return key || obj.ml || '';
    var tab = tables()[L];
    return (tab && key && tab[key]) || key || obj.ml || '';
  }

  /* ── 1. device voices ──────────────────────────────────────────────── */
  var ss = global.speechSynthesis;
  if (ss && !ss.__wallSettings) {
    var origSpeak = ss.speak.bind(ss);
    ss.speak = function (u) {
      try {
        if (u && !u.__adjusted) {
          u.__adjusted = true;
          u.rate = Math.max(0.1, Math.min(10, (u.rate || 1) * voice.speed));
          u.pitch = Math.max(0, Math.min(2, (u.pitch || 1) * voice.pitch));
          u.volume = Math.max(0, Math.min(1, (u.volume == null ? 1 : u.volume) * voice.volume));
        }
      } catch (e) {}
      return origSpeak(u);
    };
    ss.__wallSettings = true;
  }

  /** Speak with a device voice in a language tts-engine.js does not cover.
      Hindi and Kannada voices are rarely installed on Windows; without one
      this stays SILENT rather than letting an English voice mangle the script. */
  function deviceSpeak(text, code) {
    if (!ss || !text) return false;
    var info = LANGS.filter(function (l) { return l.code === code; })[0];
    var vs = ss.getVoices() || [];
    var v = vs.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(code) === 0; })[0];
    if (!v) return false;
    try {
      ss.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = info ? info.bcp : code; u.rate = 0.8;
      ss.speak(u);
      return true;
    } catch (e) { return false; }
  }

  /* ── 2. media elements ─────────────────────────────────────────────── */
  var VOICE_PATH = /\/assets\/voice\//;
  var pitched = {};              // src + '|' + pitch -> blob URL (or a Promise of one)

  function isVoice(el) { return VOICE_PATH.test(el.__wallSrc || el.currentSrc || el.src || ''); }

  /* `volume` itself is wrapped: a page that sets el.volume = 0.3 (a fade, a
     quieter effect) reads back 0.3, and the speaker gets 0.3 × master. */
  var MPV = global.HTMLMediaElement && global.HTMLMediaElement.prototype;
  var volDesc = MPV && Object.getOwnPropertyDescriptor(MPV, 'volume');
  if (volDesc && volDesc.set && !MPV.__wallVolume) {
    MPV.__wallVolume = true;
    Object.defineProperty(MPV, 'volume', {
      configurable: true,
      get: function () { return this.__wallBaseVol == null ? volDesc.get.call(this) : this.__wallBaseVol; },
      set: function (v) {
        this.__wallBaseVol = v;
        volDesc.set.call(this, Math.max(0, Math.min(1, v * voice.volume)));
      }
    });
  }
  function applyVolume(el) {
    if (!volDesc) return;
    var base = el.__wallBaseVol == null ? 1 : el.__wallBaseVol;
    try { volDesc.set.call(el, Math.max(0, Math.min(1, base * voice.volume))); } catch (e) {}
  }

  function wavBlob(buf) {
    var ch = buf.numberOfChannels, len = buf.length, rate = buf.sampleRate;
    var data = new DataView(new ArrayBuffer(44 + len * ch * 2));
    function str(o, s) { for (var i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); data.setUint32(4, 36 + len * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
    data.setUint32(24, rate, true); data.setUint32(28, rate * ch * 2, true);
    data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true); str(36, 'data');
    data.setUint32(40, len * ch * 2, true);
    var chans = []; for (var c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    var o = 44;
    for (var i = 0; i < len; i++) for (c = 0; c < ch; c++) {
      var s = Math.max(-1, Math.min(1, chans[c][i]));
      data.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); o += 2;
    }
    return URL.createObjectURL(new Blob([data], { type: 'audio/wav' }));
  }

  /** The clip at `src`, shifted to `p` × its pitch (and p× shorter). */
  function pitchedUrl(src, p) {
    var k = src + '|' + p.toFixed(3);
    if (pitched[k]) return Promise.resolve(pitched[k]);
    return new Promise(function (res, rej) {
      var x = new XMLHttpRequest();
      x.open('GET', src); x.responseType = 'arraybuffer';
      x.onload = function () {
        var AC = global.AudioContext || global.webkitAudioContext;
        var dec = new AC();
        dec.decodeAudioData(x.response, function (b) {
          try { dec.close(); } catch (e) {}
          var outLen = Math.ceil(b.length / p);
          var off = new OfflineAudioContext(b.numberOfChannels, outLen, b.sampleRate);
          var s = off.createBufferSource();
          s.buffer = b; s.playbackRate.value = p;
          s.connect(realDestination(off)); s.start();
          off.startRendering().then(function (r) { res(pitched[k] = wavBlob(r)); }, rej);
        }, rej);
      };
      x.onerror = rej;
      x.send();
    });
  }

  /** Point a voice clip at the right rendering and rate for the current
      speed/pitch. Resolves when it is ready to play. */
  function prepareVoice(el) {
    if (!el.__wallSrc) el.__wallSrc = el.currentSrc || el.src;
    var p = voice.pitch, s = voice.speed, src = el.__wallSrc;
    function rate(r) {
      try { el.preservesPitch = true; } catch (e) {}
      el.defaultPlaybackRate = r; el.playbackRate = r;
    }
    if (Math.abs(p - 1) < 0.01) {
      if (el.src !== src) el.src = src;
      rate(s);
      return Promise.resolve();
    }
    return pitchedUrl(src, p).then(function (url) {
      if (el.src !== url) el.src = url;
      rate(s / p);
    }, function () {                      // could not render: play it unpitched
      if (el.src !== src) el.src = src;
      rate(s);
    });
  }

  var MP = global.HTMLMediaElement && global.HTMLMediaElement.prototype;
  if (MP && !MP.__wallSettings) {
    var origPlay = MP.play;
    MP.play = function () {
      var el = this;
      applyVolume(el);
      if (!isVoice(el)) return origPlay.apply(el, arguments);
      return prepareVoice(el).then(function () { return origPlay.call(el); });
    };
    MP.__wallSettings = true;
  }

  /* ── 3. Web Audio: one master gain in front of every destination ───── */
  var BAC = global.BaseAudioContext || global.AudioContext;
  var destDesc = BAC && Object.getOwnPropertyDescriptor(BAC.prototype, 'destination');
  var masters = [];
  function realDestination(ctx) { return destDesc ? destDesc.get.call(ctx) : ctx.destination; }

  if (destDesc && destDesc.get && !BAC.prototype.__wallSettings) {
    BAC.prototype.__wallSettings = true;
    Object.defineProperty(BAC.prototype, 'destination', {
      configurable: true,
      get: function () {
        var ctx = this;
        if (global.OfflineAudioContext && ctx instanceof global.OfflineAudioContext) return realDestination(ctx);
        if (ctx.__wallMaster) return ctx.__wallMaster;
        var real = realDestination(ctx);
        var g = ctx.createGain();
        g.gain.value = voice.volume;
        g.connect(real);
        /* Pages talk to "the destination" — the 5.1 score sets its channel
           count and reads its maximum. Pass those through to the real one so
           surround keeps working behind the volume control. */
        ['channelCount', 'channelCountMode', 'channelInterpretation'].forEach(function (p) {
          var d = Object.getOwnPropertyDescriptor(AudioNode.prototype, p);
          Object.defineProperty(g, p, {
            configurable: true,
            get: function () { return d.get.call(real); },
            set: function (v) { try { d.set.call(real, v); } catch (e) {} try { d.set.call(g, v); } catch (e) {} }
          });
        });
        Object.defineProperty(g, 'maxChannelCount', { get: function () { return real.maxChannelCount; } });
        ctx.__wallMaster = g;
        masters.push(g);
        return g;
      }
    });
  }

  function applyMasterGain() {
    masters.forEach(function (g) {
      try { g.gain.setTargetAtTime(voice.volume, g.context.currentTime, 0.05); } catch (e) {}
    });
    // already-playing media elements follow the slider live
    try {
      [].forEach.call(document.querySelectorAll('audio,video'), applyVolume);
    } catch (e) {}
  }

  global.WALL_SETTINGS = {
    LANGS: LANGS, LINES: LINES, RANGE: RANGE, DEFAULTS: DEFAULTS,
    get: get, onChange: onChange,
    lang: function () { return lang; },
    setLang: setLang, cycleLang: cycleLang,
    setVoice: setVoice, resetVoice: resetVoice,
    tr: tr, englishOf: englishOf,
    deviceSpeak: deviceSpeak,
    bcp: function (code) { var l = LANGS.filter(function (x) { return x.code === (code || lang); })[0]; return l ? l.bcp : 'en-IN'; }
  };
  try { document.documentElement.lang = lang; } catch (e) {}
})(typeof window !== 'undefined' ? window : globalThis);
