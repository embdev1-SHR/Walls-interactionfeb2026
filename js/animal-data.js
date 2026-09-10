/**
 * animal-data.js — the Pre-Primary animal set, defined once
 * ══════════════════════════════════════════════════════════════════
 *
 * Eight activities in the Module 2 brief use the same animals:
 *   #1 Domestic & Wild flashcards      #2 Identify / Match
 *   #7 Animals and their Homes         #8 Animals and their Young
 *   #9 Types of Hen                    #10 Odd One Out
 *   #13 Sorting                        + the Animal Hunt rework
 *
 * One list means a corrected Malayalam spelling or a delivered photo
 * lands in all of them at once.
 *
 * ASSET RESOLUTION
 *   `img` points at a real file already in the repo where one exists
 *   (dog, lion, monkey, elephant, rabbit) and at the not-yet-delivered
 *   path otherwise. Every consumer falls back to `emoji` on load error,
 *   so nothing breaks while the photo set is outstanding.
 *   Same for `sound`: six animals already have real recordings.
 *
 * TWO MALAYALAM PROBLEMS IN THE SOURCE BRIEF — READ THIS
 *   1. The brief lists Sheep as "ആട്/ചെമ്മരിയാട്" and Goat as "വെള്ളാട്",
 *      but then gives BOTH the spoken label "ആട്". Two cards that say the
 *      same word cannot teach the difference between them. Used here:
 *      sheep = ചെമ്മരിയാട്, goat = ആട്.
 *   2. The brief gives the young of BOTH goat and sheep as ആട്ടിൻകുട്ടി.
 *      Used here: goat kid = ആട്ടിൻകുട്ടി, lamb = കുഞ്ഞാട്.
 *   Both need a teacher's ruling — see ASSET-LIST-PREPRIMARY.md §9.
 */
