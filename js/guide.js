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
  /* An owl. The eyes are deliberately enormous — that is what makes an owl
     read as an owl at a glance, and it also makes the blink carry across a
     room, which matters for a character whose job is to be noticed.
     Colours are saturated and outlined: an earlier pastel version of this
     character disappeared against the pale menu background. A dark outline
     also helps with low contrast sensitivity, which is common alongside the
     visual-tracking delays the brief describes. */
  /* Built as named groups so each part can move on its own:
       #g-head      tilts curiously now and then, the way owls do
       #g-tuft-l/r  twitch
       #g-wing-l/r  flap when he cheers
       #g-eyes      blinks (the whole group squashes)
       #g-pupils    looks around, and looks AT whatever he points to
       #g-beak-lo   drops while he is talking, so speech has a mouth
     Drawing order matters: tufts sit inside the head group (so they tilt with
     it) but are drawn before the face disc, so they stay behind it. */
  var ART =
    '<svg viewBox="0 0 120 124" width="100%" height="100%" aria-hidden="true">' +
      '<ellipse cx="60" cy="118" rx="31" ry="5.5" fill="rgba(60,40,20,.20)"/>' +
      '<g stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round">' +
        '<ellipse cx="60" cy="74" rx="36" ry="42" fill="#c08a4e"/>' +
      '</g>' +
      // wings, tucked at the sides — pivot at the shoulder for the flap
      '<path id="g-wing-l" d="M26 60 q-8 24 4 42 q8 6 12 -2 q-10 -20 -6 -40 Z" ' +
        'fill="#a9703f" stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path id="g-wing-r" d="M94 60 q8 24 -4 42 q-8 6 -12 -2 q10 -20 6 -40 Z" ' +
        'fill="#a9703f" stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<g stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round">' +
        '<ellipse cx="60" cy="84" rx="21" ry="26" fill="#f0d9b5"/>' +
        // belly feather marks
        '<path d="M52 78 q4 3 8 0 q4 3 8 0 M54 90 q3 3 6 0 q3 3 6 0" ' +
          'stroke="#d8b98a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M48 114 l-5 6 M48 114 l0 7 M48 114 l5 6" stroke="#e08a2f" ' +
          'stroke-width="3.4" stroke-linecap="round" fill="none"/>' +
        '<path d="M72 114 l-5 6 M72 114 l0 7 M72 114 l5 6" stroke="#e08a2f" ' +
          'stroke-width="3.4" stroke-linecap="round" fill="none"/>' +
      '</g>' +
      '<g id="g-head">' +
        '<path id="g-tuft-l" d="M34 30 L30 8 L50 22 Z" fill="#a9703f" ' +
          'stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path id="g-tuft-r" d="M86 30 L90 8 L70 22 Z" fill="#a9703f" ' +
          'stroke="#6b4423" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<ellipse cx="60" cy="48" rx="33" ry="29" fill="#d9a56a" ' +
          'stroke="#6b4423" stroke-width="2.6"/>' +
        '<g id="g-eyes">' +
          '<circle cx="44" cy="45" r="15" fill="#fffaf2" stroke="#6b4423" stroke-width="2.4"/>' +
          '<circle cx="76" cy="45" r="15" fill="#fffaf2" stroke="#6b4423" stroke-width="2.4"/>' +
          '<g id="g-pupils">' +
            '<circle cx="45.5" cy="46" r="7.4" fill="#2e2016"/>' +
            '<circle cx="74.5" cy="46" r="7.4" fill="#2e2016"/>' +
            '<circle cx="48" cy="43" r="2.7" fill="#fff"/>' +
            '<circle cx="77" cy="43" r="2.7" fill="#fff"/>' +
          '</g>' +
        '</g>' +
        // the inside of the mouth, revealed when the lower beak drops
        '<ellipse cx="60" cy="61" rx="4.6" ry="3.2" fill="#6a2b12"/>' +
        '<path id="g-beak-lo" d="M55.5 59 L64.5 59 L60 65.5 Z" fill="#c9741a" ' +
          'stroke="#6b4423" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M52.5 53 L67.5 53 L60 61.5 Z" fill="#e8921f" ' +
          'stroke="#6b4423" stroke-width="2.2" stroke-linejoin="round"/>' +
        // brow line, which is what gives an owl its friendly-serious look
        '<path d="M30 32 q14 -7 26 2 M90 32 q-14 -7 -26 2" stroke="#6b4423" ' +
          'stroke-width="2.8" stroke-linecap="round" fill="none"/>' +
      '</g>' +
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
    /* ── the owl's own movement ──────────────────────────────────────────
       transform-box:fill-box makes transform-origin percentages refer to each
       part's own bounding box. Without it SVG measures origins from the whole
       canvas, and a wing "pivoting at the shoulder" swings from the corner of
       the picture instead. */
    '#wallGuide svg *{transform-box:fill-box}',

    // head: a curious tilt now and then, held, then back. Owls do this, and it
    // is the single movement that most makes him look like he is listening.
    '#g-head{transform-origin:50% 92%;animation:owlTilt 7.5s ease-in-out infinite}',
    '@keyframes owlTilt{0%,28%,100%{transform:rotate(0)}',
    '  36%,50%{transform:rotate(-8deg)}58%{transform:rotate(0)}',
    '  76%,86%{transform:rotate(6deg)}}',

    // ear tufts: a quick twitch, out of step with each other
    '#g-tuft-l{transform-origin:85% 100%;animation:owlTuftL 5.2s ease-in-out infinite}',
    '#g-tuft-r{transform-origin:15% 100%;animation:owlTuftR 5.2s ease-in-out infinite .6s}',
    '@keyframes owlTuftL{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-14deg)}94%{transform:rotate(5deg)}}',
    '@keyframes owlTuftR{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(14deg)}94%{transform:rotate(-5deg)}}',

    // wings: pivot at the shoulder, flap only when he is pleased
    '#g-wing-l{transform-origin:90% 8%}',
    '#g-wing-r{transform-origin:10% 8%}',
    '#wallGuide.flap #g-wing-l{animation:owlFlapL .3s ease-in-out 4}',
    '#wallGuide.flap #g-wing-r{animation:owlFlapR .3s ease-in-out 4}',
    '@keyframes owlFlapL{0%,100%{transform:rotate(0)}50%{transform:rotate(32deg)}}',
    '@keyframes owlFlapR{0%,100%{transform:rotate(0)}50%{transform:rotate(-32deg)}}',

    // beak: tucked shut at rest, chattering while he speaks
    '#g-beak-lo{transform:translateY(-2.6px)}',
    '#wallGuide.talk #g-beak-lo{animation:owlTalk .19s ease-in-out infinite alternate}',
    '@keyframes owlTalk{from{transform:translateY(-2.6px)}to{transform:translateY(2.8px)}}',

    // pupils: eased, with a little overshoot, so a glance reads as a glance
    '#g-pupils{transition:transform .38s cubic-bezier(.34,1.35,.64,1)}',

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

    /* Some children at this wall are motion-sensitive. If the machine is set to
       reduce motion, he keeps his blink and his talking beak — those carry
       meaning — and drops the idle fidgeting and the flap, which do not. */
    '@media (prefers-reduced-motion:reduce){',
    '  #wallGuide,#wallGuide.cheer,#wallGuideRing,#g-head,#g-tuft-l,#g-tuft-r,',
    '  #wallGuide.flap #g-wing-l,#wallGuide.flap #g-wing-r{animation:none}',
    '  #g-pupils{transition:none}}'
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
    startLooking();
    if (W() && W().onLang) W().onLang(function () { if (last) render(last); });
  }

  /* ── where he is looking ───────────────────────────────────────────────
     Pupils can travel ±3.4 units sideways and ±2.4 up/down inside the eye
     whites before they would touch the rim. */
  var lookTimer = null, lookHeld = false;
  function lookAt(dx, dy) {
    var p = svg && svg.querySelector('#g-pupils');
    if (!p) return;
    dx = Math.max(-3.4, Math.min(3.4, dx));
    dy = Math.max(-2.4, Math.min(2.4, dy));
    p.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
  }

  /* Idle glancing. Mostly he looks out at the room (centre); every few seconds
     he glances somewhere and comes back. Paused while he is looking AT
     something he has pointed to, so a glance cannot pull his eyes off it. */
  function startLooking() {
    clearTimeout(lookTimer);
    lookTimer = setTimeout(function () {
      if (!lookHeld) {
        if (Math.random() < 0.6) {
          lookAt((Math.random() * 2 - 1) * 3.4, (Math.random() * 2 - 1) * 2.2);
          setTimeout(function () { if (!lookHeld) lookAt(0, 0); }, 900 + Math.random() * 900);
        } else {
          lookAt(0, 0);
        }
      }
      startLooking();
    }, 2200 + Math.random() * 2800);
  }

  /* Turn his eyes toward a point on screen, measured from the middle of his
     face, scaled so anything far away pins the pupils to the rim. */
  function lookToward(x, y) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height * 0.37;
    var vx = x - cx, vy = y - cy;
    var len = Math.sqrt(vx * vx + vy * vy) || 1;
    lookAt((vx / len) * 3.4, (vy / len) * 2.4);
  }

  /* ── talking ───────────────────────────────────────────────────────────
     The beak chatters for roughly as long as the sentence takes to say. It is
     an estimate — the voice may be a baked clip or the device voice, and
     neither reports progress the same way — so it errs short rather than
     leaving him mouthing after the sound has stopped. */
  var talkTimer = null;
  function talkFor(text) {
    if (!el) return;
    var n = String(text || '').length;
    var ms = Math.max(700, Math.min(5200, n * 85));
    el.classList.add('talk');
    clearTimeout(talkTimer);
    talkTimer = setTimeout(function () { el.classList.remove('talk'); }, ms);
  }
  function stopTalking() {
    clearTimeout(talkTimer);
    if (el) el.classList.remove('talk');
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
      /* Only move the beak when there is actually going to be a voice. A
         beak chattering in silence — the teacher has muted him, or there is
         no voice stack on this page — tells a child he is speaking when he
         is not, which is worse than standing still. */
      var voiced = true;
      try { voiced = !W().voiceOn || W().voiceOn(); } catch (e) {}
      if (voiced) {
        var spoken = bubble ? bubble.querySelector('.main').textContent : '';
        talkFor(spoken);
        /* Let him be heard over any background score on the page: the music
           dips while he talks, then swells back. On a 5.1 rig he is in the
           centre channel and the score is not, but this keeps him clear on an
           ordinary stereo speaker too. */
        if (global.AMBIENT && global.AMBIENT.duck) {
          try { global.AMBIENT.duck(Math.max(900, Math.min(5200, spoken.length * 85)) + 400); } catch (e) {}
        }
      }
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

    /* He looks at it as well as ringing it. A child follows a gaze far more
       readily than a dashed outline — it is how they learn where adults are
       looking — so the eyes do most of the pointing here. */
    lookHeld = true;
    lookToward(r.left + r.width / 2, r.top + r.height / 2);

    if (opts.hold !== 0) {
      setTimeout(function () {
        ring.style.opacity = '0';
        lookHeld = false;
        lookAt(0, 0);
      }, opts.hold || 2600);
    }
    return GUIDE;
  }

  function unpoint() {
    if (ring) ring.style.opacity = '0';
    lookHeld = false;
    lookAt(0, 0);
    return GUIDE;
  }

  /** Happy bounce, with an optional praise line. */
  function cheer(line) {
    if (!mounted) mount();
    el.classList.remove('cheer', 'flap');
    void el.offsetWidth;          // restart the animations
    el.classList.add('cheer', 'flap');   // bounce, and flap his wings
    setTimeout(function () { el.classList.remove('cheer', 'flap'); }, 1300);
    if (line) say(line, { hold: 2600 });
    return GUIDE;
  }

  function think() {
    if (bubble) bubble.classList.remove('show');
    unpoint();
    stopTalking();
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
