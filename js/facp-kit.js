/* ============================================================
   facp-kit.js — shared bits for the FACP interactive session
   (games/facp-*.html). Built on three-up.js (1/2/3 players) and
   wall-common.js (universal voice, language, ☰ toolbar).

   FACP.quiz(p, body, api, o) runs "look at the picture, pick the
   answer" rounds in one panel:
     o.rounds   [round, …]           shuffled each game
     o.pic(r)   -> image url           the big picture
     o.ask(r)   -> {en,ml,hi,kn}       the question
     o.options(r) -> [{id, img|em, label}]
     o.answer(r)  -> id
     o.wrong(r, op) -> text | null     a gentle hint for a wrong tap
     o.after(r)  -> {img,title,body}   the card shown after a right answer
     o.winTitle, o.winBody

   Never punishes: a wrong tap wobbles, fades that one option and
   gives a hint; the child keeps trying until it's right.
   ============================================================ */
(function (g) {
  'use strict';
  var IMG = '../assets/new/images/facp/';
  var NEXT = { en: 'Next ▶', ml: 'അടുത്തത് ▶', hi: 'अगला ▶', kn: 'ಮುಂದೆ ▶' };
  var TRY = { en: 'Not this one. Try another!', ml: 'ഇതല്ല. മറ്റൊന്ന് നോക്കൂ!', hi: 'यह नहीं। दूसरा चुनो!', kn: 'ಇದಲ್ಲ. ಇನ್ನೊಂದು ನೋಡು!' };


  /* A picture that is missing (not drawn yet, or removed) shows a big emoji
     in its place instead of a broken image. */
  var EMO = {
    'fix-socks': '🧦', 'fix-paste': '🦷', 'fix-hands': '🧼', 'fix-comb': '💇', 'fix-soup': '🥣', 'fix-rain': '🌧️',
    'clean-clothes': '👕', 'clean-cut': '🩸', 'clean-grease': '🖐️', 'clean-shoes': '👟', 'clean-plates': '🍽️',
    'clean-floor': '🍂', 'clean-bus': '🚌', 'clean-teeth': '🦷',
    'tool-detergent': '🧺', 'tool-antiseptic': '🩹', 'tool-soap': '🧼', 'tool-brush': '🖌️', 'tool-dishwash': '🧽',
    'tool-broom': '🧹', 'tool-sanitizer': '🧴', 'tool-toothpaste': '🦷', 'tool-water': '🚰',
    'feel-happy': '😀', 'feel-sad': '😢', 'feel-angry': '😠', 'feel-scared': '😨', 'feel-surprised': '😲', 'feel-tired': '😴',
    'sos-fire': '🔥', 'sos-hurt': '🤕', 'sos-thief': '🦹', 'sos-wire': '⚡', 'sos-lost': '🧒', 'sos-gas': '💨',
    'help-fire': '🚒', 'help-ambulance': '🚑', 'help-police': '🚓', 'help-electric': '🔌', 'help-gas': '🛢️',
    'food-idli': '🍙', 'food-dosa': '🥞', 'food-vada': '🍩', 'food-coffee': '☕', 'food-chutney': '🥥', 'food-sambar': '🍲',
    'food-rice': '🍚', 'food-rasam': '🥣', 'food-curd': '🥛', 'food-papad': '🍪', 'food-pickle': '🥭', 'food-payasam': '🍮',
    'food-meals': '🍛', 'food-leaf': '🍃', 'cust-man': '👨', 'cust-woman': '👩', 'cust-granny': '👵',
    'qc-cup-ok': '☕', 'qc-cup-bad': '💔', 'qc-car-ok': '🚗', 'qc-car-bad': '🔧', 'qc-biscuit-ok': '🍪', 'qc-biscuit-bad': '💔',
    'qc-bottle-ok': '🍼', 'qc-bottle-bad': '🧴'
  };
  function emojiFor(src) {
    var m = /facp\/([a-z-]+)\.jpg/.exec(src || ''); if (!m) return null;
    var k = m[1]; if (EMO[k]) return EMO[k];
    var b = k.replace(/-(wrong|right)$/, ''); return EMO[b] || '🖼️';
  }
  document.addEventListener('error', function (e) {
    var img = e.target; if (!img || img.tagName !== 'IMG') return;
    var em = emojiFor(img.getAttribute('src')); if (!em) return;
    var r = img.getBoundingClientRect(), w = r.width > 24 ? r.width : 0, h = r.height > 24 ? r.height : 0;
    var sp = document.createElement('span');
    sp.className = (img.className || '') + ' facp-emo'; sp.textContent = em;
    sp.style.width = w ? w + 'px' : '30vh'; sp.style.height = h ? h + 'px' : '30vh';
    sp.style.fontSize = (w && h) ? Math.round(Math.min(w, h) * 0.62) + 'px' : '21vh';
    if (img.parentNode) img.parentNode.replaceChild(sp, img);
  }, true);

  function sh(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pic(n) { return IMG + n + '.jpg'; }
  function T(o) { return g.WALL ? WALL.t(o) : (o.en || ''); }
  function say(p, o) { if (p === 0 && g.WALL && WALL.voiceOn()) WALL.say(o); }

  (function css() {
    var s = document.createElement('style');
    s.textContent = [
      /* the picture is not tappable, so it may sit higher than the reach band */
      '.tu-body{padding-top:5vh!important;gap:1.8vh!important}',
      '.facp-pic{flex:0 1 auto;min-height:0;display:flex;justify-content:center;align-items:center;',
      '  background:rgba(255,255,255,.93);border-radius:30px;padding:12px;',
      '  box-shadow:0 8px 0 rgba(30,70,130,.16),0 16px 34px rgba(20,50,100,.22)}',
      '.facp-pic img{height:var(--facp-pic,40vh);max-width:100%;aspect-ratio:1;object-fit:cover;border-radius:20px;display:block}',
      '.tile.txt{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px!important}',
      '.tile.txt .em{line-height:1;font-size:calc(var(--tu-tile,88px) * .38)!important}',
      '.tile.txt .cap{position:static!important;white-space:normal;line-height:1.15;font-size:clamp(11px,calc(var(--tu-tile,88px) * .095),26px)!important}',
      '.tile .cap .num{display:block;font-weight:900;color:#c0262d}',
      '.tile.gone{opacity:.3;pointer-events:none}',
      '.tile.no{animation:facpWob .44s ease-in-out}',
      '@keyframes facpWob{0%,100%{transform:none}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}',
      '.leadml{font-weight:900;font-size:clamp(14px,2.7vh,32px);color:#17245e;text-align:center;flex-shrink:0}',
      '.facp-hint{min-height:1.2em;font-weight:800;font-size:clamp(12px,2.2vh,26px);color:#b4570c;text-align:center;flex-shrink:0;',
      '  background:rgba(255,248,230,.95);border-radius:999px;padding:.3vh 2.4vh}',
      '.facp-hint:empty{visibility:hidden}',
      '.facp-btn{border:0;border-radius:20px;color:#fff;cursor:pointer;font-weight:900;flex-shrink:0;',
      '  font-family:inherit;padding:1.4vh 4vh;font-size:clamp(15px,2.8vh,32px);box-shadow:0 6px 0 rgba(0,0,0,.18)}',
      '.facp-btn:active{transform:translateY(3px);box-shadow:0 3px 0 rgba(0,0,0,.18)}',
      '.tu-pop img{max-height:46vh}',
      '.tile>.facp-emo,.qc-item>.facp-emo{width:100%!important;height:100%!important}',
      '.qc-item>.facp-emo{font-size:15vh!important}',
      '.facp-emo{display:grid;place-items:center;line-height:1;flex-shrink:0;pointer-events:none;background:#fffdf6;border-radius:18px}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  /* one answer tile: a picture with a caption, or a big emoji/word card */
  function tile(op) {
    var t = document.createElement('div');
    t.className = 'tile' + (op.img ? '' : ' wide txt');
    var cap = T(op.label) + (op.num ? '<span class="num">☎ ' + op.num + '</span>' : '');
    t.innerHTML = (op.img ? '<img src="' + op.img + '" alt="">' : '<div class="em">' + (op.em || '') + '</div>') +
      '<div class="cap">' + cap + '</div>';
    return t;
  }
  function nudge(t) { t.classList.add('no'); setTimeout(function () { t.classList.remove('no'); }, 460); if (g.WALL) WALL.sfx.nudge(); }

  /* re-run fn when the 🌐 language changes */
  function onLang(fn) {
    var S = g.WALL_SETTINGS;
    if (S && S.onChange) S.onChange(function (what) { if (what === 'lang') fn(); });
  }

  function button(label, colour, fn) {
    var b = document.createElement('button');
    b.className = 'facp-btn'; b.style.background = colour;
    b.textContent = T(label); b._label = label;
    WALL.bindTouch(b, fn);
    return b;
  }

  function quiz(p, body, api, o) {
    var st = api.state(p);
    var pw = document.createElement('div'); pw.className = 'facp-pic';
    var im = document.createElement('img'); im.alt = ''; pw.appendChild(im);
    var lead = document.createElement('div'); lead.className = 'leadml';
    var hint = document.createElement('div'); hint.className = 'facp-hint';
    var row = document.createElement('div'); row.className = 'row';
    body.appendChild(pw); body.appendChild(lead); body.appendChild(hint); body.appendChild(row);

    function deal(quiet) {
      if (st.i >= st.list.length) return api.win(p, { title: o.winTitle, body: o.winBody, onAgain: start });
      var r = st.list[st.i];
      im.src = o.pic(r);
      lead.textContent = T(o.ask(r));
      hint.textContent = '';
      api.pill(p, 'n', (st.i + 1) + ' / ' + st.list.length);
      row.innerHTML = '';
      (st.opts && quiet ? st.opts : (st.opts = sh(o.options(r)))).forEach(function (op) {
        var t = tile(op);
        WALL.bindTouch(t, function () {
          if (st.busy || t.classList.contains('gone')) return;
          if (op.id === o.answer(r)) {
            st.busy = true;
            t.classList.add('ok'); WALL.sfx.correct();
            hint.textContent = '';
            setTimeout(function () {
              st.busy = false; st.i++; st.opts = null;
              var a = o.after(r);
              api.popup(p, { img: a.img, title: a.title, body: a.body, close: NEXT, onClose: function () { deal(); } });
              if (a.body) setTimeout(function () { say(p, a.body); }, 1600);
            }, 650);
          } else {
            nudge(t); t.classList.add('gone');
            var w = (o.wrong && o.wrong(r, op)) || TRY;
            hint.textContent = T(w); say(p, w);
          }
        });
        row.appendChild(t);
      });
      if (!quiet) say(p, o.ask(r));
    }
    function start() { st.list = sh(o.rounds).slice(0, o.count || o.rounds.length); st.i = 0; st.opts = null; st.busy = false; deal(); }
    onLang(function () { if (st.list && st.i < st.list.length) deal(true); });
    start();
  }

  g.FACP = { IMG: IMG, NEXT: NEXT, sh: sh, pic: pic, T: T, say: say, tile: tile, nudge: nudge, onLang: onLang, button: button, quiz: quiz };
})(window);
