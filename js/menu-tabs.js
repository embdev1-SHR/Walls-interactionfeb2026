/**
 * menu-tabs.js — three big tabs on the main menu instead of 23 cards at once
 * ══════════════════════════════════════════════════════════════════════════
 *
 * WHY TABS
 *   Twenty-three choices on one screen is a lot for any five-year-old and a
 *   great deal for an autistic one: choice overload reads as noise, and the
 *   usual response is to tap the nearest card or none. Three groups of about
 *   eight is a choice a child can actually make.
 *
 * WHAT IT DOES, AND DOES NOT, TOUCH
 *   The cards stay exactly where index.html puts them, with the click handlers
 *   game-loader.js bound at load. This file only builds the tab bar and hides
 *   the cards that are not in the current tab. Nothing about navigation into an
 *   activity changes, so nothing there can break.
 *
 * KID-FRIENDLY DETAILS
 *   · കുട്ടു says the tab's name when it is tapped — a child who cannot read
 *     the label still knows what they chose.
 *   · The last tab is remembered for the session, so a child coming back from
 *     a game lands where they left, not on a different screen.
 *   · Cards pop in when a tab opens, so the change is visible, not abrupt.
 *
 * The tab names live here, in js/, rather than in index.html, so that
 * scripts/voice-lines.mjs collects them and they get a baked voice.
 */
(function (global) {
  'use strict';

  var TABS = [
    { key: 'learn',   label: { en: 'Learn', ml: 'പഠിക്കാം' },   colour: '#3E9BE9', icon: 'tab-learn',
      say: { ml: 'നമുക്ക് പഠിക്കാം!', en: "Let's learn!" },
      cards: ['pre-primary', 'primary', 'secondary', 'vocational', 'kannada',
              'learning', 'daily-skills', 'money-counter', 'creature-creator'] },
    { key: 'play',    label: { en: 'Play', ml: 'കളിക്കാം' },    colour: '#FF8A3D', icon: 'tab-play',
      say: { ml: 'നമുക്ക് കളിക്കാം!', en: "Let's play!" },
      cards: ['goalkeeper', 'fruit-ninja', 'balloon-popper', 'fish-it',
              'butterfly-tracker', 'puzzle-balance', 'shape-sorter', 'particle-playground'] },
    { key: 'explore', label: { en: 'Explore', ml: 'കണ്ടെത്താം' }, colour: '#2FB36A', icon: 'tab-explore',
      say: { ml: 'നമുക്ക് കണ്ടെത്താം!', en: "Let's explore!" },
      cards: ['canvas', 'coloring-book', 'music-maker', 'solar-system',
              'underwater-explorer', 'jungle', 'video-360-player'] }
  ];
  var STORE = 'auticareMenuTab';

  function keyOf(card) { return card.dataset.game || card.dataset.category || ''; }

  function build() {
    var grid = document.querySelector('.card-grid');
    var wrap = document.querySelector('.grid-wrapper');
    if (!grid || !wrap || document.querySelector('.menu-tabs')) return;

    var bar = document.createElement('nav');
    bar.className = 'menu-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Sections');
    TABS.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'menu-tab';
      b.type = 'button';
      b.dataset.tab = t.key;
      b.setAttribute('role', 'tab');
      b.style.setProperty('--tab', t.colour);
      b.innerHTML =
        '<img src="./assets/new/icons/' + t.icon + '.png" alt="" draggable="false" onerror="this.remove()">' +
        '<span class="tab-text"><span class="tab-ml"></span><span class="tab-en"></span></span>';
      b.addEventListener('click', function () { select(t.key, true); });
      bar.appendChild(b);
    });
    wrap.parentNode.insertBefore(bar, wrap);

    // tag every card with its tab, so CSS and select() can find them
    var cards = grid.querySelectorAll('.game-card');
    Array.prototype.forEach.call(cards, function (c) {
      var k = keyOf(c);
      TABS.forEach(function (t) { if (t.cards.indexOf(k) !== -1) c.dataset.tab = t.key; });
      /* A card in no tab would silently vanish from the menu — the failure
         mode of every new activity someone forgets to list above. Put it in
         Explore and say so, rather than lose it. */
      if (!c.dataset.tab) {
        c.dataset.tab = 'explore';
        try { console.warn('[menu-tabs] card "' + k + '" is not in any tab; showing it under Explore'); } catch (e) {}
      }
    });

    relabel();
    // the universal language (js/wall-settings.js): re-label when it changes
    if (global.WALL_SETTINGS) global.WALL_SETTINGS.onChange(function (w) { if (w === 'lang') relabel(); });

    var start = 'learn';
    try { start = sessionStorage.getItem(STORE) || 'learn'; } catch (e) {}
    select(start, false);
  }

  /** Tab names in the chosen language, with English (or Malayalam under
      English) small underneath. */
  function relabel() {
    var S = global.WALL_SETTINGS;
    Array.prototype.forEach.call(document.querySelectorAll('.menu-tab'), function (b) {
      var t = TABS.filter(function (x) { return x.key === b.dataset.tab; })[0];
      if (!t) return;
      var main = S ? S.tr(t.label) : t.label.ml;
      var alt = S ? (S.lang() === 'en' ? t.label.ml : t.label.en) : t.label.en;
      b.querySelector('.tab-ml').textContent = main;
      b.querySelector('.tab-en').textContent = alt !== main ? alt : '';
    });
  }

  function select(key, spoken) {
    var tab = TABS.filter(function (t) { return t.key === key; })[0] || TABS[0];
    try { sessionStorage.setItem(STORE, tab.key); } catch (e) {}

    Array.prototype.forEach.call(document.querySelectorAll('.menu-tab'), function (b) {
      var on = b.dataset.tab === tab.key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    Array.prototype.forEach.call(document.querySelectorAll('.card-grid .game-card'), function (c) {
      var show = c.dataset.tab === tab.key;
      c.hidden = !show;
      if (show) {
        /* Order comes from this file's list, not from where the card happens
           to sit in index.html — otherwise the four modules ended up split
           across both rows. CSS `order` reorders without moving the element,
           so game-loader's handlers are untouched. */
        var pos = tab.cards.indexOf(keyOf(c));
        c.style.order = pos < 0 ? 99 : pos;
        // restart the pop-in, staggered so the row reads left to right
        c.classList.remove('pop-in');
        void c.offsetWidth;
        c.style.animationDelay = ((pos < 0 ? 8 : pos) * 45) + 'ms';
        c.classList.add('pop-in');
      }
    });

    /* how many cards this tab shows, so CSS can go five-across when a tab
       outgrows two rows of four (a third row would run off the screen) */
    var grid = document.querySelector('.card-grid');
    if (grid) grid.dataset.count = document.querySelectorAll('.card-grid .game-card[data-tab="' + tab.key + '"]').length;

    document.documentElement.style.setProperty('--tab-colour', tab.colour);

    if (spoken && global.GUIDE) {
      try { GUIDE.say(tab.say, { hold: 2600 }); GUIDE.cheer(); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  global.MENU_TABS = { select: select, relabel: relabel, TABS: TABS };
})(typeof window !== 'undefined' ? window : globalThis);
