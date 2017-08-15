/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import path from 'path';
import { app, BrowserWindow, Tray, nativeImage, ipcMain } from 'electron';
import Positioner from 'electron-positioner';
import MenuBuilder from './menu';
import Database, { checkIfValidProviders } from './lib/database';
import { watchConf, isConfigured } from './lib/listeners/configuration';
import { init as initScrobbler } from './lib/scrobbler';
import { configureVlc, listenVlc } from './lib/listeners/vlc';
import { listenChromeCast } from './lib/listeners/chromecast';


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

let tray;
let win;
let cachedBounds;

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  setApplicationMenu();
  initializeTracking();

  win.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  win.webContents.on('did-finish-load', () => {
    if (!win) {
      throw new Error('"win" is not defined');
    }
    win.show();
    win.focus();
  });

  win.on('closed', () => {
    win = null;
  });

  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();
});

ipcMain.on('initialize-tracking', initializeTracking);

/**
 * Methods
 */

function initializeTracking() {
  watchConf();

  Database.initialize()
    .then(checkIfValidProviders)
    .then(initScrobbler)
    .then(() => {
      configureVlc()
        .then(listenVlc)
        .catch(console.error);
      listenChromeCast();
    })
    .catch(console.error);
}

function setApplicationMenu() {
  const iconPath = path.join(__dirname, 'assets', 'trayIcon.png');
  const nimage = nativeImage.createFromPath(iconPath);
  tray = new Tray(nimage);

  win = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
  });
  showWindow(cachedBounds);

  tray.on('click', clicked);
  tray.on('double-click', clicked);

  win.on('show', () => {
    tray.setHighlightMode('always');
  });

  win.on('hide', () => {
    tray.setHighlightMode('never');
  });
}

function clicked(e, bounds) {
  if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return hideWindow();
  if (win && win.isVisible()) return hideWindow();
  cachedBounds = bounds || cachedBounds;

  showWindow(cachedBounds);
}

function showWindow(trayPos) {
  let pos = trayPos;
  if (pos && pos.x !== 0) {
    // Cache the bounds
    cachedBounds = pos;
  } else if (cachedBounds) {
    // Cached value will be used if showWindow is called without bounds data
    pos = cachedBounds;
  } else if (tray.getBounds) {
    // Get the current tray bounds
    pos = tray.getBounds();
  }

  const position = new Positioner(win).calculate('trayCenter', pos);

  const x = position.x;
  const y = position.y;

  win.setPosition(x, y);
  win.show();
}

function hideWindow() {
  win.hide();
}
