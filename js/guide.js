/**
 * guide.js — കുട്ടു, the Malayalam guide character
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A small elephant calf who stands in the bottom-left corner, says what the
 * child should do next in Malayalam, and reacts to what they do.
 *
 * WHY A CHARACTER AND NOT A TEXT PROMPT
 *   Most of the children at the wall do not read yet, in either language. A
 *   written instruction is decoration to them. A character who says it out
 *   loud, points at the thing, and visibly reacts when they get it right is
 *   the instruction. It also gives the activity somewhere to put the voice —
 *   a disembodied sentence from nowhere is easy to ignore, a voice with a face
 *   is not.
 *
 * WHY AN ELEPHANT
 *   Kerala. It is the animal these children already know, already like, and
 *   already have a word for. Drawn in SVG rather than shipped as an image so
 *   it scales to any wall without a second asset, and so it can blink, bob and
 *   flap its ears without a sprite sheet.
 *
 * WHERE IT SITS
 *   Bottom-LEFT, deliberately:
 *     · the WALL teacher toolbar owns the right edge
 *     · vehicles.html established that the top third of a wall is out of a
 *       child's reach, so nothing that matters goes up there
 *     · low and to one side keeps it out of the play area while staying in
 *       peripheral vision
 *
 * TAP TO REPEAT
 *   Tapping കുട്ടു says the last line again. This is the single most requested
 *   thing by anyone who has watched an autistic child use a talking interface:
 *   they miss it, or they want it again, and having to trigger the whole
 *   activity state again to hear one sentence is a dead end.
 *
 * API
 *   GUIDE.mount()                    add to the page (idempotent)
 *   GUIDE.say({en,ml}, opts)         speech bubble + voice; opts.hold ms
 *   GUIDE.point(elOrSel)             lean toward something and ring it
 *   GUIDE.cheer({en,ml})             happy bounce + optional praise line
 *   GUIDE.think()                    neutral idle, clears the bubble
 *   GUIDE.repeat()                   say the last line again
 *   GUIDE.hide() / GUIDE.show()
 *
 * DEPENDS ON
 *   wall-common.js — for say() (baked clip -> device voice), the ML/EN state
 *   and the teacher's voice mute. Loads fine without it: the bubble still
 *   appears, just silently.
 */
