/**
 * kannada-voice.js — the Kannada module speaks Kannada
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Everything said on a Kannada page is said in Kannada, in the same baked
 * female Kannada voice as the letters — never the Malayalam voice reading a
 * Kannada lesson. Two parts:
 *
 *   KN_LINES   what കുട്ടു says on Kannada pages. `kn` is spoken and shown;
 *              `mlSub` is a small Malayalam translation under it in his
 *              bubble, because the children here understand Malayalam first.
 *              (Named mlSub, not ml, on purpose: scripts/voice-lines.mjs bakes
 *              every `ml:` value in the Malayalam voice, and these are never
 *              spoken.)
 *
 *   KN_VOICE   one player for every Kannada clip — letters and lines alike —
 *              so a new sound always stops the last one and two Kannada clips
 *              never talk over each other.
 *
 * guide.js hands any line with a `kn` field to KN_VOICE.say(), so a page only
 * has to load this file and pass these lines to GUIDE.say() / GUIDE.cheer().
 *
 * RECORDING
 *   scripts/voice-bake-kn.py reads KN_LINES from this file (one line per
 *   entry, in the form below) and writes assets/voice/kn/kn_line_<id>.mp3.
 *   A Kannada speaker should check the wording before it is recorded again.
 */
(function (global) {
  'use strict';

  var LINES = [
    { id: 'hello',  kn: 'ಬನ್ನಿ, ಕನ್ನಡ ಅಕ್ಷರಗಳನ್ನು ಕಲಿಯೋಣ! ಒಂದು ಅಕ್ಷರವನ್ನು ಮುಟ್ಟಿ.', mlSub: 'വരൂ, കന്നഡ അക്ഷരങ്ങൾ പഠിക്കാം! ഒരു അക്ഷരം തൊടൂ.', en: "Come, let's learn Kannada letters! Touch a letter." },
    { id: 'vowels', kn: 'ಸ್ವರಗಳು', mlSub: 'സ്വരങ്ങൾ', en: 'Vowels' },
    { id: 'cons',   kn: 'ವ್ಯಂಜನಗಳು', mlSub: 'വ്യഞ്ജനങ്ങൾ', en: 'Consonants' },
    { id: 'all',    kn: 'ಎಲ್ಲಾ ಅಕ್ಷರಗಳನ್ನು ಕೇಳೋಣ.', mlSub: 'എല്ലാ അക്ഷരങ്ങളും കേൾക്കാം.', en: "Let's hear every letter." },
    { id: 'done',   kn: 'ಶಭಾಷ್! ಎಲ್ಲಾ ಅಕ್ಷರಗಳನ್ನು ಕೇಳಿದೆ!', mlSub: 'കൊള്ളാം! എല്ലാ അക്ഷരങ്ങളും കേട്ടു!', en: 'Well done! You heard every letter!' }
  ];

  var DIR = (/\/games\//.test(global.location ? global.location.pathname : '') ? '../' : './') + 'assets/voice/kn/';
  var BY_TEXT = {}, BY_ID = {};
  LINES.forEach(function (l) { l.clip = 'kn_line_' + l.id + '.mp3'; BY_TEXT[l.kn] = l; BY_ID[l.id] = l; });

  var current = null;

  function voiceOn() {
    try { return !global.WALL || !global.WALL.voiceOn || global.WALL.voiceOn(); } catch (e) { return true; }
  }

  function stop() {
    if (!current) return;
    try { current.pause(); } catch (e) {}
    current = null;
  }

  /**
   * Play one Kannada clip by filename. done() runs when it ends, fails, or
   * the voice is off — always exactly once, so a sequence never stalls.
   */
  function playFile(file, done) {
    stop();
    var finished = false;
    function end() { if (!finished) { finished = true; if (done) done(); } }
    if (!voiceOn()) { setTimeout(end, 700); return; }
    var a = new Audio(DIR + file);
    current = a;
    a.onended = end;
    a.onerror = function () { setTimeout(end, 700); };
    var p = a.play();
    if (p && p.catch) p.catch(function () { setTimeout(end, 700); });
    setTimeout(end, 8000);
  }

  /** Speak a KN_LINES line, by its Kannada text. false if it is not one. */
  function say(text, done) {
    var l = BY_TEXT[text];
    if (!l) { if (done) done(); return false; }
    playFile(l.clip, done);
    return true;
  }

  global.KN_LINES = BY_ID;
  global.KN_VOICE = { say: say, playFile: playFile, stop: stop, lines: LINES };
})(typeof window !== 'undefined' ? window : globalThis);
