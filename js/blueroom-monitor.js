/* ============================================================
   Blueroom Monitor — global auto-capture layer.
   Loaded as an Electron PRELOAD, so it runs on EVERY page
   (menu + all game pages) with no per-game edits.

   It is fully self-contained: it reads the current session from
   localStorage and POSTs directly to the integration API, so it
   does not depend on AuticareConfig / AuticareAPI / Session being
   present on the page.

   Captures, for any ONLINE session:
     - session heartbeat (keeps the dashboard "live" card alive)
     - the current activity (per page) with timestamps
     - every touch/pointer coordinate (heatmap + hotspots)
     - button / control taps (instruction + trigger prompts)
   ============================================================ */
(function () {
  var BASE = 'https://auticare-api.vercel.app';
  var HEARTBEAT_MS = 15000;
  var TOUCH_THROTTLE_MS = 35;

  function getSession() {
    try { return JSON.parse(localStorage.getItem('auticareSession')) || null; }
    catch (_) { return null; }
  }
  function activeSession() {
    var s = getSession();
    return (s && s.mode === 'online' && s.token && s.sessionId) ? s : null;
  }

  // Best-effort human name for the current screen/activity.
  function currentActivity() {
    var page = (location.pathname || '').split('/').pop().replace('.html', '');
    var title = (document.title || '').trim();
    if (page && page !== 'index') return page;
    return title || page || 'menu';
  }

  function post(path, body) {
    var s = activeSession();
    if (!s) return;
    try {
      fetch(BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.token },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    } catch (_) {}
  }

  function logActivity(eventType, data) {
    var s = activeSession();
    if (!s) return;
    post('/api/v1/external/patient-activity', {
      sessionId: s.sessionId,
      StudentID: s.studentId || null,
      ClassID: s.classId || null,
      mode: s.submode || null,
      eventType: eventType,
      data: data || {}
    });
  }

  function heartbeat() {
    var s = activeSession();
    if (!s) return;
    post('/api/v1/external/session/heartbeat', {
      sessionId: s.sessionId,
      currentActivity: currentActivity()
    });
  }

  function start() {
    if (!activeSession()) return; // guest/offline or no session — do nothing

    var act = currentActivity();
    var lastTouch = 0;

    // ---- touch / pointer coordinates ----
    function onPoint(e) {
      var now = Date.now();
      if (now - lastTouch < TOUCH_THROTTLE_MS) return;
      lastTouch = now;
      var x = e.clientX, y = e.clientY;
      if ((x == null || x === undefined) && e.touches && e.touches[0]) {
        x = e.touches[0].clientX; y = e.touches[0].clientY;
      }
      if (x == null) return;
      logActivity('touch', {
        x: x, y: y,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        scenarioId: act, gameKey: act
      });
    }
    window.addEventListener('pointerdown', onPoint, true);
    window.addEventListener('touchstart', onPoint, { capture: true, passive: true });

    // ---- button / control taps (instruction + trigger prompts) ----
    window.addEventListener('click', function (e) {
      var el = e.target && e.target.closest &&
        e.target.closest('button,[role="button"],a,.btn,.mode-card,.game-card,.menu-item,.card');
      if (!el) return;
      var label = (el.getAttribute('aria-label') || el.title || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
      if (label) logActivity('button', { label: label, scenarioId: act });
    }, true);

    // ---- announce this activity + start heartbeat ----
    logActivity('scenario_start', { scenarioId: act, gameKey: act, label: (document.title || act) });
    heartbeat();
    setInterval(heartbeat, HEARTBEAT_MS);

    // ---- mark the activity ended when leaving the page ----
    window.addEventListener('beforeunload', function () {
      logActivity('scenario_end', { scenarioId: act, gameKey: act });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
