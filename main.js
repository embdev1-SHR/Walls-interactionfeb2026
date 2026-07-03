const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

let mainWindow;

// ─────────────────────────────────────────────────────────────
//  Persistent local store  (license / device binding / session)
//  Lives in Electron userData so it survives app updates but is
//  tied to this machine's user profile.
// ─────────────────────────────────────────────────────────────
function storePath() {
  return path.join(app.getPath('userData'), 'auticare-license.json');
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath(), 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  fs.writeFileSync(storePath(), JSON.stringify(data, null, 2), 'utf8');
  return data;
}

// A stable per-install device id. Generated once and persisted.
// Used for the "one device, one center" license rule.
function getDeviceId() {
  const store = readStore();
  if (store.__deviceId) return store.__deviceId;
  const seed = os.hostname() + '|' + os.platform() + '|' + os.arch() + '|' + crypto.randomUUID();
  const id = crypto.createHash('sha256').update(seed).digest('hex');
  store.__deviceId = id;
  writeStore(store);
  return id;
}

ipcMain.handle('store:get', (_e, key) => readStore()[key]);
ipcMain.handle('store:all', () => readStore());
ipcMain.handle('store:set', (_e, key, value) => {
  const store = readStore();
  store[key] = value;
  writeStore(store);
  return true;
});
ipcMain.handle('store:delete', (_e, key) => {
  const store = readStore();
  delete store[key];
  writeStore(store);
  return true;
});
ipcMain.handle('device:id', () => getDeviceId());

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    frame: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webgl: true,
      enableWebSQL: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      // Global Blueroom monitor — runs on every page (menu + games)
      // to capture touches, prompts and session heartbeats.
      preload: path.join(__dirname, 'js', 'blueroom-monitor.js')
    }
  });

  // Entry point is the login/license gate. Once the user is
  // activated + a session mode is chosen, the gate forwards to
  // index.html (the main menu).
  mainWindow.loadFile(path.join(__dirname, 'login.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
      } else {
        app.quit();
      }
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for game interactions
ipcMain.on('load-game', (event, gameName) => {
  console.log('Loading game:', gameName);
});
