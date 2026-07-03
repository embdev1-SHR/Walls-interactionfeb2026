/* ============================================================
   Auticare integration config
   ------------------------------------------------------------
   Only `centerAuth` is a REAL documented endpoint.
   Everything marked PLACEHOLDER needs to be implemented on the
   Auticare / Neon side and the paths confirmed. Shapes below are
   my assumed contracts — adjust to match your server.
   ============================================================ */
(function (global) {
  const AuticareConfig = {
    BASE_URL: 'https://auticare-api.vercel.app',

    ENDPOINTS: {
      // REAL — documented
      centerAuth:        '/api/v1/external/center-auth',       // POST { CenterApiKey } -> { token, center }

      // PLACEHOLDER — one device / one center registry
      deviceRegister:    '/api/v1/external/device-register',    // POST { CenterID, deviceId } -> { ok } | 409 if bound elsewhere
      deviceCheck:       '/api/v1/external/device-check',       // GET  ?deviceId=... -> { CenterID | null }

      // Department login — identifies which dept this session belongs to
      operatorLogin:     '/api/v1/external/login',              // POST { username, password } (Bearer center token) -> { department }

      // Students under a department
      students:          '/api/v1/external/classes/:classId/students', // GET -> [{ StudentID, StudentName }]

      // Patient activity capture + live session lifecycle
      patientActivity:   '/api/v1/external/patient-activity',    // POST { sessionId, StudentID, eventType, data }
      sessionStart:      '/api/v1/external/session/start',        // POST { sessionId, ... }
      sessionHeartbeat:  '/api/v1/external/session/heartbeat',    // POST { sessionId, currentActivity }
      sessionEnd:        '/api/v1/external/session/end'           // POST { sessionId }
    },

    // Games that HAVE / REQUIRE a multiplayer scenario.
    // In Individual mode these are hidden; in Class mode ONLY these show.
    // TODO: tune this list to match your real multiplayer scenarios.
    MULTIPLAYER_GAMES: [
      'arithmetica',
      'number-crunch',
      'fruit-math',
      'alphabet-explorer',
      'pp-multiplayer'
    ]
  };

  global.AuticareConfig = AuticareConfig;
  if (typeof module !== 'undefined' && module.exports) module.exports = AuticareConfig;
})(typeof window !== 'undefined' ? window : globalThis);
