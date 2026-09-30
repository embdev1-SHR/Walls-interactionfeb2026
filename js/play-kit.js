/**
 * play-kit.js — shared furniture for the single-player boards
 * ══════════════════════════════════════════════════════════════════
 *
 * The prompt band, the square photo card, the tally, the finish panel and
 * the never-punish feedback are the same in every activity. Repeating them
 * per file is how small differences crept in — one board punished a wrong
 * tap, another put content in the top third, a third made cards rectangles
 * that cropped the animal's head off.
 *
 * This is FURNITURE ONLY. It deliberately owns no game logic: no rounds, no
 * scoring, no idea what a correct answer is. Each activity brings its own
 * mechanic and calls in here for the parts that should never differ. The
 * September content failed because every board ran the same *mechanic*;
 * sharing the chrome is the opposite move, and lets the mechanic be the
 * only thing a new file has to think about.
 *
 * Rules baked in, so no activity can quietly break them:
 *   · the top band is information only — nothing in it takes a touch
 *   · the board occupies the lower three-quarters, within a child's reach
 *   · cards are square, because object-fit:cover on a tall rectangle
 *     trims the sides off a landscape photograph
 *   · a wrong tap wobbles and costs nothing
 */
(function (global) {
  'use strict';

  function css() {
    if (document.getElementById('pk-css')) return;
    var s = document.createElement('style');
    s.id = 'pk-css';
    s.textContent = [
      '.pk-ask{position:absolute;top:0;left:0;right:0;height:22%;display:flex;',
      '  flex-direction:column;align-items:center;justify-content:center;gap:.4vh;',
      '  pointer-events:none;text-align:center;padding:0 4vw;z-index:5}',
      '.pk-en{font-weight:800;font-size:clamp(15px,2.8vw,28px);color:#2b3440}',
      '.pk-ml{font-family:"Noto Sans Malayalam",sans-serif;font-weight:900;',
      '  font-size:clamp(17px,3.2vw,32px);color:var(--pk-accent,#1d6b63)}',
      '.pk-tally{font-weight:800;font-size:clamp(11px,1.6vw,17px);color:#7b8894;letter-spacing:.05em}',
      '.pk-board{position:absolute;top:24%;left:0;right:0;bottom:3vh;display:flex;',
      '  gap:1.5vw;justify-content:center;align-items:center;padding:0 2.5vw;flex-wrap:wrap}',
      /* square: sized by whichever of height/width is smaller, never by
         height alone, which a max-width would only clip */
      '.pk-card{position:relative;flex:0 0 auto;aspect-ratio:1;height:min(100%,22vw);',
      '  width:auto;border-radius:20px;overflow:hidden;background:#fff;',
      '  border:5px solid #d4dde4;cursor:pointer;box-shadow:0 6px 16px rgba(40,60,75,.16);',
      '  transition:transform .15s,border-color .15s,box-shadow .15s,opacity .3s}',
      '.pk-card img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}',
      '.pk-card .pk-emoji{width:100%;height:100%;display:flex;align-items:center;',
      '  justify-content:center;font-size:clamp(34px,9vh,96px);line-height:1}',
      '.pk-card .pk-cap{position:absolute;left:0;right:0;bottom:0;padding:4px 6px 5px;',
      '  text-align:center;background:linear-gradient(to top,rgba(255,255,255,.97),',
      '  rgba(255,255,255,.8) 72%,transparent);font-family:"Noto Sans Malayalam",sans-serif;',
      '  font-weight:700;font-size:clamp(10px,1.6vw,18px);color:#26313b;line-height:1.35}',
      '.pk-card:active{transform:scale(.97)}',
      '.pk-card.pk-right{border-color:#3fae7c;box-shadow:0 0 0 6px rgba(63,174,124,.3);',
      '  animation:pkYes .45s cubic-bezier(.3,1.5,.5,1)}',
      '@keyframes pkYes{0%{transform:scale(1)}45%{transform:scale(1.08)}100%{transform:none}}',
      '.pk-card.pk-picked{border-color:#f0872f;box-shadow:0 0 0 5px rgba(240,135,47,.3);',
      '  transform:translateY(-6px)}',
      '.pk-card.pk-dim{opacity:.38}',
      '.pk-card.pk-gone{opacity:0;transform:scale(.6);pointer-events:none}',
      '.pk-card.pk-wrong{animation:pkWob .44s ease-in-out;border-color:#e0a83c}',
      '@keyframes pkWob{0%,100%{transform:none}20%{transform:translateX(-9px)}',
      '  40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
      '.pk-done{position:absolute;inset:0;z-index:90;display:none;flex-direction:column;',
      '  align-items:center;justify-content:center;gap:2vh;padding:6vw;text-align:center;',
      '  background:rgba(255,255,255,.95);backdrop-filter:blur(6px)}',
      '.pk-done.show{display:flex}',
      '.pk-done h2{font-weight:800;font-size:clamp(22px,4.6vw,44px);color:var(--pk-accent,#1d6b63)}',
      '.pk-done .ml{font-family:"Noto Sans Malayalam",sans-serif;',
      '  font-size:clamp(14px,2.6vw,24px);color:#55646f}',
      '.pk-again{border:0;border-radius:16px;background:var(--pk-accent,#1d6b63);color:#fff;',
      '  font-weight:800;font-size:clamp(14px,2.4vw,22px);padding:13px 38px;cursor:pointer;',
      '  font-family:inherit}',
      '.pk-note{position:absolute;left:0;right:0;bottom:3vh;z-index:40;display:none;',
      '  justify-content:center;pointer-events:none}',
      '.pk-note.show{display:flex}',
      '.pk-note div{background:rgba(255,255,255,.96);border:4px solid #3fae7c;border-radius:18px;',
      '  padding:10px 26px;font-family:"Noto Sans Malayalam",sans-serif;font-weight:700;',
      '  font-size:clamp(13px,2.4vw,24px);color:#1f6b4a;box-shadow:0 8px 22px rgba(30,80,60,.2)}'
    ].join('');
    document.head.appendChild(s);
  }

  function t(o) { return (global.WALL && WALL.t) ? WALL.t(o) : (o && (o.en || o.ml)) || ''; }

  /**
   * Builds the page and returns the handles an activity needs.
   * opts: { accent, backdrop, ask:{en,ml}, done:{en,ml}, onAgain }
   */
  function page(opts) {
    opts = opts || {};
    css();
    if (opts.accent) document.documentElement.style.setProperty('--pk-accent', opts.accent);
    if (opts.backdrop && global.WALL_BACKDROP) WALL_BACKDROP.set(opts.backdrop);

    var ask = document.createElement('div');
    ask.className = 'pk-ask';
    ask.innerHTML = '<div class="pk-en"></div><div class="pk-ml"></div><div class="pk-tally"></div>';

    var board = document.createElement('div');
    board.className = 'pk-board';

    var note = document.createElement('div');
    note.className = 'pk-note';
    note.innerHTML = '<div></div>';

    var done = document.createElement('div');
    done.className = 'pk-done';
    done.innerHTML = '<h2></h2><div class="ml"></div>' +
                     '<button class="pk-again">↺ വീണ്ടും</button>';

    document.body.appendChild(ask);
    document.body.appendChild(board);
    document.body.appendChild(note);
    document.body.appendChild(done);

    var api = {
      board: board,

      ask: function (o) {
        ask.querySelector('.pk-en').textContent = o.en || '';
        ask.querySelector('.pk-ml').textContent = o.ml || '';
      },
      tally: function (txt) { ask.querySelector('.pk-tally').textContent = txt || ''; },

      /** item: { img, emoji, ml } — photo when there is one, emoji otherwise. */
      card: function (item, onTap) {
        var d = document.createElement('div');
        d.className = 'pk-card';
        d.innerHTML = (item.img ? '<img src="' + item.img + '" alt="">'
                                : '<div class="pk-emoji">' + (item.emoji || '') + '</div>') +
                      (item.ml ? '<div class="pk-cap">' + item.ml + '</div>' : '');
        if (onTap && global.WALL) WALL.bindTouch(d, function () { onTap(d, item); });
        return d;
      },

      /* Size the cards to the board rather than to a fixed fraction of the
         viewport. With twelve cards the fixed size overflowed and the bottom
         row was clipped; with four it left the board half empty. Tries every
         column count and keeps the one that fits biggest. */
      fit: function () {
        var cards = board.querySelectorAll('.pk-card');
        var n = cards.length;
        if (!n) return;
        var W = board.clientWidth, H = board.clientHeight;
        var gap = Math.max(8, W * 0.015);
        var best = 0;
        for (var c = 1; c <= n; c++) {
          var rows = Math.ceil(n / c);
          var w = (W - gap * (c - 1)) / c;
          var h = (H - gap * (rows - 1)) / rows;
          var size = Math.min(w, h);
          if (size > best) best = size;
        }
        /* fit() only stops overflow; it will happily make four cards enormous.
           The cap keeps them a readable object on the wall rather than a
           poster, and keeps every board the same scale as the next. */
        best = Math.min(Math.floor(best) - 2, 240);
        cards.forEach(function (el) {
          el.style.height = best + 'px';
          el.style.width = best + 'px';
        });
      },

      right: function (el) {
        el.classList.add('pk-right');
        if (global.WALL) { WALL.sfx.correct(); WALL.burstAt(el); }
      },
      /** Never punish: wobble, no score change, retry at once. */
      wrong: function (el) {
        el.classList.add('pk-wrong');
        setTimeout(function () { el.classList.remove('pk-wrong'); }, 460);
        if (global.WALL) WALL.sfx.nudge();
      },
      climb: function (n) { if (global.WALL) WALL.tone(440 + n * 60, 0.16, 'sine', 0.12); },

      note: function (o) {
        if (!o) { note.classList.remove('show'); return; }
        note.firstChild.textContent = t(o);
        note.classList.add('show');
        if (global.WALL && WALL.voiceOn() && o.ml) WALL.say(o.ml);
      },

      finish: function (o) {
        done.querySelector('h2').textContent = (o && o.en) || 'Well done!';
        done.querySelector('.ml').textContent = (o && o.ml) || '';
        done.classList.add('show');
        if (global.WALL) { WALL.celebrate(); if (WALL.voiceOn() && o && o.ml) WALL.say(o.ml); }
      },
      hideFinish: function () { done.classList.remove('show'); note.classList.remove('show'); },

      say: function (o) {
        if (global.GUIDE) GUIDE.say(o);
        if (global.WALL && WALL.voiceOn() && o.ml) WALL.say(o.ml);
      },
      cheer: function (o) { if (global.GUIDE) GUIDE.cheer(o || { en: 'Well done!', ml: 'കൊള്ളാം!' }); }
    };

    if (global.WALL) {
      WALL.init();
      WALL.toolbar({
        lang: true, voice: true, size: true, height: true,
        reset: opts.onAgain, heightTarget: '.pk-board'
      });
      WALL.bindTouch(done.querySelector('.pk-again'), function () {
        api.hideFinish();
        if (opts.onAgain) opts.onAgain();
      });
    }
    if (global.GUIDE) GUIDE.mount();
    return api;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t2 = a[i]; a[i] = a[j]; a[j] = t2;
    }
    return a;
  }

  global.PLAYKIT = { page: page, shuffle: shuffle };
})(typeof window !== 'undefined' ? window : globalThis);
