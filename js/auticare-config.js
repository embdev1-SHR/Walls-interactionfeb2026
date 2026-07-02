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

      // PLACEHOLDER — "online mode" operator login (2nd login)
      operatorLogin:     '/api/v1/external/login',              // POST { username, password } (Bearer center token) -> { operator }

      // PLACEHOLDER — classes / students under the center
      classes:           '/api/v1/external/classes',            // GET  -> [{ ClassID, ClassName }]
      classVerify:       '/api/v1/external/classes/verify',     // POST { ClassID, password } -> { ok }
      students:          '/api/v1/external/classes/:classId/students', // GET -> [{ StudentID, StudentName }]

      // PLACEHOLDER — patient activity capture (individual mode)
      patientActivity:   '/api/v1/external/patient-activity'    // POST { StudentID, ... } (Bearer center token)
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
