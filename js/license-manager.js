/* ============================================================
   LicenseManager — activation + "one device, one center" rule.
   Persists to the Electron userData store (via main.js IPC).
   ============================================================ */
(function (global) {
  const { ipcRenderer } = require('electron');

  const KEY_LICENSE = 'license'; // { centerApiKey, center, token, deviceId, activatedAt }

  const Store = {
    get: (k) => ipcRenderer.invoke('store:get', k),
    set: (k, v) => ipcRenderer.invoke('store:set', k, v),
    del: (k) => ipcRenderer.invoke('store:delete', k),
    deviceId: () => ipcRenderer.invoke('device:id')
  };

  const LicenseManager = {
    Store,

    async getLicense() {
      return (await Store.get(KEY_LICENSE)) || null;
    },

    async isActivated() {
      const lic = await this.getLicense();
      return !!(lic && lic.center && lic.deviceId);
    },

    /**
     * One-time activation. Authenticates the CenterApiKey, binds this
     * device to the center, and persists the license locally.
     * Enforces one-device-one-center both locally and (best effort)
     * against the API.
     */
    async activate(centerApiKey) {
      const existing = await this.getLicense();
      if (existing && existing.center) {
        throw new Error('This device is already activated for ' + existing.center.CenterName + '.');
      }

      const deviceId = await Store.deviceId();

      // 1) Authenticate the key -> token + center profile
      const { token, center } = await global.AuticareAPI.centerAuth(centerApiKey);

      // 2) Bind device <-> center on the server (one device / one center).
      //    Placeholder endpoint — treat a soft failure as non-fatal for
      //    barebones so local activation still works while the server
      //    side is being built. Flip STRICT to true once live.
      const STRICT_DEVICE_BINDING = false;
      try {
        await global.AuticareAPI.registerDevice(center.CenterID, deviceId, token);
      } catch (e) {
        if (e.status === 409) {
          throw new Error('This center or device is already bound to another machine.');
        }
        if (STRICT_DEVICE_BINDING) throw e;
        console.warn('[license] device-register skipped (placeholder):', e.message);
      }

      const license = {
        centerApiKey,          // stored to allow silent re-auth on token expiry
        center,
        token,
        deviceId,
        activatedAt: new Date().toISOString()
      };
      await Store.set(KEY_LICENSE, license);
      return license;
    },

    /** Re-authenticate using the stored key (token lasts 1h). */
    async refreshToken() {
      const lic = await this.getLicense();
      if (!lic) throw new Error('Not activated');
      const { token, center } = await global.AuticareAPI.centerAuth(lic.centerApiKey);
      lic.token = token;
      lic.center = center;
      await Store.set(KEY_LICENSE, lic);
      return token;
    },

    /** DEV ONLY — clear activation so you can re-test the flow. */
    async deactivate() {
      await Store.del(KEY_LICENSE);
    }
  };

  global.LicenseManager = LicenseManager;
})(typeof window !== 'undefined' ? window : globalThis);
