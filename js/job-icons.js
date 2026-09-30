/**
 * job-icons.js — a drawn hat per job
 * ══════════════════════════════════════════════════════════════════
 *
 * Job Hats could not be played with emoji. Across the eighteen jobs the
 * emoji set collapses badly:
 *
 *     👒  farmer, nurse, gardener          (3 jobs, one glyph)
 *     🧢  police, fisherman, driver,
 *         postman, coconut climber         (5 jobs, one glyph)
 *     ⛑️  firefighter, carpenter,
 *         electrician                      (3 jobs, one glyph)
 *
 * A round that offers two identical pictures has no correct answer a child
 * can see, which is what the review reported. These are drawn instead, so
 * every hat is distinct.
 *
 * Distinct in SHAPE as well as colour, deliberately. Colour alone fails for
 * a colour-blind child and washes out under the projector; the silhouettes
 * differ too — a tall toque, a flat mortarboard, a wide straw brim, a
 * crested fire helmet — so they stay separable at any size and in any light.
 *
 * Each entry is an SVG string on a 64x44 viewBox, drawn to sit level on an
 * imagined head at the bottom edge. `hat(id)` returns the markup; `has(id)`
 * says whether a job has one at all, so a job with no headgear is never
 * given an invented one.
 */
(function (global) {
  'use strict';

  function svg(body) {
    /* Explicit width/height as well as a viewBox. Injected as innerHTML into a
       flex box, an SVG with only percentage sizing can resolve to zero and
       render nothing at all — which is exactly how this first shipped. */
    return '<svg viewBox="0 0 64 44" width="64" height="44" ' +
           'xmlns="http://www.w3.org/2000/svg" ' +
           'preserveAspectRatio="xMidYMid meet" ' +
           'style="width:100%;height:auto;display:block">' + body + '</svg>';
  }

  var HATS = {
    /* white cap with a red cross — the one hat that carries a symbol */
    nurse: svg(
      '<path d="M14 34 Q32 14 50 34 Z" fill="#ffffff" stroke="#c9ccd6" stroke-width="2"/>' +
      '<rect x="29" y="22" width="6" height="14" fill="#d6332e"/>' +
      '<rect x="25" y="26" width="14" height="6" fill="#d6332e"/>'),

    /* flat mortarboard, unmistakable silhouette */
    teacher: svg(
      '<path d="M32 10 L60 20 L32 30 L4 20 Z" fill="#2b2f45"/>' +
      '<path d="M18 24 V33 Q32 40 46 33 V24" fill="#3c4160"/>' +
      '<circle cx="60" cy="20" r="2.5" fill="#e0b64a"/>' +
      '<path d="M60 20 V32" stroke="#e0b64a" stroke-width="2"/>'),

    /* wide straw brim, tan */
    farmer: svg(
      '<ellipse cx="32" cy="32" rx="28" ry="7" fill="#d9a441"/>' +
      '<path d="M20 32 Q32 8 44 32 Z" fill="#e8bc63"/>' +
      '<path d="M20 29 Q32 25 44 29" stroke="#b9862c" stroke-width="3" fill="none"/>'),

    /* floppy sun hat with a green band — rounder crown than the straw hat */
    gardener: svg(
      '<ellipse cx="32" cy="31" rx="26" ry="8" fill="#9ccf7a"/>' +
      '<path d="M19 31 Q32 11 45 31 Z" fill="#c2e3a8"/>' +
      '<path d="M19 28 Q32 24 45 28" stroke="#4f8f3b" stroke-width="4" fill="none"/>'),

    /* navy peaked cap with a badge */
    police: svg(
      '<path d="M16 26 Q32 10 48 26 L48 30 L16 30 Z" fill="#20305e"/>' +
      '<rect x="14" y="29" width="36" height="5" rx="2" fill="#16224a"/>' +
      '<path d="M10 34 Q32 40 54 34 L54 31 Q32 36 10 31 Z" fill="#0f1832"/>' +
      '<rect x="28" y="19" width="8" height="8" rx="1" fill="#e0b64a"/>'),

    /* khaki flat cap, shallower crown and no badge */
    postman: svg(
      '<path d="M16 27 Q32 15 48 27 L48 31 L16 31 Z" fill="#b39a5e"/>' +
      '<rect x="15" y="30" width="34" height="4" rx="2" fill="#8e7842"/>' +
      '<path d="M46 34 Q56 34 58 30 L58 33 Q56 37 46 37 Z" fill="#8e7842"/>'),

    /* driver: flat cap with a side-swept crown */
    driver: svg(
      '<path d="M14 30 Q22 16 40 18 Q50 20 50 30 Z" fill="#4a5568"/>' +
      '<rect x="13" y="29" width="38" height="5" rx="2.5" fill="#36404f"/>' +
      '<path d="M12 34 Q4 33 4 30 Q10 29 14 30 Z" fill="#36404f"/>'),

    /* red fire helmet with a front crest and a long neck brim */
    firefighter: svg(
      '<path d="M12 33 Q32 6 52 33 Z" fill="#cf3b2f"/>' +
      '<path d="M8 33 Q32 42 56 33 L56 36 Q32 45 8 36 Z" fill="#a52a20"/>' +
      '<path d="M32 10 L37 26 H27 Z" fill="#f2d06b"/>'),

    /* yellow hard hat, smooth dome with ribs */
    carpenter: svg(
      '<path d="M16 32 Q32 12 48 32 Z" fill="#e8b93c"/>' +
      '<ellipse cx="32" cy="32" rx="22" ry="5" fill="#c99a25"/>' +
      '<path d="M32 13 V30 M24 16 V30 M40 16 V30" stroke="#c99a25" stroke-width="2"/>'),

    /* blue safety helmet — same family as the hard hat, different colour AND
       a chin strap, so the two never read as one picture */
    electrician: svg(
      '<path d="M16 32 Q32 12 48 32 Z" fill="#3b7dd8"/>' +
      '<ellipse cx="32" cy="32" rx="22" ry="5" fill="#2a5da6"/>' +
      '<path d="M18 32 Q32 42 46 32" stroke="#2a5da6" stroke-width="2.5" fill="none"/>'),

    /* tall pleated toque — the tallest silhouette in the set */
    cook: svg(
      '<path d="M18 30 V20 Q18 8 32 8 Q46 8 46 20 V30 Z" fill="#ffffff" stroke="#cfd3dc" stroke-width="1.5"/>' +
      '<rect x="18" y="29" width="28" height="7" rx="2" fill="#f0f2f6" stroke="#cfd3dc" stroke-width="1.5"/>' +
      '<path d="M25 10 Q25 20 25 28 M32 8 Q32 19 32 28 M39 10 Q39 20 39 28" stroke="#dfe3ea" stroke-width="1.5" fill="none"/>'),

    /* doctor's head mirror — a band, not a hat, which is itself distinctive */
    doctor: svg(
      '<rect x="12" y="26" width="40" height="7" rx="3.5" fill="#3a4152"/>' +
      '<circle cx="32" cy="20" r="11" fill="#dfe4ec" stroke="#9aa3b5" stroke-width="2"/>' +
      '<circle cx="32" cy="20" r="3.5" fill="#3a4152"/>'),

    /* fisherman: white cloth wound round the head, tail to one side */
    fisherman: svg(
      '<path d="M14 32 Q32 12 50 32 Z" fill="#f2f4f8" stroke="#c9ccd6" stroke-width="1.5"/>' +
      '<path d="M14 30 Q32 22 50 30" stroke="#c9ccd6" stroke-width="2" fill="none"/>' +
      '<path d="M50 30 Q58 32 56 38 Q52 35 48 33 Z" fill="#e2e6ee" stroke="#c9ccd6" stroke-width="1.5"/>'),

    /* coconut climber: folded towel over the head, squarer and warmer than
       the fisherman's wrap so the two never collide */
    coconutClimber: svg(
      '<path d="M15 33 L15 22 Q32 14 49 22 L49 33 Z" fill="#e6d2a8" stroke="#c4a86f" stroke-width="1.5"/>' +
      '<path d="M15 26 Q32 19 49 26" stroke="#c4a86f" stroke-width="2" fill="none"/>' +
      '<path d="M15 33 L10 39 L18 38 Z" fill="#d8c193" stroke="#c4a86f" stroke-width="1.2"/>')
  };

  /** Same drawing as an <img> source. An <img> has intrinsic sizing and shows
   *  a broken-image marker if the markup is wrong, so a mistake is visible
   *  instead of silently blank. */
  function dataUri(id) {
    if (!HATS[id]) return '';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(HATS[id]);
  }

  global.JOB_ICONS = {
    has: function (id) { return Object.prototype.hasOwnProperty.call(HATS, id); },
    hat: function (id) { return HATS[id] || ''; },
    dataUri: dataUri,
    ids: function () { return Object.keys(HATS); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.JOB_ICONS;
})(typeof window !== 'undefined' ? window : globalThis);
