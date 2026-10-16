/**
 * guide.js — Owly (കുട്ടു), the wall's guide character
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A cheerful owl in round glasses who stands in the bottom-left corner, says
 * what the child should do next — in whichever of English, Hindi, Malayalam
 * or Kannada the teacher chose on the menu — and reacts to what they do.
 *
 * WHY A CHARACTER AND NOT A TEXT PROMPT
 *   Most of the children at the wall do not read yet, in any language. A
 *   written instruction is decoration to them. A character who says it out
 *   loud, points at the thing, and visibly reacts when they get it right is
 *   the instruction. It also gives the activity somewhere to put the voice —
 *   a disembodied sentence from nowhere is easy to ignore, a voice with a face
 *   is not.
 *
 * HOW HE IS DRAWN
 *   Four supplied illustrations (assets/avatar/owly-*.png): happy, cheering,
 *   curious and sad, cut out by scripts/build-owly.py. He moves with CSS —
 *   a gentle bob, a listening head-tilt, a bounce while he talks, a jump when
 *   he cheers — and all of it stops for anyone whose machine asks for reduced
 *   motion.
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

  var NAME = { en: 'Owly', ml: 'കുട്ടു' };

  var el = null, bubble = null, bubbleText = null, svg = null, ring = null;
  var last = null;             // last line, for repeat()
  var holdTimer = null;
  var blinkTimer = null;
  var mounted = false;

  function W() { return global.WALL; }
  function isMl() { return W() ? W().isMl() : true; }

  /* ── the character: Owly ────────────────────────────────────────────────
     Four supplied poses (assets/avatar/owly-*.png, cut out by
     scripts/build-owly.py). One is shown at a time and they cross-fade:
       happy    waving, books under his wing — his normal self, talking, pointing
       cheer    wings up — when a child gets something right
       curious  question marks — while he is thinking
     There is a sad pose too, and it is deliberately NOT used for mistakes: this
     wall never answers a wrong tap with a sad face. GUIDE.mood('sad') exists
     for a page that has a real reason (a story), nothing more. */
  var ROOT = /\/games\//.test(global.location ? global.location.pathname : '') ? '../' : './';
  var POSES = ['happy', 'cheer', 'curious', 'sad'];
  var ART = '<div class="owly">' + POSES.map(function (p) {
    return '<img class="owly-pose" data-pose="' + p + '" src="' + ROOT + 'assets/avatar/owly-' + p +
           '.png" alt="" draggable="false">';
  }).join('') + '</div>';

  var CSS = [
    '#wallGuide{position:fixed;left:18px;bottom:10px;z-index:480;',
    '  width:calc(140px * var(--wall-scale,1));height:calc(140px * var(--wall-scale,1));',
    '  cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;',
    '  transition:transform .35s cubic-bezier(.34,1.4,.64,1),opacity .3s;',
    '  animation:guideBob 3.4s ease-in-out infinite}',
    '#wallGuide.hidden{opacity:0;pointer-events:none;transform:translateY(20px) scale(.9)}',
    '#wallGuide:active{transform:scale(.94)}',
    '#wallGuide.cheer{animation:guideCheer .62s cubic-bezier(.34,1.5,.64,1) 2}',
    '#wallGuide.lean{transform:rotate(-7deg) translateX(6px)}',
    '@keyframes guideBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '@keyframes guideCheer{0%,100%{transform:translateY(0) rotate(0)}',
    '  30%{transform:translateY(-18px) rotate(-6deg)}',
    '  60%{transform:translateY(-4px) rotate(5deg)}}',
    /* the poses: stacked, one visible, cross-faded */
    '#wallGuide .owly{position:relative;width:100%;height:100%;transform-origin:50% 92%;',
    '  animation:owlyTilt 8s ease-in-out infinite}',
    '#wallGuide .owly-pose{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;',
    '  object-position:50% 100%;opacity:0;transition:opacity .25s;-webkit-user-drag:none;',
    '  filter:drop-shadow(0 6px 8px rgba(40,25,10,.28))}',
    '#wallGuide[data-pose="happy"] .owly-pose[data-pose="happy"],',
    '#wallGuide[data-pose="cheer"] .owly-pose[data-pose="cheer"],',
    '#wallGuide[data-pose="curious"] .owly-pose[data-pose="curious"],',
    '#wallGuide[data-pose="sad"] .owly-pose[data-pose="sad"]{opacity:1}',
    /* a listening tilt now and then — owls do this */
    '@keyframes owlyTilt{0%,30%,100%{transform:rotate(0)}38%,50%{transform:rotate(-5deg)}',
    '  58%{transform:rotate(0)}76%,84%{transform:rotate(4deg)}}',
    /* while he talks: a small rhythmic bounce, so speech has a body */
    '#wallGuide.talk .owly{animation:owlyTalk .34s ease-in-out infinite alternate}',
    '@keyframes owlyTalk{from{transform:scale(1,1)}to{transform:scale(1.035,.965) translateY(2%)}}',

    /* speech bubble sits ABOVE the character and never covers it */
    '#wallGuideBubble{position:fixed;left:14px;z-index:481;',
    '  bottom:calc(10px + 140px * var(--wall-scale,1) + 8px);',
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
    '  #wallGuide,#wallGuide.cheer,#wallGuideRing,#wallGuide .owly,#wallGuide.talk .owly{animation:none}}'
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

    setPose('happy');

    /* Tap to hear it again. Bound on the element itself rather than through
       WALL.bindTouch so the guide works on a page that has no WALL. */
    el.addEventListener('click', function () { repeat(); });

    if (W() && W().onLang) W().onLang(function () { if (last) render(last); });
  }

  /* ── pose ───────────────────────────────────────────────────────────── */
  var poseTimer = null;
  function setPose(p, ms) {
    if (!el || POSES.indexOf(p) === -1) return;
    el.setAttribute('data-pose', p);
    clearTimeout(poseTimer);
    if (ms) poseTimer = setTimeout(function () { el.setAttribute('data-pose', 'happy'); }, ms);
  }
  function mood(p, ms) { if (!mounted) mount(); setPose(p, ms); return GUIDE; }

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

  function S() { return global.WALL_SETTINGS || null; }

  function render(line) {
    if (!bubble) return;
    var main = bubble.querySelector('.main');
    var sub = bubble.querySelector('.sub');
    var lang = S() ? S().lang() : (isMl() ? 'ml' : 'en');
    if (typeof line === 'string') {
      main.textContent = S() ? S().tr(line) : line;
      sub.textContent = '';
    } else if (line.kn) {
      /* A Kannada page: he says it in Kannada, with its meaning underneath in
         the room's language (see js/kannada-voice.js). */
      main.textContent = line.kn;
      var mean = lang === 'ml' ? line.mlSub : (S() ? S().tr({ en: line.en, ml: line.mlSub }) : line.en);
      sub.textContent = mean || line.en || '';
    } else if (S()) {
      /* The chosen language big; underneath, English for anyone who reads it
         — or Malayalam under English, since this room reads Malayalam. */
      main.textContent = S().tr(line);
      var other = lang === 'en' ? (line.ml || '') : S().englishOf(line);
      sub.textContent = other && other !== main.textContent ? other : '';
    } else {
      var ml = isMl();
      main.textContent = ml ? (line.ml || line.en || '') : (line.en || line.ml || '');
      var o2 = ml ? (line.en || '') : (line.ml || '');
      sub.textContent = o2 && o2 !== main.textContent ? o2 : '';
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
    /* A Kannada line goes to the baked Kannada voice, never to WALL.say(),
       which only knows Malayalam and English and would read it wrongly. */
    var kannada = line && typeof line === 'object' && line.kn && global.KN_VOICE;
    // opts.done: run once his Kannada line has finished (or failed, or the voice is off)
    if (kannada) { try { global.KN_VOICE.say(line.kn, opts.done); } catch (e) { if (opts.done) opts.done(); } }

    if (W()) {
      try {
        if (!kannada) W().say(line);
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
    setPose('happy');
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
    el.classList.add('cheer', 'flap');   // bounce, wings up
    setPose('cheer', 2600);
    setTimeout(function () { el.classList.remove('cheer', 'flap'); }, 1300);
    if (line) say(line, { hold: 2600 });
    return GUIDE;
  }

  function think() {
    setPose('curious', 3200);
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
    cheer: cheer, think: think, repeat: repeat, hide: hide, show: show, mood: mood,
    get mounted() { return mounted; }
  };

  global.GUIDE = GUIDE;
})(typeof window !== 'undefined' ? window : globalThis);
