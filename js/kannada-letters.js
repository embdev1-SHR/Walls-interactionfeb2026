/**
 * kannada-letters.js — the Kannada alphabet (ವರ್ಣಮಾಲೆ), letters only
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The 49 letters as Karnataka schools teach them: 13 vowels (ಸ್ವರಗಳು),
 * the 2 yogavahas (ಅಂ ಅಃ), and 34 consonants (ವ್ಯಂಜನಗಳು) in their five
 * vargas plus the nine avargiya letters. Letters only, no words yet — the
 * module starts with the alphabet on its own, as asked.
 *
 * ONE SOURCE FOR TWO READERS
 *   games/kannada-alphabets.html shows these, and scripts/voice-bake-kn.py
 *   reads this same file to know what to record. Each letter's clip is
 *   assets/voice/kn/kn_<id>.mp3, so the id is the contract between them —
 *   keep ids stable, and keep one letter per line in the form below, which
 *   is what the baker's pattern expects.
 *
 * THE MALAYALAM TWIN
 *   Kannada and Malayalam sit at the same offsets in their Unicode blocks
 *   (ಕ U+0C95 ↔ ക U+0D15), and the letters are the same sounds. The page
 *   shows each Kannada letter's Malayalam twin, because the children at the
 *   centre read Malayalam first — "this is your ക, written the Kannada way"
 *   is the shortest bridge there is. It is computed, not typed, so it cannot
 *   drift from the letter it belongs to.
 */
(function (global) {
  'use strict';

  var LETTERS = [
    // ಸ್ವರಗಳು — vowels
    { id: 'a',    l: 'ಅ',  r: 'a',   g: 'vowel' },
    { id: 'aa',   l: 'ಆ',  r: 'ā',   g: 'vowel' },
    { id: 'i',    l: 'ಇ',  r: 'i',   g: 'vowel' },
    { id: 'ii',   l: 'ಈ',  r: 'ī',   g: 'vowel' },
    { id: 'u',    l: 'ಉ',  r: 'u',   g: 'vowel' },
    { id: 'uu',   l: 'ಊ',  r: 'ū',   g: 'vowel' },
    { id: 'ru',   l: 'ಋ',  r: 'ṛ',   g: 'vowel' },
    { id: 'e',    l: 'ಎ',  r: 'e',   g: 'vowel' },
    { id: 'ee',   l: 'ಏ',  r: 'ē',   g: 'vowel' },
    { id: 'ai',   l: 'ಐ',  r: 'ai',  g: 'vowel' },
    { id: 'o',    l: 'ಒ',  r: 'o',   g: 'vowel' },
    { id: 'oo',   l: 'ಓ',  r: 'ō',   g: 'vowel' },
    { id: 'au',   l: 'ಔ',  r: 'au',  g: 'vowel' },
    // ಯೋಗವಾಹಗಳು — taught with the vowels
    { id: 'am',   l: 'ಅಂ', r: 'aṁ',  g: 'vowel' },
    { id: 'ah',   l: 'ಅಃ', r: 'aḥ',  g: 'vowel' },

    // ವ್ಯಂಜನಗಳು — consonants, five vargas
    { id: 'ka',   l: 'ಕ',  r: 'ka',  g: 'consonant' },
    { id: 'kha',  l: 'ಖ',  r: 'kha', g: 'consonant' },
    { id: 'ga',   l: 'ಗ',  r: 'ga',  g: 'consonant' },
    { id: 'gha',  l: 'ಘ',  r: 'gha', g: 'consonant' },
    { id: 'nga',  l: 'ಙ',  r: 'ṅa',  g: 'consonant' },
    { id: 'cha',  l: 'ಚ',  r: 'ca',  g: 'consonant' },
    { id: 'chha', l: 'ಛ',  r: 'cha', g: 'consonant' },
    { id: 'ja',   l: 'ಜ',  r: 'ja',  g: 'consonant' },
    { id: 'jha',  l: 'ಝ',  r: 'jha', g: 'consonant' },
    { id: 'nya',  l: 'ಞ',  r: 'ña',  g: 'consonant' },
    { id: 'tta',  l: 'ಟ',  r: 'ṭa',  g: 'consonant' },
    { id: 'ttha', l: 'ಠ',  r: 'ṭha', g: 'consonant' },
    { id: 'dda',  l: 'ಡ',  r: 'ḍa',  g: 'consonant' },
    { id: 'ddha', l: 'ಢ',  r: 'ḍha', g: 'consonant' },
    { id: 'nna',  l: 'ಣ',  r: 'ṇa',  g: 'consonant' },
    { id: 'ta',   l: 'ತ',  r: 'ta',  g: 'consonant' },
    { id: 'tha',  l: 'ಥ',  r: 'tha', g: 'consonant' },
    { id: 'da',   l: 'ದ',  r: 'da',  g: 'consonant' },
    { id: 'dha',  l: 'ಧ',  r: 'dha', g: 'consonant' },
    { id: 'na',   l: 'ನ',  r: 'na',  g: 'consonant' },
    { id: 'pa',   l: 'ಪ',  r: 'pa',  g: 'consonant' },
    { id: 'pha',  l: 'ಫ',  r: 'pha', g: 'consonant' },
    { id: 'ba',   l: 'ಬ',  r: 'ba',  g: 'consonant' },
    { id: 'bha',  l: 'ಭ',  r: 'bha', g: 'consonant' },
    { id: 'ma',   l: 'ಮ',  r: 'ma',  g: 'consonant' },
    // ಅವರ್ಗೀಯ ವ್ಯಂಜನಗಳು
    { id: 'ya',   l: 'ಯ',  r: 'ya',  g: 'consonant' },
    { id: 'ra',   l: 'ರ',  r: 'ra',  g: 'consonant' },
    { id: 'la',   l: 'ಲ',  r: 'la',  g: 'consonant' },
    { id: 'va',   l: 'ವ',  r: 'va',  g: 'consonant' },
    { id: 'sha',  l: 'ಶ',  r: 'śa',  g: 'consonant' },
    { id: 'ssa',  l: 'ಷ',  r: 'ṣa',  g: 'consonant' },
    { id: 'sa',   l: 'ಸ',  r: 'sa',  g: 'consonant' },
    { id: 'ha',   l: 'ಹ',  r: 'ha',  g: 'consonant' },
    { id: 'lla',  l: 'ಳ',  r: 'ḷa',  g: 'consonant' }
  ];

  /** ಕ -> ക : same offset in the Malayalam block (0x0C80 -> 0x0D00). */
  function malayalamTwin(kn) {
    var out = '';
    for (var i = 0; i < kn.length; i++) {
      var c = kn.charCodeAt(i);
      out += (c >= 0x0C80 && c <= 0x0CFF) ? String.fromCharCode(c + 0x80) : kn[i];
    }
    return out;
  }

  LETTERS.forEach(function (x) {
    x.ml = malayalamTwin(x.l);
    x.clip = 'kn_' + x.id + '.mp3';
  });

  global.KANNADA_LETTERS = {
    all: LETTERS,
    vowels: LETTERS.filter(function (x) { return x.g === 'vowel'; }),
    consonants: LETTERS.filter(function (x) { return x.g === 'consonant'; }),
    malayalamTwin: malayalamTwin
  };
})(typeof window !== 'undefined' ? window : globalThis);
