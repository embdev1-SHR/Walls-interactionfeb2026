/**
 * instrument-icons.js - drawn Kerala instruments
 * ==================================================================
 * The pads used emoji, and the emoji set has no chenda, no chengila and
 * no ilathalam - a drum glyph stood in for three different instruments,
 * so three pads looked identical. These are drawn: a barrel chenda on a
 * strap, a wider maddalam played end-on, a struck bronze gong, a pair of
 * cymbals, a hand bell and a small hourglass udukku.
 *
 * Shape carries the identity, not colour, so they stay separable on a
 * projector and for a colour-blind child.
 */
(function (global) {
  'use strict';
  function svg(b) {
    return '<svg viewBox="0 0 64 64" width="64" height="64" ' +
           'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" ' +
           'style="width:100%;height:100%;display:block">' + b + '</svg>';
  }
  var I = {
    /* barrel drum, slung vertically, struck with sticks */
    chenda: svg(
      '<rect x="20" y="10" width="24" height="44" rx="4" fill="#c08a4a"/>' +
      '<ellipse cx="32" cy="12" rx="12" ry="4.5" fill="#f2e3c8" stroke="#a9763a" stroke-width="2"/>' +
      '<ellipse cx="32" cy="54" rx="12" ry="4.5" fill="#e8d5b4" stroke="#a9763a" stroke-width="2"/>' +
      '<path d="M20 22 h24 M20 32 h24 M20 42 h24" stroke="#8f6330" stroke-width="2"/>' +
      '<path d="M46 16 L57 6 M52 20 L62 11" stroke="#6b4a24" stroke-width="3" stroke-linecap="round"/>'),
    /* wider, shorter barrel played horizontally on the lap */
    maddalam: svg(
      '<rect x="8" y="22" width="48" height="22" rx="11" fill="#b5793d"/>' +
      '<ellipse cx="10" cy="33" rx="4.5" ry="11" fill="#f2e3c8" stroke="#8f5f2c" stroke-width="2"/>' +
      '<ellipse cx="54" cy="33" rx="4.5" ry="11" fill="#f2e3c8" stroke="#8f5f2c" stroke-width="2"/>' +
      '<path d="M18 22 v22 M28 22 v22 M38 22 v22 M46 22 v22" stroke="#8f5f2c" stroke-width="2"/>'),
    /* flat bronze gong struck with a stick */
    chengila: svg(
      '<circle cx="30" cy="34" r="20" fill="#d9a92c" stroke="#a67d14" stroke-width="3"/>' +
      '<circle cx="30" cy="34" r="8" fill="#eec css" opacity="0"/>' +
      '<circle cx="30" cy="34" r="8" fill="#f0cf5e" stroke="#a67d14" stroke-width="2"/>' +
      '<path d="M50 18 L60 8" stroke="#6b4a24" stroke-width="4" stroke-linecap="round"/>'),
    /* a pair of cymbals, face on and edge on */
    ilathalam: svg(
      '<circle cx="22" cy="34" r="17" fill="#e0b944" stroke="#a67d14" stroke-width="2.5"/>' +
      '<circle cx="22" cy="34" r="5" fill="#a67d14"/>' +
      '<ellipse cx="45" cy="34" rx="6" ry="17" fill="#d0a733" stroke="#a67d14" stroke-width="2.5"/>' +
      '<ellipse cx="45" cy="34" rx="2" ry="5" fill="#a67d14"/>'),
    /* small hand bell with a clapper */
    kaimani: svg(
      '<path d="M32 12 C20 12 16 26 15 42 h34 C48 26 44 12 32 12 z" fill="#e0b944" stroke="#a67d14" stroke-width="2.5"/>' +
      '<rect x="12" y="42" width="40" height="5" rx="2.5" fill="#c69a24"/>' +
      '<circle cx="32" cy="52" r="5" fill="#8f6b10"/>' +
      '<rect x="29" y="4" width="6" height="9" rx="3" fill="#8f6b10"/>'),
    /* hourglass drum squeezed in one hand */
    udukku: svg(
      '<path d="M18 12 h28 L36 32 L46 52 H18 L28 32 z" fill="#c08a4a" stroke="#8f6330" stroke-width="2"/>' +
      '<ellipse cx="32" cy="12" rx="14" ry="4.5" fill="#f2e3c8" stroke="#8f6330" stroke-width="2"/>' +
      '<ellipse cx="32" cy="52" rx="14" ry="4.5" fill="#e8d5b4" stroke="#8f6330" stroke-width="2"/>' +
      '<path d="M22 20 L42 44 M42 20 L22 44" stroke="#8f6330" stroke-width="1.6"/>')
  };
  global.INSTRUMENT_ICONS = {
    has: function (k) { return Object.prototype.hasOwnProperty.call(I, k); },
    get: function (k) { return I[k] || ''; },
    uri: function (k) {
      return I[k] ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(I[k]) : '';
    },
    ids: function () { return Object.keys(I); }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.INSTRUMENT_ICONS;
})(typeof window !== 'undefined' ? window : globalThis);
