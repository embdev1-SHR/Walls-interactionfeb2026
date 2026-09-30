/**
 * learn-engine.js — the activity engine the wall actually needed
 * ══════════════════════════════════════════════════════════════════════════
 *
 * WHAT WAS WRONG WITH WHAT THIS REPLACES
 *   flashcard-deck.js gives a grid of cards; tapping one makes it glow and
 *   awards a star. Every card is "correct", so there is nothing to get right,
 *   nothing to get wrong, and nothing to have learned by the end. It is a
 *   picture book that keeps score.
 *
 * WHAT THE TWO WORKING ACTIVITIES IN THIS REPO DO INSTEAD
 *   Both were written before this engine and both are better than what they
 *   replaced. The mechanics here are lifted from them deliberately.
 *
 *   games/word-explorer.html  — a GOAL with DISTRACTORS.
 *       A hint is shown, the target word appears as empty slots, and the
 *       letter tiles include letters that do not belong. The child has to
 *       discriminate, not just touch. The tone pitch climbs as slots fill
 *       (440 + n*60 Hz) so progress is audible as well as visible, and a
 *       wrong tap shakes the slot and is immediately retryable.
 *
 *   games/vehicles.html — a JOURNEY with DEPTH.
 *       Land -> Air -> Water, the hubs a progress track rather than a menu.
 *       Each item opens a real 3D model with its own sound and a fact. Three
 *       children can play at once, each advancing on their own progress. And
 *       `--playTop: 31%` — nothing interactive in the top third, because a
 *       child at a wall cannot reach up there.
 *
 * SO THIS ENGINE GIVES EVERY ACTIVITY
 *   · a question to answer, with wrong options present
 *   · a stage journey with visible progress
 *   · voice on every prompt, and a guide character who asks it
 *   · escalating audio feedback, and a wrong answer that costs nothing
 *   · 1 or 3 players
 *   · a reachable layout, enforced rather than hoped for
 *   · an optional detail view per item (3D model, sound, fact)
 *
 * MODES
 *   'pick'    "Which one is X?" — tap the right item among distractors.
 *   'explore' Tap each item to meet it; the stage completes when all are met.
 *             Used where the point is exposure, not testing (house types).
 *             Still has a goal: the hub only ticks when nothing is left.
 *
 * DEPENDS ON  wall-common.js (required), guide.js (optional but intended)
 */
