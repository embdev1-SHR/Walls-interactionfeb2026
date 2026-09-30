/**
 * wall-backdrop.js — the illustrated backgrounds
 * ══════════════════════════════════════════════════════════════════
 *
 * Two scenes, matching the reference art:
 *
 *   'sky'     pale blue, cut-paper clouds, a rainbow arc and paper
 *             planes trailing dotted flight paths
 *   'meadow'  warm cream, a band of leaves and flowers along the
 *             bottom, scattered stars and dots
 *
 * DRAWN, NOT PHOTOGRAPHED. Every shape is SVG built here, for three
 * reasons that matter on this wall:
 *
 *   · it scales to 1920x1080 and to a third-width panel without
 *     resampling, so nothing goes soft on the projector;
 *   · it weighs a few kilobytes instead of a few hundred, and the
 *     installer already carries 250 MB of photographs and models;
 *   · the palette is tokenised, so an activity can tint the scene to
 *     its own subject without a new asset.
 *
 * DECORATION ONLY. The backdrop is inserted as the first child of
 * <body> with pointer-events:none and a negative z-index, so it can
 * never intercept a touch meant for the activity. Detail sits at the
 * edges and the middle stays quiet: a busy centre competes with the
 * thing a child is supposed to be looking at, which is the failure
 * mode of most classroom software.
 *
 *   WALL_BACKDROP.set('sky')        // whole page
 *   WALL_BACKDROP.set('meadow', el) // inside one panel
 */
