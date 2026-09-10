/**
 * flashcard-deck.js — the tap-to-explore board engine
 * ══════════════════════════════════════════════════════════════════
 *
 * WHY THIS EXISTS
 *   The Pangappara brief describes the same interaction eight separate
 *   times, almost word for word:
 *
 *     "The touched card highlights with a bright, glowing green border.
 *      The card does a gentle, cheerful bounce in place.
 *      A glowing star icon appears on the card to mark it as explored.
 *      ... Exploring all items triggers floating balloons and a
 *      3-second applause sound effect."
 *
 *   Houses, Kerala Flowers, First Aid, Currency, Body Parts & Plant,
 *   Helpers & Public Places, Mobile Phone Skills and the five Daily
 *   Living boards are all that one interaction with different data.
 *   They are data files here, not eight implementations.
 *
 * REQUIRES  js/wall-common.js  (and it must be WALL.init()-ed first)
 *
 * ART IS FALLBACK-TOLERANT
 *   art:{img} that 404s falls back to art.emoji, so every board is
 *   demoable and testable before a single photograph is delivered.
 *   Never let a missing asset produce an empty card.
 *
 * USE
 *   var deck = DECK.mount('#board', {
 *     items: [
 *       { id:'rose',
 *         label:{ en:'Rose', ml:'റോസപ്പൂവ്' },
 *         sub:  { en:'', ml:'' },
 *         art:  { emoji:'🌹', img:'../assets/new/images/flowers/rose.jpg' },
 *         sound: WALL.sound('../assets/new/audio/x.mp3', WALL.sfx.tap) }
 *     ],
 *     speak: true
 *   });
 */
