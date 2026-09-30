/* ============================================================
   menu-greeting.js — കുട്ടു welcomes the room
   ------------------------------------------------------------
   The Clash of Clans thing: you open the app and someone is
   pleased to see you, before you have done anything. On a wall in
   a classroom that matters more than in a game — it tells a child
   who has just walked up that the wall is awake, is talking to
   them, and is speaking their language.

   Three rules it follows:

     · ONCE PER LAUNCH, not per visit to the menu. A child coming
       back from an activity has heard it already, and a greeting
       on every return becomes noise to tune out. sessionStorage
       resets when the Electron window closes, which is exactly
       the lifetime we want.

     · TAP കുട്ടു TO HEAR IT AGAIN. The one affordance that
       matters for a child who missed it or wants it repeated.
       GUIDE.repeat() already does this.

     · TIME OF DAY. Morning, afternoon and evening greetings, so
       the wall does not say "good morning" at four o'clock. The
       lines rotate within each slot so the tenth morning does not
       sound like the first.

   MALAYALAM NEEDS PROOFING. Like every other {en, ml} block in
   this repo, these were not written by a native speaker. They are
   deliberately short and standard, which is the safest thing to
   be wrong about, but they still need the same review pass as the
   rest of the content before the wall goes live.

   The lines are plain { en, ml } pairs, so `npm run voice:lines`
   collects them into the corpus and `voice-bake.py` renders them
   with the same Anjali voice as everything else. Until that runs
   they fall back to the device voice, which on Windows means
   silence — the greeting is only real once it is baked.
   ============================================================ */
(function (global) {
  'use strict';

  var SEEN = 'auticareGreeted';

  /* Kept short on purpose: a long greeting is one a child learns to
     walk away from. Each slot has three so it does not wear out. */
  var GREETINGS = {
    morning: [
      { en: 'Good morning! Shall we play?',   ml: 'സുപ്രഭാതം! നമുക്ക് കളിക്കാം?' },
      { en: 'Good morning! Welcome!',          ml: 'സുപ്രഭാതം! സ്വാഗതം!' },
      { en: 'Good morning! What shall we learn today?', ml: 'സുപ്രഭാതം! ഇന്ന് എന്ത് പഠിക്കാം?' }
    ],
    afternoon: [
      { en: 'Hello! Shall we play?',           ml: 'നമസ്കാരം! നമുക്ക് കളിക്കാം?' },
      { en: 'Welcome! Come and play!',         ml: 'സ്വാഗതം! വരൂ, കളിക്കാം!' },
      { en: 'Hello! What shall we learn today?', ml: 'നമസ്കാരം! ഇന്ന് എന്ത് പഠിക്കാം?' }
    ],
    evening: [
      { en: 'Good evening! Shall we play?',    ml: 'ശുഭസന്ധ്യ! നമുക്ക് കളിക്കാം?' },
      { en: 'Good evening! Welcome!',          ml: 'ശുഭസന്ധ്യ! സ്വാഗതം!' },
      { en: 'Hello! Come and play!',           ml: 'നമസ്കാരം! വരൂ, കളിക്കാം!' }
    ]
  };

  function slot() {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  /* Rotate rather than randomise, so a child does not hear the same
     line twice running by chance. */
  function pick() {
    var set = GREETINGS[slot()];
    var n = 0;
    try { n = parseInt(localStorage.getItem('auticareGreetIdx') || '0', 10) || 0; } catch (e) {}
    try { localStorage.setItem('auticareGreetIdx', String((n + 1) % 1000)); } catch (e) {}
    return set[n % set.length];
  }

  function alreadyGreeted() {
    try { return sessionStorage.getItem(SEEN) === '1'; } catch (e) { return false; }
  }
  function markGreeted() {
    try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
  }

  function greet(force) {
    if (!global.GUIDE) return;              // guide.js not loaded on this page
    if (!force && alreadyGreeted()) {
      GUIDE.mount();                        // present, but says nothing
      return;
    }
    markGreeted();
    GUIDE.mount();
    GUIDE.say(pick());
  }

  /* index.html styles several elements with 'Noto Sans Malayalam' but never
     loads it, so menu Malayalam has always rendered in a fallback face.
     wall-common's injectFont() would fix that, but it only runs from
     WALL.init(), which also binds Esc to '../index.html' — from the menu
     that navigates out of the app. So the font is loaded here instead and
     WALL.init() is deliberately not called on this page. */
  function injectFont() {
    if (document.getElementById('ml-font')) return;
    var l = document.createElement('link');
    l.id = 'ml-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;700;900&display=swap';
    document.head.appendChild(l);
  }

  /* The menu builds itself asynchronously, and a greeting that fires
     into a half-built page gets lost behind the intro animation. */
  function init(delay) {
    var wait = typeof delay === 'number' ? delay : 900;
    injectFont();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { greet(); }, wait); });
    } else {
      setTimeout(function () { greet(); }, wait);
    }
  }

  global.MENU_GREETING = { init: init, greet: greet, GREETINGS: GREETINGS };
})(typeof window !== 'undefined' ? window : globalThis);