(function (global) {
  'use strict';

  var OLD = '../assets/animals%20img/';          // note: folder name has a space
  var NEW = '../assets/new/images/animals/';
  var HOME = '../assets/new/images/homes/';
  var SND_OLD = '../assets/Audio/animals/';
  var SND_NEW = '../assets/new/audio/animals/';

  /* id: [ml, en, emoji, img, sound] */
  var A = {
    /* ── domestic / farm ─────────────────────────────────────────── */
    cat:    { ml: 'പൂച്ച',        en: 'Cat',    emoji: '🐱', img: NEW + 'cat.jpg',    snd: SND_NEW + 'meow.mp3' },
    dog:    { ml: 'നായ / പട്ടി',  en: 'Dog',    emoji: '🐶', img: OLD + 'dog.webp',   snd: SND_NEW + 'bark.mp3' },
    cow:    { ml: 'പശു',          en: 'Cow',    emoji: '🐮', img: NEW + 'cow.jpg',    snd: SND_OLD + 'cow.mp3' },
    hen:    { ml: 'കോഴി',         en: 'Hen',    emoji: '🐔', img: NEW + 'hen.jpg',    snd: SND_NEW + 'cluck.mp3' },
    sheep:  { ml: 'ചെമ്മരിയാട്',  en: 'Sheep',  emoji: '🐑', img: NEW + 'sheep.jpg',  snd: SND_NEW + 'baah.mp3' },
    goat:   { ml: 'ആട്',          en: 'Goat',   emoji: '🐐', img: NEW + 'goat.jpg',   snd: SND_NEW + 'bleat.mp3' },
    horse:  { ml: 'കുതിര',        en: 'Horse',  emoji: '🐴', img: NEW + 'horse.jpg',  snd: SND_NEW + 'neigh.mp3' },
    duck:   { ml: 'താറാവ്',       en: 'Duck',   emoji: '🦆', img: NEW + 'duck.jpg',   snd: SND_NEW + 'quack.mp3' },
    pig:    { ml: 'പന്നി',        en: 'Pig',    emoji: '🐷', img: NEW + 'pig.jpg',    snd: SND_NEW + 'oink.mp3' },
    rabbit: { ml: 'മുയൽ',         en: 'Rabbit', emoji: '🐰', img: OLD + 'rabbit.png', snd: SND_OLD + 'rabbit.mp3' },

    /* ── wild ────────────────────────────────────────────────────── */
    lion:     { ml: 'സിംഹം',   en: 'Lion',          emoji: '🦁', img: OLD + 'lion.png',     snd: SND_NEW + 'lion-roar.mp3' },
    tiger:    { ml: 'കടുവ',    en: 'Tiger',         emoji: '🐯', img: NEW + 'tiger.jpg',    snd: SND_OLD + 'tiger.mp3' },
    elephant: { ml: 'കാട്ടാന', en: 'Wild Elephant', emoji: '🐘', img: OLD + 'Elephant.png', snd: SND_OLD + 'elephant.mp3' },
    snake:    { ml: 'പാമ്പ്',  en: 'Snake',         emoji: '🐍', img: NEW + 'snake.jpg',    snd: SND_OLD + 'rattlesnake.mp3' },
    monkey:   { ml: 'കുരങ്ങ്', en: 'Monkey',        emoji: '🐵', img: OLD + 'monkey.png',   snd: SND_NEW + 'monkey-chatter.mp3' },
    bear:     { ml: 'കരടി',    en: 'Bear',          emoji: '🐻', img: NEW + 'bear.jpg',     snd: SND_OLD + 'bear.mp3' },

    /* ── quiz distractors / sorting ──────────────────────────────── */
    frog:   { ml: 'തവള',    en: 'Frog',   emoji: '🐸', img: NEW + 'frog.jpg',   snd: SND_NEW + 'frog-ribbit.mp3' },
    spider: { ml: 'ചിലന്തി', en: 'Spider', emoji: '🕷️', img: NEW + 'spider.jpg' },
    turtle: { ml: 'ആമ',     en: 'Turtle', emoji: '🐢', img: NEW + 'turtle.jpg' },
    bird:   { ml: 'പക്ഷി',  en: 'Bird',   emoji: '🐦', img: NEW + 'bird.jpg',   snd: SND_NEW + 'bird-chirp.mp3' },

    /* ── the three hens of activity #9 ───────────────────────────── */
    rooster:      { ml: 'പൂവൻകോഴി',    en: 'Rooster',      emoji: '🐓', img: NEW + 'rooster.jpg',       snd: SND_NEW + 'rooster-crow.mp3' },
    'hen-colour': { ml: 'വർണ്ണക്കോഴി', en: 'Colourful Hen', emoji: '🐔', img: NEW + 'colourful-hen.jpg', snd: SND_NEW + 'cluck.mp3' }
  };

  /* Young ones — activity #8. Transparent PNG preferred; they animate. */
  var YOUNG = {
    cow:   { ml: 'പശുക്കിടാവ്',   en: 'Calf',     emoji: '🐄', img: NEW + 'calf.jpg' },
    hen:   { ml: 'കോഴിക്കുഞ്ഞ്',  en: 'Chick',    emoji: '🐤', img: NEW + 'chick.jpg' },
    dog:   { ml: 'നായ്ക്കുട്ടി',   en: 'Puppy',    emoji: '🐕', img: NEW + 'puppy.jpg' },
    cat:   { ml: 'പൂച്ചക്കുട്ടി',  en: 'Kitten',   emoji: '🐈', img: NEW + 'kitten.jpg' },
    goat:  { ml: 'ആട്ടിൻകുട്ടി',  en: 'Kid',      emoji: '🐐', img: NEW + 'kid-goat.jpg' },
    horse: { ml: 'കുതിരക്കുട്ടി', en: 'Foal',     emoji: '🐎', img: NEW + 'foal.jpg' },
    duck:  { ml: 'താറാവുകുഞ്ഞ്',  en: 'Duckling', emoji: '🐥', img: NEW + 'duckling.jpg' },
    /* see the header note: the brief reuses ആട്ടിൻകുട്ടി here too */
    sheep: { ml: 'കുഞ്ഞാട്',      en: 'Lamb',     emoji: '🐑', img: NEW + 'lamb.jpg' }
  };

  /* Homes — activity #7. */
  var HOMES = {
    hen:   { ml: 'കോഴിക്കൂട്',        en: 'Coop',       emoji: '🏚️', img: HOME + 'coop.jpg' },
    cow:   { ml: 'തൊഴുത്ത്',          en: 'Cow Shed',   emoji: '🛖', img: HOME + 'cow-shed.jpg' },
    dog:   { ml: 'നായ്ക്കൂട്',         en: 'Kennel',     emoji: '🏡', img: HOME + 'kennel.jpg' },
    goat:  { ml: 'ആട്ടിൻകൂട്',        en: 'Goat Shed',  emoji: '🏚️', img: HOME + 'goat-shed.jpg' },
    cat:   { ml: 'കൊട്ട',             en: 'Cosy Basket', emoji: '🧺', img: HOME + 'cat-basket.jpg' },
    horse: { ml: 'ലായം',              en: 'Stable',     emoji: '🏛️', img: HOME + 'stable.jpg' },
    duck:  { ml: 'കുളം',              en: 'Pond',       emoji: '🏞️', img: HOME + 'pond.jpg' },
    sheep: { ml: 'ആട്ടിൻതൊഴുത്ത്',   en: 'Sheep Pen',  emoji: '🏚️', img: HOME + 'sheep-pen.jpg' }
  };

  var DOMESTIC = ['cat', 'dog', 'cow', 'hen', 'sheep', 'goat'];
  var WILD     = ['lion', 'tiger', 'elephant', 'snake', 'monkey', 'bear'];
  var HOME_SET = ['hen', 'cow', 'dog', 'goat', 'cat', 'horse', 'duck', 'sheep'];

  function W() { return global.WALL; }

  /** A DECK-shaped item for one animal id. */
  function card(id, opts) {
    var a = A[id];
    if (!a) throw new Error('[ANIMALS] unknown id: ' + id);
    opts = opts || {};
    var item = {
      id: id,
      label: { en: a.en, ml: a.ml },
      art:   { emoji: a.emoji, img: a.img }
    };
    if (a.snd && opts.sound !== false && W()) {
      item.sound = W().sound(a.snd, W().sfx.tap);
    }
    if (opts.sub) item.sub = opts.sub;
    if (opts.tint) item.tint = opts.tint;
    return item;
  }

  function cards(ids, opts) {
    return ids.map(function (id) { return card(id, opts); });
  }

  /**
   * The brief's two-step tap, used by several activities:
   * "Step 1: Natural animal sound plays. Step 2: A clear, calm voice
   *  reads the Malayalam name."
   */
  function speakAfterSound(id, delay) {
    var a = A[id];
    if (!a || !W()) return;
    setTimeout(function () {
      W().say({ ml: a.ml, en: a.en });
    }, delay == null ? 1100 : delay);
  }

  function playSound(id) {
    var a = A[id];
    if (!a || !W()) return;
    if (a.snd) W().sound(a.snd, W().sfx.tap)();
    else W().sfx.tap();
  }

  global.ANIMALS = {
    all: A, young: YOUNG, homes: HOMES,
    DOMESTIC: DOMESTIC, WILD: WILD, HOME_SET: HOME_SET,
    get: function (id) { return A[id]; },
    card: card, cards: cards,
    speakAfterSound: speakAfterSound, playSound: playSound
  };
})(typeof window !== 'undefined' ? window : globalThis);
