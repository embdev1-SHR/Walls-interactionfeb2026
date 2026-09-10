/**
 * icon-sprite.js — traffic signals, daily-life signs, phone icons
 * ══════════════════════════════════════════════════════════════════
 *
 * WHY A SPRITE AND NOT EMOJI
 *   The source brief itself proves emoji fail here: ENTRY, EXIT,
 *   NO PARKING, ZEBRA CROSSING and THIS WAY all render as tofu boxes
 *   in the PDF. On the wall an unrenderable sign is a blank card.
 *
 * WHY INLINE JS AND NOT AN EXTERNAL .svg
 *   <use href="signs.svg#id"> is unreliable under Electron's file://
 *   origin. Injecting the sprite into the document guarantees it
 *   resolves offline, which is a hard requirement for this build.
 *
 * WHY THESE ARE HAND-AUTHORED
 *   Drawn on a 24x24 grid in the visual language of Material Symbols
 *   so the set reads as one coherent pack, but with no download, no
 *   npm install, no CDN and no license file to ship. Any real Material
 *   Symbols SVG can be dropped in later as another <symbol> without
 *   touching call sites.
 *
 *   Road signs keep their statutory colours — a NO ENTRY sign that is
 *   not red is not a NO ENTRY sign, and the point of the activity is
 *   recognising the real thing on a real road.
 *
 * USE
 *   <script src="../js/icon-sprite.js"></script>
 *   ICONS.inject();                       // once, after DOM is ready
 *   art: { html: ICONS.use('sign-no-entry') }     // inside a DECK item
 */
