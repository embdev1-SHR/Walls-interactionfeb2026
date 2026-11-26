/* ui-preview.js — the behaviour for ui-preview.html (open the .html). */
(function () {
'use strict';
var W = 5780, H = 1080, S = window.WALL_SETTINGS, stage = document.getElementById('stage'), content = document.getElementById('content');
var P = function (p) { return String(p || '').replace(/^\.\.\//, ''); };
/* R(): an asset path, or its packed copy in the one-file build (scripts/build-preview.js) */
function R(p) { p = P(p); return (window.PREVIEW_ASSETS && PREVIEW_ASSETS[p]) || p; }
/* VIEW: on the wall (≈5.35:1) the whole wall fits 1:1. On a normal screen the
   default is FILL HEIGHT — true size for the screen's height, swipe or scroll
   sideways across the wall; "Whole wall" shrinks all 5780 px into the window. */
var SCALE = 1, uiW = W, uiH = H, frame = document.getElementById('frame'), scroller = document.getElementById('scroller'), uiLayer = document.getElementById('ui');
var VIEW = innerWidth / innerHeight > 3 ? 'wall' : 'fill';
function fit() {
  var iw = innerWidth, ih = innerHeight;
  SCALE = VIEW === 'wall' ? Math.min(iw / W, ih / H) : ih / H;
  stage.style.transform = 'scale(' + SCALE + ')';
  frame.style.width = Math.ceil(W * SCALE) + 'px'; frame.style.height = Math.ceil(H * SCALE) + 'px';
  frame.style.margin = VIEW === 'wall' ? ((ih - H * SCALE) / 2) + 'px ' + Math.max(0, (iw - W * SCALE) / 2) + 'px' : '0';
  /* the control layer: screen-sized, drawn at the same scale as the wall */
  uiW = iw / SCALE; uiH = ih / SCALE;
  uiLayer.style.width = uiW + 'px'; uiLayer.style.height = uiH + 'px'; uiLayer.style.transform = 'scale(' + SCALE + ')';
}
addEventListener('resize', fit); fit();
document.addEventListener('fullscreenchange', fit); document.addEventListener('webkitfullscreenchange', fit);
function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function toggleFull() {
  var d = document.documentElement;
  try {
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else { var f = d.requestFullscreen || d.webkitRequestFullscreen; if (f) { var r = f.call(d); if (r && r.catch) r.catch(function () {}); } }
  } catch (e) {}
}

function L4(en, ml, hi, kn) { return { en: en, ml: ml, hi: hi, kn: kn }; }
var UI = {
  back: L4('Back', 'പിന്നോട്ട്', 'पीछे', 'ಹಿಂದೆ'), lang: L4('Language', 'ഭാഷ', 'भाषा', 'ಭಾಷೆ'), height: L4('Height', 'ഉയരം', 'ऊँचाई', 'ಎತ್ತರ'),
  size: L4('Size', 'വലുപ്പം', 'आकार', 'ಗಾತ್ರ'), volume: L4('Volume', 'ശബ്ദം', 'आवाज़', 'ಧ್ವನಿ'),
  full: L4('Full screen', 'ഫുൾ സ്ക്രീൻ', 'पूरी स्क्रीन', 'ಪೂರ್ಣ ಪರದೆ'), view: L4('Whole wall', 'മുഴുവൻ ചുമർ', 'पूरी दीवार', 'ಇಡೀ ಗೋಡೆ'),
  pick: L4('Tap a world to start!', 'ഒരു ലോകം തൊടൂ!', 'एक दुनिया चुनो!', 'ಒಂದು ಲೋಕ ಆರಿಸಿ!'),
  path: L4('Learn · Practise · Quiz', 'പഠിക്കാം · പരിശീലിക്കാം · ചോദ്യം', 'सीखो · अभ्यास · प्रश्न', 'ಕಲಿ · ಅಭ್ಯಾಸ · ಪ್ರಶ್ನೆ'),
  acts: L4('activities', 'പ്രവർത്തനങ്ങൾ', 'गतिविधियाँ', 'ಚಟುವಟಿಕೆಗಳು'),
  hi: L4('Hi! Pick a world to play in!', 'ഹായ്! ഒരു ലോകം തിരഞ്ഞെടുക്കൂ!', 'नमस्ते! एक दुनिया चुनो!', 'ನಮಸ್ಕಾರ! ಒಂದು ಲೋಕ ಆರಿಸಿ!'),
  step: L4("Let's go step by step!", 'നമുക്ക് പടിപടിയായി പോകാം!', 'चलो, कदम-कदम चलें!', 'ಹೆಜ್ಜೆ ಹೆಜ್ಜೆಯಾಗಿ ಹೋಗೋಣ!'),
  wall: L4('This one opens in the wall app.', 'ഇത് വാൾ ആപ്പിൽ തുറക്കും.', 'यह वॉल ऐप में खुलेगा।', 'ಇದು ವಾಲ್ ಆ್ಯಪ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ.'),
  progress: L4('Your Progress', 'നിന്റെ മുന്നേറ്റം', 'तुम्हारी प्रगति', 'ನಿನ್ನ ಪ್ರಗತಿ'), lessons: L4('Lessons completed', 'പൂർത്തിയാക്കിയ പാഠങ്ങൾ', 'पूरे पाठ', 'ಮುಗಿದ ಪಾಠಗಳು'), cont: L4('Continue', 'തുടരാം', 'आगे बढ़ो', 'ಮುಂದುವರಿಸಿ'),
  great: L4('Great Job!', 'കൊള്ളാം!', 'शाबाश!', 'ಭೇಷ್!'), complete: L4('Complete!', 'പൂർത്തിയായി!', 'पूरा हुआ!', 'ಮುಗಿಯಿತು!'),
  starsC: L4('Stars collected', 'കിട്ടിയ നക്ഷത്രങ്ങൾ', 'तारे मिले', 'ಸಿಕ್ಕ ನಕ್ಷತ್ರಗಳು'), doneC: L4('Activities done', 'ചെയ്ത പ്രവർത്തനങ്ങൾ', 'पूरी गतिविधियाँ', 'ಮುಗಿದ ಚಟುವಟಿಕೆಗಳು'),
  again: L4('Again', 'വീണ്ടും', 'फिर से', 'ಮತ್ತೆ'), next: L4('Next', 'അടുത്തത്', 'अगला', 'ಮುಂದೆ'), map: L4('Map', 'വഴി', 'नक्शा', 'ನಕ್ಷೆ'), done: L4('Done', 'കഴിഞ്ഞു', 'हो गया', 'ಆಯಿತು')
};
var Q = {
  meet: L4('Tap an animal to meet it!', 'ഒരു മൃഗത്തെ തൊട്ടു നോക്കൂ!', 'किसी जानवर को छूकर देखो!', 'ಒಂದು ಪ್ರಾಣಿಯನ್ನು ಮುಟ್ಟಿ ನೋಡಿ!'),
  pairs: L4('Find each mother her baby!', 'ഓരോ അമ്മയ്ക്കും കുഞ്ഞിനെ കണ്ടെത്തൂ!', 'हर माँ का बच्चा ढूँढो!', 'ಪ್ರತಿ ತಾಯಿಗೆ ಮರಿಯನ್ನು ಹುಡುಕಿ!'),
  home: L4('Where does it live?', 'ഇത് എവിടെ താമസിക്കുന്നു?', 'यह कहाँ रहता है?', 'ಇದು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತದೆ?'),
  flip: L4('Turn the cards!', 'കാർഡുകൾ മറിക്കൂ!', 'कार्ड पलटो!', 'ಕಾರ್ಡ್ ತಿರುಗಿಸಿ!'),
  turn: L4('Turn it round with your finger!', 'വിരൽ കൊണ്ട് തിരിച്ചു നോക്കൂ!', 'उँगली से घुमाओ!', 'ಬೆರಳಿನಿಂದ ತಿರುಗಿಸಿ!'),
  zoom: L4('Whose picture is this?', 'ഇത് ആരുടെ ചിത്രം?', 'यह किसकी तस्वीर है?', 'ಇದು ಯಾರ ಚಿತ್ರ?'),
  pens: L4('Farm or forest?', 'നാട്ടിലോ കാട്ടിലോ?', 'खेत या जंगल?', 'ಹೊಲ ಅಥವಾ ಕಾಡು?'),
  farm: L4('Farm', 'നാട്', 'खेत', 'ಹೊಲ'), forest: L4('Forest', 'കാട്', 'जंगल', 'ಕಾಡು'),
  odd: L4('Which one is different?', 'ഏതാണ് വ്യത്യസ്തം?', 'कौन अलग है?', 'ಯಾವುದು ಬೇರೆ?'),
  sound: L4('Who makes this sound?', 'ഈ ശബ്ദം ആരുടേത്?', 'यह आवाज़ किसकी है?', 'ಈ ಶಬ್ದ ಯಾರದು?'),
  hide: L4('Find the hiding animals!', 'ഒളിച്ച മൃഗങ്ങളെ കണ്ടെത്തൂ!', 'छिपे जानवर ढूँढो!', 'ಅಡಗಿದ ಪ್ರಾಣಿಗಳನ್ನು ಹುಡುಕಿ!'),
  draw: L4('Colour the animal!', 'മൃഗത്തിന് നിറം കൊടുക്കൂ!', 'जानवर में रंग भरो!', 'ಪ್ರಾಣಿಗೆ ಬಣ್ಣ ಹಚ್ಚಿ!'),
  popc: L4('Pop the', 'പൊട്ടിക്കൂ:', 'फोड़ो:', 'ಒಡೆಯಿರಿ:'), balloons: L4('balloons!', 'ബലൂണുകൾ!', 'गुब्बारे!', 'ಬಲೂನುಗಳು!'),
  holes: L4('Put each shape in its hole!', 'ഓരോ ആകൃതിയും അതിന്റെ കുഴിയിൽ വയ്ക്കൂ!', 'हर आकार को उसकी जगह रखो!', 'ಪ್ರತಿ ಆಕಾರವನ್ನು ಅದರ ಗೂಡಿಗೆ ಇಡಿ!'),
  big: L4('Tap the BIG one!', 'വലുതിനെ തൊടൂ!', 'बड़े को छुओ!', 'ದೊಡ್ಡದನ್ನು ಮುಟ್ಟಿ!'), small: L4('Tap the SMALL one!', 'ചെറുതിനെ തൊടൂ!', 'छोटे को छुओ!', 'ಚಿಕ್ಕದನ್ನು ಮುಟ್ಟಿ!'),
  pattern: L4('What comes next?', 'അടുത്തത് ഏത്?', 'आगे क्या आएगा?', 'ಮುಂದೆ ಏನು?'),
  feel: L4('How does this child feel?', 'ഈ കുട്ടിക്ക് എന്തു തോന്നുന്നു?', 'यह बच्चा कैसा महसूस कर रहा है?', 'ಈ ಮಗುವಿಗೆ ಹೇಗನಿಸುತ್ತಿದೆ?'),
  garage: L4('Open the garage doors!', 'ഗാരേജ് വാതിലുകൾ തുറക്കൂ!', 'गैराज के दरवाज़े खोलो!', 'ಗ್ಯಾರೇಜ್ ಬಾಗಿಲು ತೆರೆಯಿರಿ!'),
  bloom: L4('Tap a bud to make it bloom!', 'മൊട്ടിൽ തൊട്ടാൽ പൂവിരിയും!', 'कली छुओ, फूल खिलेगा!', 'ಮೊಗ್ಗು ಮುಟ್ಟಿ, ಹೂವು ಅರಳುತ್ತದೆ!'),
  memory: L4('Find the pairs!', 'ജോഡികളെ കണ്ടെത്തൂ!', 'जोड़े ढूँढो!', 'ಜೋಡಿಗಳನ್ನು ಹುಡುಕಿ!'),
  name: L4('Make the name', 'പേര് ഉണ്ടാക്കൂ', 'नाम बनाओ', 'ಹೆಸರು ಮಾಡಿ'),
  guess: L4('Who is hiding?', 'ആരാണ് ഒളിച്ചിരിക്കുന്നത്?', 'कौन छिपा है?', 'ಯಾರು ಅಡಗಿದ್ದಾರೆ?'),
  order: L4('What comes first?', 'ആദ്യം എന്ത്?', 'पहले क्या?', 'ಮೊದಲು ಏನು?'),
  pack: L4('Pack the first aid box!', 'ഫസ്റ്റ് എയ്ഡ് ബോക്സ് നിറയ്ക്കൂ!', 'प्राथमिक चिकित्सा का डिब्बा भरो!', 'ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಪೆಟ್ಟಿಗೆ ತುಂಬಿಸಿ!'),
  dial: L4('Call', 'വിളിക്കൂ', 'फ़ोन करो', 'ಕರೆ ಮಾಡಿ'),
  vase: L4('Make a bouquet of 5 flowers!', '5 പൂക്കൾ കൊണ്ട് പൂച്ചെണ്ട് ഉണ്ടാക്കൂ!', '5 फूलों का गुलदस्ता बनाओ!', '5 ಹೂಗಳ ಗುಚ್ಛ ಮಾಡಿ!'),
  blur: L4('Who works like this?', 'ഇങ്ങനെ ജോലി ചെയ്യുന്നത് ആര്?', 'ऐसे कौन काम करता है?', 'ಹೀಗೆ ಯಾರು ಕೆಲಸ ಮಾಡುತ್ತಾರೆ?'),
  where: L4('Where do they work?', 'ഇവർ എവിടെ ജോലി ചെയ്യുന്നു?', 'ये कहाँ काम करते हैं?', 'ಇವರು ಎಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಾರೆ?'),
  stage: L4('Play each instrument!', 'ഓരോ വാദ്യവും വായിക്കൂ!', 'हर वाद्य बजाओ!', 'ಪ್ರತಿ ವಾದ್ಯ ಬಾರಿಸಿ!'),
  which: L4('Which one is playing?', 'ഏതാണ് വായിക്കുന്നത്?', 'कौन सा बज रहा है?', 'ಯಾವುದು ಬಾರಿಸುತ್ತಿದೆ?'),
  tapcount: L4('Tap and count!', 'തൊട്ട് എണ്ണൂ!', 'छुओ और गिनो!', 'ಮುಟ್ಟಿ ಎಣಿಸಿ!'),
  howmany: L4('How many are there?', 'എത്ര എണ്ണം ഉണ്ട്?', 'कितने हैं?', 'ಎಷ್ಟು ಇವೆ?'),
  bigger: L4('Tap the bigger number!', 'വലിയ സംഖ്യ തൊടൂ!', 'बड़ी संख्या छुओ!', 'ದೊಡ್ಡ ಸಂಖ್ಯೆ ಮುಟ್ಟಿ!'),
  train: L4('All aboard the letter train!', 'അക്ഷര ട്രെയിനിൽ കയറൂ!', 'अक्षर रेलगाड़ी में चढ़ो!', 'ಅಕ್ಷರ ರೈಲು ಹತ್ತಿ!'),
  spell: L4('Spell the word!', 'വാക്ക് എഴുതൂ!', 'शब्द बनाओ!', 'ಪದ ಬರೆಯಿರಿ!'),
  wordpic: L4('Which picture?', 'ഏത് ചിത്രം?', 'कौन सी तस्वीर?', 'ಯಾವ ಚಿತ್ರ?'),
  first: L4('What does it start with?', 'ഏത് അക്ഷരത്തിൽ തുടങ്ങുന്നു?', 'यह किस अक्षर से शुरू होता है?', 'ಇದು ಯಾವ ಅಕ್ಷರದಿಂದ ಶುರು?'),
  diya: L4('Light the lamp with', 'ഈ അക്ഷരമുള്ള വിളക്ക് കത്തിക്കൂ:', 'इस अक्षर वाला दीया जलाओ:', 'ಈ ಅಕ್ಷರದ ದೀಪ ಹಚ್ಚಿ:')
};
function lang() { return S ? S.lang() : 'en'; }
var MORE = { 'Animals': ['जानवर', 'ಪ್ರಾಣಿಗಳು'], 'Bathroom': ['स्नानघर', 'ಸ್ನಾನಗೃಹ'], 'Bored': ['ऊब', 'ಬೇಸರ'], 'Brush your teeth': ['दाँत साफ़ करो', 'ಹಲ್ಲುಜ್ಜು'], 'Bus Stand': ['बस स्टैंड', 'ಬಸ್ ನಿಲ್ದಾಣ'],
  'Chenda': ['चेंडा', 'ಚೆಂಡ'], 'Chengila': ['चेंगिला', 'ಚೆಂಗಿಲ'], 'Chrysanthemum': ['गुलदाउदी', 'ಸೇವಂತಿಗೆ'], 'Comb your hair': ['बाल सँवारो', 'ತಲೆ ಬಾಚು'], 'Dining Room': ['भोजन कक्ष', 'ಊಟದ ಕೋಣೆ'],
  'Excited': ['उत्साहित', 'ಉತ್ಸಾಹ'], 'Gauze': ['जाली की पट्टी', 'ಗಾಜ್ ಬಟ್ಟೆ'], 'Golden Shower': ['अमलतास', 'ಕಕ್ಕೆ ಹೂವು'], 'Happy': ['खुश', 'ಸಂತೋಷ'], 'Kaimani': ['कैमणि', 'ಕೈಮಣಿ'],
  'Living Room': ['बैठक', 'ಹಜಾರ'], 'Maddalam': ['मद्दलम', 'ಮದ್ದಳೆ'], 'Modern House': ['आधुनिक घर', 'ಆಧುನಿಕ ಮನೆ'], 'Mud House': ['मिट्टी का घर', 'ಮಣ್ಣಿನ ಮನೆ'], 'Police Station': ['थाना', 'ಪೊಲೀಸ್ ಠಾಣೆ'],
  'Sad': ['उदास', 'ದುಃಖ'], 'Scared': ['डरा हुआ', 'ಭಯ'], 'Shapes, Colours & Sizes': ['आकार, रंग और नाप', 'ಆಕಾರ, ಬಣ್ಣ ಮತ್ತು ಗಾತ್ರ'], 'Silly': ['शरारती', 'ತುಂಟ'],
  'The World Around Us': ['हमारे आसपास', 'ನಮ್ಮ ಸುತ್ತಮುತ್ತ'], 'Toothbrush': ['टूथब्रश', 'ಹಲ್ಲುಜ್ಜುವ ಬ್ರಷ್'], 'Towel': ['तौलिया', 'ಟವೆಲ್'], 'Wash your face': ['मुँह धोओ', 'ಮುಖ ತೊಳೆ'],
  'Wet hands': ['हाथ गीले करो', 'ಕೈ ಒದ್ದೆ ಮಾಡು'], 'Soap': ['साबुन', 'ಸಾಬೂನು'], 'Rub': ['रगड़ो', 'ಉಜ್ಜು'], 'Rinse': ['धोओ', 'ತೊಳೆ'], 'Dry': ['पोंछो', 'ಒರೆಸು'], 'Comb': ['कंघी', 'ಬಾಚಣಿಗೆ'], 'Fruit Basket': ['फलों की टोकरी', 'ಹಣ್ಣಿನ ಬುಟ್ಟಿ'],
  'Car': ['कार', 'ಕಾರು'], 'Bus': ['बस', 'ಬಸ್'], 'Train': ['रेलगाड़ी', 'ರೈಲು'], 'Boat': ['नाव', 'ದೋಣಿ'] };
function T(o) { if (o == null) return '';
  if (typeof o === 'object' && (lang() === 'hi' || lang() === 'kn') && !o[lang()] && o.en && MORE[o.en]) return MORE[o.en][lang() === 'hi' ? 0 : 1]; if (typeof o !== 'object') return String(o); return S ? S.tr(o) : (o.en || o.ml); }
function alt(o) { if (!o || typeof o !== 'object') return ''; var a = lang() === 'en' ? (o.ml || '') : (o.en || ''); return a === T(o) ? '' : a; }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function chunky(t) { var e = el('span', 'chunky'); e.textContent = t; e.dataset.t = t; return e; }
function starsEl(n, size, pop) { var d = el('div', 'stars'); for (var i = 0; i < 3; i++) d.insertAdjacentHTML('beforeend', '<svg class="star' + (i < n ? ' on' : '') + (pop && i < n ? ' pop' : '') + '" style="--s:' + (size || 54) + 'px;animation-delay:' + i * .18 + 's"><use href="#starSym"/></svg>'); return d; }
function tap(n, fn) { n.addEventListener('click', function (e) { ac(); fn(e); }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pickN(a, n) { return shuffle(a).slice(0, n); }
function place(e, x, y, w, h) { e.style.position = 'absolute'; e.style.left = x + 'px'; e.style.top = y + 'px'; if (w != null) e.style.width = w + 'px'; if (h != null) e.style.height = h + 'px'; return e; }

var AC = null;
function ac() { if (!AC) try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type, v, dl) { var a = ac(); if (!a) return; var t = a.currentTime + (dl || 0), o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .12, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05); }
var sfx = { tap: function () { tone(720, .09, 'triangle', .1); }, pop: function () { tone(520, .08, 'sine', .14); tone(990, .12, 'triangle', .08, .05); },
  right: function () { [660, 880, 1175].forEach(function (f, i) { tone(f, .2, 'triangle', .13, i * .09); }); }, nudge: function () { tone(330, .14, 'sine', .06); tone(300, .16, 'sine', .05, .1); },
  win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, .5, 'triangle', .11, i * .1); }); }, burst: function () { var a = ac(); if (!a) return; var n = a.sampleRate * .18, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); var src = a.createBufferSource(), g = a.createGain(); g.gain.value = .5; src.buffer = buf; src.connect(g); g.connect(a.destination); src.start(); tone(180, .12, 'sine', .2); },
  clink: function () { tone(1900, .08, 'triangle', .08); tone(2600, .12, 'sine', .05, .04); }, kaching: function () { [1046, 1318, 1568, 2093].forEach(function (f, i) { tone(f, .25, 'triangle', .1, i * .07); }); },
  ring: function () { for (var i = 0; i < 6; i++) tone(i % 2 ? 1320 : 990, .12, 'square', .04, i * .14); } };
function quiet() { return !!cur && (cur.group === 'pp-animals-group' || cur.key === 'pp-animals-group' || (cur.from && cur.from.group === 'pp-animals-group')); }
function say(o) { if (quiet()) return; var s = T(o); if (!s) return; try { if (window.VOICE) VOICE.say(s, lang()); } catch (e) {} }
var playing = null;
function play(src) { try { if (playing) playing.pause(); playing = new Audio(src); playing.volume = .8; playing.play().catch(function () {}); } catch (e) {} }

var bubble = document.getElementById('bubble'), owlyImg = document.querySelector('#owly img'), bubbleT = null, lastLine = null;
function owly(o, pose) { lastLine = o; owlyImg.src = R('assets/avatar/owly-' + (pose || 'happy') + '.png');
  bubble.innerHTML = T(o) + (alt(o) ? '<small>' + alt(o) + '</small>' : ''); bubble.classList.add('show');
  clearTimeout(bubbleT); bubbleT = setTimeout(function () { bubble.classList.remove('show'); owlyImg.src = R('assets/avatar/owly-happy.png'); }, 4200); say(o); }
document.getElementById('owly').addEventListener('click', function () { if (lastLine) owly(lastLine); });

/* ═══ BACKGROUNDS — generated abstract shape texture: the level's colour, big
   shapes in lighter and darker tones of it, bright shapes on top. Seeded, so a
   level always gets the same picture; different per level. ═══ */
function smooth(pts) { var d = 'M' + pts[0][0] + ',' + pts[0][1];
  for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ',' + p2[1]; }
  return d; }
