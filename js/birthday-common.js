/**
 * birthday-common.js — shared furniture for the six Birthday modules
 * ══════════════════════════════════════════════════════════════════
 *
 * The Vocational brief's items 3–8 are one continuous birthday party:
 * decorate the room, hand over a card, match the party cap, cut and
 * share the cake, take a photo, craft a card. All six ask for the same
 * three things, so they live here once:
 *
 *   1. "Instrumental Happy Birthday plays continuously"
 *   2. "background song volume auto-ducks by 50% for 1 second to play
 *       the item's unique placement sound"
 *   3. a Play/Pause/Mute control in the corner
 *
 * THE MUSIC IS SYNTHESIZED, AND THAT IS DELIBERATE
 *   "Happy Birthday to You" entered the public domain in 2016 when the
 *   Warner/Chappell claim was ruled invalid, so the melody itself is free
 *   to use — but any *recording* you download still carries its own
 *   separate copyright. Synthesizing the melody in Web Audio sidesteps
 *   that entirely, works offline, and means all six modules have music
 *   today with zero files delivered.
 *
 *   Drop a real instrumental at ../assets/new/audio/happy-birthday.mp3
 *   and it takes over automatically.
 *
 * REQUIRES js/wall-common.js
 */
(function (global) {
  'use strict';

  var W = global.WALL;

  /* ══════════════════════════════════════════════════════════════
     THE MELODY — [frequency, beats]
     Happy Birthday in C major. Public domain since 2016.
     ══════════════════════════════════════════════════════════════ */
  var G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25,
      D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;

  var TUNE = [
    [G4, .5], [G4, .5], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
    [G4, .5], [G4, .5], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
    [G4, .5], [G4, .5], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
    [F5, .5], [F5, .5], [E5, 1], [C5, 1], [D5, 1], [C5, 2.5]
  ];
  var BEAT = 0.42;                       // seconds per beat

  var state = {
    on: false, muted: false,
    file: null, fileOk: false,
    timer: null, gain: 1
  };

  /* try a real recording first; fall back to the synth */
  (function probeFile() {
    try {
      state.file = new Audio('../assets/new/audio/happy-birthday.mp3');
      state.file.loop = true;
      state.file.preload = 'auto';
      state.file.addEventListener('canplaythrough', function () { state.fileOk = true; });
      state.file.addEventListener('error', function () { state.fileOk = false; });
    } catch (e) { state.file = null; }
  })();

  function vol() { return state.muted ? 0 : 0.055 * state.gain; }

  /** Schedule one pass of the melody, then queue the next. */
  function playPass() {
    if (!state.on || state.fileOk) return;
    var t = 0;
    TUNE.forEach(function (n) {
      var dur = n[1] * BEAT;
      var v = vol();
      if (v > 0) {
        // a soft two-oscillator tone so it reads as an instrument, not a beep
        W.tone(n[0], dur * 0.92, 'triangle', v, t);
        W.tone(n[0] * 2, dur * 0.7, 'sine', v * 0.28, t);
      }
      t += dur;
    });
    state.timer = setTimeout(playPass, (t + 1.1) * 1000);
  }

  function start() {
    if (state.on) return;
    state.on = true;
    if (state.fileOk && state.file) {
      try { state.file.volume = state.muted ? 0 : 0.4; state.file.play().catch(function () {}); }
      catch (e) {}
    } else {
      playPass();
    }
    paintBtn();
  }

  function stop() {
    state.on = false;
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    if (state.file) { try { state.file.pause(); } catch (e) {} }
    paintBtn();
  }

  function toggle() { state.on ? stop() : start(); }

  function setMuted(m) {
    state.muted = !!m;
    if (state.file) { try { state.file.volume = state.muted ? 0 : 0.4; } catch (e) {} }
    paintBtn();
  }

  /**
   * The brief, five separate times: duck the music while a placement
   * sound plays, then bring it back.
   */
  function duck(ms) {
    state.gain = 0.5;
    if (state.file && state.fileOk) {
      try { state.file.volume = state.muted ? 0 : 0.2; } catch (e) {}
    }
    setTimeout(function () {
      state.gain = 1;
      if (state.file && state.fileOk) {
        try { state.file.volume = state.muted ? 0 : 0.4; } catch (e) {}
      }
    }, ms || 1000);
  }

  /** Music swells for the finale. */
  function swell(ms) {
    state.gain = 1.9;
    if (state.file && state.fileOk) {
      try { state.file.volume = state.muted ? 0 : 0.85; } catch (e) {}
    }
    setTimeout(function () {
      state.gain = 1;
      if (state.file && state.fileOk) {
        try { state.file.volume = state.muted ? 0 : 0.4; } catch (e) {}
      }
    }, ms || 5000);
  }

  /* ══════════════════════════════════════════════════════════════
     PLACEMENT SOUNDS — each one the brief names, synthesized
     ══════════════════════════════════════════════════════════════ */
  var sfx = {
    /** balloon tying onto a hook: pop then chime */
    balloonPop: function () {
      duck(900);
      W.tone(180, 0.06, 'square', 0.16);
      W.tone(1046, 0.16, 'triangle', 0.10, 0.06);
      W.tone(1568, 0.22, 'sine', 0.07, 0.13);
    },
    /** ribbon draping across a wall: a swish */
    ribbonSwish: function () {
      duck(900);
      W.noise(0.45, 0.06, 0.16);
      W.tone(900, 0.28, 'sine', 0.05, 0.05);
    },
    /** table locking to the floor: a solid thud-pop */
    thudPop: function () {
      duck(900);
      W.tone(90, 0.20, 'sine', 0.20);
      W.tone(150, 0.10, 'triangle', 0.10, 0.05);
    },
    /** cake onto the table: a sweet chime */
    sweetChime: function () {
      duck(900);
      [784, 988, 1319].forEach(function (f, i) {
        W.tone(f, 0.30, 'triangle', 0.11, i * 0.07);
      });
    },
    /** candle lighting: a sparkler fizz */
    sparklerFizz: function () {
      duck(900);
      W.noise(0.5, 0.05, 0.22);
      W.tone(2200, 0.24, 'sine', 0.05, 0.05);
    },
    /** card or paper moving hand to hand */
    paperSwish: function () {
      duck(800);
      W.noise(0.32, 0.05, 0.12);
    },
    /** wrong hat: a silly spring */
    boing: function () {
      W.tone(520, 0.10, 'sine', 0.10, 0.00);
      W.tone(300, 0.12, 'sine', 0.09, 0.09);
      W.tone(430, 0.14, 'sine', 0.07, 0.19);
    },
    /** knife through the cake */
    slice: function () {
      duck(800);
      W.noise(0.22, 0.045, 0.07);
      W.tone(1400, 0.20, 'sine', 0.06, 0.04);
    },
    /** camera shutter */
    shutter: function () {
      duck(800);
      W.noise(0.05, 0.22, 0.012);
      W.noise(0.06, 0.16, 0.014, 0.07);
    },
    /** sticker pressing onto card */
    stick: function () {
      duck(700);
      W.tone(680, 0.07, 'sine', 0.09);
      W.tone(1100, 0.09, 'triangle', 0.05, 0.05);
    },
    /** the card's magical transformation */
    magic: function () {
      [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) {
        W.tone(f, 0.34, 'triangle', 0.09, i * 0.06);
      });
      W.noise(0.6, 0.04, 0.25, 0.2);
    },
    /** party horn for the finale */
    partyHorn: function () {
      W.tone(440, 0.10, 'sawtooth', 0.10, 0.00);
      W.tone(660, 0.34, 'sawtooth', 0.11, 0.08);
    },
    /** the brief's longer cheer — used at the big finales */
    cheer: function (secs) {
      secs = secs || 3;
      var n = Math.round(secs / 0.16);
      for (var k = 0; k < n; k++) {
        W.noise(0.26, 0.055 + Math.random() * 0.03, 0.05, k * 0.16);
      }
    }
  };

  /* ══════════════════════════════════════════════════════════════
     THE CORNER CONTROL — "[▶ Play Song] / Pause / Mute"
     ══════════════════════════════════════════════════════════════ */
  var btn = null, muteBtn = null;

  function injectCSS() {
    if (document.getElementById('bday-style')) return;
    var s = document.createElement('style');
    s.id = 'bday-style';
    s.textContent = [
      '#bdayBar{position:fixed;top:10px;right:64px;z-index:620;display:flex;gap:8px}',
      '.bday-btn{padding:10px 18px;border-radius:16px;border:3px solid #f9a8d4;',
      '  background:linear-gradient(135deg,#fce7f3,#fbcfe8);color:#831843;',
      '  font-family:inherit;font-weight:900;font-size:15px;cursor:pointer;',
      '  touch-action:manipulation;white-space:nowrap}',
      '.bday-btn:active{transform:scale(.94)}',
      '.bday-btn.on{background:linear-gradient(135deg,#bbf7d0,#4ade80);border-color:#22c55e;color:#052e16}',
      '.bday-btn.off{opacity:.5}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function paintBtn() {
    if (!btn) return;
    var ml = W.isMl();
    btn.textContent = state.on
      ? (ml ? '⏸ പാട്ട് നിർത്തൂ' : '⏸ Pause Song')
      : (ml ? '▶ പാട്ട് വെക്കൂ' : '▶ Play Song');
    btn.classList.toggle('on', state.on);
    if (muteBtn) {
      muteBtn.textContent = state.muted ? '🔇' : '🔊';
      muteBtn.classList.toggle('off', state.muted);
    }
  }

  function controls(opts) {
    injectCSS();
    opts = opts || {};
    if (document.getElementById('bdayBar')) return;
    var bar = document.createElement('div');
    bar.id = 'bdayBar';

    btn = document.createElement('button');
    btn.className = 'bday-btn';
    W.bindTouch(btn, toggle);
    bar.appendChild(btn);

    muteBtn = document.createElement('button');
    muteBtn.className = 'bday-btn';
    W.bindTouch(muteBtn, function () { setMuted(!state.muted); });
    bar.appendChild(muteBtn);

    document.body.appendChild(bar);
    paintBtn();
    W.onLang(paintBtn);

    // the brief has the song already playing when the screen loads
    if (opts.autoplay !== false) start();
  }

  /**
   * The brief's finale, used by every one of the six modules:
   * confetti + balloons, the song swells, and a cheer plays.
   */
  function finale(secs) {
    swell(5000);
    W.celebrate();
    sfx.partyHorn();
    sfx.cheer(secs || 3);
  }

  global.BDAY = {
    start: start, stop: stop, toggle: toggle, setMuted: setMuted,
    duck: duck, swell: swell, finale: finale,
    controls: controls, sfx: sfx,
    usingRealFile: function () { return state.fileOk; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
