/**
 * menu-data.js — the menu's groups, their ORDER, and where each activity lives
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Shared by the menu (js/game-loader.js) and by every activity, so that:
 *   · an activity knows the group it belongs to and the one that comes NEXT —
 *     the finish screen's "Next ▶" walks a group learn → practise → quiz;
 *   · the universal control's Back (js/wall-dock.js) returns to that group,
 *     not all the way to the top of the menu.
 *
 * ORDER IS THE CURRICULUM. Within a group the list runs from meeting things
 * (no right or wrong), through practising, to being asked. Keep it that way
 * when adding an activity: put it where it belongs in the progression, not
 * at the end.
 *
 * Entries: { name:{en,ml}, icon, game }   group: { title:{en,ml}, icon, parent?,
 * groups?:[keys], options?:[entries] }
 */
(function (global) {
  'use strict';

  function e(en, ml, icon, game) { return { name: { en: en, ml: ml }, icon: icon, game: game }; }

  var GROUPS = {
    /* ── PRE-PRIMARY: three themes, each learn → practise → quiz ───────── */
    'pre-primary': {
      title: { en: 'Pre-Primary', ml: 'പ്രീ-പ്രൈമറി' }, icon: '🦁',
      groups: ['pp-animals-group', 'pp-shapes-group', 'pp-world-group']
    },
    'pp-animals-group': {
      title: { en: 'Animals', ml: 'മൃഗങ്ങൾ' }, icon: '🐘', parent: 'pre-primary',
      options: [
        e('Domestic & Wild Animals', 'നാട്ടു & കാട്ടു മൃഗങ്ങൾ', '🐄', 'pp-animals'),
        e('Young Ones',              'മൃഗക്കുഞ്ഞുങ്ങൾ',          '🐤', 'pp-animal-young'),
        e('Animals & Homes',         'മൃഗങ്ങളുടെ വീടുകൾ',       '🏠', 'pp-animal-homes'),
        e('Types of Hen',            'കോഴിയുടെ തരങ്ങൾ',          '🐓', 'pp-hen-types'),
        e('3D Animal Explorer',      '3D മൃഗങ്ങൾ',               '🐾', 'model-cards'),
        e('Animal Parts',            'മൃഗങ്ങളുടെ ശരീരഭാഗങ്ങൾ',  '🦉', 'model-cards-2'),
        e('Animal Sorting',          'തരംതിരിക്കാം',              '📦', 'pp-animal-sort'),
        e('Odd One Out',             'വ്യത്യസ്തമായത്',            '🔍', 'pp-odd-one-out'),
        e('Animal Quiz & Match',     'മൃഗങ്ങളെ തിരിച്ചറിയാം',    '🎯', 'pp-animal-quiz'),
        e('Animal Hunt',             'മൃഗങ്ങളെ കണ്ടെത്താം',      '🦁', 'pp-animal-hunt'),
        e('Animal Drawing',          'മൃഗങ്ങളെ വരയ്ക്കാം',       '🎨', 'animal-drawing')
      ]
    },
    'pp-shapes-group': {
      title: { en: 'Shapes, Colours & Sizes', ml: 'ആകൃതി, നിറം, വലുപ്പം' }, icon: '🔷', parent: 'pre-primary',
      options: [
        e('Colour Match',   'നിറം ചേർക്കാം',     '🎨', 'colour-match'),
        e('Shape Sorter',   'ആകൃതികൾ',          '🔵', 'shape-sorter'),
        e('Size Quiz',      'വലുതും ചെറുതും',    '🐘', 'pp-size-quiz'),
        e('Pattern Finder', 'പാറ്റേൺ കണ്ടെത്താം', '🔢', 'pattern-finder')
      ]
    },
    'pp-world-group': {
      title: { en: 'The World Around Us', ml: 'നമുക്ക് ചുറ്റും' }, icon: '🌍', parent: 'pre-primary',
      options: [
        e('Fruits vs Vegetables', 'പഴങ്ങളും പച്ചക്കറികളും', '🍎', 'fruits-vegetables'),
        e('Vehicles',             'വാഹനങ്ങൾ',              '🚗', 'vehicles'),
        e('Feelings',             'വികാരങ്ങൾ',             '😊', 'feelings'),
        e('Mosquito Clap',        'കൊതുകിനെ അടിക്കാം',      '🦟', 'mosquito-clap')
      ]
    },

    /* ── PRIMARY ───────────────────────────────────────────────────────── */
    'primary': {
      title: { en: 'Primary', ml: 'പ്രൈമറി' }, icon: '🏫',
      options: [
        e('Types of Houses',  'വീടുകളുടെ തരങ്ങൾ',  '🏠', 'pri-houses'),
        e('Rooms in a House', 'വീട്ടിലെ മുറികൾ',    '🚪', 'pri-rooms'),
        e('Kerala Flowers',   'കേരളത്തിലെ പൂക്കൾ', '🌺', 'pri-flowers'),
        e('Flower Matching',  'പൂക്കൾ ജോഡിക്കുക',   '🔗', 'pri-flower-match')
      ]
    },

    /* ── SECONDARY ─────────────────────────────────────────────────────── */
    'secondary': {
      title: { en: 'Secondary', ml: 'സെക്കൻഡറി' }, icon: '🎓',
      options: [
        e('Build My Name',    'പേര് ഉണ്ടാക്കാം',          '🎈', 'sec-name-build'),
        e('Helpers & Places', 'സഹായികളും സ്ഥലങ്ങളും',     '👮', 'sec-helpers-places'),
        e('Daily Living',     'ദൈനംദിന ജീവിതം',          '🚦', 'sec-daily-living'),
        e('First Aid Box',    'ഫസ്റ്റ് എയ്ഡ് ബോക്സ്',     '🩹', 'sec-first-aid'),
        e('Coins & Notes',    'നാണയങ്ങളും നോട്ടുകളും',    '💰', 'sec-currency'),
        e('Mobile Phone',     'മൊബൈൽ ഫോൺ',              '📱', 'sec-mobile'),
        e('Flower Bouquet',   'പൂച്ചെണ്ട്',                '💐', 'sec-bouquet')
      ]
    },

    /* ── VOCATIONAL: jobs, then the party set ──────────────────────────── */
    'vocational': {
      title: { en: 'Vocational', ml: 'തൊഴിൽപരിചയം' }, icon: '🥁',
      options: [
        e('Job Hats',            'തൊഴിൽ തൊപ്പികൾ', '🧢', 'voc-job-hats'),
        e('Tools of the Trade',  'പണിയായുധങ്ങൾ',   '🔧', 'voc-job-tools'),
        e('Where Do They Work?', 'എവിടെ ജോലി?',    '🏥', 'voc-job-where'),
        e('A Day at Work',       'ഒരു ജോലിദിനം',   '🕑', 'voc-job-day'),
        e('Who Do I Call?',      'ആരെ വിളിക്കണം?', '📞', 'voc-job-call'),
        e('Kerala Instruments',  'വാദ്യോപകരണങ്ങൾ', '🥁', 'voc-instruments'),
        e('Cap Matching',        'തൊപ്പി കണ്ടെത്താം', '🥳', 'voc-cap-match'),
        e('Party Decoration',    'ജന്മദിന അലങ്കാരം', '🎈', 'voc-party-decorate')
      ]
    },

    'kannada': {
      title: { en: 'Kannada', ml: 'കന്നഡ' }, icon: 'ಅ',
      options: [ e('Kannada Letters', 'കന്നഡ അക്ഷരങ്ങൾ', '🔤', 'kn-alphabets') ]
    },

    /* ── LEARNING: numbers, then letters ───────────────────────────────── */
    'learning': {
      title: { en: 'Learning', ml: 'പഠനം' }, icon: '📚',
      groups: ['learning-maths', 'learning-alphabets']
    },
    'learning-maths': {
      title: { en: 'Maths', ml: 'കണക്ക്' }, icon: '🔢', parent: 'learning',
      options: [
        e('Number Explorer', 'അക്കങ്ങൾ',       '🔢', 'number-explorer'),
        e('Fruit Counter',   'പഴങ്ങൾ എണ്ണാം',  '🍎', 'fruit-counter'),
        e('Fruit Math',      'പഴക്കണക്ക്',      '🍌', 'fruit-math'),
        e('Arithmetica',     'കൂട്ടലും കുറയ്ക്കലും', '➕', 'arithmetica'),
        e('Number Crunch',   'അക്ക കളി',        '🧮', 'number-crunch')
      ]
    },
    'learning-alphabets': {
      title: { en: 'Alphabets', ml: 'അക്ഷരങ്ങൾ' }, icon: '🔤', parent: 'learning',
      options: [
        e('Alphabet Explorer', 'അക്ഷരങ്ങൾ',       '🔤', 'alphabet-explorer'),
        e('Word Explorer',     'വാക്കുകൾ',         '📖', 'word-explorer'),
        e('Word Matcher',      'വാക്ക് ചേർക്കാം',   '🔗', 'word-matcher'),
        e('Word Creator',      'വാക്ക് ഉണ്ടാക്കാം', '✏️', 'word-creator')
      ]
    },

    /* ── DAILY SKILLS: sorting at home. Room Cleanup (bedroom, kitchen,
       living room) was removed on the room's request. ─────────────────── */
    'daily-skills': {
      title: { en: 'Daily Skills', ml: 'ദൈനംദിന കഴിവുകൾ' }, icon: '🏠',
      options: [
        e('Grocery Sorting',    'പലചരക്ക് തരംതിരിക്കാം', '🛒', 'sort-grocery'),
        e('Laundry Sorting',    'തുണി തരംതിരിക്കാം',     '👕', 'sort-laundry'),
        e('Recycling Sort',     'മാലിന്യം തരംതിരിക്കാം',  '♻️', 'sort-recycling'),
        e('School Bag Packing', 'സ്കൂൾ ബാഗ് ഒരുക്കാം',    '🎒', 'sort-schoolbag'),
        e('Table Setting',      'മേശ ഒരുക്കാം',          '🍽️', 'sort-table')
      ]
    },

    'jungle': {
      title: { en: 'Jungle', ml: 'കാട്' }, icon: '🌴',
      options: [
        e('Forest Animals', 'കാട്ടിലെ മൃഗങ്ങൾ',   '🐯', 'forest-animals'),
        e('Hidden Animals', 'ഒളിച്ച മൃഗങ്ങൾ',     '🔍', 'hidden-animals')
      ]
    }
  };

  /* Where each key opens. Anything not listed is games/<key>.html. */
  var ROUTES = {
    'canvas': 'FreeCanvas.html',
    'solar-system': 'solar-system.html',
    'arithmetica': 'games/arithmetica-multi.html',
    'number-crunch': 'games/number-crunch-multi.html',
    'fruit-math': 'games/fruit-math-multi.html',
    'alphabet-explorer': 'games/alphabet-explorer-multi.html',
    'kn-alphabets': 'games/kannada-alphabets.html',
    'tug-of-war': 'games/3d-viewer.html',
    'sort-grocery': 'games/room-sorter.html?room=grocery',
    'sort-laundry': 'games/room-sorter.html?room=laundry',
    'sort-recycling': 'games/room-sorter.html?room=recycling',
    'sort-schoolbag': 'games/room-sorter.html?room=schoolbag',
    'sort-table': 'games/room-sorter.html?room=table'
  };
  function route(key) { return ROUTES[key] || ('games/' + key + '.html'); }

  /** The key of the page we are on, from its file name (and ?room=). */
  function currentKey() {
    var path = global.location.pathname, file = path.slice(path.lastIndexOf('/') + 1);
    var here = (/\/games\//.test(path) ? 'games/' : '') + file;
    var q = global.location.search.replace(/[?&]lang=[a-z]+/, '').replace(/^&/, '?');
    for (var k in ROUTES) if (ROUTES[k] === here + (q && q !== '?' ? q : '') || ROUTES[k] === here) return k;
    return file.replace(/\.html$/, '');
  }

  /** The group whose options list this key, preferring the one it was opened from. */
  function groupOf(key) {
    var from = '';
    try { from = sessionStorage.getItem('auticareFromGroup') || ''; } catch (e) {}
    var has = function (g) { return GROUPS[g] && (GROUPS[g].options || []).some(function (o) { return o.game === key; }); };
    if (from && has(from)) return from;
    for (var g in GROUPS) if (has(g)) return g;
    return '';
  }

  var PATH = {
    /** { name, icon, game } of the activity after this one in its group, or null. */
    next: function () {
      var key = currentKey(), g = groupOf(key);
      if (!g) return null;
      var opts = GROUPS[g].options, i = -1;
      for (var j = 0; j < opts.length; j++) if (opts[j].game === key) i = j;
      return i >= 0 && i < opts.length - 1 ? opts[i + 1] : null;
    },
    goNext: function () {
      var n = PATH.next(); if (!n) return;
      var g = groupOf(currentKey());
      try { if (g) sessionStorage.setItem('auticareFromGroup', g); } catch (e) {}
      var root = /\/games\//.test(global.location.pathname) ? '../' : './';
      global.location.href = root + route(n.game);
    },
    group: function () { return groupOf(currentKey()); },
    currentKey: currentKey
  };

  global.MENU_DATA = { GROUPS: GROUPS, ROUTES: ROUTES, route: route };
  global.WALL_PATH = PATH;
})(typeof window !== 'undefined' ? window : globalThis);