function rng(seed) { var x = seed % 2147483647; if (x <= 0) x += 2147483646; return function () { x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
function hsl(h, sat, l) { return 'hsl(' + h + ',' + sat + '%,' + Math.max(8, Math.min(92, l)) + '%)'; }
var FUN = ['#ff5d8f', '#ffd23f', '#3ec1d3', '#7b61ff', '#4cd97b', '#ff8a3d', '#ffffff', '#ff4d4d'];
function blob(cx, cy, r0, r, k) { var pts = []; for (var i = 0; i < k; i++) { var a = i / k * Math.PI * 2, rr = r0 * (.72 + r() * .5); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  pts.push(pts[0], pts[1], pts[2]); return smooth(pts.slice(0, k + 1)) + 'Z'; }
function shapes(r, n) { var g = '';
  for (var i = 0; i < n; i++) {
    var x = r() * W, y = (r() < .55 ? r() * 360 : 360 + r() * 720);
    /* keep the prompt (top middle) clear so the words read cleanly */
    if (y < 340 && Math.abs(x - W / 2) < 1150) x = x < W / 2 ? W / 2 - 1150 - r() * 900 : W / 2 + 1150 + r() * 900;
    var sz = 70 + r() * 210, c = FUN[(r() * FUN.length) | 0], c2 = FUN[(r() * FUN.length) | 0], t = (r() * 7) | 0, rot = (r() * 360) | 0, op = (.75 + r() * .25).toFixed(2), d = (14 + r() * 26) | 0;
    var sh = '';
    if (t === 0) sh = '<circle cx="0" cy="0" r="' + sz / 2 + '" fill="' + c + '"/><circle cx="' + (-sz * .14) + '" cy="' + (-sz * .14) + '" r="' + sz * .16 + '" fill="#fff" opacity=".35"/>';
    else if (t === 1) sh = '<circle cx="0" cy="0" r="' + sz * .4 + '" fill="none" stroke="' + c + '" stroke-width="' + sz * .16 + '"/>';
    else if (t === 2) sh = '<path d="' + blob(0, 0, sz * .5, r, 7) + '" fill="' + c + '"/>';
    else if (t === 3) sh = '<path d="M0,' + (-sz * .5) + ' L' + sz * .45 + ',' + sz * .35 + ' L' + (-sz * .45) + ',' + sz * .35 + 'Z" fill="' + c + '" stroke="' + c + '" stroke-width="' + sz * .14 + '" stroke-linejoin="round"/>';
    else if (t === 4) { var w = ''; for (var k = 0; k <= 6; k++) w += (k ? ' L' : 'M') + (k * sz / 3 - sz) + ',' + (k % 2 ? -sz * .18 : sz * .18); sh = '<path d="' + w + '" fill="none" stroke="' + c + '" stroke-width="' + sz * .12 + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
    else if (t === 5) { for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) sh += '<circle cx="' + (a - 1) * sz * .3 + '" cy="' + (b - 1) * sz * .3 + '" r="' + sz * .07 + '" fill="' + c + '"/>'; }
    else sh = '<path d="M' + (-sz * .14) + ',' + (-sz * .45) + ' h' + sz * .28 + ' v' + sz * .31 + ' h' + sz * .31 + ' v' + sz * .28 + ' h' + (-sz * .31) + ' v' + sz * .31 + ' h' + (-sz * .28) + ' v' + (-sz * .31) + ' h' + (-sz * .31) + ' v' + (-sz * .28) + ' h' + sz * .31 + 'Z" fill="' + c + '"/>';
    if (r() < .35 && t !== 1 && t !== 4 && t !== 5) sh += '<circle cx="' + sz * .3 + '" cy="' + sz * .3 + '" r="' + sz * .12 + '" fill="' + c2 + '"/>';
    g += '<g class="drift" style="--d:' + d + 's"><g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') rotate(' + rot + ')" opacity="' + op + '">' + sh + '</g></g>';
  }
  return g; }
/* level → [hue, saturation, base lightness, seed] */
/* many colours: each screen picks its own from this set (stable per screen), and
   its corner blobs from accent pairs chosen to stand apart from that colour */
var HUES = [[186, 64, 52], [204, 70, 58], [226, 62, 64], [256, 52, 64], [282, 46, 62], [322, 58, 66], [350, 70, 68], [14, 78, 66],
            [30, 82, 62], [44, 86, 58], [84, 52, 52], [118, 44, 54], [150, 48, 50], [170, 56, 48], [240, 48, 56], [6, 66, 60]];
var ACCENTS = [['#ffd25a', '#ffad55', 40], ['#d8adff', '#b48cff', 270], ['#ff9ec0', '#ff6f9f', 335], ['#9be7ff', '#5cc8f2', 195], ['#b6f09c', '#7fd35a', 110], ['#ffe08a', '#ffb13d', 45], ['#ffb3a1', '#ff7f66', 10], ['#a8f0d8', '#52d1aa', 160]];
function hashKey(k) { var h = 2166136261; for (var i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function hueGap(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
function paletteFor(key) { var hsh = hashKey(key), base = HUES[hsh % HUES.length], acc = ACCENTS.filter(function (x) { return hueGap(x[2], base[0]) > 60; });
  var a1 = acc[(hsh >>> 4) % acc.length], a2 = acc[((hsh >>> 8) + 1) % acc.length]; if (a2 === a1) a2 = acc[(acc.indexOf(a1) + 1) % acc.length];
  return { h: base[0], s: base[1], l: base[2], a1: a1, a2: a2 }; }
var PAL = {};
/* The reference look: one calm colour with a soft glow in the middle, big smooth
   blobs tucked into the corners and edges (a lighter tint above; warm yellow/
   orange and lilac/purple below), curvy dashed trails, a few puffy stars and a
   sparkle — and an empty middle for the content. */
function puffStar(x, y, r, c, rot) { var pts = []; for (var i = 0; i < 10; i++) { var a = (i / 10) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .5 : r; pts.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); }
  return '<polygon points="' + pts.join(' ') + '" fill="' + c + '" stroke="' + c + '" stroke-width="' + r * .32 + '" stroke-linejoin="round" transform="rotate(' + (rot || 0) + ' ' + x + ' ' + y + ')"/>'; }
function outStar(x, y, r, c) { return puffStar(x, y, r, 'none', 8).replace('fill="none" stroke="none"', 'fill="none" stroke="' + c + '"').replace(/stroke-width="[^"]+"/, 'stroke-width="' + r * .16 + '"'); }
function sparkle(x, y, r, c) { return '<path d="M' + x + ',' + (y - r) + ' Q' + (x + r * .18) + ',' + (y - r * .18) + ' ' + (x + r) + ',' + y + ' Q' + (x + r * .18) + ',' + (y + r * .18) + ' ' + x + ',' + (y + r) + ' Q' + (x - r * .18) + ',' + (y + r * .18) + ' ' + (x - r) + ',' + y + ' Q' + (x - r * .18) + ',' + (y - r * .18) + ' ' + x + ',' + (y - r) + 'Z" fill="' + c + '" stroke="' + c + '" stroke-width="' + r * .25 + '" stroke-linejoin="round"/>'; }
function trail(pts, c1, c2) { var d = smooth(pts), h = Math.floor(pts.length / 2);
  return '<path d="' + d + '" fill="none" stroke="' + c1 + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="26 22" opacity=".95"/>' +
         '<path d="' + smooth(pts.slice(0, h + 1)) + '" fill="none" stroke="' + c2 + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="26 22"/>'; }
function paw(x, y, s, rot, c, op) { return '<g transform="translate(' + x.toFixed(0) + ',' + y.toFixed(0) + ') rotate(' + rot.toFixed(0) + ') scale(' + s + ')" fill="' + c + '" opacity="' + (op || .9) + '"><ellipse cx="0" cy="14" rx="24" ry="20"/><ellipse cx="-24" cy="-14" rx="9" ry="12"/><ellipse cx="-8" cy="-26" rx="9" ry="12"/><ellipse cx="8" cy="-26" rx="9" ry="12"/><ellipse cx="24" cy="-14" rx="9" ry="12"/></g>'; }
function pawTrail(pts, c) { var NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'), t = document.createElementNS(NS, 'path'), g = ''; sv.setAttribute('style', 'position:absolute;width:0;height:0'); t.setAttribute('d', smooth(pts)); sv.appendChild(t); document.body.appendChild(sv);
  var L = t.getTotalLength(); for (var d = 40, k = 0; d < L; d += 110, k++) { var p = t.getPointAtLength(d), q = t.getPointAtLength(Math.min(L, d + 2)), a = Math.atan2(q.y - p.y, q.x - p.x), side = k % 2 ? 1 : -1;
    g += paw(p.x + Math.cos(a + Math.PI / 2) * 26 * side, p.y + Math.sin(a + Math.PI / 2) * 26 * side, .8, a * 180 / Math.PI + 90, c); } sv.remove(); return g; }
function jungleLeaf(x, y, len, rot, c, c2) { return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><path d="M0,0 C' + len * .35 + ',' + (-len * .25) + ' ' + len * .45 + ',' + (-len * .75) + ' 0,' + (-len) + ' C' + (-len * .45) + ',' + (-len * .75) + ' ' + (-len * .35) + ',' + (-len * .25) + ' 0,0Z" fill="' + c + '"/><path d="M0,0 L0,' + (-len * .92) + '" stroke="' + c2 + '" stroke-width="' + len * .035 + '" stroke-linecap="round"/></g>'; }
function animalBits() { var g = '';
  g += jungleLeaf(80, 1120, 560, 28, '#2f9a46', '#1d6e30') + jungleLeaf(260, 1140, 460, 58, '#3fb35a', '#227a38') + jungleLeaf(-20, 1100, 420, -6, '#4fc24a', '#2f8a2f');
  g += jungleLeaf(5700, 1120, 560, -28, '#2f9a46', '#1d6e30') + jungleLeaf(5520, 1140, 460, -58, '#3fb35a', '#227a38') + jungleLeaf(5800, 1100, 420, 6, '#4fc24a', '#2f8a2f');
  g += jungleLeaf(-40, -60, 420, 150, '#3fb35a', '#227a38') + jungleLeaf(5820, -60, 420, -150, '#3fb35a', '#227a38');
  g += pawTrail([[700, 130], [1100, 200], [1600, 150], [2000, 220]], '#ffffff') + pawTrail([[3800, 210], [4300, 140], [4800, 200], [5200, 150]], '#ffffff') + pawTrail([[1500, 1060], [2100, 1000], [2700, 1050]], '#ffffff');
  return g; }
function abstractBg(name) { var p = paletteFor(name), h = p.h, sat = p.s, L = p.l - 4, id = 'bg' + hashKey(name);
  var base = hsl(h, sat, L + 6), edge = hsl(h + 4, sat, L - 2), glow = hsl(h - 6, sat - 5, L + 22), tint = hsl(h - 10, sat - 12, L + 20), tint2 = hsl(h - 10, sat - 14, L + 28);
  var g = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + edge + '"/><stop offset=".5" stop-color="' + base + '"/><stop offset="1" stop-color="' + edge + '"/></linearGradient>' +
    '<radialGradient id="' + id + 'g" cx="50%" cy="58%" r="45%"><stop offset="0" stop-color="' + glow + '" stop-opacity=".85"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/><ellipse cx="' + W / 2 + '" cy="620" rx="' + W * .48 + '" ry="560" fill="url(#' + id + 'g)"/>';
  /* top edge: lighter tints of the level colour */
  g += '<path d="M-20,-20 L640,-20 C620,180 480,260 330,300 C200,330 150,420 40,440 C10,445 -20,440 -20,430Z" fill="' + tint + '"/>' +
       '<path d="M-20,-20 L300,-20 C290,120 190,190 70,215 L-20,220Z" fill="' + tint2 + '" opacity=".8"/>' +
       '<path d="M2600,-20 C2640,110 2780,150 2900,120 C3020,90 3120,40 3260,80 C3360,108 3420,40 3440,-20Z" fill="' + tint + '" opacity=".75"/>' +
       '<path d="M4380,-20 C4400,120 4560,200 4700,170 C4830,140 4900,90 5040,130 C5180,170 5300,330 5520,350 C5700,366 5800,280 5800,280 L5800,-20Z" fill="' + tint + '"/>' +
       '<path d="M5100,-20 C5140,90 5300,170 5480,160 C5640,150 5800,60 5800,60 L5800,-20Z" fill="' + tint2 + '" opacity=".7"/>';
  /* bottom corners and edge: warm and lilac, two tones each */
  g += '<path d="M-20,700 C140,690 260,760 290,880 C320,990 470,1040 560,1100 L-20,1100Z" fill="' + p.a1[0] + '"/>' +
       '<path d="M-20,880 C120,870 220,940 270,1100 L-20,1100Z" fill="' + p.a1[1] + '"/>' +
       '<path d="M2350,1100 C2420,1010 2560,980 2700,1000 C2820,1018 2900,1060 2960,1100Z" fill="' + tint + '" opacity=".8"/>' +
       '<path d="M5800,690 C5640,720 5520,810 5420,900 C5330,980 5220,1030 5120,1100 L5800,1100Z" fill="' + p.a2[0] + '"/>' +
       '<path d="M5800,820 C5700,850 5620,930 5580,1100 L5800,1100Z" fill="' + p.a2[1] + '"/>';
  /* dashed trails, white with a yellow end */
  g += trail([[420, 470], [600, 400], [760, 260], [960, 150], [1180, 130], [1400, 190], [1560, 170], [1700, 60], [1740, -10]], '#ffffff', '#ffe066') +
       trail([[4600, -10], [4660, 60], [4760, 100], [4880, 80], [4960, -10]], '#ffe066', '#ffe066') +
       trail([[700, 1100], [760, 1000], [880, 940], [1020, 930], [1150, 990], [1210, 1100]], '#ffffff', '#ffe066') +
       trail([[4500, 1100], [4560, 990], [4700, 930], [4860, 940], [4960, 1010], [5000, 1100]], '#ffffff', '#ffffff') +
       '<circle cx="840" cy="990" r="24" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="12 10"/>';
  /* stars and sparkles, few and far apart */
  if (/animal|^pp-(animals|animal-young|animal-homes|hen-types|animal-sort|odd-one-out|animal-quiz|animal-hunt)$|^model-cards|^animal-drawing|done-pp-anim|done-model|done-animal|done-pp-hen|done-pp-odd/.test(name)) return g + animalBits();
  g += puffStar(2010, 150, 52, '#ffd25a', -12) + puffStar(4510, 180, 84, '#ffd25a', 10) + puffStar(3420, 1000, 40, '#ffd25a', 18) + puffStar(1350, 1010, 30, '#ffd25a', -6) +
       outStar(4920, 960, 46, '#ffe066') + outStar(2500, 120, 32, '#ffffff') +
       sparkle(5410, 250, 56, p.a2[0]) + sparkle(300, 640, 34, '#ffffff') + sparkle(3020, 210, 26, '#ffd25a') + sparkle(5620, 560, 30, '#ffffff');
  return g; }

var sceneCache = {}, curScene = '', front = 'A';
function sceneSVG(name, vb) { var k = name + (vb || ''); if (!sceneCache[k]) sceneCache[k] = '<svg viewBox="' + (vb || '0 0 5780 1080') + '" preserveAspectRatio="xMidYMax slice">' + abstractBg(name) + '</svg>'; return sceneCache[k]; }
function setScene(name) { if (name === curScene) return; curScene = name; var a = document.getElementById('scene' + front), b = document.getElementById('scene' + (front === 'A' ? 'B' : 'A'));
  b.innerHTML = sceneSVG(name); b.style.opacity = 1; a.style.opacity = 0; front = front === 'A' ? 'B' : 'A'; }

/* ═══ CONTENT ═══ */
var IMG = 'assets/new/images/', A = window.ANIMALS, G = MENU_DATA.GROUPS;
G['play3d'] = { title: L4('3D Seasons', '3D കാലങ്ങൾ', '3D मौसम', '3D ಋತುಗಳು'), icon: '🌦️', options: [
  { name: L4('Seasons Explorer', 'കാലങ്ങൾ', 'मौसम की सैर', 'ಋತುಗಳ ಅನ್ವೇಷಣೆ'), icon: '🌦️', game: 'seasons' },
  { name: L4('Traffic Light', 'ട്രാഫിക് ലൈറ്റ്', 'ट्रैफ़िक लाइट', 'ಟ್ರಾಫಿಕ್ ಲೈಟ್'), icon: '🚦', game: 'traffic-3d' } ] };
function set(dir, list) { return list.map(function (x) { return { img: R(IMG + dir + '/' + x[0]), en: x[1], ml: x[2] }; }); }
function an(id) { var a = A.all[id]; return { id: id, img: R(a.img), en: a.en, ml: a.ml, snd: a.snd ? R(a.snd) : null }; }
var DOM = A.DOMESTIC.slice(), WILD = A.WILD.slice(), ALL = DOM.concat(WILD);
var DATA = {
  houses: set('houses', [['bungalow.jpg', 'Bungalow', 'ബംഗ്ലാവ്'], ['apartment.jpg', 'Apartment', 'അപ്പാർട്ട്മെന്റ്'], ['mud-house.jpg', 'Mud House', 'മൺവീട്'], ['tent.jpg', 'Tent', 'കൂടാരം'], ['modern-house.jpg', 'Modern House', 'ആധുനിക വീട്']]),
  rooms: set('rooms', [['kitchen.webp', 'Kitchen', 'അടുക്കള'], ['bedroom.jpg', 'Bedroom', 'കിടപ്പുമുറി'], ['bathroom.jpg', 'Bathroom', 'കുളിമുറി'], ['dining.jpg', 'Dining Room', 'ഊണുമുറി'], ['living.webp', 'Living Room', 'സ്വീകരണമുറി']]),
  flowers: set('flowers', [['chembarathi.jpg', 'Hibiscus', 'ചെമ്പരത്തി'], ['lotus.jpg', 'Lotus', 'താമര'], ['mulla.jpg', 'Jasmine', 'മുല്ല'], ['rose.jpg', 'Rose', 'റോസ്'], ['jamanti.jpg', 'Chrysanthemum', 'ജമന്തി'], ['kanikonna.jpg', 'Golden Shower', 'കണിക്കൊന്ന'], ['pichi.jpg', 'Pichi', 'പിച്ചി']]),
  helpers: set('helpers', [['doctor.jpg', 'Doctor', 'ഡോക്ടർ'], ['teacher.jpg', 'Teacher', 'അധ്യാപിക'], ['police.jpg', 'Police', 'പോലീസ്'], ['postman.jpg', 'Postman', 'പോസ്റ്റ്മാൻ'], ['farmer.jpg', 'Farmer', 'കർഷകൻ'], ['shopkeeper.jpg', 'Shopkeeper', 'കടക്കാരൻ']]),
  jobs: set('jobs', [['nurse.jpg', 'Nurse', 'നഴ്സ്'], ['driver.jpg', 'Driver', 'ഡ്രൈവർ'], ['fisherman.jpg', 'Fisherman', 'മീൻപിടുത്തക്കാരൻ'], ['potter.jpg', 'Potter', 'കുശവൻ'], ['barber.jpg', 'Barber', 'ബാർബർ'], ['teacher.jpg', 'Teacher', 'അധ്യാപകൻ']]),
  instruments: [['chenda', 'Chenda', 'ചെണ്ട'], ['maddalam', 'Maddalam', 'മദ്ദളം'], ['chengila', 'Chengila', 'ചേങ്ങില'], ['kaimani', 'Kaimani', 'കൈമണി']].map(function (x) { return { img: R(IMG + 'instruments/' + x[0] + '.jpg'), snd: R('assets/new/audio/instruments/' + x[0] + '.mp3'), en: x[1], ml: x[2] }; }),
  feelings: set('feelings', [['happy.jpg', 'Happy', 'സന്തോഷം'], ['sad.jpg', 'Sad', 'സങ്കടം'], ['excited.jpg', 'Excited', 'ആവേശം'], ['scared.jpg', 'Scared', 'പേടി'], ['bored.jpg', 'Bored', 'മടുപ്പ്'], ['silly.jpg', 'Silly', 'കുസൃതി']]),
  firstaid: set('first-aid', [['bandage.jpg', 'Bandage', 'ബാൻഡേജ്'], ['antiseptic.jpg', 'Antiseptic', 'ആന്റിസെപ്റ്റിക്'], ['cotton.jpg', 'Cotton', 'പഞ്ഞി'], ['gauze.jpg', 'Gauze', 'ഗോസ്'], ['scissors.jpg', 'Scissors', 'കത്രിക']]),
  notaid: set('habits', [['toothbrush.webp', 'Toothbrush', 'ടൂത്ത് ബ്രഷ്'], ['towel.webp', 'Towel', 'തോർത്ത്'], ['comb.webp', 'Comb', 'ചീപ്പ്']]),
  shop: set('habits', [['comb.webp', 'Comb', 'ചീപ്പ്'], ['soap.webp', 'Soap', 'സോപ്പ്'], ['toothbrush.webp', 'Toothbrush', 'ടൂത്ത് ബ്രഷ്'], ['towel.webp', 'Towel', 'തോർത്ത്'], ['healthy-food.jpg', 'Fruit Basket', 'പഴക്കൂട']]),
  places: set('places', [['hospital.jpg', 'Hospital', 'ആശുപത്രി'], ['school.jpg', 'School', 'സ്കൂൾ'], ['police-station.jpg', 'Police Station', 'പോലീസ് സ്റ്റേഷൻ'], ['bus-stand.jpg', 'Bus Stand', 'ബസ് സ്റ്റാൻഡ്'], ['shop.jpg', 'Shop', 'കട'], ['sea.jpg', 'Sea', 'കടൽ']])
};
var SKIN = { play3d: 'meadow', home: 'forest', 'pre-primary': 'meadow', 'pp-animals-group': 'safari', 'pp-shapes-group': 'meadow', 'pp-world-group': 'meadow', primary: 'backwater', secondary: 'street', vocational: 'workshop', learning: 'school', 'learning-maths': 'school', 'learning-alphabets': 'school', kannada: 'festival' };
var SCENE = { home: 'valley', 'pre-primary': 'meadow', 'pp-animals-group': 'farm', 'pp-shapes-group': 'playground', 'pp-world-group': 'park', primary: 'backwater', secondary: 'street', vocational: 'workshop', learning: 'classroom', 'learning-maths': 'classroom', 'learning-alphabets': 'library', kannada: 'festival' };
var KIND = { 'seasons': 'learn', 'zoo-walk': 'learn', 'body-3d': 'practise', 'traffic-3d': 'practise', 'beat-punch': 'quiz', 'pp-animals': 'learn', 'pp-animal-young': 'learn', 'pp-animal-homes': 'learn', 'pp-hen-types': 'learn', 'model-cards': 'learn', 'model-cards-2': 'practise', 'pp-animal-sort': 'practise', 'pp-odd-one-out': 'practise', 'pp-animal-quiz': 'quiz', 'pp-animal-hunt': 'quiz', 'animal-drawing': 'create',
  'colour-match': 'practise', 'shape-sorter': 'practise', 'pp-size-quiz': 'quiz', 'pattern-finder': 'quiz', feelings: 'practise', vehicles: 'learn', 'pri-flower-match': 'quiz', 'sec-name-build': 'create', 'sec-daily-living': 'practise', 'sec-first-aid': 'practise', 'sec-mobile': 'quiz', 'sec-bouquet': 'create',
  'voc-job-where': 'practise', 'voc-job-call': 'quiz', 'fruit-counter': 'practise', 'fruit-math': 'practise', arithmetica: 'quiz', 'number-crunch': 'quiz', 'word-explorer': 'practise', 'word-matcher': 'practise', 'word-creator': 'quiz', 'mosquito-clap': 'quiz', 'sec-currency': 'practise', 'voc-cap-match': 'quiz', 'voc-party-decorate': 'create', 'voc-job-day': 'practise' };
var PIC = { 'zoo-walk': an('elephant').img, 'body-3d': R(IMG + 'body/eyes.jpg'), 'traffic-3d': R(IMG + 'places/road.jpg'), 'pp-animals': an('cow').img, 'pp-animal-young': R(A.young.hen.img), 'pp-animal-homes': R(A.homes.hen.img), 'pp-hen-types': an('rooster').img, 'model-cards': an('elephant').img, 'model-cards-2': an('monkey').img,
  'pp-animal-sort': an('goat').img, 'pp-odd-one-out': an('duck').img, 'pp-animal-quiz': an('tiger').img, 'pp-animal-hunt': an('lion').img, 'animal-drawing': an('rabbit').img, 'pp-size-quiz': an('elephant').img,
  feelings: DATA.feelings[0].img, vehicles: R('assets/new/models/750x450_359731-ksrtc.jpg'), 'pri-houses': DATA.houses[0].img, 'pri-rooms': DATA.rooms[0].img, 'pri-flowers': DATA.flowers[0].img, 'pri-flower-match': DATA.flowers[3].img,
  'sec-helpers-places': DATA.helpers[2].img, 'sec-daily-living': R(IMG + 'daily/teeth-2-brush.jpg'), 'sec-first-aid': DATA.firstaid[0].img, 'sec-bouquet': DATA.flowers[1].img,
  'voc-job-hats': DATA.jobs[3].img, 'voc-job-where': DATA.places[0].img, 'voc-job-call': DATA.helpers[0].img, 'voc-instruments': DATA.instruments[0].img };
window.__previewAssets = function () {
  var out = [], add = function (p) { if (p && out.indexOf(P(p)) < 0) out.push(P(p)); };
  Object.keys(A.all).forEach(function (k) { add(A.all[k].img); add(A.all[k].snd); });
  Object.keys(A.young).forEach(function (k) { add(A.young[k].img); }); Object.keys(A.homes).forEach(function (k) { add(A.homes[k].img); });
  Object.keys(DATA).forEach(function (k) { DATA[k].forEach(function (x) { add(x.img); add(x.snd); }); });
  Object.keys(PIC).forEach(function (k) { add(PIC[k]); });
  ['happy', 'cheer', 'curious', 'sad'].forEach(function (p) { add('assets/avatar/owly-' + p + '.png'); });
  add('assets/new/icons/particle-playground.png'); ['body/eyes.jpg', 'places/road.jpg'].forEach(function (k) { add(IMG + k); });
  ['pre-primary', 'primary', 'secondary', 'vocational', 'learning', 'kannada'].forEach(function (k) { add('assets/new/icons/' + k + '.png'); });
  ['car-honk', 'bus', 'train-whistle', 'motorboat'].forEach(function (k) { add('assets/new/audio/' + k + '.mp3'); });
  [1, 2, 5, 10].forEach(function (v) { add('assets/new/images/currency/coin-' + v + '.jpg'); }); [10, 20, 50, 100].forEach(function (v) { add('assets/new/images/currency/note-' + v + '.jpg'); });
  ['daily/wash-1-wet.jpg', 'daily/teeth-2-brush.jpg', 'daily/groom-3-comb.jpg', 'habits/handwash-1.webp', 'habits/handwash-2.webp', 'habits/handwash-3.webp', 'habits/handwash-4.webp', 'habits/handwash-5.webp'].forEach(function (k) { add(IMG + k); });
  return out; };
var STARS = {}; try { STARS = JSON.parse(localStorage.getItem('bluePreviewStars') || '{}'); } catch (e) {}
function saveStars() { try { localStorage.setItem('bluePreviewStars', JSON.stringify(STARS)); } catch (e) {} }
function gamesIn(k) { var g = G[k]; if (!g) return []; return g.options ? g.options.map(function (o) { return o.game; }) : (g.groups || []).reduce(function (a, s) { return a.concat(gamesIn(s)); }, []); }
function starsIn(k) { return gamesIn(k).reduce(function (n, g) { return n + (STARS[g] || 0); }, 0); }
function totalStars() { var n = 0; for (var k in STARS) n += STARS[k]; return n; }

/* ═══ SCREENS ═══ */
/* SINGLE SCREEN. The wall is three 1927x1080 screens. A one-child activity
   lives on the MIDDLE screen at normal proportions; the side screens keep the
   background (and Owly). Only shared, several-children activities span the
   wall. SG is true while a single-screen activity is being built. */
var WIDE = ['pp-animal-hunt', 'colour-match', 'seasons', 'traffic-3d', 'alpha-snake'];
var SG = false, MX = 1927, MW = 1926, MC = 2890;
var stack = [], cur = null;
function go(sc) { if (cur) stack.push(cur); cur = sc; render(); }
/* In the app (play.html) the menu is index.html: leaving goes back to the
   submenu the activity was opened from. */
var APP = !!window.WALL_APP;
function openOld(game, group) { try { sessionStorage.setItem('auticareFromGroup', group || ''); sessionStorage.setItem('auticareFromPlay', '1'); } catch (e) {} location.href = MENU_DATA.route(game); }
function fromGroup() { try { return sessionStorage.getItem('auticareFromGroup') || ''; } catch (e) { return ''; } }
function leave(home) { if (playing) { try { playing.pause(); } catch (e) {} } var g = home ? '' : fromGroup(); if (home) { try { sessionStorage.removeItem('auticareFromGroup'); } catch (e) {} }
  location.href = 'index.html' + (g ? '?open=' + encodeURIComponent(g) : ''); }
function back() { if (!stack.length) { if (APP && /[?&]act=/.test(location.search)) leave(); else owly(UI.hi); return; } cur = stack.pop(); render(); }
/* Background music: the activity's own track (the old pages' mapping), else
   its group's. One loop at a time, continuing across screens of the same track. */
var MUSIC = { 'pp-animals-group': 'forest', 'pp-shapes-group': 'ShaapeSorter', 'pp-world-group': 'Daily life scenarios', 'pre-primary': 'forest', primary: 'Daily life scenarios',
  secondary: 'jyproject-endless-shore-part2-399386', vocational: 'Daily life scenarios', learning: 'Learning', 'learning-maths': 'Learning', 'learning-alphabets': 'Learning', kannada: 'Learning',
  play3d: 'idoberg-space-chords-loop-310493', seasons: 'forest', 'zoo-walk': 'forest', 'traffic-3d': 'Daily life scenarios', 'body-3d': 'Learning', 'beat-punch': 'Goalkeeper', 'colour-match': 'Baloon',
  'shape-sorter': 'ShaapeSorter', 'pattern-finder': 'Puzzle', 'animal-drawing': 'colouring', home: 'menu' };
var bgm = null, bgmFile = '';
function music(key, group) { var f = MUSIC[key] || MUSIC[group] || 'Learning'; if (f === bgmFile && bgm) return; bgmFile = f;
  if (bgm) { try { bgm.pause(); } catch (e) {} } bgm = null; if (window.PREVIEW_ASSETS) return;
  try { bgm = new Audio('assets/Audio/' + f + '.mp3'); bgm.loop = true; bgm.volume = .28; var pr = bgm.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
/* the first time an activity opens this session: its name on a ribbon, and confetti */
function introBurst(name, key) { var k = 'auticareIntro_' + key; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
  var r = el('div', 'intro-ribbon', T(name)); stage.appendChild(r); sfx.win(); for (var i = 0; i < 50; i++) confetti(SG ? MX : 0, SG ? MW : W);
  setTimeout(function () { r.classList.add('out'); }, 2000); setTimeout(function () { r.remove(); }, 2600); }
function render() { var old = content.querySelector('.screen:not(.leave)'); if (old) { old.classList.add('leave'); setTimeout(function () { old.remove(); }, 320); }
  if (playing) { try { playing.pause(); } catch (e) {} }
  var key = cur.type === 'home' ? 'home' : (cur.type === 'level' || cur.type === 'map') ? cur.key : cur.group;
  SG = (cur.type === 'players' || cur.type === 'done' || (ACT[cur.type] && !SCREEN[cur.type])) && WIDE.indexOf(cur.type) < 0 && WIDE.indexOf(cur.act) < 0 && WIDE.indexOf(cur.from && cur.from.type) < 0 && !(cur.players > 1);
  if (cur.type === 'players') { stage.className = 'lang-' + lang() + ' skin-' + (SKIN[key] || 'meadow') + (SG ? ' sg' : ''); uiLayer.className = stage.className; setScene('players-' + cur.act); var s0 = el('div', 'screen enter sgl'); content.appendChild(s0); playersScreen(s0, cur); return; }
  stage.className = 'lang-' + lang() + ' skin-' + (SKIN[key] || 'meadow') + (SG ? ' sg' : '') + (cur.players > 1 ? ' mp' : ''); uiLayer.className = stage.className; setScene(cur.type === 'done' ? 'done-' + cur.from.type : (ACT[cur.type] ? cur.type : key));
  var s = el('div', 'screen enter' + (SG ? ' sgl' : '')); content.appendChild(s);
  if (ACT[cur.type] && !SCREEN[cur.type] && cur.group !== 'pp-animals-group' && cur.group !== 'play3d' && (/^learning/.test(cur.group || '') || KIND[cur.type] === 'quiz')) notebook(s);
  if (cur.players > 1 && PQ[cur.type]) { s.classList.remove('notebook'); [].forEach.call(s.querySelectorAll('.nb-desk,.nb-page,.nb-prop,.nb-think'), function (x) { x.remove(); }); panels(s, cur); return; }
  (SCREEN[cur.type] || ACT[cur.type])(s, cur); if (SG) fitSingle(s);
  music(ACT[cur.type] && !SCREEN[cur.type] ? cur.type : (cur.type === 'home' ? 'home' : ''), key);
  if (ACT[cur.type] && !SCREEN[cur.type] && cur.name) introBurst(cur.name, cur.type); }
function signEl(s, o, sub, small) { var h = s.querySelector('.hud') || s.appendChild(el('div', 'hud')); var g = el('div', 'sign' + (small ? ' small' : ''));
  g.appendChild(chunky(T(o))); if (sub) g.appendChild(el('div', 'sub', sub)); h.appendChild(g); return h; }

var SCREEN = {
  home: function (s) {
    signEl(s, { en: 'Auticare Blueroom', ml: 'ഓട്ടിക്കെയർ ബ്ലൂറൂം' }, T(UI.pick));
    var row = el('div', 'row'); row.style.top = '390px'; row.style.gap = '56px'; s.appendChild(row);
    var VB = { 'pre-primary': '0 0 1900 1080', primary: '3200 0 1900 1080', secondary: '200 0 1900 1080', vocational: '2200 0 1900 1080', learning: '400 0 1900 1080', kannada: '3700 0 1900 1080' };
    VB.play3d = '1200 0 1900 1080'; row.style.gap = '40px'; if (APP) { row.style.gap = '24px'; }
    var WL = ['pre-primary', 'primary', 'secondary', 'vocational', 'learning', 'kannada', 'play3d'].concat(APP ? ['classic'] : []); if (APP) { row.style.gap = '24px'; row.style.left = '300px'; row.style.right = '150px'; }
    WL.forEach(function (k, i) {
      if (k === 'classic') { var cc = el('div', 'world panel board'); cc.style.width = '600px'; row.appendChild(cc); cc.innerHTML = '<div class="win" style="display:flex;align-items:center;justify-content:center;font-size:200px;background:#fff3d6">🎮</div>'; cc.appendChild(chunky(T(L4('More games', 'കൂടുതൽ കളികൾ', 'और खेल', 'ಇನ್ನಷ್ಟು ಆಟಗಳು')))); cc.appendChild(el('div', 'alt', T(L4('All activities', 'എല്ലാ പ്രവർത്തനങ്ങളും', 'सभी गतिविधियाँ', 'ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳು'))));
        tap(cc, function () { sfx.tap(); try { sessionStorage.removeItem('auticareFromPlay'); } catch (e) {} location.href = 'index.html'; }); return; }
      var g = G[k], c = el('div', 'world panel board'); row.appendChild(c); c.style.animation = 'enter .6s ' + i * .07 + 's cubic-bezier(.3,1.3,.5,1) both';
      var win = el('div', 'win'); win.innerHTML = sceneSVG(k, VB[k]); var ic = el('img', 'ic'); ic.src = R('assets/new/icons/' + (k === 'play3d' ? 'particle-playground' : k) + '.png'); ic.onerror = function () { ic.remove(); }; win.appendChild(ic); c.appendChild(win);
      c.appendChild(chunky(T(g.title))); c.appendChild(el('div', 'alt', alt(g.title) || '&nbsp;'));
      var n = gamesIn(k).length; c.appendChild(starsEl(Math.round(starsIn(k) / Math.max(1, n * 3) * 3), 58));
      tap(c, function () { sfx.tap(); go(g.groups ? { type: 'level', key: k } : { type: 'map', key: k }); }); });
    owly(UI.hi); },
  level: function (s, sc) {
    var g = G[sc.key]; signEl(s, g.title, alt(g.title));
    var row = el('div', 'row'); row.style.top = '380px'; row.style.height = '660px'; row.style.gap = '110px'; s.appendChild(row);
    g.groups.forEach(function (k, i) {
      var sg = G[k], c = el('div', 'gcard panel'); row.appendChild(c); c.style.animation = 'enter .6s ' + i * .1 + 's cubic-bezier(.3,1.3,.5,1) both'; if (g.groups.length === 2) c.style.width = '1800px';
      var win = el('div', 'win'); win.innerHTML = sceneSVG(k, '600 0 2200 1080'); c.appendChild(win);
      var pics = sg.options.map(function (o) { return PIC[o.game]; }).filter(Boolean).slice(0, 3);
      pics.forEach(function (src, j) { var p = el('div', 'pola', '<img src="' + src + '" alt="">'); p.style.transform = 'translate(' + (j - (pics.length - 1) / 2) * 200 + 'px,' + (j % 2 ? -16 : 14) + 'px) rotate(' + (j - 1) * 8 + 'deg)'; win.appendChild(p); });
      var info = el('div', 'info'); c.appendChild(info); info.appendChild(el('div', 't', T(sg.title))); if (alt(sg.title)) info.appendChild(el('div', 'a', alt(sg.title)));
      var n = sg.options.length; info.appendChild(el('div', 'm', n + ' ' + T(UI.acts) + ' · ★ ' + starsIn(k) + ' / ' + n * 3));
      tap(c, function () { sfx.tap(); go({ type: 'map', key: k }); }); });
    owly(UI.step); },
  map: function (s, sc) {
    var g = G[sc.key], skin = SKIN[sc.key]; signEl(s, g.title, T(UI.path));
    var opts = g.options, n = opts.length, x0 = 700, x1 = 5350;
    var pts = opts.map(function (o, i) { return [n === 1 ? (x0 + x1) / 2 : x0 + i * (x1 - x0) / (n - 1), 650 + 130 * Math.sin(i * 1.3 + .5)]; });
    var line = smooth([[x0 - 500, pts[0][1] + 150]].concat(pts, [[x1 + 400, pts[n - 1][1] + 120]])), road = '';
    function along(step, fn) { var NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'), t = document.createElementNS(NS, 'path'); sv.setAttribute('style', 'position:absolute;width:0;height:0'); t.setAttribute('d', line); sv.appendChild(t); document.body.appendChild(sv);
      var L = t.getTotalLength(), k = 0; for (var d = step / 2; d < L; d += step, k++) { var p = t.getPointAtLength(d); road += fn(p, k); } sv.remove(); }
    if (skin === 'safari') along(115, function (p, k) { return paw(p.x, p.y + (k % 2 ? 22 : -22), 1.1, (k % 2 ? 100 : 80), '#7a4a18', .8); });
    else if (skin === 'meadow') along(120, function (p, k) { return '<ellipse cx="' + p.x + '" cy="' + p.y + '" rx="' + (44 + (k % 3) * 8) + '" ry="26" fill="#e3e8ec" stroke="#9aa5ae" stroke-width="5"/>'; });
    else if (skin === 'backwater') road = '<path d="' + line + '" stroke="#2f9fd0" stroke-width="140" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#5ecbf0" stroke-width="110" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="40 90" opacity=".7"/>';
    else if (skin === 'street') road = '<path d="' + line + '" stroke="#3d454c" stroke-width="130" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#59626b" stroke-width="110" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#ffd23f" stroke-width="12" fill="none" stroke-dasharray="60 50"/>';
    else if (skin === 'workshop') road = '<path d="' + line + '" stroke="#2f363b" stroke-width="110" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#5d6870" stroke-width="80" fill="none" stroke-linecap="round"/><path d="' + line + '" stroke="#9aa7b0" stroke-width="80" fill="none" stroke-dasharray="14 40"/>';
    else if (skin === 'school') road = '<path d="' + line + '" stroke="#3d6bd8" stroke-width="16" fill="none" stroke-dasharray="40 30" stroke-linecap="round"/>';
    else if (skin === 'festival') along(70, function (p, k) { return '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (k % 2 ? 16 : 24) + '" fill="' + ['#e2185b', '#ffc928', '#3fbf3f', '#2f8cff', '#ff8a1a'][k % 5] + '"/>'; });
    var rd = el('div', 'abs'); rd.style.cssText += ';top:0;right:0;bottom:0;left:0'; rd.style.pointerEvents = 'none'; rd.innerHTML = '<svg width="5780" height="1080">' + road + '</svg>'; s.appendChild(rd);
    var nextIdx = -1; opts.forEach(function (o, i) { if (nextIdx < 0 && (STARS[o.game] || 0) < 3) nextIdx = i; });
    opts.forEach(function (o, i) {
      var kind = KIND[o.game] || 'learn', d = el('div', 'stop' + (i === nextIdx ? ' next' : ''));
      d.style.left = pts[i][0] + 'px'; d.style.top = pts[i][1] + 'px'; d.style.setProperty('--k', 'var(--' + kind + ')'); d.style.animation = 'enter .5s ' + i * .06 + 's cubic-bezier(.3,1.4,.5,1) both';
      var deco = '';
      if (skin === 'meadow') deco = '<svg class="deco" viewBox="-175 -175 350 350">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<ellipse cx="0" cy="-128" rx="44" ry="56" fill="' + (k % 2 ? '#ff9ec0' : '#ffd23f') + '" transform="rotate(' + k * 45 + ')"/>'; }).join('') + '</svg>';
      else if (skin === 'backwater') deco = '<svg class="deco" viewBox="-175 -175 350 350"><path d="M0,0 L160,-30 A162,162 0 1 1 160,30Z" fill="#3fa046"/><path d="M0,0 L150,-25 A152,152 0 1 1 150,25Z" fill="#56bd5c"/></svg>';
      else if (skin === 'workshop') deco = '<svg class="deco" viewBox="-175 -175 350 350">' + Array.apply(null, Array(12)).map(function (_, k) { return '<rect x="-22" y="-168" width="44" height="60" rx="8" fill="#7f8c8d" transform="rotate(' + k * 30 + ')"/>'; }).join('') + '<circle r="135" fill="#7f8c8d"/></svg>';
      else if (skin === 'festival') deco = '<svg class="deco" viewBox="-175 -175 350 350">' + Array.apply(null, Array(16)).map(function (_, k) { return '<circle cx="0" cy="-150" r="20" fill="' + (k % 2 ? '#ff9a0d' : '#ffc928') + '" transform="rotate(' + k * 22.5 + ')"/>'; }).join('') + '</svg>';
      else if (skin === 'street') deco = '<div class="pole"></div>';
      var pic = PIC[o.game];
      d.innerHTML = deco + (i === nextIdx ? '<div class="ring"></div>' : '') + '<div class="disc">' + (pic ? '<img src="' + pic + '" alt="">' : o.icon) + '</div><div class="num">' + (i + 1) + '</div>';
      d.appendChild(el('div', 'lbl', T(o.name))); d.appendChild(starsEl(STARS[o.game] || 0, 50)); s.appendChild(d);
      tap(d, function () { sfx.tap(); if (!ACT[o.game]) { if (APP) { openOld(o.game, sc.key); return; } owly(UI.wall, 'curious'); return; } if (PQ[o.game]) { go({ type: 'players', act: o.game, group: sc.key, name: o.name }); return; } go({ type: o.game, group: sc.key, name: o.name }); }); });
    owly(UI.step); }
};

/* Safety net: if a single-screen activity's content still spills out of the
   middle screen (a round with many items), scale it down uniformly to fit. */
var FIT_SEL = '.pc,.tile,.slot,.flip,.bal,.panel,.door,.diya,.bead,.coin,.note,.pill,.shopfront,.tray,.wallet,canvas,model-viewer,.abs>svg';
function fitSingle(s) { var box = el('div', 'fitbox'); box.style.cssText = 'position:absolute;left:0;top:0;width:5780px;height:1080px;transform-origin:0 0';
  [].slice.call(s.children).forEach(function (k) { if (!/\b(hud|nb-desk|nb-page|nb-prop|nb-think|rays|ribbon)\b/.test(k.className)) box.appendChild(k); });
  s.appendChild(box);
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (k) { if (k.nodeType === 1 && k.parentNode === s && k !== box && !/\bhud\b/.test(k.className)) box.appendChild(k); }); }); queue(); }).observe(s, { childList: true });
  new MutationObserver(queue).observe(box, { childList: true, subtree: true });
  var q = false; function queue() { if (q) return; q = true; requestAnimationFrame(function () { q = false; refit(); }); }
  function refit() { if (!s.isConnected) return; box.style.transform = 'none'; var sr = stage.getBoundingClientRect(), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    [].forEach.call(box.querySelectorAll(FIT_SEL), function (e) { var r = e.getBoundingClientRect(); if (!r.width) return;
      x0 = Math.min(x0, (r.left - sr.left) / SCALE); x1 = Math.max(x1, (r.right - sr.left) / SCALE); y0 = Math.min(y0, (r.top - sr.top) / SCALE); y1 = Math.max(y1, (r.bottom - sr.top) / SCALE); });
    if (x0 > x1) return; var L = MX + 24, Rr = MX + MW - 24, T0 = 335, B = 1070;
    if (x0 >= L && x1 <= Rr && y0 >= T0 - 30 && y1 <= B) return;
    var k = Math.min(1, (Rr - L) / (x1 - x0), (B - T0) / (y1 - y0)), cx = (x0 + x1) / 2, ty = Math.max(T0, Math.min(y0, B - (y1 - y0) * k));
    box.style.transform = 'translate(' + (MC - cx * k) + 'px,' + (ty - y0 * k) + 'px) scale(' + k + ')'; }
  queue(); setTimeout(queue, 400); }
/* ═══ NOTEBOOK DESK (learning + quizzes) ═══ */
var PROPS = {
  books: '<svg width="420" height="300" viewBox="0 0 420 300"><rect x="20" y="210" width="380" height="80" rx="10" fill="#e2632f" stroke="#5a2a10" stroke-width="8"/><rect x="40" y="226" width="340" height="14" fill="#fff3d6"/><rect x="50" y="135" width="330" height="76" rx="10" fill="#2f8cff" stroke="#1a3f80" stroke-width="8"/><rect x="66" y="150" width="296" height="12" fill="#e8f2ff"/><rect x="30" y="64" width="350" height="72" rx="10" fill="#3fbf3f" stroke="#1f6a1f" stroke-width="8"/><rect x="46" y="78" width="316" height="12" fill="#eaffea"/></svg>',
  plant: '<svg width="300" height="420" viewBox="0 0 300 420"><path d="M150,300 C120,220 40,200 30,120 C90,140 130,200 150,300Z" fill="#3fae3f"/><path d="M150,300 C180,200 260,180 280,90 C210,120 170,200 150,300Z" fill="#4fc24a"/><path d="M150,300 C140,190 160,90 150,10 C200,90 170,200 150,300Z" fill="#2f9a2f"/><path d="M70,290 L230,290 L205,410 L95,410Z" fill="#e2632f" stroke="#8a3410" stroke-width="8"/><rect x="60" y="278" width="180" height="30" rx="10" fill="#f07a40" stroke="#8a3410" stroke-width="8"/></svg>',
  pencils: '<svg width="240" height="380" viewBox="0 0 240 380"><rect x="60" y="40" width="26" height="220" fill="#ffcf3d" stroke="#5a3416" stroke-width="5" transform="rotate(-10 73 150)"/><rect x="110" y="20" width="26" height="240" fill="#2f8cff" stroke="#1a3f80" stroke-width="5"/><rect x="150" y="50" width="26" height="210" fill="#ff5a5a" stroke="#8a1a1a" stroke-width="5" transform="rotate(10 163 150)"/><path d="M40,220 L200,220 L185,370 L55,370Z" fill="#9b4dff" stroke="#4e1f99" stroke-width="8"/></svg>',
  globe: '<svg width="300" height="400" viewBox="0 0 300 400"><circle cx="150" cy="150" r="120" fill="#5ab8ff" stroke="#1f5fa0" stroke-width="10"/><path d="M70,110 q40,-40 80,0 q30,40 70,10 M60,180 q50,10 70,50 q40,30 90,-10" stroke="#3fbf3f" stroke-width="28" fill="none" stroke-linecap="round"/><path d="M40,150 A110,110 0 0 0 260,150" fill="none" stroke="#8a5a2b" stroke-width="10"/><rect x="140" y="270" width="20" height="70" fill="#8a5a2b"/><rect x="80" y="335" width="140" height="30" rx="12" fill="#8a5a2b"/></svg>'
};
function notebook(s) {
  s.classList.add('notebook');
  var desk = el('div', 'nb-desk'); s.appendChild(desk);
  var page = el('div', 'nb-page'); s.appendChild(page);
  for (var x = 80; x < (SG ? 1800 : 4920 - 60); x += 150) { page.insertAdjacentHTML('beforeend', '<div class="nb-hole" style="left:' + (x - 17) + 'px"></div><div class="nb-ring" style="left:' + (x - 20) + 'px"></div>'); }
  var put = function (svg, x, y, sc) { var e = el('div', 'nb-prop', svg); place(e, x, y); e.style.transform = 'scale(' + (sc || 1) + ')'; e.style.transformOrigin = '0 100%'; s.appendChild(e); };
  var dx = 0, rx = 0;
  put(PROPS.books, -10 + dx, 800, .95);      /* Owly sits on these */
  put(PROPS.plant, 5340 + rx, 640, 1);
  put(PROPS.pencils, 5490 + rx, 700, .9);
  put(PROPS.globe, 5330 + rx, 380, .55);
  var th = el('div', 'nb-think', '<svg viewBox="0 0 190 150" width="190" height="150"><circle cx="20" cy="140" r="10" fill="#fff"/><circle cx="45" cy="115" r="16" fill="#fff"/><path d="M60,70 a40,40 0 0 1 60,-40 a35,35 0 0 1 60,25 a30,30 0 0 1 -10,58 h-95 a30,30 0 0 1 -15,-43z" fill="#fff"/><text x="120" y="98" font-size="70" font-weight="800" text-anchor="middle" fill="#9aa3b5" font-family="Baloo 2">?</text></svg>'); s.appendChild(th);
  return s;
}
/* a sum written in bright, chunky multicolour digits */
var MATH_COL = ['#ff4d4d', '#ff9f1c', '#2f8cff', '#3fbf3f', '#9b4dff'];
function mathHTML(str) { return '<div class="math">' + str.split('').map(function (ch, i) { if (ch === ' ') return '&nbsp;';
  var c = ch === '?' ? '#9b4dff' : ch === '=' ? '#3fbf3f' : /[+\-×]/.test(ch) ? '#ff9f1c' : MATH_COL[i % 5]; return '<span style="color:' + c + '">' + ch + '</span>'; }).join('') + '</div>'; }
function chrome(s, ctx, total) {
  var h = signEl(s, ctx.name, null, true);
  var bar = el('div', 'bar', '<i></i><b>0 / ' + total + '</b>'); h.appendChild(bar);
  var sb = el('div', 'starbox', '<svg class="star on" style="--s:80px"><use href="#starSym"/></svg><span class="n">' + totalStars() + '</span>'); h.appendChild(sb);
  var pr = el('div', 'prompt', '<div class="q"></div><div class="q2"></div>'); h.appendChild(pr);
  var c = { n: 0,
    q: function (o, speak) { var qe = pr.querySelector('.q'); if (typeof o === 'string' && /^[\d\s+\-=?×]+$/.test(o) && s.classList.contains('notebook')) qe.innerHTML = mathHTML(o); else qe.textContent = typeof o === 'object' ? T(o) : o; pr.querySelector('.q2').textContent = typeof o === 'object' ? alt(o) : ''; if (speak !== false && typeof o === 'object') say(o); },
    step: function (node, after) { c.n++; bar.querySelector('i').style.width = 'calc(' + c.n / total * 100 + '% - 16px)'; bar.querySelector('b').textContent = c.n + ' / ' + total;
      if (node) flyStar(node, sb); if (c.n >= total) setTimeout(function () { finish(ctx); }, 1500); else if (after) setTimeout(after, 1100); },
    right: function (node) { sfx.right(); if (node) { node.classList.remove('ok'); void node.offsetWidth; node.classList.add('ok'); } },
    wrong: function (node) { sfx.nudge(); if (node) { node.classList.remove('no'); void node.offsetWidth; node.classList.add('no'); } } };
  return c; }
var PRINT = { cat: 'giraffe', dog: 'cow', cow: 'cow', hen: 'giraffe', sheep: 'cow', goat: 'giraffe', horse: 'giraffe', duck: 'cow', pig: 'cow', rabbit: 'giraffe', rooster: 'giraffe', 'hen-colour': 'cow', lion: 'leopard', tiger: 'tiger', elephant: 'zebra', snake: 'leopard', monkey: 'tiger', bear: 'zebra' };
function pc(it, size, capPx) { var c = el('div', 'pc panel' + (it.id && PRINT[it.id] && /skin-safari/.test(stage.className) ? ' animal print-' + PRINT[it.id] : '')); c.style.width = size + 'px'; c.innerHTML = '<img src="' + it.img + '" alt=""><div class="cap" style="font-size:' + (capPx || Math.round(size * .11)) + 'px"></div>'; c.querySelector('.cap').textContent = T(it); return c; }
function photo(it, size) { var c = pc(it, size); c.querySelector('.cap').remove(); c.style.paddingBottom = '12px'; return c; }
function row(s, top, gap, height) { var r = el('div', 'row'); r.style.top = top + 'px'; if (height) r.style.height = height + 'px'; r.style.gap = (gap || 50) + 'px'; s.appendChild(r); return r; }
function flyStar(from, to) { var st = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), f = el('div', 'abs', '<svg class="star on" style="--s:120px"><use href="#starSym"/></svg>');
  f.style.cssText += ';z-index:80;pointer-events:none;transition:all .8s cubic-bezier(.5,-.3,.6,1);left:' + ((a.left + a.width / 2 - st.left) / SCALE - 60) + 'px;top:' + ((a.top + a.height / 2 - st.top) / SCALE - 60) + 'px';
  stage.appendChild(f); requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.left = ((b.left + 30 - st.left) / SCALE - 60) + 'px'; f.style.top = ((b.top + 20 - st.top) / SCALE - 60) + 'px'; f.style.transform = 'scale(.5)'; }); });
  setTimeout(function () { f.remove(); var n = to.querySelector('.n'); if (n) n.textContent = +n.textContent + 1; sfx.pop(); }, 820); }
