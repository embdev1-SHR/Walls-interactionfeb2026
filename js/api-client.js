/* ============================================================
   AuticareAPI — thin fetch wrapper around the integration API.
   Renderer-side (Electron nodeIntegration). Uses global fetch.
   ============================================================ */
(function (global) {
  const CFG = global.AuticareConfig;

  function url(path) {
    return CFG.BASE_URL + path;
  }

  async function request(path, { method = 'GET', body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(url(path), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    try { data = await res.json(); } catch (_) { /* non-json */ }

    if (!res.ok) {
      const msg = (data && data.errors && data.errors.message) || ('HTTP ' + res.status);
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const AuticareAPI = {
    // ---- REAL: authenticate the center with its API key -------
    async centerAuth(centerApiKey) {
      const data = await request(CFG.ENDPOINTS.centerAuth, {
        method: 'POST',
        body: { CenterApiKey: centerApiKey }
      });
      // { success, results: { token, center } }
      return data.results;
    },

    // ---- PLACEHOLDER: one device / one center -----------------
    async registerDevice(centerId, deviceId, token) {
      // TODO(server): create binding; return 409 if device already
      // bound to a different center, or center already bound to a
      // different device.
      return request(CFG.ENDPOINTS.deviceRegister, {
        method: 'POST',
        token,
        body: { CenterID: centerId, deviceId }
      });
    },

    async checkDevice(deviceId) {
      // TODO(server): return which center (if any) this device is bound to.
      return request(CFG.ENDPOINTS.deviceCheck + '?deviceId=' + encodeURIComponent(deviceId));
    },

    // ---- PLACEHOLDER: online-mode operator login (2nd login) --
    async operatorLogin(username, password, token) {
      return request(CFG.ENDPOINTS.operatorLogin, {
        method: 'POST',
        token,
        body: { username, password }
      });
    },

    // ---- PLACEHOLDER: classes & students ----------------------
    async getClasses(token) {
      const data = await request(CFG.ENDPOINTS.classes, { token });
      return (data && data.results) || data;
    },

    async verifyClassPassword(classId, password, token) {
      return request(CFG.ENDPOINTS.classVerify, {
        method: 'POST',
        token,
        body: { ClassID: classId, password }
      });
    },

    async getStudents(classId, token) {
      const path = CFG.ENDPOINTS.students.replace(':classId', encodeURIComponent(classId));
      const data = await request(path, { token });
      return (data && data.results) || data;
    },

    // ---- PLACEHOLDER: patient activity capture ----------------
    async sendPatientActivity(payload, token) {
      return request(CFG.ENDPOINTS.patientActivity, {
        method: 'POST',
        token,
        body: payload
      });
    }
  };

  global.AuticareAPI = AuticareAPI;
})(typeof window !== 'undefined' ? window : globalThis);