(function (global) {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────────
     TUNABLES
     ────────────────────────────────────────────────────────────────────── */

  /** Nothing interactive above this fraction of the screen. From vehicles.html:
   *  a child standing at a wall cannot reach the top third. The measured
   *  failure in the activities this replaces was tappable cards at 10-16%. */
  var PLAY_TOP = 0.32;

  /** How many wrong options sit beside the right one. Three is enough to make
   *  the choice real without turning the board into a search task. */
  var DISTRACTORS = 3;

  /** At most this many item sounds at once across all panels. Three children
   *  tapping together otherwise produces noise rather than feedback. */
  var MAX_SOUNDS = 3;

  /** Every item sound is cut to this, with a fade. The vehicle clips in this
   *  repo run to 16 s; a 16 s burner behind a tap is not feedback. */
  var SOUND_CAP = 2.6, SOUND_FADE = 0.4;

  /* ──────────────────────────────────────────────────────────────────────
     STATE
     ────────────────────────────────────────────────────────────────────── */

  var cfg = null;
  var playerCount = 1;
  var panels = [];          // per-player state
  var live = 0;             // sounds currently playing
  var ctx = null;

  function W() { return global.WALL; }
  function G() { return global.GUIDE; }
  function t(pair) { return W() ? W().t(pair) : (pair && (pair.ml || pair.en)) || ''; }
  function isMl() { return W() ? W().isMl() : true; }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ──────────────────────────────────────────────────────────────────────
     SOUND
     One item sound per panel, a global cap, a hard length cap with a fade,
     and a gain trim per item. Lifted from vehicles.html, which learned this
     from clips that ranged over an order of magnitude in loudness.
     ────────────────────────────────────────────────────────────────────── */

  function audio() {
    if (!ctx) {
      try { ctx = new (global.AudioContext || global.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function playItemSound(p, item) {
    if (!item || !item.snd) return;
    if (!W() || !W().voiceOn()) return;       // the teacher's mute covers this too
    var ac = audio();
    if (!ac || live >= MAX_SOUNDS) return;

    // a new tap in this panel replaces that panel's previous sound
    stopPanelSound(p);

    var el = new Audio(item.snd);
    el.crossOrigin = 'anonymous';
    var src, gain;
    try {
      src = ac.createMediaElementSource(el);
      gain = ac.createGain();
      gain.gain.value = item.vol == null ? 0.8 : item.vol;
      src.connect(gain); gain.connect(ac.destination);
    } catch (e) {
      el.volume = item.vol == null ? 0.8 : item.vol;   // plain fallback
    }

    live++;
    p.sound = { el: el, gain: gain };
    el.play().catch(function () { live = Math.max(0, live - 1); p.sound = null; });

    // hard cap with a fade, so a long clip behaves like a cue
    p.soundTimer = setTimeout(function () {
      if (gain && ac) {
        try {
          gain.gain.setValueAtTime(gain.gain.value, ac.currentTime);
          gain.gain.linearRampToValueAtTime(0.0001, ac.currentTime + SOUND_FADE);
        } catch (e) {}
      }
      setTimeout(function () { stopPanelSound(p); }, SOUND_FADE * 1000);
    }, SOUND_CAP * 1000);

    el.addEventListener('ended', function () { stopPanelSound(p); });
  }

  function stopPanelSound(p) {
    clearTimeout(p.soundTimer);
    if (!p.sound) return;
    try { p.sound.el.pause(); p.sound.el.currentTime = 0; } catch (e) {}
    p.sound = null;
    live = Math.max(0, live - 1);
  }

  /* ──────────────────────────────────────────────────────────────────────
     CSS
     ────────────────────────────────────────────────────────────────────── */

  var CSS = [
    ':root{--play-top:' + (PLAY_TOP * 100) + '%}',
    '#leWrap{position:fixed;inset:0;display:flex;flex-direction:column;overflow:hidden}',

    /* ── the banner. Deliberately NOT interactive: it lives in the top band a
          child cannot reach, so it carries information only. ── */
    '#leTop{flex:0 0 auto;min-height:var(--play-top);display:flex;flex-direction:column;',
    '  align-items:center;justify-content:center;gap:.6vh;padding:1.4vh 2vw .4vh;',
    '  pointer-events:none;text-align:center}',
    '#leTitle{font-size:calc(26px * var(--wall-scale,1));font-weight:900;color:#1d5f96;',
    '  text-shadow:0 2px 0 rgba(255,255,255,.85)}',
    '#leTitle .alt{display:block;font-size:calc(16px * var(--wall-scale,1));opacity:.66;font-weight:700}',

    /* stage hubs: a progress track, not a chooser */
    '#leHubs{display:flex;gap:calc(14px * var(--wall-scale,1));margin-top:.5vh}',
    '.le-hub{display:flex;align-items:center;gap:6px;padding:calc(6px * var(--wall-scale,1)) ',
    '  calc(13px * var(--wall-scale,1));border-radius:999px;background:rgba(255,255,255,.72);',
    '  border:2px solid #cfe1ef;font-weight:800;color:#3c6f96;',
    '  font-size:calc(14px * var(--wall-scale,1));transition:all .3s}',
    '.le-hub.on{background:#fff;border-color:#7fb4dc;box-shadow:0 4px 14px rgba(20,60,95,.16);',
    '  transform:scale(1.06)}',
    '.le-hub.done{background:#eaf7ee;border-color:#8ed4a4;color:#2f7d4a}',
    '.le-hub .tick{opacity:0;transition:opacity .3s}',
    '.le-hub.done .tick{opacity:1}',

    /* ── the play area ── */
    '#lePanels{flex:1 1 auto;display:flex;min-height:0}',
    '.le-panel{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;',
    '  align-items:center;justify-content:flex-start;gap:1.2vh;padding:1vh 1vw 2vh;',
    '  background-position:center;background-size:cover;transition:background-image .5s}',
    '.le-panel + .le-panel{border-left:3px solid rgba(255,255,255,.55)}',
    '.le-head{display:flex;align-items:center;gap:calc(10px * var(--wall-scale,1));',
    '  flex:0 0 auto}',
    '.le-pname{font-weight:900;color:#2a5f8a;font-size:calc(15px * var(--wall-scale,1));',
    '  background:rgba(255,255,255,.8);padding:3px 14px;border-radius:999px}',
    '.le-score{font-weight:900;color:#a4711c;font-size:calc(16px * var(--wall-scale,1));',
    '  background:rgba(255,255,255,.86);padding:3px 15px;border-radius:999px;',
    '  border:2px solid #f0d9a6}',
    '.le-score b{color:#8a5c12;font-size:calc(19px * var(--wall-scale,1))}',
    '.le-score.bump{animation:leBump .4s cubic-bezier(.34,1.5,.64,1)}',
    '@keyframes leBump{0%,100%{transform:scale(1)}45%{transform:scale(1.22)}}',
    '.le-prompt{font-weight:900;color:#1d5f96;text-align:center;line-height:1.2;',
    '  font-size:calc(23px * var(--wall-scale,1));',
    '  background:rgba(255,255,255,.86);padding:calc(8px * var(--wall-scale,1)) ',
    '  calc(18px * var(--wall-scale,1));border-radius:16px;max-width:94%}',
    '.le-prompt .alt{display:block;font-size:calc(15px * var(--wall-scale,1));opacity:.62;font-weight:700}',

    /* the options — big, low, and evenly spread */
    '.le-opts{flex:1 1 auto;display:flex;flex-wrap:wrap;align-content:center;',
    '  justify-content:center;gap:calc(14px * var(--wall-scale,1));width:100%;overflow:auto}',
    /* കുട്ടു stands in the bottom-left with a speech bubble that can be as wide
       as the first card row. Verified in a screenshot: the bubble sat on top of
       the first house. Only the leftmost panel needs the gutter, so the 3-player
       layout does not lose width on all three. */
    '.le-panel:first-child .le-opts{padding-left:calc(172px * var(--wall-scale,1))}',
    '.le-opt{position:relative;width:calc(154px * var(--wall-scale,1));',
    '  height:calc(154px * var(--wall-scale,1));border-radius:22px;border:4px solid #fff;',
    '  background:rgba(255,255,255,.93);box-shadow:0 8px 22px rgba(20,60,95,.18);',
    '  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;',
    '  cursor:pointer;touch-action:manipulation;overflow:hidden;',
    '  transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s,border-color .2s}',
    '.le-opt:active{transform:scale(.95)}',
    '.le-opt img{width:72%;height:62%;object-fit:contain;pointer-events:none}',
    '.le-opt .emoji{font-size:calc(62px * var(--wall-scale,1));line-height:1;pointer-events:none}',
    '.le-opt .cap{font-weight:900;color:#2a5f8a;font-size:calc(15px * var(--wall-scale,1));',
    '  text-align:center;padding:0 6px;pointer-events:none}',

    /* right = green bloom + lift.  wrong = a soft yellow glow and a wiggle,
       never red, never a buzzer. The brief states this three times. */
    '.le-opt.right{border-color:#8ed4a4;box-shadow:0 0 0 8px rgba(142,212,164,.34),',
    '  0 14px 30px rgba(20,60,95,.2);transform:translateY(-8px) scale(1.04)}',
    '.le-opt.soft{border-color:#f5d78e;box-shadow:0 0 0 8px rgba(245,215,142,.36);',
    '  animation:leWiggle .42s ease}',
    '.le-opt.met{opacity:.55}',
    '.le-opt.met::after{content:"\\2713";position:absolute;top:6px;right:9px;',
    '  color:#2f7d4a;font-weight:900;font-size:calc(19px * var(--wall-scale,1))}',
    '@keyframes leWiggle{0%,100%{transform:translateX(0)}',
    '  25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}',

    /* stage change + finish */
    '.le-note{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    '  background:rgba(255,255,255,.9);z-index:20;opacity:0;pointer-events:none;',
    '  transition:opacity .35s;font-weight:900;color:#1d5f96;text-align:center;',
    '  font-size:calc(27px * var(--wall-scale,1));padding:0 6%}',
    '.le-note.show{opacity:1}',
    '.le-note .alt{display:block;font-size:calc(17px * var(--wall-scale,1));opacity:.65}',

    /* ── the 1-or-3 player gate, copied in spirit from vehicles.html ── */
    '#leMenu{position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;',
    '  align-items:center;justify-content:center;gap:3vh;background:#e8f1f8;',
    '  transition:opacity .45s}',
    '#leMenu.hide{opacity:0;pointer-events:none}',
    '#leMenu h1{font-size:calc(38px * var(--wall-scale,1));font-weight:900;color:#1d5f96;',
    '  text-align:center;line-height:1.15}',
    '#leMenu h1 .alt{display:block;font-size:calc(21px * var(--wall-scale,1));opacity:.66}',
    '.le-pbtns{display:flex;gap:4vw}',
    '.le-pbtn{width:calc(168px * var(--wall-scale,1));height:calc(168px * var(--wall-scale,1));',
    '  border-radius:30px;border:5px solid #fff;cursor:pointer;background:#fff;',
    '  box-shadow:0 12px 30px rgba(20,60,95,.22);display:flex;flex-direction:column;',
    '  align-items:center;justify-content:center;gap:6px;',
    '  transition:transform .22s cubic-bezier(.34,1.4,.64,1)}',
    '.le-pbtn:active{transform:scale(.95)}',
    '.le-pbtn .n{font-size:calc(62px * var(--wall-scale,1));font-weight:900;color:#e08a2f;line-height:1}',
    '.le-pbtn[data-n="3"] .n{color:#2f8ac4}',
    '.le-pbtn .cap{font-weight:900;color:#2a5f8a;font-size:calc(15px * var(--wall-scale,1))}',

    '@media (prefers-reduced-motion:reduce){.le-opt,.le-opt.soft{animation:none;transition:none}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('leCSS')) return;
    var s = document.createElement('style');
    s.id = 'leCSS';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ──────────────────────────────────────────────────────────────────────
     BUILD
     ────────────────────────────────────────────────────────────────────── */

  function bilingual(pair, altClass) {
    if (!pair) return '';
    var main = t(pair);
    var other = isMl() ? (pair.en || '') : (pair.ml || '');
    return main + (other && other !== main
      ? '<span class="' + (altClass || 'alt') + '">' + other + '</span>' : '');
  }

  function start(options) {
    cfg = options || {};
    injectCSS();
    if (W()) W().init();

    /* Clear the activity's own markup but keep <script> and <style>.
       `document.body.innerHTML = ''` was the first version and it is a trap:
       this runs from an inline script inside <body>, so wiping the body while
       the parser is still inside it removes sibling script tags that have
       already been inserted — audio-manager.js is loaded that way at the end of
       every activity. Removing only non-script elements is the same outcome
       without the hazard. */
    Array.prototype.slice.call(document.body.children).forEach(function (n) {
      if (n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') n.remove();
    });

    // ── player gate ──
    var menu = document.createElement('div');
    menu.id = 'leMenu';
    menu.innerHTML =
      '<h1>' + bilingual(cfg.title) + '</h1>' +
      '<div class="le-pbtns">' +
        '<button class="le-pbtn" data-n="1"><span class="n">1</span>' +
          '<span class="cap">' + (isMl() ? 'ഒരാൾ' : 'One player') + '</span></button>' +
        '<button class="le-pbtn" data-n="3"><span class="n">3</span>' +
          '<span class="cap">' + (isMl() ? 'മൂന്ന് പേർ' : 'Three players') + '</span></button>' +
      '</div>';
    document.body.appendChild(menu);

    var wrap = document.createElement('div');
    wrap.id = 'leWrap';
    wrap.style.display = 'none';
    wrap.innerHTML =
      '<div id="leTop"><div id="leTitle">' + bilingual(cfg.title) + '</div>' +
      '<div id="leHubs"></div></div><div id="lePanels"></div>';
    document.body.appendChild(wrap);

    menu.addEventListener('click', function (e) {
      var b = e.target.closest('.le-pbtn');
      if (!b) return;
      playerCount = +b.dataset.n;
      menu.classList.add('hide');
      setTimeout(function () {
        menu.style.display = 'none';
        wrap.style.display = 'flex';
        begin();
      }, 450);
    });

    if (G()) {
      G().mount();
      G().say(cfg.guideIntro || cfg.title, { hold: 5200 });
    }

    if (W()) {
      W().toolbar({
        lang: true, voice: true, size: true, height: true, home: true,
        reset: function () { begin(); }
      });
      W().onLang(function () { repaintChrome(); });
    }
  }

  function repaintChrome() {
    var ti = document.getElementById('leTitle');
    if (ti) ti.innerHTML = bilingual(cfg.title);
    panels.forEach(function (p) { renderRound(p); });
    drawHubs();
  }

  function begin() {
    var host = document.getElementById('lePanels');
    host.innerHTML = '';
    panels = [];
    for (var i = 0; i < playerCount; i++) {
      var p = {
        idx: i, stage: 0, score: 0, met: {}, pool: [], sound: null, soundTimer: null, el: null
      };
      var d = document.createElement('div');
      d.className = 'le-panel';
      /* The star count is not decoration. "What do I gain" was the exact
         complaint about the version this replaces, and a number that only goes
         up when you were right is the smallest honest answer to it. */
      d.innerHTML =
        '<div class="le-head">' +
          (playerCount > 1
            ? '<span class="le-pname">' + (isMl() ? 'കുട്ടി ' : 'Player ') + (i + 1) + '</span>'
            : '') +
          '<span class="le-score">⭐ <b>0</b></span>' +
        '</div>' +
        '<div class="le-prompt"></div><div class="le-opts"></div>' +
        '<div class="le-note"></div>';
      host.appendChild(d);
      p.el = d;
      d.addEventListener('click', makeTapHandler(p));
      panels.push(p);
      enterStage(p, 0);
    }
    drawHubs();
  }

  /** Add to the score and make the chip react, so the gain is felt not just recorded. */
  function addScore(p, n) {
    p.score += n;
    var chip = p.el && p.el.querySelector('.le-score');
    if (!chip) return;
    chip.querySelector('b').textContent = p.score;
    chip.classList.remove('bump');
    void chip.offsetWidth;
    chip.classList.add('bump');
  }

  function stageOf(p) { return cfg.stages[p.stage]; }

  /** A stage may override the activity's mode. Houses want both: meet the five
   *  types first ('explore'), then be asked to find one ('pick'). Teaching then
   *  testing in one activity is the whole point; a single global mode would
   *  force that to be two separate cards in the menu. */
  function modeOf(p) {
    var st = stageOf(p);
    return (st && st.mode) || cfg.mode || 'pick';
  }

  function drawHubs() {
    var hubs = document.getElementById('leHubs');
    if (!hubs) return;
    // in multiplayer the hubs track the furthest player, since each advances
    // independently and one shared track cannot show three positions
    var at = Math.max.apply(null, panels.map(function (p) { return p.stage; }).concat([0]));
    hubs.innerHTML = cfg.stages.map(function (s, i) {
      return '<div class="le-hub' + (i < at ? ' done' : i === at ? ' on' : '') + '">' +
        '<span>' + (s.icon || '') + '</span><span>' + t(s.label) + '</span>' +
        '<span class="tick">✓</span></div>';
    }).join('');
  }

  function enterStage(p, n) {
    p.stage = n;
    p.met = {};
    var st = stageOf(p);
    if (st && st.bg) p.el.style.backgroundImage = 'url("' + st.bg + '")';
    newRound(p);
  }

  /** Build the next question for this panel. */
  function newRound(p) {
    var st = stageOf(p);
    if (!st) return;
    var items = st.items;

    if (modeOf(p) === 'task') {
      /* Collect items until they add up to an amount. This is the mode for the
         things that are a skill rather than a fact: paying ₹15 is not knowing
         what a ten-rupee note looks like, it is putting one with a five. Every
         item carries a `value`; the tray shows the running total so the child
         can see themselves getting closer, and can take a coin back. */
      p.options = items;
      p.tray = [];
      var amounts = st.amounts || [5, 10, 15, 20];
      p.goal = amounts[Math.floor(Math.random() * amounts.length)];
      p.target = null;
    } else if (modeOf(p) === 'explore') {
      // every item is on the board; the goal is to have met them all
      p.options = items;
      p.target = null;
    } else {
      var remaining = items.filter(function (it) { return !p.met[it.key]; });
      if (!remaining.length) { finishStage(p); return; }
      p.target = remaining[Math.floor(Math.random() * remaining.length)];
      var others = items.filter(function (it) { return it.key !== p.target.key; });
      p.options = shuffle([p.target].concat(shuffle(others).slice(0, DISTRACTORS)));
    }
    renderRound(p);
    askPrompt(p);
  }

  function promptFor(p) {
    var st = stageOf(p);
    if (modeOf(p) === 'task') {
      var unit = st.unit || { en: '', ml: '' };
      var ask = st.ask || { en: 'Pay', ml: 'കൊടുക്കൂ' };
      return { en: ask.en + ' ' + (unit.en || '') + p.goal,
               ml: ask.ml + ' ' + (unit.ml || '') + p.goal };
    }
    if (modeOf(p) === 'explore') {
      return st.prompt || { en: 'Tap each one to meet it', ml: 'ഓരോന്നും തൊട്ടു നോക്കൂ' };
    }
    var q = cfg.question || { en: 'Which one is', ml: 'ഏതാണ്' };
    return {
      en: (q.en || '') + ' ' + (p.target.en || '') + '?',
      ml: (q.ml || '') + ' ' + (p.target.ml || '') + '?'
    };
  }

  function renderRound(p) {
    if (!p.options) return;
    var pr = p.el.querySelector('.le-prompt');
    pr.innerHTML = bilingual(promptFor(p));

    /* Built as DOM rather than an HTML string, deliberately. The string version
       carried the emoji fallback in an inline onerror attribute, and the emoji
       had to be quoted inside an already-quoted attribute — which silently broke
       the markup for every item that had a photo. Attaching the handler as a
       function removes the quoting problem entirely, and an image that 404s
       still degrades to its emoji, which is the rule the whole app follows. */
    var box = p.el.querySelector('.le-opts');
    box.innerHTML = '';
    p.options.forEach(function (it) {
      var card = document.createElement('div');
      card.className = 'le-opt' + (p.met[it.key] ? ' met' : '');
      card.dataset.key = it.key;

      var emoji = document.createElement('div');
      emoji.className = 'emoji';
      emoji.textContent = it.emoji || '❓';

      if (it.img) {
        var img = document.createElement('img');
        img.alt = '';
        img.addEventListener('error', function () {
          if (img.parentNode) img.parentNode.replaceChild(emoji, img);
        });
        img.src = it.img;
        card.appendChild(img);
      } else {
        card.appendChild(emoji);
      }

      var cap = document.createElement('div');
      cap.className = 'cap';
      cap.textContent = t(it);
      card.appendChild(cap);
      box.appendChild(card);
    });
  }

  function askPrompt(p) {
    // only the first panel drives the guide and the voice: three panels each
    // asking their own question out loud is the multiplayer noise problem
    if (p.idx !== 0) return;
    var line = promptFor(p);
    if (G()) G().say(line, { hold: 4600 });
    else if (W()) W().say(line);
  }

  function makeTapHandler(p) {
    return function (e) {
      var o = e.target.closest('.le-opt');
      if (!o) return;
      var key = o.dataset.key;
      var st = stageOf(p);
      var item = st.items.filter(function (x) { return x.key === key; })[0];
      if (!item) return;

      if (modeOf(p) === 'explore') { meet(p, item, o); return; }

      if (item.key === p.target.key) right(p, item, o);
      else wrong(p, item, o);
    };
  }

  /** explore: every tap is valid, and the stage ends when all are met. */
  function meet(p, item, node) {
    var firstTime = !p.met[item.key];
    p.met[item.key] = true;
    node.classList.add('met');
    playItemSound(p, item);
    if (W()) W().say(item);
    if (cfg.onDetail) cfg.onDetail(item, p);

    if (firstTime) {
      addScore(p, 10);
      if (W()) W().tone(440 + Object.keys(p.met).length * 60, 0.12, 'sine', 0.1, 0);
    }
    if (Object.keys(p.met).length >= stageOf(p).items.length) {
      setTimeout(function () { finishStage(p); }, 900);
    }
  }

  function right(p, item, node) {
    node.classList.add('right');
    p.met[item.key] = true;
    addScore(p, 10);

    // pitch climbs with progress, the way word-explorer does it
    var n = Object.keys(p.met).length;
    if (W()) { W().tone(440 + n * 60, 0.13, 'sine', 0.11, 0); }
    playItemSound(p, item);
    if (p.idx === 0 && G()) G().cheer(cfg.praise || { en: 'Yes!', ml: 'കൊള്ളാം!' });
    if (cfg.onDetail) cfg.onDetail(item, p);

    setTimeout(function () {
      node.classList.remove('right');
      newRound(p);
    }, cfg.onDetail ? 1600 : 1000);
  }

  function wrong(p, item, node) {
    /* Never punished. A soft yellow glow, a wiggle, a low soft tone, and the
       question stays open. No score is lost — losing points for trying is the
       fastest way to teach a child not to try. */
    node.classList.add('soft');
    if (W()) W().tone(210, 0.16, 'sine', 0.07, 0);
    setTimeout(function () { node.classList.remove('soft'); }, 460);

    p.misses = (p.misses || 0) + 1;
    if (p.idx === 0 && p.misses >= 2 && G()) {
      // after two tries, show them rather than keep asking
      var answer = p.el.querySelector('.le-opt[data-key="' + p.target.key + '"]');
      if (answer) G().point(answer, { hold: 2400 });
      G().say(cfg.hint || { en: 'This one!', ml: 'ഇതാണ്!' }, { hold: 2600 });
      p.misses = 0;
    }
  }

  function finishStage(p) {
    var note = p.el.querySelector('.le-note');
    var next = cfg.stages[p.stage + 1];
    p.misses = 0;

    if (p.idx === 0 && G()) {
      G().cheer(next ? (next.enter || { en: 'Now the next one!', ml: 'ഇനി അടുത്തത്!' })
                     : (cfg.done || { en: 'All done!', ml: 'എല്ലാം കഴിഞ്ഞു!' }));
    }
    if (W()) W().celebrate(p.el.getBoundingClientRect(), true);

    note.innerHTML = bilingual(next ? (next.enter || next.label)
                                    : (cfg.done || { en: 'All done!', ml: 'എല്ലാം കഴിഞ്ഞു!' }));
    note.classList.add('show');

    setTimeout(function () {
      note.classList.remove('show');
      if (next) { enterStage(p, p.stage + 1); drawHubs(); }
      else { enterStage(p, 0); drawHubs(); }   // loop, so the wall never dead-ends
    }, 1700);
  }

  global.LEARN = {
    start: start,
    PLAY_TOP: PLAY_TOP,
    get players() { return playerCount; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