/* a real-looking balloon: teardrop body, shading, shine, knot, curly string */
function balloon(col, w, label) { var b = el('div', 'bal'); b.style.width = w + 'px'; b.style.height = (w * 1.6) + 'px'; b.dataset.col = col;
  b.innerHTML = '<svg viewBox="0 0 100 160" width="' + w + '" height="' + (w * 1.6) + '" style="overflow:visible">' +
    '<path d="M50,121 c-9,9 9,15 0,24 c-8,8 7,12 0,15" fill="none" stroke="#8a7a6a" stroke-width="2.2"/>' +
    '<path d="M50,4 C78,4 95,28 95,54 C95,86 70,110 54,118 L50,120 L46,118 C30,110 5,86 5,54 C5,28 22,4 50,4Z" fill="' + col + '"/>' +
    '<path d="M72,14 C90,26 95,50 90,72 C84,96 66,110 54,118 C70,100 80,80 80,56 C80,40 78,26 72,14Z" fill="#000" opacity=".14"/>' +
    '<ellipse cx="32" cy="30" rx="10" ry="17" fill="#fff" opacity=".55" transform="rotate(25 32 30)"/><ellipse cx="25" cy="52" rx="3.5" ry="6" fill="#fff" opacity=".45"/>' +
    '<path d="M44,119 L56,119 L53,126 L47,126Z" fill="' + col + '"/>' +
    (label != null ? '<text x="50" y="68" text-anchor="middle" font-size="44" font-weight="800" fill="#fff" stroke="rgba(0,0,0,.28)" stroke-width="3" paint-order="stroke" font-family="Baloo 2,sans-serif">' + label + '</text>' : '') + '</svg>';
  b.style.setProperty('--t', (2.4 + Math.random() * 1.6).toFixed(2) + 's'); b.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's'; return b; }
