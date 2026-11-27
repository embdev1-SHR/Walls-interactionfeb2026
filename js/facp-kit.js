/* ============================================================
   facp-kit.js — shared bits for the FACP interactive session
   (games/facp-*.html). Built on three-up.js (1/2/3 players) and
   wall-common.js (universal voice, language, ☰ toolbar).

   FACP.quiz(p, body, api, o) runs "look at the picture, pick the
   answer" rounds in one panel:
     o.rounds   [round, …]           shuffled each game, SHARED by every panel
     o.pic(r)   -> image url           the big picture
     o.ask(r)   -> {en,ml,hi,kn}       the question
     o.options(r) -> [{id, img|em, label}]
     o.answer(r)  -> id
     o.wrong(r, op) -> text | null     a gentle hint for a wrong tap
     o.after(r)  -> {img,title,body}   the card shown after a right answer
     o.winTitle, o.winBody

   EVERYONE GETS THE SAME QUESTION. All panels see the same picture and
   the same tiles, so the voice can ask the question once, out loud, for
   the whole room. The next question comes when every player has got it
   (a player who is done sees "wait for your friends").

   A wrong tap is said out loud from any panel — "That is wrong. Think
   again!" — then that option fades; the child keeps trying until it's
   right. Each activity opens with a spoken "what to do" (INTRO).
   ============================================================ */
