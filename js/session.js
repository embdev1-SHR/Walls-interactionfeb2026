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

    // ---- patient activity capture (individual mode) ----------
    /**
     * Fire-and-forget activity log. Only sends when we're in
     * individual online mode with a selected student.
     */
    async logActivity(eventType, payload = {}) {
      const s = this.get();
      if (!s || !this.isIndividual() || !s.studentId || !s.token) return;
      try {
        await global.AuticareAPI.sendPatientActivity({
          StudentID: s.studentId,
          ClassID: s.classId,
          CenterID: s.center ? s.center.CenterID : undefined,
          eventType,
          at: new Date().toISOString(),
          data: payload
        }, s.token);
      } catch (e) {
        console.warn('[session] activity log failed:', e.message);
      }
    }
  };

  global.Session = Session;
})(typeof window !== 'undefined' ? window : globalThis);