function popBalloon(b) { var col = b.dataset.col; b.classList.add('popped'); b.querySelector('svg').style.visibility = 'hidden'; sfx.burst();
  for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2, d = 140 + Math.random() * 120, sh = el('span', 'shard'); sh.style.background = i % 3 ? col : '#fff'; sh.style.setProperty('--x', (Math.cos(a) * d).toFixed(0) + 'px'); sh.style.setProperty('--y', (Math.sin(a) * d).toFixed(0) + 'px'); b.appendChild(sh); }
  b.appendChild(el('span', 'popw', 'POP!')); setTimeout(function () { b.style.visibility = 'hidden'; }, 700); }
/* drag a floating window anywhere on the wall */
function draggable(w) { var sx, sy, ox, oy, on = false;
  w.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; on = true; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop; w.setPointerCapture(e.pointerId); w.classList.add('dragging'); });
  w.addEventListener('pointermove', function (e) { if (!on) return; w.style.left = Math.max(0, Math.min(W - w.offsetWidth, ox + (e.clientX - sx) / SCALE)) + 'px'; w.style.top = Math.max(330, Math.min(H - 120, oy + (e.clientY - sy) / SCALE)) + 'px'; });
  w.addEventListener('pointerup', function () { on = false; w.classList.remove('dragging'); }); }
/* Indian money. A photo of the real coin/note is used when it is in
   assets/new/images/currency/ (see the README there); until then a faithful
   drawing in that denomination's colour and size. */
var NOTE_COL = { 10: ['#c08a52', '#8a5a2b'], 20: ['#d9dc63', '#8f9a20'], 50: ['#63d3e6', '#1f8ea3'], 100: ['#bba7e6', '#6b54b0'], 200: ['#f5bd3c', '#b07a0a'], 500: ['#b3b4ad', '#6a6b63'] };
function moneyEl(m, small) { var e = el('div', m.coin ? 'coin' : 'note'), k = small ? .62 : 1;
  if (m.coin) { var gold = m.v === 5, bi = m.v === 10, d = (m.v === 1 ? 190 : m.v === 2 ? 210 : m.v === 5 ? 220 : 240) * k;
    e.style.width = e.style.height = d + 'px';
    e.style.background = bi ? 'radial-gradient(circle,#e8ecef 0 44%,#9aa4ab 45% 47%,#e7c35a 48% 92%,#a7811f 93%)' : gold ? 'radial-gradient(circle at 35% 30%,#fff1b0,#e2b94a 55%,#a7811f)' : 'radial-gradient(circle at 35% 30%,#fff,#cfd5d9 55%,#8e979d)';
    e.innerHTML = '<b style="font-size:' + d * .36 + 'px">₹' + m.v + '</b>';
    e.insertAdjacentHTML('beforeend', '<img alt="" src="' + R('assets/new/images/currency/coin-' + m.v + '.jpg') + '" onload="this.style.display=\'block\'" onerror="this.remove()">'); }
  else { var c2 = NOTE_COL[m.v], w = (m.v >= 100 ? 400 : m.v >= 50 ? 385 : 370) * k;
    e.style.width = w + 'px'; e.style.height = (w * .47) + 'px';
    e.style.background = 'repeating-radial-gradient(circle at 70% 50%,transparent 0 10px,rgba(255,255,255,.18) 10px 12px),linear-gradient(135deg,' + c2[0] + ',' + c2[1] + ')';
    e.innerHTML = '<span class="nv" style="font-size:' + w * .2 + 'px">₹' + m.v + '</span><span class="wm"></span><span class="sm">' + m.v + '</span>';
    e.insertAdjacentHTML('beforeend', '<img alt="" src="' + R('assets/new/images/currency/note-' + m.v + '.jpg') + '" onload="this.style.display=\'block\'" onerror="this.remove()">'); }
  return e; }
function mv(src, w, h, still) {
  if (window.PREVIEW_NO_3D) { var i = document.createElement('img'); i.src = still || ''; i.style.cssText = 'width:' + w + 'px;height:' + h + 'px;object-fit:contain'; return i; }
  var m = document.createElement('model-viewer'); m.setAttribute('src', src); m.setAttribute('camera-controls', ''); m.setAttribute('auto-rotate', ''); m.setAttribute('shadow-intensity', '1'); m.setAttribute('interaction-prompt', 'none'); m.setAttribute('disable-zoom', ''); m.setAttribute('exposure', '1.3'); m.setAttribute('environment-image', 'neutral'); m.setAttribute('min-camera-orbit', 'auto auto 5%'); m.setAttribute('camera-orbit', '30deg 76deg 52%'); m.setAttribute('autoplay', ''); m.style.width = w + 'px'; m.style.height = h + 'px'; return m; }
function opts3(pool, t, n) { return shuffle([t].concat(pickN(pool.filter(function (x) { return x !== t; }), n || 2))); }