(function (g) {
  'use strict';
  var IMG = '../assets/new/images/facp/';
  var NEXT = { en: 'Next ▶', ml: 'അടുത്തത് ▶', hi: 'अगला ▶', kn: 'ಮುಂದೆ ▶' };
  var WRONG = { en: 'That is wrong. Think again!', ml: 'അത് തെറ്റാണ്. ആലോചിച്ച് വീണ്ടും നോക്കൂ!', hi: 'यह गलत है। सोचो और फिर से कोशिश करो!', kn: 'ಇದು ತಪ್ಪು. ಯೋಚಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸು!' };
  var WAIT = { en: 'Well done! Wait for your friends.', ml: 'നന്നായി! കൂട്ടുകാർക്കായി കാത്തിരിക്കൂ.', hi: 'शाबाश! अपने दोस्तों का इंतज़ार करो।', kn: 'ಶಾಬಾಶ್! ಸ್ನೇಹಿತರಿಗಾಗಿ ಕಾಯು.' };

  /* What to do, said once when the activity opens (games/facp-<name>.html) */
  var INTRO = {
    'fix-mistake': { en: 'Look at the picture carefully. Something is wrong. Find the mistake and touch the right answer.',
      ml: 'ചിത്രം നന്നായി നോക്കൂ. എന്തോ ഒരു തെറ്റുണ്ട്. തെറ്റ് കണ്ടെത്തി ശരിയായ ഉത്തരം തൊടൂ.',
      hi: 'तस्वीर ध्यान से देखो। कुछ गलत है। गलती ढूँढो और सही जवाब को छुओ।',
      kn: 'ಚಿತ್ರವನ್ನು ಚೆನ್ನಾಗಿ ನೋಡು. ಏನೋ ತಪ್ಪಾಗಿದೆ. ತಪ್ಪನ್ನು ಹುಡುಕಿ ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಮುಟ್ಟು.' },
    'clean-right': { en: 'Look at what is dirty. Touch the thing we use to clean it.',
      ml: 'എന്താണ് വൃത്തികേടായതെന്ന് നോക്കൂ. അത് വൃത്തിയാക്കാൻ ഉപയോഗിക്കുന്നത് തൊടൂ.',
      hi: 'देखो क्या गंदा है। उसे साफ़ करने वाली चीज़ को छुओ।',
      kn: 'ಏನು ಕೊಳಕಾಗಿದೆ ಎಂದು ನೋಡು. ಅದನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸುವ ವಸ್ತುವನ್ನು ಮುಟ್ಟು.' },
    'feelings': { en: 'First touch each face to learn the feelings. Then look at the picture and touch how the child feels.',
      ml: 'ആദ്യം ഓരോ മുഖത്തും തൊട്ട് വികാരങ്ങൾ പഠിക്കൂ. പിന്നെ ചിത്രം നോക്കി കുട്ടിക്ക് എന്ത് തോന്നുന്നു എന്നത് തൊടൂ.',
      hi: 'पहले हर चेहरे को छूकर भावनाएँ सीखो। फिर तस्वीर देखो और छुओ कि बच्चा कैसा महसूस कर रहा है।',
      kn: 'ಮೊದಲು ಪ್ರತಿ ಮುಖವನ್ನು ಮುಟ್ಟಿ ಭಾವನೆಗಳನ್ನು ಕಲಿ. ನಂತರ ಚಿತ್ರ ನೋಡಿ ಮಗುವಿಗೆ ಹೇಗನಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ಮುಟ್ಟು.' },
    'who-to-call': { en: 'Look at what is happening. Touch the helper we should call.',
      ml: 'എന്താണ് സംഭവിക്കുന്നതെന്ന് നോക്കൂ. നമ്മൾ വിളിക്കേണ്ട സഹായിയെ തൊടൂ.',
      hi: 'देखो क्या हो रहा है। जिस मददगार को फ़ोन करना है, उसे छुओ।',
      kn: 'ಏನಾಗುತ್ತಿದೆ ಎಂದು ನೋಡು. ನಾವು ಕರೆ ಮಾಡಬೇಕಾದ ಸಹಾಯಕನನ್ನು ಮುಟ್ಟು.' },
    'tiffin-counter': { en: 'A customer wants food. Touch the food they ask for to put it on the leaf. Then touch Serve.',
      ml: 'ഒരാൾക്ക് ഭക്ഷണം വേണം. ചോദിക്കുന്ന ഭക്ഷണം തൊട്ട് ഇലയിൽ വെക്കൂ. പിന്നെ വിളമ്പൂ തൊടൂ.',
      hi: 'एक ग्राहक को खाना चाहिए। जो खाना माँगे उसे छूकर पत्ते पर रखो। फिर परोसो को छुओ।',
      kn: 'ಗ್ರಾಹಕರಿಗೆ ಊಟ ಬೇಕು. ಅವರು ಕೇಳಿದ ಆಹಾರ ಮುಟ್ಟಿ ಎಲೆಯ ಮೇಲೆ ಇಡು. ನಂತರ ಬಡಿಸು ಮುಟ್ಟು.' },
    'quality-check': { en: 'Things move along the belt. Touch the broken ones to take them out. Let the good ones go.',
      ml: 'സാധനങ്ങൾ ബെൽറ്റിലൂടെ നീങ്ങുന്നു. കേടായവ തൊട്ട് മാറ്റൂ. നല്ലവ പോകട്ടെ.',
      hi: 'चीज़ें बेल्ट पर चल रही हैं। खराब चीज़ों को छूकर हटाओ। अच्छी चीज़ों को जाने दो।',
      kn: 'ವಸ್ತುಗಳು ಬೆಲ್ಟ್ ಮೇಲೆ ಸಾಗುತ್ತಿವೆ. ಹಾಳಾದವನ್ನು ಮುಟ್ಟಿ ತೆಗೆ. ಒಳ್ಳೆಯವು ಹೋಗಲಿ.' }
  };


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
  /* feedback to the child who tapped — from any panel */
  function sayAny(o) { if (g.WALL && WALL.voiceOn()) WALL.say(o); }

  /* call fn once the voice has finished (a baked clip or the device voice) */
  function whenQuiet(fn) {
    var t0 = Date.now();
    (function poll() {
      var busy = (g.VOICE && VOICE.current && VOICE.current()) || (g.speechSynthesis && speechSynthesis.speaking);
      var el = Date.now() - t0;
      if ((busy || el < 400) && el < 15000) return setTimeout(poll, 200);
      fn();
    })();
  }
  /* say several lines one after another */
  function sayAll(list, done) {
    list = list.filter(Boolean);
    if (!list.length || !(g.WALL && WALL.voiceOn())) { if (done) done(); return; }
    WALL.say(list[0]);
    whenQuiet(function () { sayAll(list.slice(1), done); });
  }

  /* the activity's "what to do", once per page, then fn */
  var introDone = false;
  function intro(fn) {
    if (introDone) { if (fn) fn(); return; }
    introDone = true;
    var m = /facp-([a-z-]+)\.html/.exec(location.pathname);
    var line = m && INTRO[m[1]];
    if (line) setTimeout(function () { sayAll([line], fn); }, 600); else if (fn) fn();
  }

  /* One shared run of rounds for every panel on the page. Each panel joins
     with show(p) (draw the current round) and wait(p) ("wait for your
     friends"). done(p) says that panel has finished the round; when every
     panel that joined is done, all of them move on together. After the
     last round done() means "again", and a fresh shuffle starts. */
  var groups = {};
  function group(key, make, onNext) {
    if (groups[key]) return groups[key];
    var G = groups[key] = { list: make(), i: 0, m: {}, ready: {}, data: null, first: -1 };
    G.cur = function () { return G.list[G.i]; };
    G.over = function () { return G.i >= G.list.length; };
    G.join = function (p, h) { G.m[p] = h; h.show(); };
    G.done = function (p) {
      G.ready[p] = true;
      var all = Object.keys(G.m).every(function (q) { return G.ready[q]; });
      if (!all) { G.m[p].wait(); return; }
      if (G.over()) { G.list = make(); G.i = 0; } else G.i++;
      G.ready = {}; G.data = null; G.first = -1;
      Object.keys(G.m).forEach(function (q) { G.m[q].show(); });
      if (onNext) onNext(G);
    };
    return G;
  }
  group.has = function (key) { return !!groups[key]; };

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
    var pw = document.createElement('div'); pw.className = 'facp-pic';
    var im = document.createElement('img'); im.alt = ''; pw.appendChild(im);
    var lead = document.createElement('div'); lead.className = 'leadml';
    var hint = document.createElement('div'); hint.className = 'facp-hint';
    var row = document.createElement('div'); row.className = 'row';
    body.appendChild(pw); body.appendChild(lead); body.appendChild(hint); body.appendChild(row);
    var busy = false;

    var fresh = !groups.quiz;
    var G = group('quiz', function () { return sh(o.rounds).slice(0, o.count || o.rounds.length); }, ask);
    function ask() { if (!G.over()) sayAny(o.ask(G.cur())); }
    /* tap the question to hear it again */
    WALL.bindTouch(lead, function () { if (!G.over()) sayAny(o.ask(G.cur())); });

    function show() {
      busy = false;
      if (G.over()) {
        pw.style.visibility = 'hidden'; lead.textContent = ''; hint.textContent = ''; row.innerHTML = '';
        if (G.ready[p]) return wait();
        return api.win(p, { title: o.winTitle, body: o.winBody, onAgain: function () { G.done(p); } });
      }
      pw.style.visibility = '';
      if (G.ready[p]) return wait();
      var r = G.cur();
      im.src = o.pic(r);
      lead.textContent = T(o.ask(r));
      hint.textContent = '';
      api.pill(p, 'n', (G.i + 1) + ' / ' + G.list.length);
      row.innerHTML = '';
      /* the same tiles, in the same order, in every panel */
      (G.data || (G.data = sh(o.options(r)))).forEach(function (op) {
        var t = tile(op);
        WALL.bindTouch(t, function () {
          if (busy || t.classList.contains('gone')) return;
          if (op.id === o.answer(r)) {
            busy = true;
            t.classList.add('ok'); WALL.sfx.correct();
            hint.textContent = '';
            var firstHere = G.first < 0; if (firstHere) G.first = p;
            setTimeout(function () {
              var a = o.after(r);
              api.popup(p, { img: a.img, title: a.title, body: a.body, close: NEXT, say: false, onClose: function () { G.done(p); } });
              /* the explanation is said once, for the first player to get it */
              if (firstHere) sayAll([a.title, a.body]);
            }, 650);
          } else {
            nudge(t); t.classList.add('gone');
            var w = o.wrong && o.wrong(r, op);
            hint.textContent = T(WRONG) + (w ? ' ' + T(w) : '');
            sayAll([WRONG, w]);
          }
        });
        row.appendChild(t);
      });
    }
    function wait() { row.innerHTML = ''; hint.textContent = T(WAIT); }

    G.join(p, { show: show, wait: wait });
    if (fresh) intro(ask);
    onLang(function () { show(); });
  }

  g.FACP = { IMG: IMG, NEXT: NEXT, WRONG: WRONG, WAIT: WAIT, sh: sh, pic: pic, T: T, say: say, sayAny: sayAny, sayAll: sayAll,
             whenQuiet: whenQuiet, intro: intro, group: group, tile: tile, nudge: nudge, onLang: onLang, button: button, quiz: quiz };
})(window);
