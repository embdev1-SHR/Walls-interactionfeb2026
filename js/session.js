/* ============================================================
   Session — current run mode, shared across index.html + games.
   Persisted in localStorage so it survives page navigation.

   Shape:
   {
     mode: 'guest' | 'online',
     submode: 'class' | 'individual' | null,   // online only
     token: '<center jwt>' | null,             // for API calls
     center: { CenterID, CenterName, ... } | null,
     classId, className,                        // online
     studentId, studentName                     // individual only
   }
   ============================================================ */
(function (global) {
  const KEY = 'auticareSession';
  const CFG = global.AuticareConfig || {};
  const MULTI = new Set(CFG.MULTIPLAYER_GAMES || []);

  const Session = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)) || null; }
      catch (_) { return null; }
    },
    set(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    },
    clear() { localStorage.removeItem(KEY); },

    // ---- mode helpers ----------------------------------------
    isGuest()      { const s = this.get(); return !!s && s.mode === 'guest'; },
    isOnline()     { const s = this.get(); return !!s && s.mode === 'online'; },
    isClass()      { const s = this.get(); return this.isOnline() && s.submode === 'class'; },
    isIndividual() { const s = this.get(); return this.isOnline() && s.submode === 'individual'; },

    /** Guest mode is offline — no web-backed data. */
    isWebEnabled() { return this.isOnline(); },

    // ---- multiplayer gating ----------------------------------
    isMultiplayerGame(gameKey) { return MULTI.has(gameKey); },

    /**
     * Should a given game card be visible/playable in this session?
     *   guest       -> everything
     *   class       -> ONLY multiplayer games
     *   individual  -> everything EXCEPT multiplayer games
     */
    isGameAllowed(gameKey) {
      if (this.isClass())      return this.isMultiplayerGame(gameKey);
      if (this.isIndividual()) return !this.isMultiplayerGame(gameKey);
      return true; // guest / unset
    },

    // ---- patient activity capture ----------------------------
    /**
     * Fire-and-forget activity log. Sends for any ONLINE session
     * (class or individual) so live monitoring + heatmaps work in
     * both. StudentID is only present in individual mode.
     */
    async logActivity(eventType, payload = {}) {
      const s = this.get();
      if (!s || !this.isOnline() || !s.token || !s.sessionId) return;
      try {
        await global.AuticareAPI.sendPatientActivity({
          sessionId: s.sessionId,
          StudentID: s.studentId || null,
          ClassID: s.classId,
          mode: s.submode,
          eventType,
          at: new Date().toISOString(),
          data: payload
        }, s.token);
      } catch (e) {
        console.warn('[session] activity log failed:', e.message);
      }
    },

    // ---- live session lifecycle ------------------------------
    /** Called once when an online session begins (from login.html). */
    async startLiveSession() {
      const s = this.get();
      if (!s || !this.isOnline() || !s.token || !s.sessionId) return;
      try {
        await global.AuticareAPI.sessionStart({
          sessionId: s.sessionId,
          StudentID: s.studentId || null,
          PatientName: s.studentName || null,
          ClassID: s.classId || null,
          ClassName: s.className || null,
          mode: s.submode,
          deviceId: s.deviceId || null,
        }, s.token);
      } catch (e) {
        console.warn('[session] start failed:', e.message);
      }
    },

    /** Periodic keepalive so the dashboard shows this session as live. */
    async heartbeat(currentActivity) {
      const s = this.get();
      if (!s || !this.isOnline() || !s.token || !s.sessionId) return;
      try {
        await global.AuticareAPI.sessionHeartbeat({
          sessionId: s.sessionId,
          currentActivity: currentActivity || null,
        }, s.token);
      } catch (e) { /* silent */ }
    },

    /** End the live session (best-effort). */
    async endLiveSession() {
      const s = this.get();
      if (!s || !this.isOnline() || !s.token || !s.sessionId) return;
      try {
        await global.AuticareAPI.sessionEnd({ sessionId: s.sessionId }, s.token);
      } catch (e) { /* silent */ }
    }
  };

  global.Session = Session;
})(typeof window !== 'undefined' ? window : globalThis);
