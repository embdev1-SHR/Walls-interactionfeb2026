/**
 * voice-clips.js — play baked Malayalam clips instead of the device voice
 * ══════════════════════════════════════════════════════════════════════
 *
 * THE PROBLEM THIS SOLVES
 *   Every Malayalam line in this app goes through tts-engine.js to the
 *   machine's own speech engine. Windows ships no `ml-IN` voice by
 *   default. On a wall with none installed the result is either silence
 *   or an English/Hindi voice reading Malayalam script — which is worse
 *   than silence, because it teaches the wrong pronunciation.
 *
 *   This plays a clip that was rendered ahead of time instead. Same voice
 *   on every machine, correct Malayalam, and no dependency on what the
 *   operating system happens to have installed.
 *
 * ORDER OF PREFERENCE
 *   baked clip  ->  device voice  ->  silence
 *   A missing clip is NORMAL, not an error: content is written long
 *   before anyone re-runs the renderer. An unbaked line simply falls
 *   through to the device voice, exactly as before this file existed.
 *   Nothing regresses by adding it; lines only get better as they bake.
 *
 * HOW IT IS WIRED
 *   js/voice-manifest.js  (generated) maps line -> filename
 *   assets/voice/ml/*.mp3 (generated) the clips themselves
 *   wall-common.js say()  asks here first, then falls back
 *
 *   Load order in an activity:
 *     <script src="../js/tts-engine.js"></script>
 *     <script src="../js/voice-manifest.js"></script>   <!-- optional -->
 *     <script src="../js/voice-clips.js"></script>      <!-- optional -->
 *     <script src="../js/wall-common.js"></script>
 *
 *   Both voice files are optional. If neither is present WALL.say() works
 *   exactly as it does today.
 *
 * REGENERATE
 *   node scripts/voice-lines.mjs     # what has to be said
 *   python scripts/voice-bake.py     # say it  (needs Python + a GPU)
 *   node scripts/voice-lines.mjs     # again, for the coverage report
 *   See VOICE.md.
 */
(function (global) {
  'use strict';

  var DIR = '../assets/voice/ml/';
  var cache = {};        // filename -> HTMLAudioElement
  var dead = {};         // filename -> true, once it has failed to play
  var playing = null;
  var missLogged = {};

  function manifest() {
    return global.VOICE_MANIFEST || null;
  }

  /** Normalise the way the renderer did, so lookups match exactly. */
  function key(text) {
    if (text == null) return '';
    var s = String(text);
    s = s.normalize ? s.normalize('NFC') : s;
    return s.trim();
  }

  function has(text) {
    var m = manifest();
    return !!(m && m[key(text)]);
  }

  function stop() {
    if (!playing) return;
    try { playing.pause(); playing.currentTime = 0; } catch (e) {}
    playing = null;
  }

  /**
   * Play the baked clip for this line.
   * @returns {boolean} true if a clip is playing; false means the caller
   *          should fall back to the device voice.
   */
  function say(text) {
    var m = manifest();
    if (!m) return false;

    var k = key(text);
    var file = m[k];
    if (!file) {
      // one line per distinct miss — useful when checking coverage, and
      // not a flood when an activity speaks the same unbaked line often
      if (!missLogged[k]) {
        missLogged[k] = true;
        console.info('[voice] no baked clip, using device voice:', k);
      }
      return false;
    }

    /* A line can be in the manifest with no file behind it — that is the
       normal state between `voice-lines.mjs` and the next render. Without
       this, every such line would 404 and fall back on EVERY tap, adding a
       delay each time. One failure is enough to know. */
    if (dead[file]) return false;

    var el = cache[file];
    if (!el) {
      try {
        el = new Audio(DIR + file);
        el.preload = 'auto';
        cache[file] = el;
      } catch (e) { return false; }
    }

    // A child tapping twice should hear the second thing, not both.
    stop();

    try {
      el.currentTime = 0;
      var p = el.play();
      playing = el;
      if (p && p.catch) {
        p.catch(function () {
          // autoplay refusal or a file that is listed but not on disk:
          // the caller has already returned, so speak it the old way now,
          // and remember not to try this file again
          playing = null;
          dead[file] = true;
          delete cache[file];
          deviceFallback(text);
        });
      }
      return true;
    } catch (e) {
      playing = null;
      return false;
    }
  }

  /** Used only when a clip was listed but would not actually play. */
  function deviceFallback(text) {
    try {
      if (global.TTSEngine) global.TTSEngine.speak(String(text), 'ml', null);
    } catch (e) {}
  }

  /** How much of what the app says is actually baked. For the console. */
  function coverage() {
    var m = manifest();
    if (!m) return { manifest: false };
    return { manifest: true, lines: Object.keys(m).length };
  }

  global.VOICE = {
    has: has, say: say, stop: stop, coverage: coverage,
    get available() { return !!manifest(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
