/**
 * ambient-music.js — a calm, Japanese-style score for the loading screen and menu
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Synthesised live with Web Audio rather than played from a file. That is not
 * a shortcut; it is what makes the brief possible:
 *
 *   "anime-like … Japanese style … calm … less bass … 5.1 surround"
 *
 *   JAPANESE   The Yo scale — the bright pentatonic of Japanese folk song and a
 *              lot of Ghibli-adjacent writing: D E G A B. Every note anywhere in
 *              this file is drawn from it, so nothing can clash.
 *              A koto-style pluck carries the melody; soft pads hold the
 *              harmony; a furin (wind chime) and a breathy shakuhachi-like
 *              flute turn up now and then.
 *
 *   CALM       ~62 BPM, sparse phrases with long rests, chords that change every
 *              ~8 s, and a compressor so no single note jumps out. Generative,
 *              so it never loops audibly — a looped track is something a child
 *              who hears it every day learns to anticipate and can find
 *              distressing when it cuts off mid-phrase.
 *
 *   LESS BASS  Nothing is ever voiced below G3 (196 Hz). On top of that the
 *              master bus has a 150 Hz high-pass and a low-shelf cut, so a 5.1
 *              system's bass management finds almost nothing to send to the
 *              subwoofer. Calm on a surround rig mostly means "the sub is quiet".
 *
 *   5.1        If the output device really has six channels, the music is laid
 *              out deliberately:
 *                  front L/R   the instruments, dry
 *                  rear L/R    the reverb — the room, the air
 *                  centre      EMPTY, on purpose: that is where കുട്ടു's voice
 *                              sits, and keeping music out of it is what lets a
 *                              child hear him over the score
 *                  LFE         EMPTY
 *              On an ordinary stereo device it simply plays in stereo.
 *
 * API
 *   AMBIENT.start()      fade in (safe to call more than once)
 *   AMBIENT.stop(ms)     fade out and stop
 *   AMBIENT.duck(ms)     dip under speech for ms, then come back up
 *   AMBIENT.layout       'surround-5.1' | 'stereo' | null
 */