/* ═══ ACTIVITIES — one per stop, each its own way of playing ═══ */
var ACT = {
  'pp-animals': function (s, ctx) { var set = ALL.map(an), c = chrome(s, ctx, set.length), seen = {}; c.q(Q.meet);
    var r = row(s, SG ? 360 : 420, SG ? 26 : 40, SG ? 700 : 620); set.forEach(function (it, i) { var k = pc(it, SG ? 270 : 380); r.appendChild(k);
      tap(k, function () { c.right(k); if (it.snd) { play(it.snd); setTimeout(function () { say(it); }, 1100); } else say(it); c.q(it, false);
        if (!seen[i]) { seen[i] = 1; k.insertAdjacentHTML('beforeend', '<svg class="seenstar star on"><use href="#starSym"/></svg>'); c.step(k); } }); }); },
  'pp-animal-young': function (s, ctx) { var keys = pickN(Object.keys(A.young), 6), c = chrome(s, ctx, keys.length), sel = null; c.q(Q.pairs);
    var lines = el('div', 'abs'); lines.style.cssText += ';top:0;right:0;bottom:0;left:0'; lines.style.pointerEvents = 'none'; lines.innerHTML = '<svg width="5780" height="1080"></svg>'; s.appendChild(lines);
    var top = row(s, 380, SG ? 40 : 120, 300), bot = row(s, 740, SG ? 40 : 120, 300);
    keys.forEach(function (k) { var m = pc(an(k), SG ? 250 : 270); m.dataset.k = k; top.appendChild(m); tap(m, function () { if (sel) sel.style.outline = ''; sel = m; m.style.outline = '14px solid var(--accent)'; sfx.tap(); }); });
    shuffle(keys).forEach(function (k) { var y = A.young[k], b = pc({ img: R(y.img), en: y.en, ml: y.ml }, SG ? 250 : 270); bot.appendChild(b);
      tap(b, function () { if (!sel) return; if (sel.dataset.k !== k) { c.wrong(b); return; }
        var st = lines.getBoundingClientRect(), kk = st.width / 5780, r1 = sel.getBoundingClientRect(), r2 = b.getBoundingClientRect(), x1 = (r1.left + r1.width / 2 - st.left) / kk, y1 = (r1.bottom - st.top) / kk, x2 = (r2.left + r2.width / 2 - st.left) / kk, y2 = (r2.top - st.top) / kk;
        lines.firstChild.insertAdjacentHTML('beforeend', '<path d="M' + x1 + ',' + y1 + ' C' + x1 + ',720 ' + x2 + ',650 ' + x2 + ',' + y2 + '" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" stroke-dasharray="1 34"/>');
        c.right(b); say({ en: y.en, ml: y.ml }); sel.style.outline = ''; sel.classList.add('dim'); b.classList.add('dim'); sel = null; c.step(b); }); }); },
  'pp-animal-homes': function (s, ctx) { var keys = pickN(Object.keys(A.homes), 6), c = chrome(s, ctx, keys.length), q = shuffle(keys), cur2 = null; c.q(Q.home);
    var walker = el('div', 'abs'); place(walker, SG ? MC - 190 : 2700, 340, 400, 420); s.appendChild(walker); var r = row(s, 800, SG ? 30 : 60, 260);
    keys.forEach(function (k) { var hm = A.homes[k], h = pc({ img: R(hm.img), en: hm.en, ml: hm.ml }, SG ? 270 : 250, 30); r.appendChild(h);
      tap(h, function () { if (!cur2) return; if (cur2 !== k) { c.wrong(h); return; } c.right(h); say(an(k)); h.insertAdjacentHTML('beforeend', '<img src="' + an(k).img + '" style="position:absolute;right:-30px;top:-40px;width:120px;height:120px;border-radius:50%;object-fit:cover;border:6px solid #fff">'); walker.innerHTML = ''; cur2 = null; c.step(h, nextA); }); });
    function nextA() { var k = q.shift(); if (!k) return; cur2 = k; walker.innerHTML = ''; var w = pc(an(k), 380); w.style.animation = 'enter .5s cubic-bezier(.3,1.4,.5,1) both'; walker.appendChild(w); }
    nextA(); },
  'pp-hen-types': function (s, ctx) { var set = ['hen', 'rooster', 'hen-colour'].map(an), c = chrome(s, ctx, 3); c.q(Q.flip);
    var r = row(s, 400, SG ? 60 : 130, 620); set.forEach(function (it) { var f = el('div', 'flip'); f.style.width = (SG ? 520 : 540) + 'px'; f.style.height = (SG ? 600 : 620) + 'px';
      f.innerHTML = '<div class="in"><div class="f panel">?</div><div class="b panel"><img src="' + it.img + '" alt=""><div class="cap" style="font-size:64px;font-weight:800;padding-top:10px"></div></div></div>'; f.querySelector('.cap').textContent = T(it); r.appendChild(f);
      tap(f, function () { if (it.snd) play(it.snd); if (f.classList.contains('open')) return; f.classList.add('open'); sfx.pop(); setTimeout(function () { say(it); }, 900); c.q(it, false); c.step(f); }); }); },
  'model-cards': function (s, ctx) { var M = [['cow', '3dmodels/cow.glb'], ['elephant', '3dmodels/elephant__gajah.glb'], ['tiger', '3dmodels/tiger.glb'], ['lion', '3dmodels/lion_lowpoly.glb'], ['monkey', '3dmodels/monkey.glb'], ['hen', '3dmodels/hen.glb'], ['bear', '3dmodels/bear.glb'], ['rabbit', '3dmodels/rabbit.glb']];
    var FACT = { cow: [L4('Gives us milk', 'നമുക്ക് പാൽ തരുന്നു', 'हमें दूध देती है', 'ನಮಗೆ ಹಾಲು ಕೊಡುತ್ತದೆ'), L4('Eats grass', 'പുല്ല് തിന്നുന്നു', 'घास खाती है', 'ಹುಲ್ಲು ತಿನ್ನುತ್ತದೆ')],
      elephant: [L4('Has a long trunk', 'നീണ്ട തുമ്പിക്കൈ ഉണ്ട്', 'लंबी सूँड होती है', 'ಉದ್ದ ಸೊಂಡಿಲು ಇದೆ'), L4("Kerala's state animal", 'കേരളത്തിന്റെ സംസ്ഥാന മൃഗം', 'केरल का राज्य पशु', 'ಕೇರಳದ ರಾಜ್ಯ ಪ್ರಾಣಿ')],
      tiger: [L4("India's national animal", 'ഇന്ത്യയുടെ ദേശീയ മൃഗം', 'भारत का राष्ट्रीय पशु', 'ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಪ್ರಾಣಿ'), L4('Has orange and black stripes', 'ഓറഞ്ചും കറുപ്പും വരകൾ', 'नारंगी-काली धारियाँ', 'ಕಿತ್ತಳೆ-ಕಪ್ಪು ಪಟ್ಟೆಗಳು')],
      lion: [L4('Lives in a group called a pride', 'കൂട്ടമായി ജീവിക്കുന്നു', 'झुंड में रहता है', 'ಗುಂಪಾಗಿ ಬದುಕುತ್ತದೆ'), L4('Has a big mane', 'വലിയ സട ഉണ്ട്', 'बड़े अयाल होते हैं', 'ದೊಡ್ಡ ಕೇಸರ ಇದೆ')],
      monkey: [L4('Climbs trees', 'മരം കയറുന്നു', 'पेड़ पर चढ़ता है', 'ಮರ ಹತ್ತುತ್ತದೆ'), L4('Has a long tail', 'നീണ്ട വാൽ ഉണ്ട്', 'लंबी पूँछ होती है', 'ಉದ್ದ ಬಾಲ ಇದೆ')],
      bear: [L4('Loves honey', 'തേൻ ഇഷ്ടമാണ്', 'शहद पसंद है', 'ಜೇನು ಇಷ್ಟ'), L4('Sleeps in winter', 'തണുപ്പിൽ ഉറങ്ങുന്നു', 'सर्दी में सोता है', 'ಚಳಿಯಲ್ಲಿ ಮಲಗುತ್ತದೆ')],
      rabbit: [L4('Has long ears', 'നീണ്ട ചെവികൾ', 'लंबे कान', 'ಉದ್ದ ಕಿವಿಗಳು'), L4('Hops and jumps', 'ചാടിച്ചാടി നടക്കുന്നു', 'उछलता है', 'ಜಿಗಿಯುತ್ತದೆ')],
      hen: [L4('Lays eggs', 'മുട്ടയിടുന്നു', 'अंडे देती है', 'ಮೊಟ್ಟೆ ಇಡುತ್ತದೆ'), L4('Says cluck cluck', 'കൊക്കൊക്കോ എന്ന് കരയുന്നു', 'कुड़-कुड़ करती है', 'ಕೊಕ್-ಕೊಕ್ ಎನ್ನುತ್ತದೆ')] };
    var c = chrome(s, ctx, M.length), seen = {}; c.q(Q.turn);
    var BW = SG ? 1080 : 2700, BH = SG ? 560 : 730;
    var box = el('div', 'abs'); place(box, SG ? MX + 20 : 1450, 340, BW, BH); s.appendChild(box);
    var chips = el('div', 'abs float-win'); if (SG) { place(chips, MX + 20, 920, MW - 40, 120); chips.style.cssText += ';display:flex;gap:14px;justify-content:center;align-items:center'; } else { place(chips, 430, 360, 900, 690); chips.style.cssText += ';display:flex;flex-direction:column;gap:16px;justify-content:center'; } s.appendChild(chips);
    var info = el('div', 'abs panel float-win info-win'); place(info, SG ? MX + 1120 : 4250, SG ? 360 : 400, SG ? 780 : 1180, SG ? 520 : 560); s.appendChild(info); draggable(info);
    function show(i) { var it = an(M[i][0]); box.innerHTML = ''; var m = mv(M[i][1], BW, BH, it.img); box.appendChild(m); c.q(it, false); if (it.snd) play(it.snd);
      info.innerHTML = '<div class="grip">⠿</div><div style="display:flex;gap:30px;align-items:center"><img src="' + it.img + '" style="width:220px;height:220px;border-radius:50%;object-fit:cover;border:8px solid #fff;box-shadow:0 8px 0 rgba(0,0,0,.15)"><div style="font-size:96px;font-weight:800;line-height:1">' + T(it) + '</div></div>' +
        FACT[M[i][0]].map(function (f) { return '<div class="fact">✦ ' + T(f) + '</div>'; }).join('');
      info.classList.remove('pop-in'); void info.offsetWidth; info.classList.add('pop-in');
      [].forEach.call(chips.children, function (x, j) { x.classList.toggle('on', j === i); }); if (!seen[i]) { seen[i] = 1; c.step(chips.children[i]); } }
    M.forEach(function (m, i) { var it = an(m[0]), b = el('button', 'pill wordpill'); b.style.cssText += SG ? ';height:96px;font-size:38px;padding:0 22px 0 10px;justify-content:flex-start;gap:10px' : ';height:100px;font-size:52px;padding:0 40px 0 14px;justify-content:flex-start'; b.innerHTML = '<img src="' + it.img + '" style="width:76px;height:76px;border-radius:50%;object-fit:cover">' + T(it); chips.appendChild(b); tap(b, function () { show(i); }); });
    show(0); },
  'model-cards-2': function (s, ctx) { var c = chrome(s, ctx, 5), pool = shuffle(ALL); c.q(Q.zoom);
    var lens = el('div', 'abs'); place(lens, SG ? MX + 40 : 900, SG ? 400 : 390, SG ? 540 : 620, SG ? 540 : 620); lens.style.cssText += ';border-radius:50%;border:24px solid #3d2410;box-shadow:0 0 0 14px #fff,0 30px 40px rgba(0,0,0,.35);background-repeat:no-repeat;transition:background-size .9s,background-position .9s'; s.appendChild(lens);
    var hdl = el('div', 'abs'); place(hdl, SG ? MX + 500 : 1440, SG ? 860 : 900, 70, SG ? 220 : 300); hdl.style.cssText += ';background:#3d2410;border-radius:35px;transform:rotate(-45deg)'; s.appendChild(hdl);
    var r = row(s, 440, SG ? 30 : 70, 560); r.style.left = (SG ? MX + 660 : 1800) + 'px'; if (SG) r.style.right = (5780 - MX - MW + 20) + 'px';
    function round() { var t = pool.pop(), it = an(t); lens.style.backgroundImage = 'url(' + it.img + ')'; lens.style.backgroundSize = '420%'; lens.style.backgroundPosition = (30 + Math.random() * 40) + '% ' + (25 + Math.random() * 30) + '%'; r.innerHTML = '';
      opts3(ALL, t).forEach(function (id) { var k = pc(an(id), SG ? 380 : 430); r.appendChild(k); tap(k, function () { if (id !== t) { c.wrong(k); return; } c.right(k); say(it); lens.style.backgroundSize = '100%'; lens.style.backgroundPosition = '50% 50%'; c.step(k, round); }); }); }
    round(); },
  'pp-animal-sort': function (s, ctx) { var q = shuffle(ALL).slice(0, 8), c = chrome(s, ctx, q.length), cur2 = null, walker; c.q(Q.pens);
    function pen(x, label, isFarm) { var p = el('div', 'abs panel'); place(p, x, 420, SG ? 680 : 1700, 600); p.style.overflow = 'hidden'; s.appendChild(p);
      p.innerHTML = '<svg viewBox="0 0 1700 600" preserveAspectRatio="xMidYMid slice" style="position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%">' + (isFarm
        ? '<rect width="1700" height="600" fill="#c9ee9a"/>' + [80, 330, 580, 830, 1080, 1330, 1580].map(function (x) { return '<rect x="' + x + '" y="380" width="30" height="200" fill="#f3dcb4" stroke="#8a5a2b" stroke-width="6"/>'; }).join('') + '<rect x="0" y="420" width="1700" height="24" fill="#c9a27a"/><rect x="0" y="500" width="1700" height="24" fill="#c9a27a"/>'
        : '<rect width="1700" height="600" fill="#2f7a4a"/>' + [[150, 520, 300], [480, 560, 360], [1250, 540, 330], [1550, 560, 280]].map(function (t) { return '<polygon points="' + t[0] + ',' + (t[1] - t[2]) + ' ' + (t[0] - 110) + ',' + t[1] + ' ' + (t[0] + 110) + ',' + t[1] + '" fill="#1f5a36"/>'; }).join('')) +
        '</svg><div style="position:absolute;left:0;right:0;top:20px;text-align:center;font-size:72px;font-weight:800;color:' + (isFarm ? '#2f6a1a' : '#fff') + '">' + T(label) + '</div><div class="inside" style="position:absolute;left:40px;right:40px;bottom:30px;display:flex;gap:16px;flex-wrap:wrap;justify-content:center"></div>';
      tap(p, function () { if (!cur2) return; if ((DOM.indexOf(cur2) >= 0) !== isFarm) { c.wrong(walker.firstChild); return; }
        var it = an(cur2); c.right(p); say(it); p.querySelector('.inside').insertAdjacentHTML('beforeend', '<img src="' + it.img + '" style="width:150px;height:150px;border-radius:50%;object-fit:cover;border:8px solid #fff">'); walker.innerHTML = ''; cur2 = null; c.step(p, nextA); }); }
    pen(SG ? MX + 20 : 420, Q.farm, true); pen(SG ? MX + MW - 700 : 3600, Q.forest, false);
    walker = el('div', 'abs'); place(walker, SG ? MC - 210 : 2690, 450, 420, 480); s.appendChild(walker);
    function nextA() { cur2 = q.shift(); if (!cur2) return; var k = pc(an(cur2), 400); k.style.animation = 'enter .5s cubic-bezier(.3,1.4,.5,1) both'; walker.innerHTML = ''; walker.appendChild(k); }
    nextA(); },
  'pp-odd-one-out': function (s, ctx) { var c = chrome(s, ctx, 5); c.q(Q.odd); var r = row(s, 410, SG ? 36 : 90, 600);
    function round() { var farm = Math.random() < .5, odd = pickN(farm ? WILD : DOM, 1)[0]; r.innerHTML = '';
      shuffle(pickN(farm ? DOM : WILD, 3).concat([odd])).forEach(function (id) { var k = pc(an(id), SG ? 430 : 520); r.appendChild(k); tap(k, function () { if (id !== odd) { c.wrong(k); return; } c.right(k); say(an(id)); c.step(k, round); }); }); }
    round(); },
  'pp-animal-quiz': function (s, ctx) { var snd = ALL.filter(function (id) { return A.all[id].snd; }), pool = shuffle(snd), c = chrome(s, ctx, 5), t = null; c.q(Q.sound);
    var spk = el('button', 'pill'); place(spk, SG ? MX + 40 : 700, SG ? 500 : 470, SG ? 380 : 460, SG ? 380 : 460); spk.style.fontSize = (SG ? 190 : 230) + 'px'; spk.textContent = '🔊'; s.appendChild(spk); tap(spk, function () { if (t) play(an(t).snd); });
    var r = row(s, 420, SG ? 30 : 80, 600); r.style.left = (SG ? MX + 460 : 1500) + 'px'; if (SG) r.style.right = (5780 - MX - MW + 20) + 'px';
    function round() { t = pool.pop(); r.innerHTML = ''; setTimeout(function () { play(an(t).snd); }, 400);
      opts3(snd, t).forEach(function (id) { var k = pc(an(id), SG ? 440 : 500); r.appendChild(k); tap(k, function () { if (id !== t) { c.wrong(k); return; } c.right(k); say(an(id)); c.step(k, round); }); }); }
    round(); },
  'pp-animal-hunt': function (s, ctx) { var ids = pickN(ALL, 6), c = chrome(s, ctx, ids.length); c.q(Q.hide);
    var spots = [[620, 640], [1450, 720], [2300, 600], [3200, 700], [4100, 620], [4900, 720]], shapes = [[0, 0, 200], [170, -40, 170], [320, 10, 150], [-130, 30, 140]];
    ids.forEach(function (id, i) { var it = an(id), x = spots[i][0], y = spots[i][1];
      var pk = el('div', 'peek', '<img src="' + it.img + '" alt="">'); place(pk, x + 30, y - 30); pk.style.transform = 'translateY(150px)'; pk.style.transition = 'transform .25s'; s.appendChild(pk);
      var b = el('div', 'bush'); place(b, x - 180, y + 30, 640, 380);
      b.innerHTML = '<svg viewBox="-260 -230 640 380" width="640" height="380">' + shapes.map(function (q, k) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (q[2] - i * 4) + '" fill="' + (k % 2 ? '#3fa94a' : '#4fbf55') + '"/>'; }).join('') + '<rect x="-260" y="40" width="640" height="120" fill="#3fa94a"/></svg>';
      s.appendChild(b); var tm = setInterval(function () { if (!document.body.contains(b)) { clearInterval(tm); return; } if (!b.dataset.f) { pk.style.transform = 'translateY(100px)'; setTimeout(function () { if (!b.dataset.f) pk.style.transform = 'translateY(150px)'; }, 500); } }, 2600 + i * 400);
      tap(b, function () { if (b.dataset.f) return; b.dataset.f = 1; pk.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1)'; pk.style.transform = 'translateY(-170px) scale(1.15)'; sfx.right(); if (it.snd) play(it.snd); c.q(it, false); c.step(pk); }); }); },
  'animal-drawing': function (s, ctx) { var it = an(pickN(ALL, 1)[0]), c = chrome(s, ctx, 1); c.q(Q.draw);
    var PW = SG ? 1260 : 3300; var pad = el('div', 'abs panel'); place(pad, SG ? MX + 240 : 1000, 360, PW, 700); s.appendChild(pad);
    pad.innerHTML = '<img src="' + it.img + '" style="position:absolute;left:50%;top:10px;height:660px;transform:translateX(-50%);opacity:.3;border-radius:24px"><canvas width="' + (PW - 20) + '" height="680" style="position:absolute;left:0;top:0;touch-action:none"></canvas>';
    var cv = pad.querySelector('canvas'), cx = cv.getContext('2d'), col = '#ff4d4d', size = 80, drawing = false, last = null; cx.lineCap = 'round'; cx.lineJoin = 'round';
    function pt(e) { var r = cv.getBoundingClientRect(), k = r.width / cv.width; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; }
    function dot(p) { cx.globalCompositeOperation = col === 'erase' ? 'destination-out' : 'source-over'; cx.fillStyle = col === 'erase' ? '#000' : col; cx.beginPath(); cx.arc(p[0], p[1], size / 2, 0, Math.PI * 2); cx.fill(); }
    cv.addEventListener('pointerdown', function (e) { drawing = true; last = pt(e); dot(last); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pt(e); cx.globalCompositeOperation = col === 'erase' ? 'destination-out' : 'source-over'; cx.strokeStyle = col === 'erase' ? '#000' : col; cx.lineWidth = size; cx.beginPath(); cx.moveTo(last[0], last[1]); cx.lineTo(p[0], p[1]); cx.stroke(); last = p; });
    cv.addEventListener('pointerup', function () { drawing = false; });
    var pal = el('div', 'abs'); place(pal, SG ? MX + 1520 : 4420, 360, SG ? 380 : 1100, 700); pal.style.cssText += ';display:flex;flex-wrap:wrap;gap:' + (SG ? 18 : 30) + 'px;align-content:center;justify-content:center'; s.appendChild(pal);
    function choose(b) { [].forEach.call(pal.querySelectorAll('.pick'), function (x) { x.style.outline = ''; }); b.style.outline = '16px solid #fff'; sfx.tap(); }
    ['#ff4d4d', '#ff9a1f', '#ffd21f', '#36b34a', '#2f7df0', '#9b4dff', '#ff6fb1', '#8a5a2b', '#3d2410'].forEach(function (k, i) { var b = el('button', 'pill pick'); b.style.cssText += SG ? ';width:104px;height:104px;background:' + k : ';width:200px;height:200px;background:' + k; if (!i) b.style.outline = '16px solid #fff'; pal.appendChild(b); tap(b, function () { col = k; choose(b); }); });
    var er = el('button', 'pill pick', '🧽'); er.style.cssText += SG ? ';width:104px;height:104px;font-size:60px' : ';width:200px;height:200px;font-size:110px'; pal.appendChild(er); tap(er, function () { col = 'erase'; choose(er); });
    var sizes = el('div', 'abs'); place(sizes, SG ? MX + 20 : 430, 360, SG ? 200 : 460, 420); sizes.style.cssText += ';display:flex;flex-direction:column;gap:26px;align-items:center;justify-content:center'; s.appendChild(sizes);
    [40, 80, 130].forEach(function (z) { var b = el('button', 'pill'); b.style.cssText += ';width:200px;height:120px'; b.innerHTML = '<span style="display:block;width:' + z * .9 + 'px;height:' + z * .9 + 'px;border-radius:50%;background:#3d2410"></span>'; if (z === 80) b.classList.add('on'); sizes.appendChild(b);
      tap(b, function () { size = z; [].forEach.call(sizes.children, function (x) { x.classList.remove('on'); }); b.classList.add('on'); sfx.tap(); }); });
    var clr = el('button', 'btn alt', '🗑'); place(clr, SG ? MX + 30 : 470, 830); clr.style.fontSize = '64px'; s.appendChild(clr); tap(clr, function () { cx.clearRect(0, 0, cv.width, cv.height); sfx.tap(); });
    var dn = el('button', 'btn', '✓ ' + T(UI.done)); place(dn, 4600, 1080 - 150); dn.style.top = 'auto'; dn.style.bottom = '-40px'; dn.style.display = 'none';
    pal.appendChild(dn); dn.style.position = 'static'; dn.style.display = ''; if (SG) { dn.style.fontSize = '48px'; dn.style.padding = '18px 34px 22px'; } tap(dn, function () { c.right(dn); say(it); c.step(dn); }); },
  'colour-match': function (s, ctx) { var C = [L4('Red', 'ചുവപ്പ്', 'लाल', 'ಕೆಂಪು'), L4('Blue', 'നീല', 'नीला', 'ನೀಲಿ'), L4('Green', 'പച്ച', 'हरा', 'ಹಸಿರು'), L4('Yellow', 'മഞ്ഞ', 'पीला', 'ಹಳದಿ')], HEX = ['#ef3b3b', '#2f7df0', '#36b34a', '#ffd21f'];
    var ti = Math.random() * 4 | 0, cols = []; for (var i = 0; i < 16; i++) cols.push(i % 4 === 0 ? ti : (ti + 1 + (i % 3)) % 4); cols = shuffle(cols);
    var c = chrome(s, ctx, cols.filter(function (x) { return x === ti; }).length); c.q({ en: 'Pop the ' + C[ti].en + ' balloons!', ml: C[ti].ml + ' ബലൂണുകൾ പൊട്ടിക്കൂ!', hi: C[ti].hi + ' गुब्बारे फोड़ो!', kn: C[ti].kn + ' ಬಲೂನುಗಳನ್ನು ಒಡೆಯಿರಿ!' });
    cols.forEach(function (ci, i) { var b = balloon(HEX[ci], 270); place(b, 470 + i * 305, 400 + (i % 3) * 70); s.appendChild(b);
      tap(b, function () { if (b.classList.contains('popped')) return; if (ci !== ti) { c.wrong(b); return; } popBalloon(b); c.step(null); }); }); },
  'shape-sorter': function (s, ctx) { var SH = [['Circle', 'വൃത്തം', '<circle cx="50" cy="50" r="42"/>', '#ffd21f'], ['Square', 'സമചതുരം', '<rect x="10" y="10" width="80" height="80" rx="6"/>', '#2f7df0'], ['Triangle', 'ത്രികോണം', '<polygon points="50,6 94,90 6,90"/>', '#36b34a'], ['Star', 'നക്ഷത്രം', '<polygon points="50,4 61,37 96,37 68,58 79,92 50,71 21,92 32,58 4,37 39,37"/>', '#ef3b3b'], ['Heart', 'ഹൃദയം', '<path d="M50,90 C10,60 4,34 22,18 C36,6 50,18 50,28 C50,18 64,6 78,18 C96,34 90,60 50,90Z"/>', '#ff6fb1']];
    var c = chrome(s, ctx, SH.length), sel = null; c.q(Q.holes);
    var bd = el('div', 'abs panel'); if (SG) place(bd, MX + 20, 345, MW - 40, 330); else place(bd, 560, 370, 2500, 690); bd.style.cssText += ';display:flex;flex-wrap:wrap;gap:' + (SG ? '20px 60px' : '40px 110px') + ';justify-content:center;align-content:center'; s.appendChild(bd);
    var r = el('div', 'abs'); if (SG) place(r, MX + 20, 720, MW - 40, 330); else place(r, 3260, 370, 2200, 690); r.style.cssText += ';display:flex;flex-wrap:wrap;gap:' + (SG ? '20px 50px' : '40px 70px') + ';justify-content:center;align-content:center'; s.appendChild(r);
    SH.forEach(function (sh, i) { var h = el('div', ''); h.style.cssText = 'width:' + (SG ? 270 : 310) + 'px;height:' + (SG ? 270 : 310) + 'px;cursor:pointer'; h.innerHTML = '<svg viewBox="0 0 100 100" width="100%" height="100%" fill="rgba(61,36,16,.25)" stroke="#3d2410" stroke-width="3" stroke-dasharray="6 5">' + sh[2] + '</svg>'; bd.appendChild(h);
      tap(h, function () { if (!sel) return; if (sel.dataset.i !== String(i)) { c.wrong(sel); return; } h.innerHTML = '<svg viewBox="0 0 100 100" width="100%" height="100%" fill="' + sh[3] + '" stroke="#3d2410" stroke-width="3">' + sh[2] + '</svg>'; c.right(h); say({ en: sh[0], ml: sh[1] }); sel.style.visibility = 'hidden'; sel = null; c.step(h); }); });
    shuffle([0, 1, 2, 3, 4]).forEach(function (i) { var sh = SH[i], p = el('button', 'tile'); p.dataset.i = i; p.style.width = p.style.height = (SG ? 280 : 310) + 'px'; p.innerHTML = '<svg viewBox="0 0 100 100" width="260" height="260" fill="' + sh[3] + '" stroke="#3d2410" stroke-width="3">' + sh[2] + '</svg>'; r.appendChild(p);
      tap(p, function () { if (sel) sel.style.outline = ''; sel = p; p.style.outline = '14px solid var(--accent)'; sfx.tap(); }); }); },
  'pp-size-quiz': function (s, ctx) { var c = chrome(s, ctx, 6), r = row(s, 400, SG ? 120 : 200, 640);
    function round() { var it = an(pickN(ALL, 1)[0]), wantBig = Math.random() < .5; c.q(wantBig ? Q.big : Q.small); r.innerHTML = '';
      shuffle([true, false]).forEach(function (isBig) { var k = photo(it, isBig ? 620 : 290); k.style.cursor = 'pointer'; r.appendChild(k); tap(k, function () { if (isBig !== wantBig) { c.wrong(k); return; } c.right(k); say(it); c.step(k, round); }); }); }
    round(); },
  'pattern-finder': function (s, ctx) { var HEX = ['#ef3b3b', '#2f7df0', '#36b34a', '#ffd21f', '#9b4dff'], c = chrome(s, ctx, 5); c.q(Q.pattern);
    var str = el('div', 'abs'); if (SG) place(str, MX + 20, 420, MW - 40, 260); else place(str, 400, 420, 5000, 260); str.style.cssText += ';display:flex;gap:' + (SG ? 20 : 40) + 'px;align-items:center;justify-content:center'; s.appendChild(str); var r = row(s, 780, 120, 240);
    function round() { var P2 = [[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1]][Math.random() * 4 | 0], cs = pickN([0, 1, 2, 3, 4], 3), seq = []; for (var i = 0; i < 8; i++) seq.push(cs[P2[i % P2.length]]); var ans = cs[P2[8 % P2.length]];
      str.innerHTML = '<div style="position:absolute;left:0;right:0;top:50%;height:14px;background:#8a5a2b;border-radius:7px;z-index:-1"></div>' + seq.map(function (k) { return '<div class="bead" style="background:' + HEX[k] + (SG ? ';width:150px;height:150px' : '') + '"></div>'; }).join('') + '<div class="slot" style="width:' + (SG ? 150 : 180) + 'px;height:' + (SG ? 150 : 180) + 'px;border-radius:50%;font-size:110px">?</div>'; r.innerHTML = '';
      shuffle(cs).forEach(function (k) { var b = el('button', 'pill'); b.style.width = '220px'; b.style.height = '220px'; b.innerHTML = '<div class="bead" style="background:' + HEX[k] + '"></div>'; r.appendChild(b);
        tap(b, function () { if (k !== ans) { c.wrong(b); return; } str.lastChild.outerHTML = '<div class="bead ok" style="background:' + HEX[k] + '"></div>'; c.right(b); c.step(b, round); }); }); }
    round(); },
  feelings: function (s, ctx) { var pool = shuffle(DATA.feelings), c = chrome(s, ctx, 5), EM = { Happy: '😊', Sad: '😢', Excited: '🤩', Scared: '😨', Bored: '🥱', Silly: '😜' }; c.q(Q.feel);
    var pic = el('div', 'abs'); place(pic, SG ? MX + 60 : 900, 380, 640, 660); s.appendChild(pic); var r = el('div', 'abs'); place(r, SG ? MX + 760 : 1900, 400, SG ? 1130 : 3300, 620); r.style.cssText += ';display:flex;flex-direction:column;gap:50px;justify-content:center;align-items:center'; s.appendChild(r);
    function round() { var t = pool.pop(); pic.innerHTML = ''; pic.appendChild(photo(t, 620)); r.innerHTML = '';
      opts3(DATA.feelings, t).forEach(function (o) { var b = el('button', 'pill wordpill'); b.innerHTML = '<span style="font-size:110px">' + EM[o.en] + '</span>' + T(o); r.appendChild(b); tap(b, function () { if (o !== t) { c.wrong(b); return; } b.classList.add('on'); c.right(b); say(o); c.step(b, round); }); }); }
    round(); },
  vehicles: function (s, ctx) { var V = [['car.glb', 'Car', 'കാർ', 'car-honk.mp3'], ['KSRTC_BUS.glb', 'Bus', 'ബസ്', 'bus.mp3'], ['train.glb', 'Train', 'തീവണ്ടി', 'train-whistle.mp3'], ['boat.glb', 'Boat', 'ബോട്ട്', 'motorboat.mp3']], c = chrome(s, ctx, V.length); c.q(Q.garage);
    V.forEach(function (v, i) { var DW = SG ? 448 : 1100; var d = el('div', 'door'); place(d, SG ? MX + 20 + i * 470 : 560 + i * 1260, 400, DW, 640); d.innerHTML = '<div class="sh"></div><div class="nm"></div>'; s.appendChild(d);
      tap(d, function () { play(R('assets/new/audio/' + v[3])); if (d.classList.contains('open')) return; d.classList.add('open'); var o = { en: v[1], ml: v[2] }; d.querySelector('.nm').textContent = T(o);
        var m = mv('assets/new/models/' + v[0], DW, 560, v[0] === 'KSRTC_BUS.glb' ? PIC.vehicles : null); m.style.position = 'absolute'; m.style.top = '20px'; d.appendChild(m); c.q(o, false); setTimeout(function () { say(o); }, 1200); c.step(d); }); }); },
  'pri-houses': function (s, ctx) { var CL = { Bungalow: L4('A big house with a garden', 'പൂന്തോട്ടമുള്ള വലിയ വീട്', 'बगीचे वाला बड़ा घर', 'ತೋಟವಿರುವ ದೊಡ್ಡ ಮನೆ'), Apartment: L4('Many homes, one on top of another', 'ഒന്നിനു മുകളിൽ ഒന്നായി പല വീടുകൾ', 'एक के ऊपर एक कई घर', 'ಒಂದರ ಮೇಲೆ ಒಂದು ಹಲವು ಮನೆಗಳು'),
      'Mud House': L4('A house made of mud', 'മണ്ണു കൊണ്ടുള്ള വീട്', 'मिट्टी का घर', 'ಮಣ್ಣಿನ ಮನೆ'), Tent: L4('A cloth house for camping', 'തുണി കൊണ്ടുള്ള താൽക്കാലിക വീട്', 'कपड़े का घर', 'ಬಟ್ಟೆಯ ಮನೆ'), 'Modern House': L4('A new house with big windows', 'വലിയ ജനലുകളുള്ള പുതിയ വീട്', 'बड़ी खिड़कियों वाला नया घर', 'ದೊಡ್ಡ ಕಿಟಕಿಗಳ ಹೊಸ ಮನೆ') };
    var pool = shuffle(DATA.houses), c = chrome(s, ctx, DATA.houses.length), r = row(s, 400, SG ? 26 : 70, 640);
    function round() { var t = pool.pop(); c.q(CL[t.en]); r.innerHTML = ''; shuffle(DATA.houses).forEach(function (h) { var k = pc(h, SG ? 340 : 470); r.appendChild(k); tap(k, function () { if (h !== t) { c.wrong(k); return; } c.right(k); say(h); c.step(k, round); }); }); }
    round(); },
  'pri-rooms': function (s, ctx) { var QS = [L4('Where do we cook?', 'നമ്മൾ എവിടെ പാചകം ചെയ്യും?', 'हम खाना कहाँ बनाते हैं?', 'ನಾವು ಎಲ್ಲಿ ಅಡುಗೆ ಮಾಡುತ್ತೇವೆ?'), L4('Where do we sleep?', 'നമ്മൾ എവിടെ ഉറങ്ങും?', 'हम कहाँ सोते हैं?', 'ನಾವು ಎಲ್ಲಿ ಮಲಗುತ್ತೇವೆ?'), L4('Where do we bathe?', 'നമ്മൾ എവിടെ കുളിക്കും?', 'हम कहाँ नहाते हैं?', 'ನಾವು ಎಲ್ಲಿ ಸ್ನಾನ ಮಾಡುತ್ತೇವೆ?'),
      L4('Where do we eat?', 'നമ്മൾ എവിടെ ഭക്ഷണം കഴിക്കും?', 'हम कहाँ खाते हैं?', 'ನಾವು ಎಲ್ಲಿ ಊಟ ಮಾಡುತ್ತೇವೆ?'), L4('Where do we sit with family?', 'കുടുംബത്തോടൊപ്പം എവിടെ ഇരിക്കും?', 'परिवार के साथ कहाँ बैठते हैं?', 'ಕುಟುಂಬದೊಂದಿಗೆ ಎಲ್ಲಿ ಕೂರುತ್ತೇವೆ?')];
    var c = chrome(s, ctx, 5), order = shuffle([0, 1, 2, 3, 4]), t = null;
    var hs = el('div', 'abs'); place(hs, SG ? MX + 20 : 1690, SG ? 380 : 330, 2400, 720); if (SG) { hs.style.transform = 'scale(' + ((MW - 40) / 2400) + ')'; hs.style.transformOrigin = '0 0'; } s.appendChild(hs);
    hs.innerHTML = '<svg viewBox="0 0 2400 720" width="2400" height="720" style="position:absolute;top:0;right:0;bottom:0;left:0"><polygon points="60,250 1200,10 2340,250" fill="#c8562e" stroke="#6e2a12" stroke-width="14"/><rect x="120" y="240" width="2160" height="480" fill="#fff1d6" stroke="#6e2a12" stroke-width="14"/><line x1="120" y1="480" x2="2280" y2="480" stroke="#6e2a12" stroke-width="12"/></svg>';
    var slots = [[170, 280, 640, 180], [880, 280, 640, 180], [1590, 280, 640, 180], [400, 520, 760, 180], [1240, 520, 760, 180]];
    DATA.rooms.forEach(function (rm, i) { var w = el('div', ''), sl = slots[i]; place(w, sl[0], sl[1], sl[2], sl[3]); w.style.cssText += ';border-radius:16px;overflow:hidden;border:10px solid #6e2a12;cursor:pointer;background:url(' + rm.img + ') center/cover'; hs.appendChild(w);
      tap(w, function () { if (i !== t) { c.wrong(w); return; } c.right(w); say(rm); w.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:0;right:0;bottom:0;background:#fff;font-size:44px;font-weight:800;text-align:center">' + T(rm) + '</div>'); c.step(w, round); }); });
    function round() { t = order.pop(); c.q(QS[t]); }
    round(); },
  'pri-flowers': function (s, ctx) { var c = chrome(s, ctx, DATA.flowers.length); c.q(Q.bloom);
    var bed = el('div', 'abs'); place(bed, SG ? MX + 20 : 400, 960, SG ? MW - 40 : 5000, 120); bed.style.cssText += ';background:#7a4a28;border-radius:60px 60px 0 0'; s.appendChild(bed);
    DATA.flowers.forEach(function (f, i) { var x = SG ? MX + 150 + i * 270 : 650 + i * 700, y = 560 + (i % 2) * 70, b = el('div', ''); place(b, x - 160, y - 160, 320, 600); if (SG) { b.style.transform = 'scale(.82)'; b.style.transformOrigin = '50% 100%'; } b.style.cursor = 'pointer';
      b.innerHTML = '<svg width="320" height="600" style="position:absolute;top:0;right:0;bottom:0;left:0"><path d="M160,600 Q' + (140 + (i % 3) * 20) + ',400 160,170" stroke="#2f8a2f" stroke-width="18" fill="none"/><ellipse cx="' + (i % 2 ? 210 : 110) + '" cy="380" rx="60" ry="24" fill="#3fa94a"/></svg>' +
        '<div class="bl" style="position:absolute;left:60px;top:40px;width:200px;height:200px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#5cbf4a;border:10px solid #2f8a2f;transition:all .7s cubic-bezier(.3,1.6,.5,1)"></div>'; s.appendChild(b);
      tap(b, function () { if (b.dataset.o) return; b.dataset.o = 1; var bl = b.querySelector('.bl'); bl.style.cssText += ';left:-10px;top:-30px;width:340px;height:340px;border-radius:50%;border-color:#fff;background:url(' + f.img + ') center/cover';
        b.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:50%;top:330px;transform:translateX(-50%);background:#fff;padding:4px 24px;border-radius:20px;font-size:44px;font-weight:800;white-space:nowrap">' + T(f) + '</div>'); sfx.right(); say(f); c.q(f, false); c.step(b); }); }); },
  'pri-flower-match': function (s, ctx) { var four = pickN(DATA.flowers, 4), deck = shuffle(four.concat(four)), c = chrome(s, ctx, 4), open = [], lock = false; c.q(Q.memory);
    var r = row(s, 380, SG ? 30 : 46, SG ? 690 : 600);
    deck.forEach(function (f) { var k = el('div', 'flip'); k.style.width = k.style.height = (SG ? 320 : 560) + 'px'; k.innerHTML = '<div class="in"><div class="f panel" style="font-size:240px">🌼</div><div class="b panel" style="padding:10px"><img src="' + f.img + '" alt=""></div></div>'; r.appendChild(k);
      tap(k, function () { if (lock || k.classList.contains('open')) return; k.classList.add('open'); sfx.tap(); open.push([k, f]);
        if (open.length === 2) { var a = open[0], b = open[1]; open = []; if (a[1] === b[1]) { c.right(b[0]); say(f); c.step(b[0]); } else { lock = true; setTimeout(function () { a[0].classList.remove('open'); b[0].classList.remove('open'); lock = false; }, 1100); } } }); }); },
  'sec-name-build': function (s, ctx) { var NAME = 'AMMU', letters = shuffle(NAME.split('').concat(['T', 'R'])), c = chrome(s, ctx, NAME.length), at = 0; c.q(T(Q.name) + ': ' + NAME, false);
    var sl = row(s, 390, 40, 300); NAME.split('').forEach(function () { var d = el('div', 'slot'); d.style.width = '260px'; d.style.height = '280px'; d.style.fontSize = '190px'; sl.appendChild(d); });
    var HEX = ['#ef3b3b', '#2f7df0', '#36b34a', '#ff9f1c', '#9b4dff', '#ff6fb1'];
    letters.forEach(function (ch, i) { var b = balloon(HEX[i], SG ? 220 : 240, ch); place(b, SG ? MX + 70 + i * 300 : 1000 + i * 640, SG ? 720 : 680 + (i % 2) * 20); s.appendChild(b);
      tap(b, function () { if (b.dataset.u) return; if (ch !== NAME[at]) { c.wrong(b); return; } b.dataset.u = 1; popBalloon(b); var d = sl.children[at]; d.textContent = ch; d.style.borderStyle = 'solid'; d.style.background = '#fff'; at++; sfx.pop(); c.step(d); }); }); },
  'sec-helpers-places': function (s, ctx) { var pool = shuffle(DATA.helpers), c = chrome(s, ctx, 4); c.q(Q.guess);
    var pic = el('div', 'abs panel'); place(pic, SG ? MX + 60 : 900, 380, 660, 660); pic.style.overflow = 'hidden'; s.appendChild(pic);
    var r = el('div', 'abs'); place(r, SG ? MX + 780 : 2000, 400, SG ? 1110 : 3200, 620); r.style.cssText += ';display:flex;flex-direction:column;gap:46px;justify-content:center;align-items:center'; s.appendChild(r);
    function round() { var t = pool.pop(); pic.innerHTML = '<img src="' + t.img + '" style="position:absolute;top:12px;right:12px;bottom:12px;left:12px;width:616px;height:616px;object-fit:cover;border-radius:24px">';
      for (var i = 0; i < 9; i++) { var tl = el('div', ''); place(tl, 12 + (i % 3) * 205, 12 + (i / 3 | 0) * 205, 200, 200); tl.style.cssText += ';background:var(--accent);border:6px solid #fff;border-radius:18px;cursor:pointer;transition:all .35s;display:flex;align-items:center;justify-content:center;font-size:90px;color:#fff;font-weight:800'; tl.textContent = '?';
        pic.appendChild(tl); (function (tl) { tap(tl, function () { tl.style.transform = 'scale(0) rotate(40deg)'; sfx.pop(); }); })(tl); }
      r.innerHTML = ''; opts3(DATA.helpers, t).forEach(function (o) { var b = el('button', 'pill wordpill'); b.textContent = T(o); r.appendChild(b);
        tap(b, function () { if (o !== t) { c.wrong(b); return; } [].forEach.call(pic.querySelectorAll('div'), function (x) { x.style.transform = 'scale(0)'; }); b.classList.add('on'); c.right(b); say(o); c.step(b, round); }); }); }
    round(); },
  'sec-daily-living': function (s, ctx) { var R2 = [[['daily/wash-1-wet.jpg', 'Wash your face', 'മുഖം കഴുകുക'], ['daily/teeth-2-brush.jpg', 'Brush your teeth', 'പല്ല് തേക്കുക'], ['daily/groom-3-comb.jpg', 'Comb your hair', 'മുടി ചീകുക']],
      [1, 2, 3, 4, 5].map(function (n) { return ['habits/handwash-' + n + '.webp', ['Wet hands', 'Soap', 'Rub', 'Rinse', 'Dry'][n - 1], ['കൈ നനയ്ക്കുക', 'സോപ്പ്', 'തേയ്ക്കുക', 'കഴുകുക', 'തുടയ്ക്കുക'][n - 1]]; })];
    var c = chrome(s, ctx, 8), ri = 0; c.q(Q.order); var sl = row(s, 380, 50, 300), cards = row(s, 730, 50, 320);
    function round() { var seq = R2[ri], at = 0; sl.innerHTML = ''; cards.innerHTML = '';
      seq.forEach(function (_, i) { var d = el('div', 'slot'); d.style.width = '290px'; d.style.height = '290px'; d.style.fontSize = '140px'; d.textContent = i + 1; sl.appendChild(d); });
      shuffle(seq.map(function (x, i) { return i; })).forEach(function (i) { var it = { img: R(IMG + seq[i][0]), en: seq[i][1], ml: seq[i][2] }, k = pc(it, 290, 34); cards.appendChild(k);
        tap(k, function () { if (i !== at) { c.wrong(k); return; } var d = sl.children[at]; d.innerHTML = '<img src="' + it.img + '" style="width:100%;height:100%;object-fit:cover">'; d.style.borderStyle = 'solid'; k.style.visibility = 'hidden'; at++; c.right(d); say(it);
          c.step(d, at === seq.length && ri === 0 ? function () { ri = 1; round(); } : null); }); }); }
    round(); },
  'sec-first-aid': function (s, ctx) { var items = shuffle(DATA.firstaid.concat(DATA.notaid)), c = chrome(s, ctx, DATA.firstaid.length); c.q(Q.pack);
    var box = el('div', 'abs'); place(box, SG ? MX + 30 : 400, SG ? 600 : 520, 900, 520); if (SG) { box.style.transform = 'scale(.66)'; box.style.transformOrigin = '0 0'; } box.innerHTML = '<svg viewBox="0 0 900 520" width="900" height="520"><rect x="20" y="120" width="860" height="400" rx="40" fill="#e23b3b" stroke="#8a1a1a" stroke-width="14"/><rect x="380" y="60" width="140" height="80" rx="20" fill="none" stroke="#8a1a1a" stroke-width="22"/><rect x="390" y="220" width="120" height="240" rx="14" fill="#fff"/><rect x="330" y="280" width="240" height="120" rx="14" fill="#fff"/></svg><div class="in" style="position:absolute;left:40px;right:40px;top:150px;display:flex;flex-wrap:wrap;gap:10px"></div>'; s.appendChild(box);
    var r = row(s, 400, SG ? 24 : 40, 640); r.style.left = (SG ? MX + 640 : 1450) + 'px'; if (SG) r.style.right = (5780 - MX - MW + 20) + 'px'; r.style.flexWrap = 'wrap'; r.style.rowGap = '40px'; r.style.alignContent = 'center';
    items.forEach(function (it) { var k = pc(it, SG ? 250 : 300, 34); r.appendChild(k);
      tap(k, function () { if (DATA.firstaid.indexOf(it) < 0) { c.wrong(k); return; } k.style.visibility = 'hidden'; c.right(box); say(it); box.querySelector('.in').insertAdjacentHTML('beforeend', '<img src="' + it.img + '" style="width:130px;height:130px;border-radius:20px;object-fit:cover;border:6px solid #fff">'); c.step(box); }); }); },
  'sec-mobile': function (s, ctx) { var CALLS = [['108', L4('Ambulance', 'ആംബുലൻസ്', 'एम्बुलेंस', 'ಆಂಬುಲೆನ್ಸ್')], ['100', L4('Police', 'പോലീസ്', 'पुलिस', 'ಪೊಲೀಸ್')], ['101', L4('Fire', 'ഫയർ ഫോഴ്സ്', 'दमकल', 'ಅಗ್ನಿಶಾಮಕ')]], ci = 0, typed = '', c = chrome(s, ctx, CALLS.length);
    var ph = el('div', 'abs'); place(ph, 2390, 390, 1000, 670); ph.style.cssText += ';border-radius:80px;background:#26303a;box-shadow:0 20px 0 #11171c,0 30px 50px rgba(0,0,0,.4);padding:40px'; s.appendChild(ph);
    var scr = el('div', ''); scr.style.cssText = 'height:120px;border-radius:30px;background:#cfeaff;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:800;letter-spacing:20px;margin-bottom:24px'; ph.appendChild(scr);
    var kp = el('div', ''); kp.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:18px'; ph.appendChild(kp);
    '1234567890'.split('').forEach(function (d) { var b = el('button', 'pill'); b.style.cssText += ';width:160px;height:150px;font-size:96px'; b.textContent = d; kp.appendChild(b);
      tap(b, function () { var want = CALLS[ci][0]; if (want[typed.length] !== d) { c.wrong(b); return; } typed += d; scr.textContent = typed; sfx.tap();
        if (typed === want) { sfx.ring(); scr.textContent = '📞 ' + typed; c.right(scr); say(CALLS[ci][1]); c.step(scr, function () { ci++; typed = ''; scr.textContent = ''; ask(); }); } }); });
    function ask() { var k = CALLS[ci]; c.q({ en: 'Call ' + k[1].en + ': ' + k[0], ml: k[1].ml + ' വിളിക്കൂ: ' + k[0], hi: k[1].hi + ' को फ़ोन करो: ' + k[0], kn: k[1].kn + ' ಕರೆ ಮಾಡಿ: ' + k[0] }); }
    ask(); },
  'sec-bouquet': function (s, ctx) { var c = chrome(s, ctx, 5), got = 0; c.q(Q.vase);
    var vase = el('div', 'abs'); place(vase, 2490, 420, 800, 640); vase.innerHTML = '<svg viewBox="0 0 800 640" width="800" height="640" style="position:absolute;top:0;right:0;bottom:0;left:0"><path d="M260,320 L540,320 L600,620 L200,620Z" fill="#5ab8ff" stroke="#2c6fd6" stroke-width="12"/><ellipse cx="400" cy="320" rx="150" ry="30" fill="#2c6fd6"/></svg><div class="bq" style="position:absolute;left:0;right:0;top:0;height:340px"></div>'; s.appendChild(vase);
    DATA.flowers.forEach(function (f, i) { var x = SG ? (i < 4 ? MX + 20 + (i % 2) * 270 : MX + 1380 + (i % 2) * 270) : (i < 4 ? 500 + i * 470 : 3500 + (i - 4) * 520), k = pc(f, SG ? 250 : 380, SG ? 30 : 40); place(k, x, SG ? (i % 4 < 2 ? 380 : 720) : 470 + (i % 2) * 60); s.appendChild(k);
      tap(k, function () { if (got >= 5 || k.dataset.u) return; k.dataset.u = 1; k.style.visibility = 'hidden'; var a = [-60, -30, 0, 30, 60][got];
        vase.querySelector('.bq').insertAdjacentHTML('beforeend', '<div style="position:absolute;left:310px;top:150px;width:180px;height:180px;border-radius:50%;background:url(' + f.img + ') center/cover;border:8px solid #fff;transform:rotate(' + a + 'deg) translateY(-130px)"></div>'); got++; sfx.pop(); say(f); c.step(vase); }); }); },
  'voc-job-hats': function (s, ctx) { var pool = shuffle(DATA.jobs), c = chrome(s, ctx, 4); c.q(Q.blur);
    var pic = el('div', 'abs panel'); place(pic, SG ? MX + 60 : 900, 380, 660, 660); pic.style.overflow = 'hidden'; s.appendChild(pic);
    var r = el('div', 'abs'); place(r, SG ? MX + 780 : 2000, 400, SG ? 1110 : 3200, 620); r.style.cssText += ';display:flex;flex-direction:' + (SG ? 'column' : 'row') + ';gap:' + (SG ? 40 : 60) + 'px;align-items:center;justify-content:center'; s.appendChild(r);
    function round() { var t = pool.pop(); pic.innerHTML = '<img src="' + t.img + '" style="position:absolute;top:12px;right:12px;bottom:12px;left:12px;width:616px;height:616px;object-fit:cover;border-radius:24px;filter:blur(40px);transition:filter 8s linear">';
      setTimeout(function () { var im = pic.querySelector('img'); if (im) im.style.filter = 'blur(6px)'; }, 60); r.innerHTML = '';
      opts3(DATA.jobs, t).forEach(function (o) { var b = el('button', 'pill wordpill'); b.style.height = (SG ? 150 : 220) + 'px'; b.textContent = T(o); r.appendChild(b);
        tap(b, function () { if (o !== t) { c.wrong(b); return; } var im = pic.querySelector('img'); im.style.transition = 'filter .5s'; im.style.filter = 'none'; b.classList.add('on'); c.right(b); say(o); c.step(b, round); }); }); }
    round(); },
  'voc-job-where': function (s, ctx) { var PAIRS = [[DATA.helpers[0], DATA.places[0]], [DATA.helpers[1], DATA.places[1]], [DATA.helpers[2], DATA.places[2]], [DATA.jobs[1], DATA.places[3]], [DATA.helpers[5], DATA.places[4]], [DATA.jobs[2], DATA.places[5]]];
    var c = chrome(s, ctx, 5), order = shuffle(PAIRS).slice(0, 5), t = null; c.q(Q.where);
    var MPW = SG ? 1300 : 3600, MK = MPW / 3600; var map = el('div', 'abs panel'); place(map, SG ? MX + 600 : 1700, 360, MPW, 700); map.style.overflow = 'hidden'; s.appendChild(map);
    map.innerHTML = '<svg viewBox="0 0 3600 700" preserveAspectRatio="none" width="' + MPW + '" height="700" style="position:absolute;top:0;right:0;bottom:0;left:0"><rect width="3600" height="700" fill="#bfe8a0"/><path d="M0,350 C900,250 1800,500 3600,330" stroke="#8a97a1" stroke-width="90" fill="none"/><path d="M1100,0 C1200,300 1000,500 1150,700 M2500,0 C2400,250 2600,500 2450,700" stroke="#8a97a1" stroke-width="70" fill="none"/><path d="M2900,700 C3100,600 3300,640 3600,560 L3600,700Z" fill="#5ecbf0"/></svg>';
    var spots = [[300, 120], [800, 400], [1450, 80], [1900, 400], [2750, 100], [3250, 380]];
    PAIRS.forEach(function (p, i) { var pin = el('div', ''); place(pin, spots[i][0] * MK, spots[i][1], SG ? 180 : 240, SG ? 180 : 240); pin.style.cssText += ';border-radius:50%;border:12px solid #fff;cursor:pointer;background:url(' + p[1].img + ') center/cover;box-shadow:0 10px 0 rgba(0,0,0,.25)';
      pin.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:50%;top:' + (SG ? 170 : 228) + 'px;transform:translateX(-50%);background:#fff;padding:2px 18px;border-radius:16px;font-size:34px;font-weight:800;white-space:nowrap">' + T(p[1]) + '</div>'); map.appendChild(pin);
      tap(pin, function () { if (!t) return; if (t !== p) { c.wrong(pin); return; } c.right(pin); say(p[1]); c.step(pin, nextW); }); });
    var who = el('div', 'abs'); place(who, SG ? MX + 20 : 500, 420, SG ? 560 : 1000, 620); s.appendChild(who);
    function nextW() { t = order.pop(); if (!t) return; who.innerHTML = ''; var k = pc(t[0], SG ? 540 : 560); who.appendChild(k); k.style.animation = 'enter .5s both'; }
    nextW(); },
  'voc-job-call': function (s, ctx) { var SIT = [[L4('Someone is sick!', 'ഒരാൾക്ക് സുഖമില്ല!', 'कोई बीमार है!', 'ಯಾರೋ ಅಸ್ವಸ್ಥರಾಗಿದ್ದಾರೆ!'), 0], [L4('Someone took my bag!', 'ആരോ എന്റെ ബാഗ് എടുത്തു!', 'किसी ने मेरा बैग लिया!', 'ಯಾರೋ ನನ್ನ ಚೀಲ ತೆಗೆದುಕೊಂಡರು!'), 2],
      [L4('I have a letter to send', 'എനിക്ക് ഒരു കത്ത് അയയ്ക്കണം', 'मुझे चिट्ठी भेजनी है', 'ನಾನು ಪತ್ರ ಕಳುಹಿಸಬೇಕು'), 3], [L4('We need rice and milk', 'നമുക്ക് അരിയും പാലും വേണം', 'हमें चावल और दूध चाहिए', 'ನಮಗೆ ಅಕ್ಕಿ ಮತ್ತು ಹಾಲು ಬೇಕು'), 5]];
    var c = chrome(s, ctx, SIT.length), q = shuffle(SIT), t = null;
    var ph = el('div', 'abs'); place(ph, 2290, 390, 1200, 670); ph.style.cssText += ';border-radius:80px;background:#26303a;padding:40px;box-shadow:0 20px 0 #11171c'; s.appendChild(ph);
    var list = el('div', ''); list.style.cssText = 'height:100%;border-radius:40px;background:#f3f7fb;padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:20px'; ph.appendChild(list);
    DATA.helpers.forEach(function (h, i) { var b = el('div', ''); b.style.cssText = 'display:flex;align-items:center;gap:20px;background:#fff;border-radius:30px;padding:14px;cursor:pointer;box-shadow:0 8px 0 #cfdbe6;font-size:46px;font-weight:800';
      b.innerHTML = '<img src="' + h.img + '" style="width:150px;height:150px;border-radius:50%;object-fit:cover"><span style="flex:1"></span><span style="width:90px;height:90px;border-radius:50%;background:#3fbf3f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:50px">📞</span>';
      b.children[1].textContent = T(h); list.appendChild(b);
      tap(b, function () { if (t === null) return; if (t !== i) { c.wrong(b); return; } sfx.ring(); c.right(b); say(h); t = null; c.step(b, ask); }); });
    function ask() { var x = q.pop(); if (!x) return; t = x[1]; c.q(x[0]); }
    ask(); },
  'voc-instruments': function (s, ctx) { var I = DATA.instruments, c = chrome(s, ctx, I.length + 3), met = 0, quiz = null, qn = 0; c.q(Q.stage);
    var st = el('div', 'abs'); place(st, SG ? MX + 10 : 400, 330, SG ? MW - 20 : 5000, 740); st.style.cssText += ';border-radius:40px;background:linear-gradient(180deg,#5a1030,#8e1a44);overflow:hidden'; s.appendChild(st);
    st.innerHTML = '<div style="position:absolute;left:0;top:0;bottom:0;width:260px;background:repeating-linear-gradient(90deg,#c2185b 0 40px,#9c0f45 40px 80px)"></div><div style="position:absolute;right:0;top:0;bottom:0;width:260px;background:repeating-linear-gradient(90deg,#c2185b 0 40px,#9c0f45 40px 80px)"></div><div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:#8a5a2b"></div>';
    I.forEach(function (it, i) { var IX = SG ? 70 + i * 450 : 560 + i * 1120; var spot = el('div', ''); place(spot, IX - 120, -40, SG ? 640 : 760, 800); spot.style.cssText += ';background:radial-gradient(ellipse at 50% 0,rgba(255,250,200,.55),transparent 70%);opacity:0;transition:opacity .3s;pointer-events:none'; st.appendChild(spot);
      var k = pc(it, SG ? 400 : 520, SG ? 42 : 52); place(k, IX, SG ? 140 : 110); st.appendChild(k);
      tap(k, function () { play(it.snd); spot.style.opacity = 1; setTimeout(function () { spot.style.opacity = 0; }, 1400);
        if (quiz === null) { c.right(k); if (!k.dataset.m) { k.dataset.m = 1; met++; say(it); c.step(k); if (met === I.length) setTimeout(listen, 1800); } }
        else if (quiz && it === quiz) { c.right(k); quiz = undefined; c.step(k, listen); } else if (quiz) c.wrong(k); }); });
    function listen() { if (qn >= 3) return; qn++; quiz = pickN(I, 1)[0]; c.q(Q.which); setTimeout(function () { play(quiz.snd); }, 500); } },
  'number-explorer': function (s, ctx) { var c = chrome(s, ctx, 3), r = row(s, 400, SG ? 30 : 60, 640); r.style.left = (SG ? MX + 560 : 1500) + 'px'; if (SG) r.style.right = (5780 - MX - MW + 20) + 'px'; r.style.flexWrap = 'wrap'; c.q(Q.tapcount);
    var bigN = el('div', 'abs'); place(bigN, SG ? MX + 20 : 500, 480, SG ? 520 : 800, 420); bigN.style.cssText += ';font-size:' + (SG ? 320 : 380) + 'px;font-weight:800;color:var(--accent);text-align:center;line-height:1'; s.appendChild(bigN); var ns = [3, 5, 7];
    function round() { var n = ns.shift(), k = 0, it = an(pickN(DOM, 1)[0]); r.innerHTML = ''; bigN.textContent = '';
      for (var i = 0; i < n; i++) { var b = el('button', 'pill'); b.style.cssText += SG ? ';width:260px;height:260px;padding:12px' : ';width:300px;height:300px;padding:14px'; b.innerHTML = '<img src="' + it.img + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">'; r.appendChild(b);
        tap(b, function (e) { var bt = e.currentTarget; if (bt.dataset.c) return; k++; bt.dataset.c = k; bt.classList.add('on'); bt.insertAdjacentHTML('beforeend', '<span style="position:absolute;font-size:130px;color:#fff;text-shadow:0 6px 0 rgba(0,0,0,.4)">' + k + '</span>'); bigN.textContent = k; tone(440 + k * 70, .2, 'triangle', .14);
          say({ en: String(k) }); if (k === n) c.step(bigN, round); }); } }
    round(); },
  'fruit-counter': function (s, ctx) { var c = chrome(s, ctx, 5); c.q(Q.howmany); var grid = el('div', 'abs'); place(grid, SG ? MX + 20 : 500, 400, SG ? 1150 : 2700, 640); grid.style.cssText += ';display:flex;flex-wrap:wrap;gap:30px;align-content:center;justify-content:center'; s.appendChild(grid);
    var ans = el('div', 'abs'); place(ans, SG ? MX + 1190 : 3500, 380, SG ? 716 : 1700, 680); ans.style.cssText += ';display:grid;grid-template-columns:1fr 1fr;gap:' + (SG ? 40 : 60) + 'px;justify-items:center;align-content:center'; s.appendChild(ans);
    function round() { var n = 2 + (Math.random() * 7 | 0), it = an(pickN(ALL, 1)[0]); grid.innerHTML = ''; for (var i = 0; i < n; i++) grid.insertAdjacentHTML('beforeend', '<img src="' + it.img + '" style="width:' + (SG ? 200 : 240) + 'px;height:' + (SG ? 200 : 240) + 'px;border-radius:50%;object-fit:cover;border:10px solid #fff;box-shadow:0 10px 20px rgba(0,0,0,.2)">'); ans.innerHTML = '';
      opts3([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], n, 3).forEach(function (v) { var b = el('button', 'pill bubble-n'); b.textContent = v; ans.appendChild(b); tap(b, function () { if (v !== n) { c.wrong(b); return; } b.classList.add('on'); c.right(b); say({ en: String(v) }); c.step(b, round); }); }); }
    round(); },
  'fruit-math': function (s, ctx) { var c = chrome(s, ctx, 4); var top = el('div', 'abs'); place(top, SG ? MX + 20 : 400, 390, SG ? 1280 : 3600, 650); top.style.cssText += ';display:flex;gap:' + (SG ? 20 : 60) + 'px;align-items:center;justify-content:center'; s.appendChild(top);
    var ans = el('div', 'abs'); place(ans, SG ? MX + 1320 : 4200, 420, SG ? 586 : 1100, 620); ans.style.cssText += ';display:grid;grid-template-columns:1fr 1fr;gap:' + (SG ? 30 : 50) + 'px;justify-items:center;align-content:center'; s.appendChild(ans);
    function basket(n, src) { var b = el('div', 'panel'); b.style.cssText += ';width:' + (SG ? 560 : 1300) + 'px;height:560px;display:flex;flex-wrap:wrap;gap:24px;padding:40px;align-content:center;justify-content:center'; for (var i = 0; i < n; i++) b.insertAdjacentHTML('beforeend', '<img src="' + src + '" style="width:' + (SG ? 170 : 190) + 'px;height:' + (SG ? 170 : 190) + 'px;border-radius:50%;object-fit:cover;border:8px solid #fff">'); return b; }
    function round() { var a = 1 + (Math.random() * 4 | 0), b = 1 + (Math.random() * 4 | 0), it = an(pickN(DOM, 1)[0]); c.q(a + ' + ' + b + ' = ?');
      top.innerHTML = ''; top.appendChild(basket(a, it.img)); top.insertAdjacentHTML('beforeend', '<div style="font-size:' + (SG ? 140 : 220) + 'px;font-weight:800">+</div>'); top.appendChild(basket(b, it.img)); ans.innerHTML = '';
      opts3([2, 3, 4, 5, 6, 7, 8], a + b, 3).forEach(function (v) { var k = el('button', 'pill bubble-n'); k.textContent = v; ans.appendChild(k); tap(k, function () { if (v !== a + b) { c.wrong(k); return; } k.classList.add('on'); c.right(k); c.step(k, round); }); }); }
    round(); },
  arithmetica: function (s, ctx) { var c = chrome(s, ctx, 6), r = row(s, 520, SG ? 40 : 110, 360), COL = ['#3fbf3f', '#2f8cff', '#b65cff', '#ff8a1a'];
    function round() { var a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 3 | 0), n = a + b; c.q(a + ' + ' + b + ' = ?'); r.innerHTML = '';
      opts3([2, 3, 4, 5, 6, 7, 8, 9, 10], n, 3).forEach(function (v, i) { var k = el('button', 'tile'); k.style.cssText += ';width:380px;height:340px;font-size:210px;color:#fff;background:' + COL[i] + ';box-shadow:inset 0 14px 0 rgba(255,255,255,.3),0 18px 0 rgba(0,0,0,.25)'; k.textContent = v; r.appendChild(k);
        tap(k, function () { if (v !== n) { c.wrong(k); return; } c.right(k); c.step(k, round); }); }); }
    round(); },
  'number-crunch': function (s, ctx) { var c = chrome(s, ctx, 6); c.q(Q.bigger); var HEX = ['#ef3b3b', '#2f7df0'];
    function round() { [].forEach.call(s.querySelectorAll('.nb'), function (x) { x.remove(); }); var a = 1 + (Math.random() * 9 | 0), b; do { b = 1 + (Math.random() * 9 | 0); } while (b === a);
      [a, b].forEach(function (v, i) { var w = 250 + v * 18, k = balloon(HEX[i], w, v); k.classList.add('nb'); place(k, (SG ? MC - 420 + i * 840 : 1900 + i * 1700) - w / 2, 1050 - w * 1.6); s.appendChild(k);
        tap(k, function () { if (k.classList.contains('popped')) return; if (v !== Math.max(a, b)) { c.wrong(k); return; } popBalloon(k); c.step(null); setTimeout(round, 800); }); }); }
    round(); },
  'alphabet-explorer': function (s, ctx) { var ids = ['bear', 'cat', 'dog', 'goat', 'hen', 'lion', 'monkey', 'tiger'], c = chrome(s, ctx, ids.length); c.q(Q.train);
    var tr = el('div', 'abs'); if (SG) place(tr, MX + 20, 330, MW - 40, 740); else place(tr, 300, 600, 5200, 470); s.appendChild(tr); tr.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:0;right:0;bottom:10px;height:20px;background:#5d6870;border-radius:10px"></div>');
    var eng = el('div', ''); if (SG) place(eng, 1460, 120, 400, 290); else place(eng, 4700, 120, 480, 330); eng.style.cssText += ';background:#e2185b;border-radius:30px 120px 20px 20px;border:10px solid #3d2410'; eng.innerHTML = '<div style="position:absolute;left:40px;top:-110px;width:90px;height:120px;background:#3d2410;border-radius:10px"></div><div style="position:absolute;right:40px;top:40px;width:160px;height:120px;background:#cfefff;border-radius:20px;border:8px solid #3d2410"></div>'; tr.appendChild(eng);
    ids.forEach(function (id, i) { var it = an(id), ch = it.en[0], w = el('div', ''); if (SG) place(w, (i % 4) * 365, i < 4 ? 140 : 470, 340, 230); else place(w, 60 + i * 570, 170, 520, 270); w.style.cssText += ';cursor:pointer;background:' + ['#ffcf3d', '#3fbf3f', '#2f8cff', '#ff8a1a'][i % 4] + ';border-radius:24px;border:10px solid #3d2410;display:flex;align-items:center;justify-content:center;font-size:200px;font-weight:800;color:#fff;text-shadow:0 8px 0 rgba(0,0,0,.25)';
      w.textContent = ch; w.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:60px;bottom:-60px;width:90px;height:90px;border-radius:50%;background:#3d2410"></div><div style="position:absolute;right:60px;bottom:-60px;width:90px;height:90px;border-radius:50%;background:#3d2410"></div>'); tr.appendChild(w);
      tap(w, function () { if (w.dataset.m) return; w.dataset.m = 1; if (SG) { w.style.background = 'linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url(' + it.img + ') center/cover'; w.firstChild.textContent = ch; sfx.right(); say({ en: it.en }); c.q({ en: ch + ' — ' + it.en, ml: it.ml }, false); c.step(w); return; } var p = el('div', ''); p.style.cssText = 'position:absolute;left:70px;top:-400px;width:380px;animation:enter .5s cubic-bezier(.3,1.5,.5,1) both'; p.appendChild(pc({ img: it.img, en: ch + ' — ' + it.en, ml: it.ml }, 380, 46)); w.appendChild(p); sfx.right(); say({ en: it.en }); c.step(w); }); }); },
  'word-explorer': function (s, ctx) { var c = chrome(s, ctx, 3), pool = shuffle(['cat', 'dog', 'cow', 'hen', 'pig']); c.q(Q.spell);
    var pic = el('div', 'abs'); place(pic, SG ? MX + 20 : 700, 400, 640, 640); s.appendChild(pic); var sl = el('div', 'abs'); place(sl, SG ? MX + 640 : 1700, 390, SG ? 1266 : 3500, 300); sl.style.cssText += ';display:flex;gap:40px;justify-content:center'; s.appendChild(sl);
    var tl = el('div', 'abs'); place(tl, SG ? MX + 640 : 1700, 760, SG ? 1266 : 3500, 270); tl.style.cssText += ';display:flex;gap:' + (SG ? 18 : 40) + 'px;justify-content:center'; s.appendChild(tl);
    function round() { var w = pool.pop(), it = an(w), W2 = w.toUpperCase(), at = 0; pic.innerHTML = ''; pic.appendChild(photo(it, 620));
      sl.innerHTML = ''; W2.split('').forEach(function () { var d = el('div', 'slot'); d.style.width = '250px'; d.style.height = '280px'; d.style.fontSize = '190px'; sl.appendChild(d); });
      tl.innerHTML = ''; shuffle(W2.split('').concat(pickN('BEARSTMUL'.split(''), 3))).forEach(function (ch) { var b = el('button', 'tile'); b.style.width = (SG ? 190 : 240) + 'px'; b.style.height = (SG ? 220 : 250) + 'px'; b.style.fontSize = (SG ? 140 : 170) + 'px'; b.textContent = ch; tl.appendChild(b);
        tap(b, function () { if (ch !== W2[at]) { c.wrong(b); return; } var d = sl.children[at]; d.textContent = ch; d.style.borderStyle = 'solid'; d.style.background = '#fff'; b.style.visibility = 'hidden'; at++; tone(440 + at * 80, .15, 'triangle', .12);
          if (at === W2.length) { c.right(sl); say({ en: it.en }); c.step(sl, round); } }); }); }
    round(); },
  'word-matcher': function (s, ctx) { var ids = shuffle(['cat', 'dog', 'cow', 'hen', 'lion', 'goat']), c = chrome(s, ctx, 4), POOL = ['cat', 'dog', 'cow', 'hen', 'lion', 'goat', 'sheep', 'tiger'];
    var word = el('div', 'abs panel'); place(word, SG ? MX + 20 : 600, 470, SG ? 720 : 1300, 460); word.style.cssText += ';display:flex;align-items:center;justify-content:center;font-size:' + (SG ? 170 : 250) + 'px;font-weight:800;letter-spacing:20px'; s.appendChild(word);
    var r = row(s, 360, SG ? 24 : 60, 700); r.style.left = (SG ? MX + 770 : 2200) + 'px'; if (SG) { r.style.right = (5780 - MX - MW + 20) + 'px'; r.style.flexWrap = 'wrap'; r.style.alignContent = 'center'; r.style.rowGap = '24px'; }
    function round() { var t = ids.pop(), it = an(t); word.textContent = it.en.toUpperCase(); c.q(Q.wordpic); r.innerHTML = '';
      opts3(POOL, t, 3).forEach(function (id) { var k = photo(an(id), SG ? 320 : 620); k.style.cursor = 'pointer'; r.appendChild(k); tap(k, function () { if (id !== t) { c.wrong(k); return; } c.right(k); say({ en: it.en }); c.step(k, round); }); }); }
    round(); },
  'word-creator': function (s, ctx) { var ids = shuffle(['bear', 'cat', 'dog', 'goat', 'hen', 'lion', 'monkey', 'tiger']), c = chrome(s, ctx, 5); c.q(Q.first);
    var pic = el('div', 'abs'); place(pic, SG ? MX + 30 : 1100, 380, 640, 680); s.appendChild(pic); var ans = el('div', 'abs'); place(ans, SG ? MX + 700 : 2300, 420, SG ? 1206 : 2800, 600); ans.style.cssText += ';display:flex;gap:' + (SG ? 40 : 80) + 'px;align-items:center;justify-content:center'; s.appendChild(ans);
    function round() { var t = ids.pop(), it = an(t), ch = it.en[0]; pic.innerHTML = ''; pic.appendChild(pc(it, 620)); ans.innerHTML = '';
      opts3('ABCDEFGHKLMNPRSTW'.split(''), ch).forEach(function (L) { var b = el('button', 'pill bubble-n'); b.style.width = '340px'; b.style.height = '340px'; b.style.fontSize = '210px'; b.textContent = L; ans.appendChild(b);
        tap(b, function () { if (L !== ch) { c.wrong(b); return; } b.classList.add('on'); c.right(b); say({ en: it.en }); c.step(b, round); }); }); }
    round(); },
  /* Secondary · MONEY SHOP: pay the exact price with real coins and notes */
  'sec-currency': function (s, ctx) { var PRICES = [5, 10, 20, 50, 100], items = DATA.shop, c = chrome(s, ctx, items.length), ri = 0, paid = [], price = 0, it = null;
    var TOO = L4('Too much! Tap money in the tray to take it back.', 'കൂടുതലായി! ട്രേയിലെ പണം തൊട്ട് തിരികെ എടുക്കൂ.', 'ज़्यादा हो गया! ट्रे के पैसे छूकर वापस लो।', 'ಹೆಚ್ಚಾಯಿತು! ತಟ್ಟೆಯ ಹಣ ಮುಟ್ಟಿ ವಾಪಸ್ ತೆಗೆಯಿರಿ.');
    var shelf = el('div', 'abs shopfront'); if (SG) place(shelf, MX + 20, 345, 640, 470); else place(shelf, 430, 350, 1250, 710); s.appendChild(shelf);
    var tray = el('div', 'abs tray'); if (SG) place(tray, MX + 690, 345, MW - 710, 470); else place(tray, 1800, 350, 1780, 710); s.appendChild(tray);
    tray.innerHTML = '<div class="tot"></div><div class="paid"></div>';
    var wal = el('div', 'abs wallet'); if (SG) { place(wal, MX + 20, 840, MW - 40, 230); wal.style.padding = '14px'; wal.style.gap = '16px'; wal.style.flexWrap = 'nowrap'; wal.style.alignItems = 'center'; } else place(wal, 3700, 350, 1760, 710); s.appendChild(wal);
    function total() { return paid.reduce(function (a, m) { return a + m.v; }, 0); }
    function refresh() { var t = total(); tray.querySelector('.tot').innerHTML = '₹ ' + t + ' <span>/ ₹ ' + price + '</span>'; tray.classList.toggle('over', t > price);
      if (t > price) c.q(TOO, true); else c.q(ask(), false);
      if (t === price) { sfx.kaching(); shelf.querySelector('.sold').classList.add('show'); c.step(shelf.querySelector('.item'), function () { ri++; next(); }); } }
    function ask() { var nm = T(it); return { en: 'Pay ₹' + price + ' for the ' + it.en, ml: it.ml + ' വാങ്ങാൻ ₹' + price + ' കൊടുക്കൂ', hi: nm + ' के लिए ₹' + price + ' दो', kn: nm + ' ಗೆ ₹' + price + ' ಕೊಡಿ' }; }
    function next() { if (ri >= items.length) return; it = items[ri]; price = PRICES[ri]; paid = []; tray.querySelector('.paid').innerHTML = '';
      shelf.innerHTML = '<div class="awning"></div><div class="item"><img src="' + it.img + '"><div class="tag">₹ ' + price + '</div><div class="sold">✓</div></div><div class="nm">' + T(it) + '</div>';
      say(ask()); refresh(); }
    function addMoney(m) { if (total() === price) return; var e = moneyEl(m, true); tray.querySelector('.paid').appendChild(e); paid.push(m); sfx.clink();
      e.addEventListener('click', function () { var i = paid.indexOf(m); if (i >= 0) paid.splice(i, 1); e.remove(); sfx.tap(); refresh(); }); refresh(); }
    [{ v: 1, coin: 1 }, { v: 2, coin: 1 }, { v: 5, coin: 1 }, { v: 10, coin: 1 }, { v: 10 }, { v: 20 }, { v: 50 }, { v: 100 }].forEach(function (m) { var e = moneyEl(m, SG); wal.appendChild(e); tap(e, function () { e.classList.remove('ok'); void e.offsetWidth; e.classList.add('ok'); addMoney({ v: m.v, coin: m.coin }); }); });
    next(); },
  'kn-alphabets': function (s, ctx) { var LET = ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಎ', 'ಏ'], c = chrome(s, ctx, 5), ask = shuffle(LET).slice(0, 5), t = null;
    LET.forEach(function (L, i) { var d = el('div', 'diya'); if (SG) place(d, MX + 110 + (i % 4) * 440, i < 4 ? 560 : 870); else place(d, 600 + i * 600, 640 + (i % 2) * 120); d.innerHTML = '<div class="pot"></div><div class="fl"></div><div class="ch">' + L + '</div>'; s.appendChild(d);
      tap(d, function () { if (L !== t) { c.wrong(d); return; } d.classList.add('lit'); c.right(d); say(L); t = null; c.step(d, nextL); }); });
    function nextL() { t = ask.pop(); if (!t) return; c.q(T(Q.diya) + ' ' + t, false); say(t); }
    nextL(); }
};


/* ═══ PLAYERS — 1, 2 or 3 children, side by side on the wall ═══ */
var PLAYER_COL = ['#2f8cff', '#ff7a1a', '#22b07d'];
function playersScreen(s, sc) {
  signEl(s, sc.name, T(L4('How many players?', 'എത്ര കളിക്കാർ?', 'कितने खिलाड़ी?', 'ಎಷ್ಟು ಆಟಗಾರರು?')));
  var r = row(s, 360, SG ? 80 : 140, 680);
  [1, 2, 3].forEach(function (n) { var b = el('button', 'pchoose'); if (SG) { b.style.width = '520px'; b.style.height = '600px'; } b.style.background = PLAYER_COL[n - 1];
    b.innerHTML = '<div class="kids">' + new Array(n + 1).join('<svg viewBox="0 0 60 100" width="110" height="180"><circle cx="30" cy="22" r="18" fill="#fff"/><path d="M8,100 C8,60 14,46 30,46 C46,46 52,60 52,100Z" fill="#fff"/></svg>') + '</div><div class="n">' + n + '</div><div class="w">' + T(n === 1 ? L4('player', 'കളിക്കാരൻ', 'खिलाड़ी', 'ಆಟಗಾರ') : L4('players', 'കളിക്കാർ', 'खिलाड़ी', 'ಆಟಗಾರರು')) + '</div>';
    r.appendChild(b); tap(b, function () { sfx.tap(); go({ type: sc.act, group: sc.group, name: sc.name, players: n }); }); });
  owly(L4('How many friends are playing?', 'എത്ര കൂട്ടുകാർ കളിക്കുന്നു?', 'कितने दोस्त खेल रहे हैं?', 'ಎಷ್ಟು ಗೆಳೆಯರು ಆಡುತ್ತಿದ್ದಾರೆ?'));
}
/* Round makers for the activities that can be played in panels. Each returns
   { q: prompt, pic: optional picture, opts: [{img|text|color}], ans: index }. */
function pqPhotoQ(q, pool, t, n) { var o = opts3(pool, t, n || 2); return { q: q, opts: o.map(function (x) { return { img: x.img, text: T(x) }; }), ans: o.indexOf(t) }; }
var PQ = {
  'pp-odd-one-out': function () { var farm = Math.random() < .5, odd = pickN(farm ? WILD : DOM, 1)[0], o = shuffle(pickN(farm ? DOM : WILD, 3).concat([odd])); return { q: Q.odd, opts: o.map(function (id) { var a = an(id); return { img: a.img, text: T(a) }; }), ans: o.indexOf(odd) }; },
  'model-cards-2': function () { var t = pickN(ALL, 1)[0], o = opts3(ALL, t); return { q: Q.zoom, pic: { img: an(t).img, zoom: true }, opts: o.map(function (id) { var a = an(id); return { img: a.img, text: T(a) }; }), ans: o.indexOf(t) }; },
  feelings: function () { var t = pickN(DATA.feelings, 1)[0], o = opts3(DATA.feelings, t); return { q: Q.feel, pic: { img: t.img }, opts: o.map(function (x) { return { text: T(x) }; }), ans: o.indexOf(t) }; },
  'pri-houses': function () { var t = pickN(DATA.houses, 1)[0]; return pqPhotoQ(t, DATA.houses, t, 2); },
  'sec-helpers-places': function () { var t = pickN(DATA.helpers, 1)[0], o = opts3(DATA.helpers, t); return { q: Q.guess, pic: { img: t.img }, opts: o.map(function (x) { return { text: T(x) }; }), ans: o.indexOf(t) }; },
  'voc-job-hats': function () { var t = pickN(DATA.jobs, 1)[0], o = opts3(DATA.jobs, t); return { q: Q.blur, pic: { img: t.img }, opts: o.map(function (x) { return { text: T(x) }; }), ans: o.indexOf(t) }; },
  'fruit-counter': function () { var n = 2 + (Math.random() * 6 | 0), o = opts3([1, 2, 3, 4, 5, 6, 7, 8, 9], n, 3); return { q: Q.howmany, pic: { img: an(pickN(ALL, 1)[0]).img, count: n }, opts: o.map(function (v) { return { text: String(v), num: 1 }; }), ans: o.indexOf(n) }; },
  arithmetica: function () { var a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 3 | 0), o = opts3([2, 3, 4, 5, 6, 7, 8, 9, 10], a + b, 3); return { q: a + ' + ' + b + ' = ?', opts: o.map(function (v) { return { text: String(v), num: 1 }; }), ans: o.indexOf(a + b) }; },
  'fruit-math': function () { var a = 1 + (Math.random() * 4 | 0), b = 1 + (Math.random() * 4 | 0), o = opts3([2, 3, 4, 5, 6, 7, 8], a + b, 3); return { q: a + ' + ' + b + ' = ?', pic: { img: an(pickN(DOM, 1)[0]).img, count: a, plus: b }, opts: o.map(function (v) { return { text: String(v), num: 1 }; }), ans: o.indexOf(a + b) }; },
  'number-crunch': function () { var a = 1 + (Math.random() * 9 | 0), b; do { b = 1 + (Math.random() * 9 | 0); } while (b === a); return { q: Q.bigger, opts: [{ text: String(a), num: 1 }, { text: String(b), num: 1 }], ans: a > b ? 0 : 1 }; },
  'word-matcher': function () { var P = ['cat', 'dog', 'cow', 'hen', 'lion', 'goat', 'sheep', 'tiger'], t = pickN(P, 1)[0], o = opts3(P, t, 3); return { q: an(t).en.toUpperCase(), opts: o.map(function (id) { return { img: an(id).img }; }), ans: o.indexOf(t) }; },
  'word-creator': function () { var t = an(pickN(['bear', 'cat', 'dog', 'goat', 'hen', 'lion', 'monkey', 'tiger'], 1)[0]), ch = t.en[0], o = opts3('ABCDEFGHKLMNPRSTW'.split(''), ch); return { q: Q.first, pic: { img: t.img, cap: T(t) }, opts: o.map(function (L) { return { text: L, num: 1 }; }), ans: o.indexOf(ch) }; },
  'colour-match': function () { var C = [[L4('Red', 'ചുവപ്പ്', 'लाल', 'ಕೆಂಪು'), '#ef3b3b'], [L4('Blue', 'നീല', 'नीला', 'ನೀಲಿ'), '#2f7df0'], [L4('Green', 'പച്ച', 'हरा', 'ಹಸಿರು'), '#36b34a'], [L4('Yellow', 'മഞ്ഞ', 'पीला', 'ಹಳದಿ'), '#ffd21f'], [L4('Purple', 'വയലറ്റ്', 'बैंगनी', 'ನೇರಳೆ'), '#9b4dff']], o = pickN(C, 4), t = o[0], sh = shuffle(o);
    return { q: t[0], opts: sh.map(function (x) { return { color: x[1] }; }), ans: sh.indexOf(t) }; }
};
function panels(s, ctx) {
  var n = ctx.players, ROUNDS = 5, SCR = n === 2 ? [0, 2] : [0, 1, 2], pw = 1926 - 60, done = 0;
  signEl(s, ctx.name, null, true);
  for (var p = 0; p < n; p++) (function (p) {
    var P = el('div', 'pnl'); place(P, SCR[p] * 1927 + 30, 150, pw, 910); P.style.setProperty('--pc', PLAYER_COL[p]); s.appendChild(P);
    P.innerHTML = '<div class="ph"><span class="who">' + T(L4('Player', 'കളിക്കാരൻ', 'खिलाड़ी', 'ಆಟಗಾರ')) + ' ' + (p + 1) + '</span><span class="sc"></span></div><div class="pq"></div><div class="pp"></div><div class="po"></div><div class="pw"></div>';
    var got = 0;
    function score() { var h = ''; for (var i = 0; i < ROUNDS; i++) h += '<svg class="star' + (i < got ? ' on' : '') + '" style="--s:58px"><use href="#starSym"/></svg>'; P.querySelector('.sc').innerHTML = h; }
    function round() { var R2 = PQ[ctx.type](), qEl = P.querySelector('.pq'), pp = P.querySelector('.pp'), po = P.querySelector('.po');
      if (typeof R2.q === 'string' && /^[\d\s+\-=?×]+$/.test(R2.q)) qEl.innerHTML = mathHTML(R2.q); else qEl.textContent = typeof R2.q === 'object' ? T(R2.q) : R2.q;
      pp.innerHTML = ''; pp.style.display = R2.pic ? '' : 'none';
      if (R2.pic) { if (R2.pic.count) { var h = ''; for (var i = 0; i < R2.pic.count; i++) h += '<img src="' + R2.pic.img + '">'; if (R2.pic.plus) { h += '<b>+</b>'; for (i = 0; i < R2.pic.plus; i++) h += '<img src="' + R2.pic.img + '">'; } pp.innerHTML = '<div class="cnt">' + h + '</div>'; }
        else pp.innerHTML = '<div class="pic' + (R2.pic.zoom ? ' zoom' : '') + '" style="background-image:url(' + R2.pic.img + ')"></div>' + (R2.pic.cap ? '<div class="pcap">' + R2.pic.cap + '</div>' : ''); }
      po.innerHTML = ''; var k = R2.opts.length, sz = Math.min(R2.pic ? 330 : 470, Math.floor((pw - 120 - (k - 1) * 30) / k));
      R2.opts.forEach(function (o, i) { var b = el('button', 'popt'); b.style.width = b.style.height = sz + 'px';
        if (o.img) b.innerHTML = '<img src="' + o.img + '">' + (o.text ? '<span>' + o.text + '</span>' : '');
        else if (o.color) b.style.background = o.color;
        else { b.innerHTML = '<span class="t' + (o.num ? ' num' : '') + '">' + o.text + '</span>'; b.style.height = (o.num ? sz : Math.round(sz * .55)) + 'px'; if (!o.num) b.style.width = Math.min(pw - 120, sz * 1.25) + 'px'; }
        po.appendChild(b);
        tap(b, function () { if (P.dataset.lock) return; if (i !== R2.ans) { sfx.nudge(); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); return; }
          P.dataset.lock = 1; b.classList.add('ok', 'good'); sfx.right(); got++; score();
          setTimeout(function () { delete P.dataset.lock; if (got >= ROUNDS) win(); else round(); }, 1000); }); }); }
    function win() { var w = P.querySelector('.pw'); w.innerHTML = '<div class="wt">' + T(UI.great) + '</div>'; w.appendChild(starsEl(3, 110, true)); w.classList.add('show'); sfx.win();
      done++; if (done >= n) setTimeout(function () { finish(ctx); }, 2200); }
    score(); round(); })(p);
}

/* ═══ BEAT PUNCH — things fly at you to the beat; punch the right ones ═══ */
var BEAT_MODES = [
  { q: L4('Punch the RED ones!', 'ചുവപ്പിനെ ഇടിക്കൂ!', 'लाल वालों को मारो!', 'ಕೆಂಪನ್ನು ಹೊಡೆಯಿರಿ!'), make: function () { var red = Math.random() < .55; return { good: red, html: '', col: red ? '#ff3b4f' : pickN(['#2f8cff', '#ffd21f', '#36d16a', '#b65cff'], 1)[0] }; } },
  { q: L4('Punch the ANIMALS!', 'മൃഗങ്ങളെ ഇടിക്കൂ!', 'जानवरों को मारो!', 'ಪ್ರಾಣಿಗಳನ್ನು ಹೊಡೆಯಿರಿ!'), make: function () { var a = Math.random() < .55; return { good: a, col: '#ffffff', img: a ? an(pickN(ALL, 1)[0]).img : pickN(DATA.flowers.concat(DATA.notaid), 1)[0].img }; } },
  { q: L4('Punch the STARS!', 'നക്ഷത്രങ്ങളെ ഇടിക്കൂ!', 'तारों को मारो!', 'ನಕ್ಷತ್ರಗಳನ್ನು ಹೊಡೆಯಿರಿ!'), make: function () { var st = Math.random() < .55; return { good: st, col: pickN(['#ff3b4f', '#2f8cff', '#ffd21f', '#36d16a', '#b65cff'], 1)[0], shape: st ? 'star' : pickN(['circle', 'square', 'tri'], 1)[0] }; } }
];
ACT['beat-punch'] = function (s, ctx) { var GOAL = 30, c = chrome(s, ctx, GOAL), mode = 0, combo = 0, beat = 0, bpm = 112, spb = 60 / bpm, alive = true, hits = 0;
  s.classList.add('beat'); s.insertBefore(el('div', 'beat-bg'), s.firstChild);
  var VX = W / 2, VY = 250, LANES = 8, lx = function (i) { return 520 + i * (4740 / (LANES - 1)); };
  var lanes = el('div', 'abs'); lanes.style.cssText += ';top:0;left:0;right:0;bottom:0;pointer-events:none'; s.insertBefore(lanes, s.children[1]);
  var svg = '<svg width="5780" height="1080">'; for (var i = 0; i < LANES; i++) svg += '<line x1="' + VX + '" y1="' + VY + '" x2="' + lx(i) + '" y2="1080" stroke="url(#laneG)" stroke-width="10"/>';
  lanes.innerHTML = svg + '<defs><linearGradient id="laneG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cf3ff" stop-opacity="0"/><stop offset="1" stop-color="#7cf3ff" stop-opacity=".8"/></linearGradient></defs><ellipse cx="' + VX + '" cy="900" rx="2700" ry="70" fill="none" stroke="#ff4fd8" stroke-width="10" opacity=".6"/></svg>';
  var cb = el('div', 'combo'); s.appendChild(cb);
  c.q(BEAT_MODES[0].q);
  var AC2 = ac(), t0 = AC2 ? AC2.currentTime + .3 : 0;
  function drum(at, k) { if (!AC2) return; var o = AC2.createOscillator(), g = AC2.createGain(); o.connect(g); g.connect(AC2.destination);
    if (k === 'kick') { o.frequency.setValueAtTime(140, at); o.frequency.exponentialRampToValueAtTime(40, at + .15); g.gain.setValueAtTime(.5, at); g.gain.exponentialRampToValueAtTime(.001, at + .2); }
    else { o.type = 'square'; o.frequency.value = k === 'snare' ? 220 : 6000; g.gain.setValueAtTime(k === 'snare' ? .12 : .03, at); g.gain.exponentialRampToValueAtTime(.001, at + (k === 'snare' ? .12 : .04)); }
    o.start(at); o.stop(at + .25); }
  function spawn() { var m = BEAT_MODES[mode].make(), lane = Math.random() * LANES | 0, tx = lx(lane), b = el('div', 'orb' + (m.img ? ' img' : '') + (m.shape ? ' ' + m.shape : '')); b.style.setProperty('--c', m.col);
    if (m.img) b.innerHTML = '<img src="' + m.img + '">'; b.dataset.good = m.good ? 1 : '';
    place(b, VX - 130, VY - 130); s.appendChild(b); var born = performance.now(), dur = 2600;
    (function fly() { if (!alive || !b.isConnected || b.dataset.hit) return; var k = Math.min(1, (performance.now() - born) / dur), e = k * k;
      var x = VX + (tx - VX) * e, y = VY + (930 - VY) * e, sc = .12 + .98 * e; b.style.transform = 'translate(' + (x - VX) + 'px,' + (y - VY) + 'px) scale(' + sc + ')'; b.style.opacity = k < .05 ? k * 20 : 1;
      b.style.pointerEvents = y > 380 ? 'auto' : 'none';
      if (k >= 1) { b.classList.add('gone'); setTimeout(function () { b.remove(); }, 300); if (b.dataset.good) { combo = 0; cb.textContent = ''; } return; }
      requestAnimationFrame(fly); })();
    b.addEventListener('pointerdown', function () { if (b.dataset.hit) return;
      if (!b.dataset.good) { sfx.nudge(); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); return; }
      b.dataset.hit = 1; b.classList.add('smash'); combo++; hits++; sfx.pop(); tone(880 + Math.min(combo, 12) * 40, .12, 'triangle', .12);
      cb.textContent = combo > 1 ? '×' + combo + ' ' + T(L4('COMBO!', 'കോംബോ!', 'कॉम्बो!', 'ಕಾಂಬೊ!')) : ''; cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
      c.step(null); if (hits % 10 === 0 && hits < GOAL) { mode = (mode + 1) % BEAT_MODES.length; c.q(BEAT_MODES[mode].q); }
      if (hits >= GOAL) alive = false; setTimeout(function () { b.remove(); }, 450); }); }
  (function loop() { if (!alive || !s.isConnected) { alive = false; return; } if (AC2) { while (t0 + beat * spb < AC2.currentTime + .2) { var at = t0 + beat * spb; drum(at, 'kick'); drum(at + spb / 2, 'hat'); if (beat % 2) drum(at, 'snare');
        (function (d) { setTimeout(function () { if (alive) spawn(); }, Math.max(0, d)); })((at - AC2.currentTime) * 1000); beat++; } }
    else if (Math.random() < .03) spawn(); setTimeout(loop, 60); })();
};

/* ═══ 3D experiences (ui-3d.js) ═══ */
function three(kind) { return function (s, ctx) { var host = el('div', 'abs three-host'); place(host, 0, 0, W, H); s.insertBefore(host, s.firstChild);
  var c = chrome(s, ctx, kind === 'traffic' ? 4 : kind === 'body' ? 9 : kind === 'seasons' ? 8 : 10);
  var api = { ask: function (o, sp) { c.q(o, sp); }, step: function (n, after) { c.step(n, after); }, right: function (n) { c.right(n); }, wrong: function (n) { c.wrong(n); },
    play: play, say: say, T: T, R: R, tap: sfx.tap, pop: sfx.pop };
  var go3 = function () { try { WALL3D[kind](host, api); } catch (e) { c.q(L4('3D is not available on this device', 'ഈ ഉപകരണത്തിൽ 3D ലഭ്യമല്ല', 'इस डिवाइस पर 3D उपलब्ध नहीं', 'ಈ ಸಾಧನದಲ್ಲಿ 3D ಇಲ್ಲ'), false); } };
  if (window.WALL3D) go3(); else window.addEventListener('wall3d-ready', go3, { once: true });
  if (kind === 'zoo') c.q(L4('Walk through the zoo! Tap an animal.', 'മൃഗശാലയിലൂടെ നടക്കാം! ഒരു മൃഗത്തെ തൊടൂ.', 'चिड़ियाघर घूमो! किसी जानवर को छुओ।', 'ಮೃಗಾಲಯದಲ್ಲಿ ನಡೆಯೋಣ! ಒಂದು ಪ್ರಾಣಿ ಮುಟ್ಟಿ.'), false); }; }
ACT['seasons'] = three('seasons');
/* ═══ ALPHABET SNAKE — a big chunky snake slides across the wall; 8+ letter
   apples sit around it. Touch the letters IN ORDER (A, B, C… or the chosen
   language's alphabet). Each apple lasts 5 seconds, then a new one grows.
   A wrong touch starts the run again from the first letter. Best run wins. ═══ */
var ALPHAS = { en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), ml: 'അ ആ ഇ ഈ ഉ ഊ ഋ എ ഏ ഐ ഒ ഓ ഔ ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ഞ'.split(' '),
  hi: 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ'.split(' '), kn: 'ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ'.split(' ') };
ACT['alpha-snake'] = function (s, ctx) { var AL = ALPHAS[lang()] || ALPHAS.en, c = chrome(s, ctx, 10), want = 0, best = 0, alive = true, apples = [];
  var score = el('div', 'abs sn-score'); s.appendChild(score);
  function ask() { c.q({ en: 'Find ' + AL[want], ml: AL[want] + ' കണ്ടെത്തൂ', hi: AL[want] + ' ढूँढो', kn: AL[want] + ' ಹುಡುಕಿ' }, false); score.innerHTML = '🍎 ' + want + '  ·  🏆 ' + best; }
  /* the snake: a chain of big round segments following a wavy path across the wall */
  var SEG = 22, segs = []; for (var i = 0; i < SEG; i++) { var d = el('div', 'sn-seg' + (i === 0 ? ' head' : '')); s.appendChild(d); segs.push(d); }
  segs[0].innerHTML = '<i></i><i></i>';
  var t0 = performance.now(), trail = [];
  function spawn() { if (!alive) return; var free = [], tries = 0, x, y;
    /* keep the next wanted letter on screen, plus random ones */
    var onBoard = apples.map(function (a) { return a.ch; }), ch = onBoard.indexOf(AL[want]) < 0 ? AL[want] : AL[Math.min(AL.length - 1, Math.max(0, want + (Math.random() * 6 | 0) - 2))];
    do { x = 450 + Math.random() * 4880; y = 380 + Math.random() * 560; tries++; } while (tries < 30 && apples.some(function (a) { return Math.abs(a.x - x) < 300 && Math.abs(a.y - y) < 260; }));
    var e = el('div', 'sn-apple', '<b>' + ch + '</b>'); place(e, x - 110, y - 110); s.appendChild(e); var ap = { e: e, ch: ch, x: x, y: y };
    apples.push(ap); ap.tm = setTimeout(function () { kill(ap); spawn(); }, 5000);
    tap(e, function () { if (!alive || ap.dead) return;
      if (ch === AL[want]) { want++; best = Math.max(best, want); sfx.right(); c.right(e); kill(ap); say(ch); if (want % 3 === 0) c.step(e); spawn(); ask();
        if (want >= AL.length) { alive = false; finish(ctx); } }
      else { want = 0; c.wrong(e); c.q(L4('Oops! Start again from the first letter.', 'വീണ്ടും ആദ്യ അക്ഷരം മുതൽ!', 'फिर से पहले अक्षर से!', 'ಮತ್ತೆ ಮೊದಲ ಅಕ್ಷರದಿಂದ!'), false); setTimeout(ask, 1300); } }); }
  function kill(ap) { if (ap.dead) return; ap.dead = 1; clearTimeout(ap.tm); ap.e.classList.add('gone'); setTimeout(function () { ap.e.remove(); }, 400); apples.splice(apples.indexOf(ap), 1); }
  (function loop() { if (!alive || !s.isConnected) { alive = false; apples.forEach(function (a) { clearTimeout(a.tm); }); return; }
    var t = (performance.now() - t0) / 1000, hx = 300 + ((t * 260) % 5400), hy = 720 + Math.sin(t * 1.6) * 230;
    trail.unshift([hx, hy]); if (trail.length > SEG * 6) trail.length = SEG * 6;
    segs.forEach(function (d, i) { var p = trail[Math.min(trail.length - 1, i * 6)]; d.style.transform = 'translate(' + (p[0] - 70) + 'px,' + (p[1] - 70) + 'px)'; });
    requestAnimationFrame(loop); })();
  for (var k = 0; k < 9; k++) spawn();
  ask(); }; ACT['traffic-3d'] = three('traffic');
/* the menu's Money Counter card opens the money shop with real coins and notes */
ACT['money-counter'] = ACT['sec-currency'];

/* ═══ FEED THE ANIMALS — a big 3D animal to turn with a finger; drag (or tap)
   the food it eats onto it. Right: its own sound and hearts. Wrong: the food
   just bounces back. ═══ */
var FOOD = { grass: ['🌿', L4('Grass', 'പുല്ല്', 'घास', 'ಹುಲ್ಲು')], banana: ['🍌', L4('Banana', 'പഴം', 'केला', 'ಬಾಳೆಹಣ್ಣು')], carrot: ['🥕', L4('Carrot', 'കാരറ്റ്', 'गाजर', 'ಕ್ಯಾರೆಟ್')],
  grain: ['🌾', L4('Grain', 'ധാന്യം', 'दाना', 'ಕಾಳು')], meat: ['🍖', L4('Meat', 'ഇറച്ചി', 'मांस', 'ಮಾಂಸ')], honey: ['🍯', L4('Honey', 'തേൻ', 'शहद', 'ಜೇನು')], bone: ['🦴', L4('Bone', 'എല്ല്', 'हड्डी', 'ಮೂಳೆ')], fish: ['🐟', L4('Fish', 'മീൻ', 'मछली', 'ಮೀನು')] };
var FEED = [['cow', '3dmodels/cow.glb', 'grass'], ['monkey', '3dmodels/monkey.glb', 'banana'], ['rabbit', '3dmodels/rabbit.glb', 'carrot'], ['hen', '3dmodels/hen.glb', 'grain'],
  ['elephant', '3dmodels/elephant__gajah.glb', 'banana'], ['tiger', '3dmodels/tiger.glb', 'meat'], ['lion', '3dmodels/lion_lowpoly.glb', 'meat'], ['bear', '3dmodels/bear.glb', 'honey']];
ACT['zoo-walk'] = function (s, ctx) { var order = shuffle(FEED).slice(0, 6), c = chrome(s, ctx, order.length), cur2 = null, busy = false;
  var stageBox = el('div', 'abs panel feed-stage'); place(stageBox, MX + 260, 330, MW - 520, 560); s.appendChild(stageBox);
  var foods = el('div', 'abs feed-foods'); place(foods, MX + 120, 905, MW - 240, 165); s.appendChild(foods);
  function ask(a) { var it = an(a[0]); return { en: 'What does the ' + it.en.toLowerCase() + ' eat?', ml: it.ml + ' എന്താണ് കഴിക്കുന്നത്?', hi: T(it) + ' क्या खाता है?', kn: T(it) + ' ಏನು ತಿನ್ನುತ್ತದೆ?' }; }
  function over(e) { var r = stageBox.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; }
  function feed(f, card) { if (busy) return; if (f !== cur2[2]) { c.wrong(card); return; }
    busy = true; var it = an(cur2[0]); c.right(stageBox); if (it.snd) play(it.snd);
    var fly = el('div', 'feed-fly', FOOD[f][0]); stageBox.appendChild(fly); setTimeout(function () { fly.remove(); }, 900);
    for (var i = 0; i < 12; i++) { var h = el('div', 'feed-heart', '❤'); h.style.left = (40 + Math.random() * 20) + '%'; h.style.setProperty('--dx', ((Math.random() - .5) * 600) + 'px'); h.style.animationDelay = (i * .05) + 's'; stageBox.appendChild(h); setTimeout(function (h) { h.remove(); }.bind(null, h), 1800); }
    c.q(L4('Yum! Thank you!', 'രുചിയുണ്ട്! നന്ദി!', 'स्वादिष्ट! धन्यवाद!', 'ರುಚಿಯಾಗಿದೆ! ಧನ್ಯವಾದ!'));
    c.step(stageBox, function () { busy = false; next(); }); }
  function next() { cur2 = order.shift(); if (!cur2) return; stageBox.innerHTML = ''; var it = an(cur2[0]);
    var m = mv(cur2[1], MW - 560, 540, it.img); m.style.margin = '10px'; m.setAttribute('camera-orbit', '35deg 78deg 60%'); stageBox.appendChild(m);
    stageBox.insertAdjacentHTML('beforeend', '<div class="feed-name">' + T(it) + '</div><div class="feed-hint">👆 ' + T(L4('Turn me!', 'എന്നെ തിരിക്കൂ!', 'मुझे घुमाओ!', 'ನನ್ನನ್ನು ತಿರುಗಿಸಿ!')) + '</div>');
    c.q(ask(cur2)); foods.innerHTML = '';
    var pool = Object.keys(FOOD).filter(function (k) { return k !== cur2[2]; });
    shuffle([cur2[2]].concat(pickN(pool, 2))).forEach(function (f) { var card = el('div', 'feed-card', '<span class="fe">' + FOOD[f][0] + '</span><span class="fn">' + T(FOOD[f][1]) + '</span>'); foods.appendChild(card);
      /* drag the food onto the animal; a plain tap feeds too */
      var ghost = null, sx = 0, sy = 0, moved = false;
      card.addEventListener('pointerdown', function (e) { ac(); sx = e.clientX; sy = e.clientY; moved = false; card.setPointerCapture(e.pointerId); });
      card.addEventListener('pointermove', function (e) { if (!card.hasPointerCapture || !card.hasPointerCapture(e.pointerId)) return;
        if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 12) return;
        if (!ghost) { ghost = el('div', 'feed-ghost', FOOD[f][0]); document.body.appendChild(ghost); card.classList.add('lifted'); } moved = true;
        ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; stageBox.classList.toggle('hot', over(e)); });
      card.addEventListener('pointerup', function (e) { stageBox.classList.remove('hot'); card.classList.remove('lifted'); if (ghost) { ghost.remove(); ghost = null; }
        if (!moved || over(e)) feed(f, card); else sfx.tap(); }); }); }
  next(); };

/* ═══ GREAT JOB ═══ */
function finish(ctx) { STARS[ctx.type] = 3; saveStars(); var opts = G[ctx.group].options, i = opts.map(function (o) { return o.game; }).indexOf(ctx.type);
  cur = { type: 'done', group: ctx.group, from: ctx, next: opts[i + 1] }; render(); }
SCREEN.done = function (s, sc) { sfx.win();
  s.appendChild(el('div', 'rays', '<svg viewBox="-100 -100 200 200">' + Array.apply(null, Array(16)).map(function (_, i) { var a = i / 16 * Math.PI * 2, b = a + .12; return '<polygon points="0,0 ' + Math.cos(a) * 100 + ',' + Math.sin(a) * 100 + ' ' + Math.cos(b) * 100 + ',' + Math.sin(b) * 100 + '" fill="#fff"/>'; }).join('') + '</svg>'));
  s.appendChild(el('div', 'ribbon', T(UI.great)));
  var r2 = el('div', 'row'); r2.style.top = '230px'; r2.style.height = '820px'; r2.style.gap = '120px'; s.appendChild(r2);
  r2.insertAdjacentHTML('beforeend', '<svg class="trophy" viewBox="0 0 200 240"><path d="M40,30 H160 V70 Q160,140 100,150 Q40,140 40,70Z" fill="url(#gStar)" stroke="#5a3416" stroke-width="8"/><path d="M40,45 Q4,45 8,80 Q12,110 52,112 M160,45 Q196,45 192,80 Q188,110 148,112" fill="none" stroke="#5a3416" stroke-width="16"/><path d="M40,45 Q4,45 8,80 Q12,110 52,112 M160,45 Q196,45 192,80 Q188,110 148,112" fill="none" stroke="#ffc928" stroke-width="8"/>' +
    '<rect x="88" y="148" width="24" height="34" fill="#e0a21a" stroke="#5a3416" stroke-width="7"/><rect x="50" y="180" width="100" height="44" rx="8" fill="#8a5a2b" stroke="#5a3416" stroke-width="8"/></svg>');
  if (SG) { r2.style.left = (MX + 20) + 'px'; r2.style.right = (5780 - MX - MW + 20) + 'px'; r2.style.gap = '40px'; }
  var tro = r2.querySelector('.trophy'), sh = el('div', 'shelf'); if (SG) sh.style.width = '520px'; r2.insertBefore(sh, tro); sh.appendChild(tro); place(tro, SG ? 30 : 330, -20);
  sh.insertAdjacentHTML('beforeend', '<div style="position:absolute;left:0;right:0;top:540px;height:44px;border-radius:14px;background:linear-gradient(180deg,#c98b4e,#8a5a2b);box-shadow:0 12px 0 #5a3416"></div>');
  if (!SG) { var bk = el('div', 'nb-prop', PROPS.books); place(bk, -30, 300); bk.style.transform = 'scale(.8)'; sh.appendChild(bk); var pl = el('div', 'nb-prop', PROPS.plant); place(pl, 830, 130); pl.style.transform = 'scale(.95)'; sh.appendChild(pl); }
  var card = el('div', 'panel done-card'); card.style.cssText += ';width:1150px;padding:26px 54px 36px;display:flex;flex-direction:column;gap:14px'; r2.appendChild(card);
  card.appendChild(el('div', 'prog-h', T(UI.progress))); card.appendChild(starsEl(3, 96, true));
  var g = G[sc.group], n = g.options.length, k = g.options.filter(function (o) { return (STARS[o.game] || 0) >= 3; }).length;
  card.insertAdjacentHTML('beforeend', '<div class="stat">📖 <span>' + T(UI.lessons) + '</span><span class="v">' + Object.keys(STARS).length + '</span></div><div class="stat">🧭 <span>' + T(UI.doneC) + '</span><span class="v">' + k + ' / ' + n + '</span></div><div class="stat">⭐ <span>' + T(UI.starsC) + '</span><span class="v">' + totalStars() + '</span></div>');
  var bt = el('div', ''); bt.style.cssText = 'display:flex;gap:50px;justify-content:center;margin-top:10px'; card.appendChild(bt);
  var ag = el('button', 'btn alt', '↺ ' + T(UI.again)); bt.appendChild(ag); tap(ag, function () { sfx.tap(); cur = sc.from; render(); });
  if (sc.next && ACT[sc.next.game]) { var nb = el('button', 'btn purple', T(UI.cont) + ' ▶'); nb.style.fontSize = '72px'; bt.appendChild(nb); tap(nb, function () { sfx.tap(); cur = PQ[sc.next.game] ? { type: 'players', act: sc.next.game, group: sc.group, name: sc.next.name } : { type: sc.next.game, group: sc.group, name: sc.next.name }; render(); }); }
  else { var mb = el('button', 'btn warm', '🗺 ' + T(UI.map)); bt.appendChild(mb); tap(mb, function () { sfx.tap(); if (APP) leave(); else back(); }); }
  owly(UI.great, 'cheer'); for (var i = 0; i < 60; i++) confetti(); };
function confetti(x0, w0) { var c = el('div'), cols = ['#ff6b6b', '#ffcf3d', '#5ab8ff', '#7bd86b', '#c486ff'];
  c.style.cssText = 'position:absolute;z-index:70;pointer-events:none;width:22px;height:40px;border-radius:5px;left:' + ((x0 || 0) + Math.random() * (w0 || 5780)) + 'px;top:-60px;background:' + cols[Math.random() * 5 | 0] + ';transition:transform ' + (2.4 + Math.random() * 1.6) + 's cubic-bezier(.3,.6,.6,1),opacity 1s 2.6s';
  stage.appendChild(c); requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.transform = 'translate(' + (Math.random() - .5) * 400 + 'px,1200px) rotate(' + Math.random() * 900 + 'deg)'; c.style.opacity = 0; }); }); setTimeout(function () { c.remove(); }, 4200); }

/* ═══ UNIVERSAL CONTROL ═══ */
var dock = document.getElementById('dock'), knob = document.getElementById('knob'), panel = document.getElementById('panel'), lift = 0, sizeK = 1, closeT = null;
function relabelDock() { panel.querySelectorAll('[data-t]').forEach(function (n) { n.textContent = n.dataset.t === 'view' && VIEW === 'wall' ? T(L4('Fill height', 'മുഴുവൻ ഉയരം', 'पूरी ऊँचाई', 'ಪೂರ್ಣ ಎತ್ತರ')) : T(UI[n.dataset.t]); }); panel.querySelectorAll('.lang').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === lang()); }); }
function applyFit() { content.style.transform = 'translateY(' + lift + 'px) scale(' + sizeK + ')'; }
(function () { var sx, sy, ox, oy, moved, on = false;
  knob.addEventListener('pointerdown', function (e) { on = true; moved = false; sx = e.clientX; sy = e.clientY; ox = dock.offsetLeft; oy = dock.offsetTop; knob.setPointerCapture(e.pointerId); });
  knob.addEventListener('pointermove', function (e) { if (!on) return; var dx = (e.clientX - sx) / SCALE, dy = (e.clientY - sy) / SCALE; if (!moved && Math.abs(dx) + Math.abs(dy) < 14) return; moved = true;
    var x = Math.max(10, Math.min(uiW - 128, ox + dx)), y = Math.max(69, Math.min(uiH - 69, oy + dy + 59)); dock.style.left = x + 'px'; dock.style.right = 'auto'; dock.style.top = y + 'px'; dock.classList.toggle('left', x < uiW / 2); });
  knob.addEventListener('pointerup', function () { if (!on) return; on = false; if (!moved) { ac(); sfx.tap(); dock.classList.toggle('open'); relabelDock(); poke(); } }); })();
