/**
 * flower-data.js — the Kerala flower set, defined once
 * ══════════════════════════════════════════════════════════════════
 *
 * Three activities in the brief use the same flowers:
 *   Primary #4  Kerala Flowers Flashcards   (6 flowers)
 *   Primary #5  Flower Matching             (adds Pichi, 7th)
 *   Secondary #9 Flower Bouquet Building    (reuses both sets)
 *
 * Keeping one list means a corrected Malayalam spelling or a delivered
 * photograph lands in all three at once. Pichi appears only in the
 * Matching round sets in the source brief, so FLASHCARD_SET is the six
 * the flashcard activity is specified with, and ALL is all seven.
 *
 * MALAYALAM WARNING
 *   The source PDF spells several of these two different ways across
 *   pages (encoding damage — e.g. both ററാസപ്പൂവ് and ററാസപ്പറവ്).
 *   The spellings here are the standard forms. They MUST be proofed by
 *   a Malayalam-speaking teacher before wall deployment.
 *   See DEV-DOC-additional-content.md section 8, open question 1.
 */
(function (global) {
  'use strict';

  var IMG = '../assets/new/images/flowers/';

  var FLOWERS = {
    rose: {
      id: 'rose',
      label: { en: 'Rose', ml: 'റോസപ്പൂവ്' },
      sub:   { en: 'Red rose with green leaves', ml: 'ചുവന്ന റോസാപ്പൂവ്' },
      art:   { emoji: '🌹', img: IMG + 'rose.jpg' },
      tint:  '#fff1f2'
    },
    mulla: {
      id: 'mulla',
      label: { en: 'Jasmine / Mulla', ml: 'മുല്ലപ്പൂവ്' },
      sub:   { en: 'Fresh white jasmine', ml: 'വെളുത്ത മുല്ലപ്പൂവ്' },
      art:   { emoji: '🌼', img: IMG + 'mulla.jpg' },
      tint:  '#fffbeb'
    },
    jamanti: {
      id: 'jamanti',
      label: { en: 'Jamanti', ml: 'ജമന്തി' },
      sub:   { en: 'Marigold', ml: 'ജമന്തിപ്പൂവ്' },
      art:   { emoji: '🏵️', img: IMG + 'jamanti.jpg' },
      tint:  '#fff7ed'
    },
    lotus: {
      id: 'lotus',
      label: { en: 'Lotus', ml: 'താമരപ്പൂവ്' },
      sub:   { en: 'Pink lotus on green water leaves', ml: 'പിങ്ക് താമരപ്പൂവ്' },
      art:   { emoji: '🪷', img: IMG + 'lotus.jpg' },
      tint:  '#fdf2f8'
    },
    kanikonna: {
      id: 'kanikonna',
      label: { en: 'Golden Shower / Kanikonna', ml: 'കണിക്കൊന്ന' },
      sub:   { en: 'Yellow hanging cluster', ml: 'മഞ്ഞ പൂങ്കുല' },
      art:   { emoji: '💛', img: IMG + 'kanikonna.jpg' },
      tint:  '#fefce8'
    },
    chembarathi: {
      id: 'chembarathi',
      label: { en: 'Hibiscus / Chembarathi', ml: 'ചെമ്പരത്തി' },
      sub:   { en: 'Classic red chembarathi', ml: 'ചുവന്ന ചെമ്പരത്തി' },
      art:   { emoji: '🌺', img: IMG + 'chembarathi.jpg' },
      tint:  '#fff1f2'
    },
    /* Introduced by the brief's second matching round set only. */
    pichi: {
      id: 'pichi',
      label: { en: 'Pichi', ml: 'പിച്ചിപ്പൂവ്' },
      sub:   { en: 'Small white pichi flower', ml: 'ചെറിയ വെളുത്ത പിച്ചിപ്പൂവ്' },
      art:   { emoji: '💮', img: IMG + 'pichi.jpg' },
      tint:  '#f8fafc'
    }
  };

  /** The six the flashcard activity is specified with. */
  var FLASHCARD_SET = ['rose', 'mulla', 'jamanti', 'lotus', 'kanikonna', 'chembarathi'];

  /** The two matching round sets, exactly as the brief lays them out. */
  var MATCH_ROUNDS = [
    ['rose',  'mulla', 'chembarathi'],
    ['pichi', 'lotus', 'kanikonna']
  ];

  function get(ids) {
    return ids.map(function (k) {
      // shallow copy so a deck marking state cannot mutate the source
      var f = FLOWERS[k];
      return { id: f.id, label: f.label, sub: f.sub, art: f.art, tint: f.tint };
    });
  }

  global.FLOWER_DATA = {
    all: FLOWERS,
    get: get,
    flashcardSet: function () { return get(FLASHCARD_SET); },
    matchRounds: MATCH_ROUNDS,
    round: function (i) { return get(MATCH_ROUNDS[i]); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