(function (global) {
  'use strict';

  /* ── the scale ─────────────────────────────────────────────────────────── */
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  // Yo scale on D: D E G A B. MIDI numbers.
  var D4 = 62, E4 = 64, G4 = 67, A4 = 69, B4 = 71;
  var MELODY = [D4, E4, G4, A4, B4, D4 + 12, E4 + 12, G4 + 12, A4 + 12];

  /* Pads, all voiced at or above G3 — there is no bass in this score. */
  var CHORDS = [
    [55, 62, 69, 71],   // G3 D4 A4 B4
    [59, 64, 67, 71],   // B3 E4 G4 B4
    [57, 62, 64, 69],   // A3 D4 E4 A4
    [55, 59, 64, 69]    // G3 B3 E4 A4
  ];
  /* melody notes that sit well over each chord, so phrases lean on chord tones */
  var LEANS = [
    [G4, A4, B4, D4 + 12],
    [E4, G4, B4, E4 + 12],
    [D4, E4, A4, D4 + 12],
    [E4, G4, A4, B4]
  ];

  var BEAT = 60 / 62;               // seconds
  /* Measured against the old menu.mp3: at 0.22 the score sat 14 dB below it
     (RMS -35 dBFS) — calm, but too quiet to carry across a room over a wall
     of children. 0.48 brings it to about -28 dBFS: clearly present, still
     well under speech, and the bass stays exactly as low relative to the rest
     because every filter is ahead of this gain. */
  var MASTER_LEVEL = 0.48;

  var ctx = null, master = null, bus = null, revSend = null;
  var running = false, layout = null;
  var chordIdx = 0, timers = [], padVoices = [];

  function T(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── a generated reverb: a few seconds of decaying stereo noise ────────── */
  function impulse(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    var buf = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  /* ── the signal chain ──────────────────────────────────────────────────── */
  function build() {
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    return chain(false);
  }

  /* The signal chain, on whatever context is current. forceStereo is for the
     offline preview, which renders two channels regardless of the device. */
  function chain(forceStereo) {
    // instruments mix into `bus`
    bus = ctx.createGain();

    // keep the bass out: two stacked 150 Hz high-passes (24 dB/oct) …
    var hp1 = ctx.createBiquadFilter(); hp1.type = 'highpass'; hp1.frequency.value = 150; hp1.Q.value = 0.6;
    var hp2 = ctx.createBiquadFilter(); hp2.type = 'highpass'; hp2.frequency.value = 150; hp2.Q.value = 0.6;
    // … and a gentle dip in the low-mids so the pads never feel heavy
    var shelf = ctx.createBiquadFilter(); shelf.type = 'lowshelf'; shelf.frequency.value = 260; shelf.gain.value = -5;
    // soften the very top, so the plucks are warm rather than glassy
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000; lp.Q.value = 0.5;
    // even out the dynamics: calm means nothing jumps
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -26; comp.knee.value = 18; comp.ratio.value = 3;
    comp.attack.value = 0.02; comp.release.value = 0.4;

    bus.connect(hp1); hp1.connect(hp2); hp2.connect(shelf); shelf.connect(lp); lp.connect(comp);

    master = ctx.createGain();
    master.gain.value = 0;                       // faded in by start()

    var verb = ctx.createConvolver();
    verb.buffer = impulse(3.6, 2.6);
    revSend = ctx.createGain(); revSend.gain.value = 0.55;
    var revOut = ctx.createGain(); revOut.gain.value = 0.9;
    comp.connect(revSend); revSend.connect(verb); verb.connect(revOut);

    var dry = ctx.createGain(); dry.gain.value = 1;
    comp.connect(dry);

    /* 5.1 if the device really is 5.1; otherwise stereo. */
    var dest = ctx.destination;
    var six = false;
    try { six = !forceStereo && dest.maxChannelCount >= 6; } catch (e) {}
    if (six) {
      dest.channelCount = 6;
      dest.channelCountMode = 'explicit';
      dest.channelInterpretation = 'discrete';
      var merger = ctx.createChannelMerger(6);   // L R C LFE SL SR
      var dSplit = ctx.createChannelSplitter(2);
      var rSplit = ctx.createChannelSplitter(2);
      dry.connect(dSplit); revOut.connect(rSplit);

      dSplit.connect(merger, 0, 0);              // front L: instruments
      dSplit.connect(merger, 1, 1);              // front R
      rSplit.connect(merger, 0, 4);              // rear L: the room
      rSplit.connect(merger, 1, 5);              // rear R
      // a little of the room in the front too, so the fronts are not bone-dry
      var frontAir = ctx.createGain(); frontAir.gain.value = 0.35;
      revOut.connect(frontAir);
      var faSplit = ctx.createChannelSplitter(2); frontAir.connect(faSplit);
      faSplit.connect(merger, 0, 0); faSplit.connect(merger, 1, 1);
      // channels 2 (centre) and 3 (LFE) are deliberately left unconnected

      merger.connect(master);
      layout = 'surround-5.1';
    } else {
      dry.connect(master); revOut.connect(master);
      layout = 'stereo';
    }
    master.connect(dest);
    return true;
  }

  /* a little stereo position for each sound, so the front pair has width */
  function out(node, pan) {
    if (ctx.createStereoPanner) {
      var p = ctx.createStereoPanner(); p.pan.value = pan;
      node.connect(p); p.connect(bus); return p;
    }
    node.connect(bus); return node;
  }

  /* ── instruments ───────────────────────────────────────────────────────── */

  /* Koto-style pluck: a few partials, one slightly inharmonic for the string's
     shimmer, a fast attack, an exponential ring-out, and a filter that closes
     after the pick — the brightness of a plucked string dies before its body. */
  function pluck(midi, when, level) {
    var t = when, f = hz(midi);
    var dur = Math.max(1.0, 2.2 - (midi - 60) * 0.05);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.Q.value = 1.2;
    f1.frequency.setValueAtTime(3800, t);
    f1.frequency.exponentialRampToValueAtTime(950, t + 0.45);
    f1.connect(g);

    [[1, 'triangle', 1], [2, 'sine', 0.34], [3, 'sine', 0.16], [4.07, 'sine', 0.07]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = p[1]; o.frequency.value = f * p[0];
      var pg = ctx.createGain(); pg.gain.value = p[2];
      o.connect(pg); pg.connect(f1);
      o.start(t); o.stop(t + dur + 0.05);
    });

    // the pick: a 12 ms breath of filtered noise
    var nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.012), ctx.sampleRate);
    var nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length);
    var ns = ctx.createBufferSource(); ns.buffer = nb;
    var nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 3200; nf.Q.value = 1.4;
    var ng = ctx.createGain(); ng.gain.value = level * 0.25;
    ns.connect(nf); nf.connect(ng); ng.connect(g);
    ns.start(t);

    out(g, rnd(-0.45, 0.45));
  }

  /* Soft pad: two slightly detuned voices per note, slow swell in and out. */
  function pad(chord, when, length) {
    var voices = [];
    chord.forEach(function (midi, k) {
      var f = hz(midi);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.034, when + 2.8);
      g.gain.setValueAtTime(0.034, when + length - 2.5);
      g.gain.linearRampToValueAtTime(0.0001, when + length + 0.5);
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.4;
      lp.connect(g);
      [-5, 5].forEach(function (cents) {
        var o = ctx.createOscillator(); o.type = 'triangle';
        o.frequency.value = f; o.detune.value = cents;
        o.connect(lp); o.start(when); o.stop(when + length + 0.7);
        voices.push(o);
      });
      out(g, (k / (chord.length - 1)) * 0.7 - 0.35);   // spread the chord across the front
    });
    return voices;
  }

  /* Furin — a small glass wind-chime: an inharmonic bell, long and very quiet. */
  function chime(when) {
    var base = hz(pick([E4 + 24, A4 + 24, B4 + 24, D4 + 36]));
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.03, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 4.2);
    [[1, 1], [2.76, 0.32], [5.4, 0.12]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = base * p[0];
      var pg = ctx.createGain(); pg.gain.value = p[1];
      o.connect(pg); pg.connect(g); o.start(when); o.stop(when + 4.3);
    });
    out(g, rnd(-0.8, 0.8));
  }

  /* Shakuhachi-ish: a sine with breath noise and a vibrato that arrives late,
     the way a player settles into a long note. */
  function flute(midi, when, length) {
    var f = hz(midi);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(0.05, when + 0.35);
    g.gain.setValueAtTime(0.05, when + length - 0.6);
    g.gain.linearRampToValueAtTime(0.0001, when + length);
    var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    var vib = ctx.createOscillator(); vib.frequency.value = 4.8;
    var vg = ctx.createGain();
    vg.gain.setValueAtTime(0, when);
    vg.gain.linearRampToValueAtTime(f * 0.006, when + length * 0.45);
    vib.connect(vg); vg.connect(o.frequency);
    o.connect(g); o.start(when); o.stop(when + length + 0.1);
    vib.start(when); vib.stop(when + length + 0.1);

    // breath
    var len = Math.floor(ctx.sampleRate * length);
    var nb = ctx.createBuffer(1, len, ctx.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
    var ns = ctx.createBufferSource(); ns.buffer = nb;
    var nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = f * 2; nf.Q.value = 2.5;
    var ng = ctx.createGain(); ng.gain.value = 0.18;
    ns.connect(nf); nf.connect(ng); ng.connect(g); ns.start(when);

    out(g, rnd(-0.2, 0.2));
  }

  /* ── the composition ───────────────────────────────────────────────────── */

  var CHORD_BEATS = 8;                       // ~7.7 s per chord

  function chordLoop() {
    if (!running) return;
    var now = ctx.currentTime + 0.05;
    var len = BEAT * CHORD_BEATS;
    padVoices = pad(CHORDS[chordIdx], now, len + 1.5);
    phrase(now + rnd(0.4, 1.4), chordIdx, len - 1.2);
    if (Math.random() < 0.55) chime(now + rnd(1, len - 1));
    if (Math.random() < 0.18) flute(pick([A4, B4, D4 + 12]), now + rnd(1.5, 3), rnd(2.4, 3.4));
    chordIdx = (chordIdx + 1) % CHORDS.length;
    T(chordLoop, len * 1000);
  }

  /* A melody phrase over one chord: a few notes walking mostly by step through
     the scale, leaning on chord tones, then a rest. Sometimes it rests the whole
     bar — silence is part of what makes it calm. */
  function phrase(start, ci, room) {
    if (Math.random() < 0.22) return;        // a bar of pads only
    var t = start, end = start + room;
    var idx = MELODY.indexOf(pick(LEANS[ci]));
    if (idx < 0) idx = 2;
    var notes = 3 + Math.floor(Math.random() * 4);
    for (var n = 0; n < notes && t < end; n++) {
      pluck(MELODY[idx], t, n === 0 ? 0.17 : rnd(0.11, 0.15));
      // a soft echo an octave up on the first note, the way koto players often ornament
      if (n === 0 && Math.random() < 0.35 && idx + 5 < MELODY.length) pluck(MELODY[idx + 5], t + 0.09, 0.06);
      t += BEAT * pick([0.5, 1, 1, 1, 1.5, 2]);
      idx = Math.max(0, Math.min(MELODY.length - 1, idx + pick([-2, -1, -1, 1, 1, 2])));
    }
  }

  /* ── public ────────────────────────────────────────────────────────────── */

  function start() {
    if (running) return;
    if (!ctx && !build()) return;
    running = true;
    if (ctx.state === 'suspended') ctx.resume().catch(function () {});
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(MASTER_LEVEL, t + 3.5);
    chordLoop();
  }

  function stop(ms) {
    if (!ctx || !running) return;
    running = false;
    timers.forEach(clearTimeout); timers = [];
    var t = ctx.currentTime, fade = (ms == null ? 1200 : ms) / 1000;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.0001, t + fade);
  }

  /* Dip under speech. Used when കുട്ടു talks: the review of the Alphabet
     Explorer found background music drowning the letter audio, and a guide
     whose voice sits under the score has the same problem. */
  var duckTimer = null;
  function duck(ms) {
    if (!ctx || !running) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(MASTER_LEVEL * 0.32, t + 0.25);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(function () {
      if (!running) return;
      var t2 = ctx.currentTime;
      master.gain.cancelScheduledValues(t2);
      master.gain.setValueAtTime(master.gain.value, t2);
      master.gain.linearRampToValueAtTime(MASTER_LEVEL, t2 + 1.4);
    }, Math.max(600, ms || 2500));
  }

  /**
   * Render `seconds` of the score offline, in stereo, and resolve with the
   * AudioBuffer. For auditioning and measuring — it never touches the live
   * output, and it refuses to run while the live score is playing, because it
   * borrows the same instrument code by swapping the current context.
   */
  function renderPreview(seconds) {
    var OAC = global.OfflineAudioContext || global.webkitOfflineAudioContext;
    if (!OAC) return Promise.reject(new Error('no OfflineAudioContext'));
    if (running) return Promise.reject(new Error('stop the live score first'));
    var saved = { ctx: ctx, bus: bus, master: master, revSend: revSend, layout: layout };
    var rate = 44100;
    ctx = new OAC(2, Math.ceil(rate * (seconds + 4)), rate);   // +4 s for the tail
    chain(true);
    master.gain.value = MASTER_LEVEL;
    var len = BEAT * CHORD_BEATS, t = 0.1, ci = 0;
    while (t < seconds) {
      pad(CHORDS[ci], t, len + 1.5);
      phrase(t + rnd(0.4, 1.4), ci, len - 1.2);
      if (Math.random() < 0.55) chime(t + rnd(1, len - 1));
      if (Math.random() < 0.18) flute(pick([A4, B4, D4 + 12]), t + rnd(1.5, 3), rnd(2.4, 3.4));
      ci = (ci + 1) % CHORDS.length; t += len;
    }
    var rendering = ctx.startRendering();
    ctx = saved.ctx; bus = saved.bus; master = saved.master;
    revSend = saved.revSend; layout = saved.layout;
    return rendering;
  }

  /* If the platform blocks audio until a gesture, the first touch starts it. */
  function resumeOnTouch() {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});
  }
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, resumeOnTouch, true);
  });

  global.AMBIENT = {
    start: start, stop: stop, duck: duck, renderPreview: renderPreview,
    get layout() { return layout; },
    get running() { return running; },
    get state() { return ctx ? ctx.state : 'none'; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