function poke() { clearTimeout(closeT); closeT = setTimeout(function () { dock.classList.remove('open'); }, 9000); }
panel.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ac(); sfx.tap(); poke();
  if (b.dataset.lang) { if (S) S.setLang(b.dataset.lang); return; } var a = b.dataset.act;
  if (a === 'full') { toggleFull(); return; }
  if (a === 'view') { VIEW = VIEW === 'wall' ? 'fill' : 'wall'; relabelDock(); fit(); return; }
  if (a === 'back') { dock.classList.remove('open'); back(); } else if (a === 'home' && APP && /[?&]act=/.test(location.search)) { leave(true); } else if (a === 'home') { dock.classList.remove('open'); stack = []; cur = { type: 'home' }; render(); }
  else if (a === 'up') { lift = Math.max(-200, lift - 40); applyFit(); } else if (a === 'down') { lift = Math.min(240, lift + 40); applyFit(); }
  else if (a === 'smaller') { sizeK = Math.max(.8, +(sizeK - .05).toFixed(2)); applyFit(); } else if (a === 'bigger') { sizeK = Math.min(1.15, +(sizeK + .05).toFixed(2)); applyFit(); }
  else if ((a === 'quieter' || a === 'louder') && S) S.setVoice({ volume: Math.round((S.get().volume + (a === 'louder' ? .1 : -.1)) * 10) / 10 }); });