(function (global) {
  'use strict';

  var NAME = { en: 'Kuttu', ml: 'കുട്ടു' };

  var el = null, bubble = null, bubbleText = null, svg = null, ring = null;
  var last = null;             // last line, for repeat()
  var holdTimer = null;
  var blinkTimer = null;
  var mounted = false;

  function W() { return global.WALL; }
  function isMl() { return W() ? W().isMl() : true; }

  /* ── the character ────────────────────────────────────────────────────
     Plain SVG shapes. The eyes and ears are given ids so they can be
     animated without re-rendering the whole drawing. */
  /* Colours are deliberately saturated and outlined. The first version was a
     soft pastel elephant on a soft pastel wall and it simply disappeared —
     which for a character whose whole job is to be noticed is fatal. A dark
     outline also helps children with low contrast sensitivity, which is common
     alongside the visual-tracking delays the brief describes. */
  var ART =
    '<svg viewBox="0 0 120 124" width="100%" height="100%" aria-hidden="true">' +
      '<ellipse cx="60" cy="118" rx="33" ry="5.5" fill="rgba(20,40,60,.20)"/>' +
      '<g stroke="#4a7796" stroke-width="2.6" stroke-linejoin="round">' +
        // ears behind the head
        '<ellipse id="g-ear-l" cx="25" cy="52" rx="17" ry="21" fill="#7fb0d0"/>' +
        '<ellipse id="g-ear-r" cx="95" cy="52" rx="17" ry="21" fill="#7fb0d0"/>' +
        // body
        '<ellipse cx="60" cy="88" rx="29" ry="25" fill="#8fbcd8"/>' +
        // feet, so it stands rather than floats
        '<ellipse cx="45" cy="110" rx="10" ry="7" fill="#7fb0d0"/>' +
        '<ellipse cx="75" cy="110" rx="10" ry="7" fill="#7fb0d0"/>' +
        // head last of the big shapes, so it sits in front of the ears
        '<circle cx="60" cy="50" r="31" fill="#a3cce4"/>' +
      '</g>' +
      // inner ear
      '<ellipse cx="27" cy="52" rx="9" ry="12" fill="#c6dfee"/>' +
      '<ellipse cx="93" cy="52" rx="9" ry="12" fill="#c6dfee"/>' +
      // trunk — drawn over the body with an outline so it reads as separate
      '<path id="g-trunk" d="M60 64 q-5 20 1 30 q4 8 12 5" ' +
        'stroke="#4a7796" stroke-width="15" stroke-linecap="round" fill="none"/>' +
      '<path d="M60 64 q-5 20 1 30 q4 8 12 5" ' +
        'stroke="#a3cce4" stroke-width="11" stroke-linecap="round" fill="none"/>' +
      // eyes
      '<g id="g-eyes">' +
        '<circle cx="47" cy="44" r="6" fill="#24384a"/>' +
        '<circle cx="73" cy="44" r="6" fill="#24384a"/>' +
        '<circle cx="48.9" cy="41.9" r="2.1" fill="#fff"/>' +
        '<circle cx="74.9" cy="41.9" r="2.1" fill="#fff"/>' +
      '</g>' +
      // cheeks + a small smile
      '<circle cx="38" cy="58" r="5.4" fill="#f2a6b0" opacity=".7"/>' +
      '<circle cx="82" cy="58" r="5.4" fill="#f2a6b0" opacity=".7"/>' +
      '<path d="M50 58 q4 5 9 4" stroke="#4a7796" stroke-width="2.4" ' +
        'stroke-linecap="round" fill="none"/>' +
    '</svg>';

  var CSS = [
    '#wallGuide{position:fixed;left:18px;bottom:14px;z-index:480;',
    '  width:calc(112px * var(--wall-scale,1));height:calc(112px * var(--wall-scale,1));',
    '  cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;',
    '  transition:transform .35s cubic-bezier(.34,1.4,.64,1),opacity .3s;',
    '  animation:guideBob 3.4s ease-in-out infinite}',
    '#wallGuide.hidden{opacity:0;pointer-events:none;transform:translateY(20px) scale(.9)}',
    '#wallGuide:active{transform:scale(.94)}',
    '#wallGuide.cheer{animation:guideCheer .62s cubic-bezier(.34,1.5,.64,1) 2}',
    '#wallGuide.lean{transform:rotate(-7deg) translateX(6px)}',
    '@keyframes guideBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '@keyframes guideCheer{0%,100%{transform:translateY(0) rotate(0)}',
    '  30%{transform:translateY(-16px) rotate(-6deg)}',
    '  60%{transform:translateY(-4px) rotate(5deg)}}',
    '#wallGuide .ear{transform-origin:center;animation:guideEar 4.2s ease-in-out infinite}',

    /* speech bubble sits ABOVE the character and never covers it */
    '#wallGuideBubble{position:fixed;left:14px;z-index:481;',
    '  bottom:calc(14px + 112px * var(--wall-scale,1) + 8px);',
    '  max-width:min(32vw,400px);padding:calc(13px * var(--wall-scale,1)) calc(18px * var(--wall-scale,1));',
    '  background:rgba(255,255,255,.97);border:3px solid #7fb4dc;border-radius:20px;',
    '  box-shadow:0 10px 28px rgba(20,60,95,.24);color:#1c3d56;font-weight:800;',
    '  font-size:calc(19px * var(--wall-scale,1));line-height:1.35;',
    '  opacity:0;transform:translateY(10px) scale(.96);pointer-events:none;',
    '  transition:opacity .26s,transform .26s cubic-bezier(.34,1.4,.64,1)}',
    '#wallGuideBubble.show{opacity:1;transform:translateY(0) scale(1)}',
    '#wallGuideBubble .sub{display:block;font-size:calc(14px * var(--wall-scale,1));',
    '  opacity:.62;font-weight:700;margin-top:3px}',
    '#wallGuideBubble::after{content:"";position:absolute;left:34px;bottom:-13px;',
    '  width:0;height:0;border:11px solid transparent;border-top-color:#7fb4dc}',

    /* the ring it draws around whatever it is pointing at */
    /* The ring's opacity is set inline from JS rather than via a .show class.
       Either works — an earlier note here claimed the class version was broken,
       but it was not: the measurement was reading getComputedStyle in the same
       tick as the class was added, before style recalc had run, so it always
       reported the pre-transition value. Inline is kept only because it is one
       less indirection. If you are ever debugging a style that "did not apply",
       wait a frame before reading it back. */
    /* No opacity transition here, deliberately. With one, the ring's fade-in
       could be left stranded part-way — it was measured sitting at computed 0
       with an inline 0.95 set, and even !important did not move it, because a
       transition in flight owns the property. A "look here" hint should appear
       at once in any case; the pulse below is what draws the eye. */
    '#wallGuideRing{position:fixed;z-index:479;border-radius:18px;pointer-events:none;',
    '  border:4px dashed #7fb4dc;opacity:0;',
    '  animation:guideRing 1.5s ease-in-out infinite}',
    '@keyframes guideRing{0%,100%{box-shadow:0 0 0 0 rgba(127,180,220,.45)}',
    '  50%{box-shadow:0 0 0 12px rgba(127,180,220,0)}}',

    '@media (prefers-reduced-motion:reduce){',
    '  #wallGuide,#wallGuide.cheer,#wallGuideRing{animation:none}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('wallGuideCSS')) return;
    var s = document.createElement('style');
    s.id = 'wallGuideCSS';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    injectCSS();

    el = document.createElement('div');
    el.id = 'wallGuide';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Guide — tap to hear again');
    el.innerHTML = ART;
    document.body.appendChild(el);

    bubble = document.createElement('div');
    bubble.id = 'wallGuideBubble';
    bubble.innerHTML = '<span class="main"></span><span class="sub"></span>';
    document.body.appendChild(bubble);

    ring = document.createElement('div');
    ring.id = 'wallGuideRing';
    document.body.appendChild(ring);

    svg = el.querySelector('svg');

    /* Tap to hear it again. Bound on the element itself rather than through
       WALL.bindTouch so the guide works on a page that has no WALL. */
    el.addEventListener('click', function () { repeat(); });

    startBlinking();
    if (W() && W().onLang) W().onLang(function () { if (last) render(last); });
  }

  /* A blink is two quick scale-downs of the eye group. Randomised interval so
     it does not read as a metronome. */
  function startBlinking() {
    clearTimeout(blinkTimer);
    var next = 2600 + Math.random() * 3400;
    blinkTimer = setTimeout(function () {
      var eyes = svg && svg.querySelector('#g-eyes');
      if (eyes) {
        eyes.style.transition = 'transform .09s';
        eyes.style.transformOrigin = '60px 46px';
        eyes.style.transform = 'scaleY(.12)';
        setTimeout(function () { eyes.style.transform = 'scaleY(1)'; }, 95);
      }
      startBlinking();
    }, next);
  }

  function render(line) {
    if (!bubble) return;
    var main = bubble.querySelector('.main');
    var sub = bubble.querySelector('.sub');
    if (typeof line === 'string') {
      main.textContent = line;
      sub.textContent = '';
    } else {
      var ml = isMl();
      main.textContent = ml ? (line.ml || line.en || '') : (line.en || line.ml || '');
      var other = ml ? (line.en || '') : (line.ml || '');
      sub.textContent = other && other !== main.textContent ? other : '';
    }
    bubble.classList.add('show');
  }

  /**
   * Say a line: bubble + voice.
   * @param {{en:string,ml:string}|string} line
   * @param {{hold?:number, cheer?:boolean}} [opts] hold = ms before the bubble
   *        fades. 0 keeps it up until the next say().
   */
  function say(line, opts) {
    if (!mounted) mount();
    opts = opts || {};
    last = line;
    render(line);

    /* WALL.say already honours the teacher's voice toggle and prefers a baked
       Malayalam clip over the device voice, so nothing extra is needed here. */
    if (W()) {
      try {
        if (typeof line === 'string') W().say(line);
        else W().say(line);
      } catch (e) {}
    }

    clearTimeout(holdTimer);
    var hold = opts.hold === undefined ? 4200 : opts.hold;
    if (hold > 0) {
      holdTimer = setTimeout(function () {
        if (bubble) bubble.classList.remove('show');
      }, hold);
    }
    return GUIDE;
  }

  function repeat() {
    if (last) say(last);
    else if (W()) { try { W().sfx && W().sfx.tap && W().sfx.tap(); } catch (e) {} }
    return GUIDE;
  }

  /** Lean toward something and draw a dashed ring around it. */
  function point(target, opts) {
    if (!mounted) mount();
    opts = opts || {};
    var node = typeof target === 'string' ? document.querySelector(target) : target;
    if (!node || !ring) return GUIDE;

    var r = node.getBoundingClientRect();
    if (!r.width || !r.height) return GUIDE;
    var pad = 8;
    ring.style.left = (r.left - pad) + 'px';
    ring.style.top = (r.top - pad) + 'px';
    ring.style.width = (r.width + pad * 2) + 'px';
    ring.style.height = (r.height + pad * 2) + 'px';
    ring.style.opacity = '0.95';

    el.classList.add('lean');
    setTimeout(function () { el.classList.remove('lean'); }, 900);

    if (opts.hold !== 0) {
      setTimeout(function () { ring.style.opacity = '0'; }, opts.hold || 2600);
    }
    return GUIDE;
  }

  function unpoint() { if (ring) ring.style.opacity = '0'; return GUIDE; }

  /** Happy bounce, with an optional praise line. */
  function cheer(line) {
    if (!mounted) mount();
    el.classList.remove('cheer');
    void el.offsetWidth;          // restart the animation
    el.classList.add('cheer');
    setTimeout(function () { el.classList.remove('cheer'); }, 1300);
    if (line) say(line, { hold: 2600 });
    return GUIDE;
  }

  function think() {
    if (bubble) bubble.classList.remove('show');
    unpoint();
    return GUIDE;
  }

  function hide() { if (el) { el.classList.add('hidden'); } think(); return GUIDE; }
  function show() { if (!mounted) mount(); el.classList.remove('hidden'); return GUIDE; }

  var GUIDE = {
    NAME: NAME,
    mount: mount, say: say, point: point, unpoint: unpoint,
    cheer: cheer, think: think, repeat: repeat, hide: hide, show: show,
    get mounted() { return mounted; }
  };

  global.GUIDE = GUIDE;
})(typeof window !== 'undefined' ? window : globalThis);
