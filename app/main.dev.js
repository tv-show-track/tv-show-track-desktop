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
import log from 'electron-log';
import Positioner from 'electron-positioner';
import isOnline from 'is-online';
import autoUpdater from './utils/updates';
import './lib/database';
import MenuBuilder from './menu';
import { isSandboxed } from './utils/apple';
import { init as initLicensing, licenseKeyIsValid } from './lib/licensing';
import { initTracking } from './lib/tracker';

log.transports.file.level = 'info';
log.transports.console.level = 'info';
log.info('App starting...');


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
  // checkLicense();
  isReady();
});

ipcMain.on('initialize-tracking', initTracking);
ipcMain.on('online-status-changed', (event, statusIsOnline) => {
  global.isOnline = statusIsOnline;
});

/**
 * Methods
 */

async function checkLicense() {
  log.info('checkLicense');
  const webIsHere = await isOnline();
  const validLicense = await licenseKeyIsValid();
  log.info('validLicense', validLicense);

  const iosAndSandboxed = process.platform === 'darwin' && isSandboxed();

  if (iosAndSandboxed || (webIsHere && validLicense)) {
    isReady();
  } else {
    isNotAuthorized();
  }
}

function isNotAuthorized() {
  log.info('isNotAuthorized');
  ipcMain.on('license-added', () => {
    log.info('license added');
    checkLicense();
  });
  initLicensing();
  win.loadURL(`file://${__dirname}/not-authorized.html`);
  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();
}

function isReady() {
  log.info('isReady');

  autoUpdater(win);

  initTracking();

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

  const centering = process.platform === 'darwin'
    ? 'trayCenter'
    : 'trayBottomCenter';

  const position = new Positioner(win).calculate(centering, pos);

  const x = position.x;
  const y = position.y;

  win.setPosition(x, y);
  win.show();
}

function hideWindow() {
  win.hide();
}
