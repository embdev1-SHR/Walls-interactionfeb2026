const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

let mainWindow;

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
      allowRunningInsecureContent: true
    }
  });

  // Load index.html from app directory
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

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