(function (global) {
  'use strict';

  var PALETTE = {
    sky: {
      bg:     'linear-gradient(180deg,#a8d9f0 0%,#bce4f5 55%,#d3eefb 100%)',
      cloud:  '#ffffff',
      cloud2: '#e8f6fd',
      plane:  '#3a9fe0',
      plane2: '#2b7fbd',
      dots:   'rgba(255,255,255,.75)',
      arc:    ['#f08a8a', '#f5c26b', '#7fd6a8', '#8fb8ee', '#a99adf']
    },
    meadow: {
      bg:     'linear-gradient(180deg,#f6e7cd 0%,#f3e2c4 60%,#efdcb8 100%)',
      leaf:   '#2f9e8f',
      leaf2:  '#57bda9',
      petal:  ['#f2879f', '#f6c453', '#ef7b6a', '#8fd0a8'],
      star:   '#f6c453',
      cloud:  '#ffffff'
    }
  };

  function el(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* A cut-paper cloud: three overlapping circles on a flat base, with a
     white outline so it reads against the sky the way the reference does. */
  function cloud(x, y, s, fill) {
    var g = el('g', { transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' });
    var body = el('path', {
      d: 'M0 22 Q0 8 14 8 Q18 -4 34 0 Q48 -6 54 8 Q70 8 70 22 Z',
      fill: fill, stroke: '#ffffff', 'stroke-width': 3, 'stroke-linejoin': 'round'
    });
    g.appendChild(body);
    return g;
  }

  function plane(x, y, r, s, c1, c2) {
    var g = el('g', { transform: 'translate(' + x + ',' + y + ') rotate(' + r + ') scale(' + s + ')' });
    g.appendChild(el('path', { d: 'M0 0 L44 14 L0 28 L10 14 Z', fill: c1 }));
    g.appendChild(el('path', { d: 'M0 0 L10 14 L0 28 Z', fill: c2 }));
    return g;
  }

  function trail(d, colour) {
    return el('path', {
      d: d, fill: 'none', stroke: colour, 'stroke-width': 2.4,
      'stroke-linecap': 'round', 'stroke-dasharray': '1 10'
    });
  }

  function buildSky(P) {
    var svg = el('svg', {
      viewBox: '0 0 1200 675', preserveAspectRatio: 'xMidYMid slice',
      width: '100%', height: '100%'
    });

    /* rainbow, bottom-right — arcs drawn outermost first so each band
       overlaps the last cleanly, as in cut paper */
    var g = el('g', { transform: 'translate(1010,560)' });
    P.arc.forEach(function (c, i) {
      var r = 300 - i * 26;
      g.appendChild(el('path', {
        d: 'M ' + (-r) + ' 0 A ' + r + ' ' + r + ' 0 0 1 ' + r + ' 0',
        fill: 'none', stroke: c, 'stroke-width': 24, 'stroke-linecap': 'round'
      }));
    });
    svg.appendChild(g);

    [[60, 70, 1.5], [330, 30, 1.0], [560, 88, 0.8], [890, 40, 1.15],
     [130, 470, 1.35], [640, 520, 1.6], [1010, 300, 1.0]].forEach(function (c, i) {
      svg.appendChild(cloud(c[0], c[1], c[2], i % 3 === 1 ? P.cloud2 : P.cloud));
    });

    svg.appendChild(trail('M 300 60 Q 340 130 250 150', P.dots));
    svg.appendChild(trail('M 690 40 Q 780 90 700 160', P.dots));
    svg.appendChild(trail('M 60 330 Q 150 380 90 430', P.dots));

    svg.appendChild(plane(232, 96, 18, 1.5, P.plane, P.plane2));
    svg.appendChild(plane(660, 130, -12, 1.2, P.plane, P.plane2));
    svg.appendChild(plane(70, 380, 24, 1.1, P.plane, P.plane2));
    return svg;
  }

  function buildMeadow(P) {
    var svg = el('svg', {
      viewBox: '0 0 1200 675', preserveAspectRatio: 'xMidYMid slice',
      width: '100%', height: '100%'
    });

    svg.appendChild(el('path', {
      d: 'M0 675 L0 560 Q160 505 330 556 Q520 612 700 552 Q900 488 1200 548 L1200 675 Z',
      fill: P.cloud, opacity: '.55'
    }));

    /* leaves along the bottom edge only — the middle of the wall stays
       empty so the activity owns it */
    for (var i = 0; i < 20; i++) {
      var x = 20 + i * 62 + (i % 3) * 14;
      var y = 600 + (i % 4) * 14;
      var rot = (i % 2 ? 1 : -1) * (18 + (i % 5) * 9);
      var lg = el('g', { transform: 'translate(' + x + ',' + y + ') rotate(' + rot + ')' });
      lg.appendChild(el('path', {
        d: 'M0 0 Q26 -30 52 0 Q26 30 0 0 Z',
        fill: i % 2 ? P.leaf : P.leaf2
      }));
      svg.appendChild(lg);
    }

    for (var j = 0; j < 13; j++) {
      var fx = 60 + j * 92, fy = 606 + (j % 3) * 20;
      var col = P.petal[j % P.petal.length];
      var fg = el('g', { transform: 'translate(' + fx + ',' + fy + ')' });
      for (var k = 0; k < 5; k++) {
        fg.appendChild(el('ellipse', {
          cx: 0, cy: -13, rx: 7, ry: 12, fill: col,
          transform: 'rotate(' + (k * 72) + ')'
        }));
      }
      fg.appendChild(el('circle', { cx: 0, cy: 0, r: 6, fill: '#ffffff' }));
      svg.appendChild(fg);
    }

    [[150, 90], [420, 56], [760, 104], [1050, 70], [300, 200], [900, 220]]
      .forEach(function (s) {
        svg.appendChild(el('path', {
          d: 'M0 -13 L4 -4 L13 0 L4 4 L0 13 L-4 4 L-13 0 L-4 -4 Z',
          fill: P.star, transform: 'translate(' + s[0] + ',' + s[1] + ')', opacity: '.85'
        }));
      });

    for (var d = 0; d < 22; d++) {
      svg.appendChild(el('circle', {
        cx: 40 + (d * 97) % 1160, cy: 60 + (d * 53) % 380, r: 4 + (d % 3),
        fill: P.petal[d % P.petal.length], opacity: '.4'
      }));
    }
    return svg;
  }

  var BUILD = { sky: buildSky, meadow: buildMeadow };

  function set(name, host) {
    var P = PALETTE[name];
    if (!P) return null;
    host = host || document.body;

    var old = host.querySelector(':scope > .wall-backdrop');
    if (old) old.remove();

    var box = document.createElement('div');
    box.className = 'wall-backdrop';
    box.setAttribute('aria-hidden', 'true');
    /* Never in the way of a touch: behind everything, and transparent to
       pointers so a tap always reaches the activity. */
    box.style.cssText = 'position:absolute;inset:0;z-index:-1;overflow:hidden;' +
      'pointer-events:none;background:' + P.bg;
    box.appendChild(BUILD[name](P));

    if (host === document.body) {
      box.style.position = 'fixed';
      /* z-index:-1 only paints behind if the body itself is not opaque. */
      document.body.style.background = 'transparent';
    } else if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }
    host.insertBefore(box, host.firstChild);
    return box;
  }

  global.WALL_BACKDROP = { set: set, names: function () { return Object.keys(BUILD); } };
})(typeof window !== 'undefined' ? window : globalThis);