(function (global) {
  'use strict';

  var W = global.WALL;

  /* ═══════════════════════════════════════════════════════════════
     STYLE
     ═══════════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('deck-style')) return;
    var s = document.createElement('style');
    s.id = 'deck-style';
    s.textContent = [
      /* margin:auto centres the grid when it fits and, unlike flex
         centring alone, does NOT clip the first row when it overflows
         and the container has to scroll. */
      '.deck{display:grid;gap:calc(18px * var(--wall-scale,1));',
      '  justify-content:center;align-content:center;padding:14px;margin:auto;',
      '  transition:transform .25s ease}',

      '.deck-card{position:relative;display:flex;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:6px;',
      '  padding:calc(16px * var(--wall-scale,1));border-radius:26px;',
      '  background:var(--tint,#ffffff);border:5px solid rgba(150,180,210,.35);',
      '  box-shadow:0 8px 22px rgba(20,60,95,.16);cursor:pointer;',
      '  touch-action:manipulation;-webkit-tap-highlight-color:transparent;',
      '  transition:border-color .25s,box-shadow .25s,transform .18s}',
      '.deck-card:active{transform:scale(.96)}',

      /* the brief: "bright, glowing green border" */
      '.deck-card.lit{border-color:#22c55e;',
      '  box-shadow:0 0 0 6px rgba(34,197,94,.22),0 0 28px rgba(34,197,94,.55),',
      '  0 8px 22px rgba(20,60,95,.16)}',

      /* the brief: "gentle, cheerful bounce in place" */
      '.deck-card.bounce{animation:deckBounce .55s cubic-bezier(.28,.84,.42,1)}',
      '@keyframes deckBounce{0%{transform:translateY(0) scale(1)}',
      '  30%{transform:translateY(-16px) scale(1.06)}',
      '  55%{transform:translateY(0) scale(.98)}',
      '  75%{transform:translateY(-6px) scale(1.02)}',
      '  100%{transform:translateY(0) scale(1)}}',

      '.deck-art{width:var(--art);height:var(--art);display:flex;',
      '  align-items:center;justify-content:center;font-size:calc(var(--art) * .82);',
      '  line-height:1;user-select:none}',
      '.deck-art img{max-width:100%;max-height:100%;object-fit:contain;',
      '  border-radius:14px;display:block}',
      '.deck-art svg{width:100%;height:100%;display:block}',

      '.deck-label{font-weight:900;text-align:center;line-height:1.15;',
      '  font-size:calc(19px * var(--wall-scale,1));color:#123b5e;max-width:100%}',
      '.deck-alt{font-weight:700;text-align:center;opacity:.62;',
      '  font-size:calc(13px * var(--wall-scale,1));color:#123b5e}',
      '.deck-sub{font-weight:800;text-align:center;color:#0f766e;',
      '  font-size:calc(14px * var(--wall-scale,1));margin-top:2px}',

      /* the brief: "a glowing star icon appears on the card" */
      '.deck-star{position:absolute;top:-12px;right:-10px;font-size:30px;',
      '  opacity:0;transform:scale(.2) rotate(-40deg);pointer-events:none;',
      '  filter:drop-shadow(0 0 8px rgba(250,204,21,.95));',
      '  transition:opacity .3s,transform .45s cubic-bezier(.2,1.5,.4,1)}',
      '.deck-card.lit .deck-star{opacity:1;transform:scale(1) rotate(0)}',

      /* optional "tap to open" cover, e.g. the closed First Aid box */
      '.deck-cover{display:flex;flex-direction:column;align-items:center;',
      '  justify-content:center;gap:14px;padding:40px;cursor:pointer;',
      '  animation:deckPulse 2s ease-in-out infinite}',
      '@keyframes deckPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}',
      '.deck-cover .deck-art{--art:min(38vh,320px)}',

      /* board tab strip, used by the multi-board activities */
      '.deck-tabs{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;',
      '  padding:10px 14px}',
      '.deck-tab{padding:10px 20px;border-radius:16px;border:3px solid #7fb4dc;',
      '  background:linear-gradient(135deg,#eaf5ff,#c8e2f7);color:#1c4a75;',
      '  font-weight:900;font-size:calc(15px * var(--wall-scale,1));',
      '  font-family:inherit;cursor:pointer;touch-action:manipulation}',
      '.deck-tab.on{background:linear-gradient(135deg,#bbf7d0,#4ade80);border-color:#16a34a}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     ART RESOLUTION — first present wins, with graceful degradation
     ═══════════════════════════════════════════════════════════════ */
  function buildArt(art) {
    var box = document.createElement('div');
    box.className = 'deck-art';
    if (!art) return box;

    // Wide artwork (a currency note is ~1.93:1) would letterbox badly
    // inside a square well, so let an item declare its own ratio.
    if (art.aspect) box.style.height = 'calc(var(--art) / ' + art.aspect + ')';

    if (art.html) { box.innerHTML = art.html; return box; }

    if (art.svg) {
      box.innerHTML = '<svg><use href="' + art.svg + '"></use></svg>';
      return box;
    }

    if (art.img) {
      var img = document.createElement('img');
      img.src = art.img;
      img.alt = '';
      // A missing photograph must never leave a blank card.
      img.addEventListener('error', function () {
        box.textContent = art.emoji || '🖼️';
      });
      box.appendChild(img);
      return box;
    }

    box.textContent = art.emoji || '❓';
    return box;
  }

  /* ═══════════════════════════════════════════════════════════════
     MOUNT
     ═══════════════════════════════════════════════════════════════ */
  function mount(target, cfg) {
    injectCSS();
    cfg = cfg || {};

    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('[DECK] mount target not found: ' + target);

    var deck = {
      host: host,
      el: null,
      items: cfg.items || [],
      explored: {},
      cfg: cfg
    };

    var speak      = cfg.speak !== false;
    var doCelebrat = cfg.celebrate !== false;

    function artPx() {
      // "MUST load in EXTRA LARGE size by default" — so the base is
      // sized to fill the wall, not to look tidy on a laptop, and the
      // teacher's SIZE control scales from there. Also clamped against
      // the real viewport so a small board never overflows.
      var n = Math.max(1, deck.items.length);
      var base = n <= 4 ? 250 : n <= 6 ? 205 : n <= 9 ? 165 : 135;

      // Clamp against the host box, not the window — this deck may be
      // mounted inside something much narrower than the screen (the
      // giant phone frame in sec-mobile is the case that caught this).
      var availW = host.clientWidth  || global.innerWidth;
      var availH = host.clientHeight || global.innerHeight;
      var cols = columns(), rows = Math.ceil(n / cols);

      // Budget for the non-art chrome on each card: padding + border +
      // gaps + the label, the alt-language line, and the optional sub
      // line. Under-counting this is what made the 9-sign board clip.
      var hasSub = deck.items.some(function (it) { return !!it.sub; });
      var chromeH = 96 + (hasSub ? 30 : 0);
      var gap = 18 * (W ? W.scale() : 1);

      var fitW = (availW - 30) / cols - 70;
      var fitH = (availH - 30 - gap * (rows - 1)) / rows - chromeH;
      base = Math.min(base, Math.max(76, fitW), Math.max(76, fitH));
      return Math.round(base * (W ? W.scale() : 1));
    }

    function columns() {
      if (typeof cfg.columns === 'number') return cfg.columns;
      var n = deck.items.length;
      if (n <= 3) return n || 1;
      if (n <= 4) return 2;
      if (n <= 6) return 3;
      if (n <= 9) return 3;
      return 4;
    }

    function allExplored() {
      for (var i = 0; i < deck.items.length; i++) {
        if (!deck.explored[deck.items[i].id]) return false;
      }
      return deck.items.length > 0;
    }

    function playItemSound(item) {
      if (cfg.silent) return;
      if (typeof item.sound === 'function') { item.sound(); return; }
      if (typeof item.sound === 'string') {
        try {
          var a = new Audio(item.sound);
          a.volume = 0.7;
          a.play().catch(function () { if (W) W.sfx.tap(); });
          return;
        } catch (e) { /* fall through */ }
      }
      if (W) W.sfx.tap();
    }

    function tap(item, card) {
      var first = !deck.explored[item.id];

      card.classList.add('lit');
      card.classList.remove('bounce');
      void card.offsetWidth;               // restart the animation
      card.classList.add('bounce');

      playItemSound(item);
      if (speak) W && W.say(item.label);
      if (first && W) {
        // cfg.silent covers the Kerala Flowers board, which the brief
        // asks to be visually rewarding but audibly silent. The sparkle
        // still fires — that is a visual, not a sound effect.
        if (!cfg.silent) W.sfx.star();
        W.burstAt(card, null, 10);
      }

      deck.explored[item.id] = true;

      if (cfg.onTap) cfg.onTap(item, card, deck);

      if (first && allExplored()) {
        setTimeout(function () {
          if (cfg.onAllExplored) cfg.onAllExplored(deck);
          else if (doCelebrat && W) W.celebrate(deck.el.getBoundingClientRect());
        }, 420);
      }
    }

    function render() {
      host.innerHTML = '';

      var grid = document.createElement('div');
      grid.className = 'deck';
      grid.style.gridTemplateColumns = 'repeat(' + columns() + ', auto)';
      deck.el = grid;

      var px = artPx();

      deck.items.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'deck-card';
        card.setAttribute('data-id', item.id);
        card.style.setProperty('--art', px + 'px');
        if (item.tint) card.style.setProperty('--tint', item.tint);
        if (deck.explored[item.id]) card.classList.add('lit');

        var star = document.createElement('div');
        star.className = 'deck-star';
        star.textContent = '⭐';
        card.appendChild(star);

        card.appendChild(buildArt(item.art));

        var both = W ? W.tBoth(item.label) : { main: '', alt: '' };
        var lab = document.createElement('div');
        lab.className = 'deck-label';
        lab.textContent = both.main;
        card.appendChild(lab);

        if (both.alt && both.alt !== both.main) {
          var alt = document.createElement('div');
          alt.className = 'deck-alt';
          alt.textContent = both.alt;
          card.appendChild(alt);
        }

        if (item.sub) {
          var sub = document.createElement('div');
          sub.className = 'deck-sub';
          sub.textContent = W ? W.t(item.sub) : '';
          if (sub.textContent) card.appendChild(sub);
        }

        W && W.bindTouch(card, function () { tap(item, card); });
        grid.appendChild(card);
      });

      host.appendChild(grid);
    }

    /**
     * Optional cover card — the brief's "Tap the closed First Aid Box
     * to open it and reveal the items."
     */
    function renderCover(cover) {
      host.innerHTML = '';
      var c = document.createElement('div');
      c.className = 'deck-card deck-cover';
      c.appendChild(buildArt(cover.art));
      var lab = document.createElement('div');
      lab.className = 'deck-label';
      lab.textContent = W ? W.t(cover.label) : '';
      c.appendChild(lab);
      W && W.bindTouch(c, function () {
        W && W.sfx.pop();
        render();
      });
      host.appendChild(c);
    }

    deck.render = render;

    deck.reset = function () {
      deck.explored = {};
      if (cfg.cover) renderCover(cfg.cover); else render();
    };

    deck.setItems = function (items, cover) {
      deck.items = items || [];
      deck.explored = {};
      if (cover) renderCover(cover); else render();
    };

    deck.exploredCount = function () {
      return Object.keys(deck.explored).length;
    };

    // Re-render on language and size changes so the teacher controls
    // work on every board without per-activity wiring. The isConnected
    // guard matters: switch boards with deck.setItems() rather than a
    // second mount(), but if a page does re-mount, the orphaned deck
    // stops repainting instead of fighting the live one.
    if (W) {
      W.onLang(function () { if (deck.el && deck.el.isConnected) render(); });
      W.onSize(function () { if (deck.el && deck.el.isConnected) render(); });
    }

    if (cfg.cover) renderCover(cfg.cover); else render();
    return deck;
  }

  /* ═══════════════════════════════════════════════════════════════
     TAB STRIP — for the activities the brief groups under one title
     (Body Parts + Plant, Helpers + Places, the five Daily Living boards)
     ═══════════════════════════════════════════════════════════════ */
  function tabs(target, boards, onPick) {
    injectCSS();
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return null;

    var activeKey = boards.length ? boards[0].key : null;

    function draw(key) {
      if (key != null) activeKey = key;
      host.innerHTML = '';
      var strip = document.createElement('div');
      strip.className = 'deck-tabs';
      boards.forEach(function (b) {
        var el = document.createElement('button');
        el.className = 'deck-tab' + (b.key === activeKey ? ' on' : '');
        el.textContent = W ? W.t(b.title) : b.key;
        W && W.bindTouch(el, function () {
          W && W.sfx.tap();
          draw(b.key);
          onPick(b);
        });
        strip.appendChild(el);
      });
      host.appendChild(strip);
    }

    // Relabel on a language switch without changing which tab is open.
    if (W) W.onLang(function () { if (host.isConnected) draw(null); });

    return { draw: draw, active: function () { return activeKey; } };
  }

  global.DECK = { mount: mount, tabs: tabs, buildArt: buildArt };
})(typeof window !== 'undefined' ? window : globalThis);