document.addEventListener('keydown', function (e) { if (e.key === 'f' || e.key === 'F') toggleFull(); else if (e.key === 'Backspace') back(); });
/* start screen: one tap → full screen + sound allowed (browsers need a tap for both) */
var startEl = document.getElementById('start');
function begin() { if (startEl.classList.contains('gone')) return; ac(); toggleFull(); startEl.classList.add('gone'); fit(); if (lastLine) owly(lastLine); }
document.getElementById('startBtn').addEventListener('click', begin);
startEl.addEventListener('click', begin);
if (/[?&](go|nostart)=/.test(location.search)) startEl.classList.add('gone');
if (S) S.onChange(function (w) { if (w === 'lang') { relabelDock(); render(); } });
relabelDock();
/* the app runs full screen already: no full-screen or view buttons */
if (APP) [].forEach.call(panel.querySelectorAll('[data-act="full"],[data-act="view"]'), function (b) { b.parentNode.style.display = 'none'; });
var direct = /[?&](?:go|act)=([a-z0-9-]+)/.exec(location.search);
if (direct && ACT[direct[1]]) { var grp = ''; for (var gk in G) if ((G[gk].options || []).some(function (o) { return o.game === direct[1]; })) grp = gk;
  var opt = grp ? G[grp].options.filter(function (o) { return o.game === direct[1]; })[0] : { name: L4('Money Shop', 'പണക്കട', 'पैसों की दुकान', 'ಹಣದ ಅಂಗಡಿ') }; if (!grp) grp = 'secondary'; stack = APP ? [] : [{ type: 'home' }, { type: 'map', key: grp }]; cur = PQ[direct[1]] && !/[?&]solo/.test(location.search) ? { type: 'players', act: direct[1], group: grp, name: opt.name } : { type: direct[1], group: grp, name: opt.name }; render(); }
else if (APP && /[?&]map=([a-z0-9-]+)/.test(location.search) && G[/[?&]map=([a-z0-9-]+)/.exec(location.search)[1]]) { var mk = /[?&]map=([a-z0-9-]+)/.exec(location.search)[1]; stack = [{ type: 'home' }]; if (G[mk].parent) stack.push({ type: 'level', key: G[mk].parent }); cur = { type: 'map', key: mk }; render(); }
else { try { sessionStorage.setItem('auticareFromPlay', '1'); } catch (e) {} go({ type: 'home' }); }
})();