(function (global) {
  'use strict';

  var SPRITE = [
    '<svg xmlns="http://www.w3.org/2000/svg" id="wall-icon-sprite" style="display:none">',

    /* ── TRAFFIC SIGNALS ─────────────────────────────────────────
       One housing, three lamps; the live lamp glows and the other two
       sit dark, so red / wait / go read at a glance from across a room. */
    tl('traffic-red',    '#ef4444', '#3f2a2a', '#2a3f2a'),
    tl('traffic-yellow', '#3f3a2a', '#facc15', '#2a3f2a'),
    tl('traffic-green',  '#3f2a2a', '#3f3a2a', '#22c55e'),

    /* ── DAILY-LIFE SIGNS ────────────────────────────────────────── */

    // ENTRY — green, arrow entering a doorway
    sym('sign-entry',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#16a34a"/>' +
      '<path d="M14.5 5h4.2v14h-4.2" fill="none" stroke="#fff" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M5 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M10 8.6 13.6 12 10 15.4" fill="none" stroke="#fff" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>'),

    // EXIT — green, arrow leaving a doorway
    sym('sign-exit',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#16a34a"/>' +
      '<path d="M9.5 5H5.3v14h4.2" fill="none" stroke="#fff" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M11 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M15.4 8.6 19 12l-3.6 3.4" fill="none" stroke="#fff" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>'),

    // GENTS — blue plate, male pictogram
    sym('sign-gents',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#1d4ed8"/>' +
      '<circle cx="12" cy="6.4" r="2.3" fill="#fff"/>' +
      '<path d="M9 10.2h6l1 6h-2.1l-.35 6h-3.1l-.35-6H8z" fill="#fff"/>'),

    // LADIES — magenta plate, female pictogram
    sym('sign-ladies',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#be185d"/>' +
      '<circle cx="12" cy="6.4" r="2.3" fill="#fff"/>' +
      '<path d="M12 9.6c2.4 0 3.6 1.3 4.1 3.4l.9 3.6h-2.4l-.5 5.4h-4.2L9.4 16.6H7l.9-3.6' +
        'c.5-2.1 1.7-3.4 4.1-3.4z" fill="#fff"/>'),

    // THIS WAY — blue plate, direction arrow
    sym('sign-this-way',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#1d4ed8"/>' +
      '<path d="M5 12h11" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M13 7.5 17.8 12 13 16.5" fill="none" stroke="#fff" stroke-width="2.4" ' +
        'stroke-linecap="round" stroke-linejoin="round"/>'),

    // NO ENTRY — red disc, white bar
    sym('sign-no-entry',
      '<circle cx="12" cy="12" r="10.4" fill="#dc2626"/>' +
      '<circle cx="12" cy="12" r="10.4" fill="none" stroke="#fff" stroke-width="1.1"/>' +
      '<rect x="5.6" y="10.4" width="12.8" height="3.2" rx="1" fill="#fff"/>'),

    // ZEBRA CROSSING — blue plate, walker over stripes
    sym('sign-zebra-crossing',
      '<rect x="1" y="1" width="22" height="22" rx="3" fill="#1d4ed8"/>' +
      '<rect x="4"   y="17.4" width="16" height="1.7" rx=".5" fill="#fff"/>' +
      '<rect x="4"   y="20.1" width="16" height="1.7" rx=".5" fill="#fff" opacity=".75"/>' +
      '<circle cx="13" cy="5.4" r="1.9" fill="#fff"/>' +
      '<path d="M13.2 7.8c1 0 1.6.5 1.9 1.4l1.1 3.1-1.6.6-.8-2v2.2l1.9 3.1-1.5.9-2-3.2' +
        '-2.1 2.6-1.3-1.1 2-2.6V9.9l-1.3 1.5-1.4-1 2.1-2.2c.4-.3.8-.4 1.3-.4z" fill="#fff"/>'),

    // NO PARKING — blue disc, red ring and slash, white P
    sym('sign-no-parking',
      '<circle cx="12" cy="12" r="10.4" fill="#1d4ed8"/>' +
      '<circle cx="12" cy="12" r="10.4" fill="none" stroke="#dc2626" stroke-width="2.6"/>' +
      '<path d="M9.2 7.2h3.4c1.9 0 3 1.1 3 2.8s-1.1 2.9-3 2.9h-1.5v3.9H9.2z' +
        'm1.9 1.7v2.3h1.2c.8 0 1.3-.4 1.3-1.15S14.1 8.9 13.3 8.9z" fill="#fff"/>' +
      '<path d="M5.1 18.9 18.9 5.1" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/>'),

    // NO SMOKING — red ring and slash over a cigarette
    sym('sign-no-smoking',
      '<circle cx="12" cy="12" r="10.4" fill="#fff"/>' +
      '<circle cx="12" cy="12" r="10.4" fill="none" stroke="#dc2626" stroke-width="2.6"/>' +
      '<rect x="4.6" y="10.6" width="10.6" height="2.9" rx=".7" fill="#334155"/>' +
      '<rect x="15.9" y="10.6" width="1.6" height="2.9" rx=".5" fill="#f59e0b"/>' +
      '<rect x="18.1" y="10.6" width="1.4" height="2.9" rx=".5" fill="#f59e0b"/>' +
      '<path d="M5.1 18.9 18.9 5.1" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/>'),

    /* ── MOBILE PHONE FEATURES ───────────────────────────────────
       Neutral pictograms; these inherit colour from the card. */

    sym('phone-call',
      '<path d="M6.2 3.4c.7 0 1.3.4 1.6 1l1.2 2.7c.3.7.1 1.5-.5 2L7.4 10.2' +
        'a12.4 12.4 0 0 0 6.4 6.4l1.1-1.1c.5-.6 1.3-.8 2-.5l2.7 1.2c.6.3 1 .9 1 1.6v2.4' +
        'c0 1-.8 1.8-1.8 1.8C10.3 22 2 13.7 2 5.2c0-1 .8-1.8 1.8-1.8z" fill="currentColor"/>'),

    sym('phone-sms',
      '<path d="M4 3.6h16c1.1 0 2 .9 2 2v9.6c0 1.1-.9 2-2 2H9.4L4.9 21a.9.9 0 0 1-1.5-.7' +
        'v-3.1H4c-1.1 0-2-.9-2-2V5.6c0-1.1.9-2 2-2z" fill="currentColor"/>' +
      '<circle cx="8" cy="10.4" r="1.4" fill="#fff"/>' +
      '<circle cx="12" cy="10.4" r="1.4" fill="#fff"/>' +
      '<circle cx="16" cy="10.4" r="1.4" fill="#fff"/>'),

    sym('phone-mic',
      '<rect x="9" y="2.2" width="6" height="11.6" rx="3" fill="currentColor"/>' +
      '<path d="M5.4 11.4a6.6 6.6 0 0 0 13.2 0" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M12 18v3.6M8.6 21.6h6.8" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round"/>'),

    sym('phone-video',
      '<rect x="2" y="5.6" width="13.4" height="12.8" rx="2.4" fill="currentColor"/>' +
      '<path d="m17 11 4.1-2.9c.5-.4 1.2 0 1.2.6v6.6c0 .6-.7 1-1.2.6L17 13z" ' +
        'fill="currentColor"/>'),

    sym('phone-calc',
      '<rect x="4" y="2" width="16" height="20" rx="2.6" fill="currentColor"/>' +
      '<rect x="6.4" y="4.4" width="11.2" height="4" rx="1" fill="#fff"/>' +
      '<circle cx="8"    cy="12"   r="1.35" fill="#fff"/>' +
      '<circle cx="12"   cy="12"   r="1.35" fill="#fff"/>' +
      '<circle cx="16"   cy="12"   r="1.35" fill="#fff"/>' +
      '<circle cx="8"    cy="15.8" r="1.35" fill="#fff"/>' +
      '<circle cx="12"   cy="15.8" r="1.35" fill="#fff"/>' +
      '<circle cx="16"   cy="15.8" r="1.35" fill="#fff"/>' +
      '<circle cx="8"    cy="19.2" r="1.35" fill="#fff"/>' +
      '<circle cx="12"   cy="19.2" r="1.35" fill="#fff"/>' +
      '<circle cx="16"   cy="19.2" r="1.35" fill="#fff"/>'),

    '</svg>'
  ].join('');

  function sym(id, body) {
    return '<symbol id="ic-' + id + '" viewBox="0 0 24 24">' + body + '</symbol>';
  }

  /** Traffic light housing with the three lamp colours supplied. */
  function tl(id, red, amber, green) {
    return sym(id,
      '<rect x="6.4" y="1.4" width="11.2" height="21.2" rx="3.4" fill="#334155"/>' +
      '<circle cx="12" cy="6.6"  r="3.1" fill="' + red   + '"/>' +
      '<circle cx="12" cy="12"   r="3.1" fill="' + amber + '"/>' +
      '<circle cx="12" cy="17.4" r="3.1" fill="' + green + '"/>');
  }

  var injected = false;
  function inject() {
    if (injected || document.getElementById('wall-icon-sprite')) return;
    injected = true;
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = SPRITE;
    document.body.insertBefore(d, document.body.firstChild);
  }

  /** Markup for one icon, sized to fill its container. */
  function use(id, extraStyle) {
    inject();
    return '<svg viewBox="0 0 24 24" style="width:100%;height:100%;' +
           (extraStyle || '') + '"><use href="#ic-' + id + '"></use></svg>';
  }

  global.ICONS = { inject: inject, use: use };
})(typeof window !== 'undefined' ? window : globalThis);
