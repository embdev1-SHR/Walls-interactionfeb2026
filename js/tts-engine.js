/**
 * TTS Engine — Natural pronunciation for English & Malayalam
 *
 * Voice priority:
 *   Malayalam : Google ml-IN > any ml-IN > any malayalam-named voice
 *   English   : Google US English > any Google en > any en-US > first voice
 *
 * Call TTSEngine.speak(text, lang, word) for single clean pronunciation.
 * Call TTSEngine.kidsYell(text, lang)    for excited multi-kid balloon-pop effect.
 */
const TTSEngine = (() => {
  const ss = window.speechSynthesis;
  if (!ss) return { speak: () => {}, kidsYell: () => {} };

  let _mlVoice  = null;
  let _enVoice  = null;
  let _loaded   = false;
  let _kidTimers = [];

  /* ── Voice loading ──────────────────────────────────────────────── */
  function _load() {
    const voices = ss.getVoices();
    if (!voices.length) return;

    // Best Malayalam voice — Google neural TTS sounds closest to a real speaker
    _mlVoice =
      voices.find(v => /google/i.test(v.name) && /^ml/i.test(v.lang)) ||
      voices.find(v => /^ml[-_]/i.test(v.lang)) ||
      voices.find(v => /malayalam/i.test(v.name)) ||
      null;  // null → browser will attempt ml-IN on its own

    // Best English voice
    _enVoice =
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => /google/i.test(v.name) && /^en/i.test(v.lang)) ||
      voices.find(v => /^en-US/i.test(v.lang)) ||
      voices.find(v => /^en/i.test(v.lang)) ||
      voices[0] || null;

    _loaded = true;
    console.log('[TTS] EN:', _enVoice?.name || 'default',
                '| ML:', _mlVoice?.name || 'attempting ml-IN without specific voice');
  }

  ss.addEventListener('voiceschanged', _load);
  _load();

  /* ── Low-level utterance ────────────────────────────────────────── */
  function _say(text, voice, lang, rate, pitch, vol) {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang   = lang;
    u.rate   = Math.max(0.1, Math.min(10, rate));
    u.pitch  = Math.max(0,   Math.min(2,  pitch));
    u.volume = Math.max(0,   Math.min(1,  vol));
    ss.speak(u);
    return u;
  }

  /* ── Public: clear educational pronunciation ───────────────────── */
  /**
   * @param {string}      text   — The letter / Malayalam char to speak first
   * @param {'en'|'ml'}   lang
   * @param {string|null} word   — Optional example word to speak after a pause
   */
  function speak(text, lang, word) {
    if (!_loaded) _load();
    ss.cancel();

    if (lang === 'ml') {
      // Speak the actual Unicode char — ml-IN TTS renders it correctly
      _say(text, _mlVoice, 'ml-IN', 0.78, 1.05, 1.0);
      if (word) setTimeout(() => _say(word, _mlVoice, 'ml-IN', 0.72, 1.05, 1.0), 650);
    } else {
      _say(text, _enVoice, 'en-US', 0.80, 1.00, 1.0);
      if (word) setTimeout(() => _say(word, _enVoice, 'en-US', 0.80, 1.00, 1.0), 480);
    }
  }

  /* ── Public: excited multi-kid yell (balloon pop) ──────────────── */
  /**
   * Queues 3 high-pitched "kid" voices with staggered timing.
   * Cancels any previous pending kid voices so only the current
   * letter's sound plays.
   *
   * @param {string}      text   — The character to yell
   * @param {'en'|'ml'}   lang
   */
  function kidsYell(text, lang) {
    if (!_loaded) _load();
    ss.cancel();

    // Clear any timers from a previous rapid pop
    _kidTimers.forEach(clearTimeout);
    _kidTimers = [];

    // Three kids — different pitches & speeds, staggered slightly
    const kids = [
      { pitch: 1.90, rate: 1.15, vol: 1.00, delay: 0   },
      { pitch: 1.55, rate: 1.00, vol: 0.82, delay: 200 },
      { pitch: 2.00, rate: 1.25, vol: 0.65, delay: 390 },
    ];

    kids.forEach(k => {
      const id = setTimeout(() => {
        if (lang === 'ml') {
          _say(text, _mlVoice, 'ml-IN', k.rate, k.pitch, k.vol);
        } else {
          _say(text, _enVoice, 'en-US', k.rate, k.pitch, k.vol);
        }
      }, k.delay);
      _kidTimers.push(id);
    });
  }

  return { speak, kidsYell };
})();
