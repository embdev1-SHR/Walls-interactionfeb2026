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
  // NOTE: this file is an Electron preload (see main.js), so it runs before the
  // page's own scripts and cannot read window.AuticareConfig. Keep this URL in
  // sync with BASE_URL in js/auticare-config.js by hand.
  var BASE = 'https://api.myauticare.com';
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

  // ---- center token upkeep -------------------------------------------------
  // The center token from /external/center-auth expires. It used to be fetched
  // once at login and never renewed, so every request after expiry got a 401,
  // the session silently "ended" and all later touches/scores were lost.
  // Now: renew shortly before expiry, and retry once on a 401.
  var REFRESH_MARGIN_MS = 10 * 60 * 1000;
  var KEEPALIVE_MAX_BYTES = 60000; // Chromium rejects keepalive bodies > 64KB
  var refreshing = null;

  function tokenExpiry(token) {
    try {
      var part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var payload = JSON.parse(atob(part));
      return payload.exp ? payload.exp * 1000 : 0;
    } catch (_) { return 0; }
  }

  function needsRefresh(token) {
    var exp = tokenExpiry(token);
    return !!exp && exp - Date.now() < REFRESH_MARGIN_MS;
  }

  function refreshToken() {
    if (refreshing) return refreshing;
    var ipc = require('electron').ipcRenderer;
    refreshing = ipc.invoke('store:get', 'license')
      .then(function (lic) {
        if (!lic || !lic.centerApiKey) throw new Error('not activated');
        return fetch(BASE + '/api/v1/external/center-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CenterApiKey: lic.centerApiKey })
        }).then(function (r) {
          if (!r.ok) throw new Error('center-auth ' + r.status);
          return r.json();
        }).then(function (j) {
          var token = j && j.results && j.results.token;
          if (!token) throw new Error('no token');
          lic.token = token;
          ipc.invoke('store:set', 'license', lic);
          var s = getSession();
          if (s) {
            s.token = token;
            localStorage.setItem('auticareSession', JSON.stringify(s));
          }
          return token;
        });
      })
      .finally(function () { refreshing = null; });
    return refreshing;
  }

  // ---- operator-facing connection note ----------------------------------------
  // Small and quiet on purpose (children are looking at this screen): a muted
  // line in the bottom corner, only while recording is actually failing.
  var failures = 0;
  function setOnline(ok) {
    failures = ok ? 0 : failures + 1;
    var el = document.getElementById('blueroom-offline-note');
    if (failures >= 3) {
      if (!el && document.body) {
        el = document.createElement('div');
        el.id = 'blueroom-offline-note';
        el.textContent = 'Not recording — reconnecting…';
        el.style.cssText = 'position:fixed;right:12px;bottom:10px;z-index:2147483647;' +
          'font:12px/1.4 system-ui,sans-serif;color:#6b7280;background:rgba(255,255,255,.85);' +
          'padding:4px 10px;border-radius:10px;pointer-events:none;';
        document.body.appendChild(el);
      }
    } else if (el) {
      el.remove();
    }
  }

  function send(path, json, token) {
    return fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: json,
      keepalive: json.length < KEEPALIVE_MAX_BYTES
    });
  }

  function sendWithRetry(path, json, token) {
    return send(path, json, token).then(function (r) {
      if (r.status !== 401) return r;
      return refreshToken().then(function (fresh) { return send(path, json, fresh); });
    });
  }

  function post(path, body) {
    var s = activeSession();
    if (!s) return;
    var json = JSON.stringify(body);
    var done = function (r) { setOnline(!!(r && r.ok)); };
    var fail = function () { setOnline(false); };
    try {
      if (needsRefresh(s.token)) {
        refreshToken()
          .catch(function () { return s.token; })
          .then(function (t) { return sendWithRetry(path, json, t); })
          .then(done, fail);
      } else {
        // Fire synchronously so beforeunload events still go out.
        sendWithRetry(path, json, s.token).then(done, fail);
      }
    } catch (_) { fail(); }
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

  // Capture the scenario screen once (after it has rendered) so the dashboard
  // can draw touches over the real screen instead of a black canvas.
  function captureScenarioShot(act) {
    var s = activeSession();
    if (!s || !act || act === 'menu' || act === 'index') return;
    try {
      var ipc = require('electron').ipcRenderer;
      ipc.invoke('capture-page').then(function (dataUrl) {
        if (!dataUrl) return;
        post('/api/v1/external/scenario-shot', {
          sessionId: s.sessionId, gameKey: act, image: dataUrl
        });
      }).catch(function () {});
    } catch (e) { /* not in Electron */ }
  }

  // ---- global hook games can OPTIONALLY call to report score/timing ----
  // Usage from any game:  window.Blueroom.reportScore({ score: 85, completionPct: 90, durationMs: 40000 });
  // Timing is auto-derived even without this; score needs this call.
  function installGlobalHook(act) {
    window.Blueroom = window.Blueroom || {};
    window.Blueroom.reportScore = function (r) {
      r = r || {};
      logActivity('scenario_complete', {
        scenarioId: act, gameKey: act,
        completionPct: (r.completionPct != null ? r.completionPct : null),
        durationMs: (r.durationMs != null ? r.durationMs : (Date.now() - START_TS)),
        label: (r.score != null ? String(r.score) : null)
      });
    };
    // Generic event passthrough for anything else a game wants to record.
    window.Blueroom.logEvent = function (type, data) { logActivity(type, data || {}); };
  }

  var START_TS = Date.now();

  function start() {
    if (!activeSession()) return; // guest/offline or no session — do nothing

    var act = currentActivity();
    var lastTouch = 0;
    START_TS = Date.now();
    installGlobalHook(act);

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

    // Grab a screen replica once the scenario has painted.
    setTimeout(function () { captureScenarioShot(act); }, 2500);

    // ---- mark the activity ended (with time-on-task) when leaving ----
    window.addEventListener('beforeunload', function () {
      logActivity('scenario_end', {
        scenarioId: act, gameKey: act,
        durationMs: (Date.now() - START_TS)
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
