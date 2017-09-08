import os from 'os';
import { app, autoUpdater } from 'electron';
import ms from 'ms';
import log from 'electron-log';
import isOnline from 'is-online';

const platform = `${os.platform()}_${os.arch()}`;
const feedURL = `https://releases.tv-show-track.com/update/${platform}`;

const checkForUpdates = async () => {
  log.info('checkForUpdates...');
  const appIsOnline = await isOnline();
  log.info('appIsOnline', appIsOnline);

  if (!appIsOnline) {
    // Try again after half an hour
    setTimeout(checkForUpdates, ms('30m'));
    return;
  }

  autoUpdater.checkForUpdates();
};

const startAppUpdates = async () => {
  log.info('startAppUpdates...');

  try {
    autoUpdater.setFeedURL(`${feedURL}/${app.getVersion()}`);
  } catch (e) {
    log.error(`Error settting FeedURL: ${JSON.stringify(e)}`);
  }


  // Check for app update after startup
  setTimeout(checkForUpdates, ms('10s'));

  log.info('feedURL: ', feedURL);

  autoUpdater.on('error', error => {
    // Report errors to console. We can't report
    // to Slack and restart here, because it will
    // cause the app to never start again
    log.error(`Error in auto-update: ${JSON.stringify(error)}`);

    // Then check again for update after 15 minutes
    setTimeout(checkForUpdates, ms('15m'));
  });

  autoUpdater.on('download-progress', progressObj => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
    logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total$})`;
    log.info(logMessage);
  });

  autoUpdater.on('update-downloaded', async () => {
    log.info('Update downloaded, will install soon...');

    // Then restart the application
    autoUpdater.quitAndInstall();
    app.quit();
  });

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for app updates...');
  });

  autoUpdater.on('update-available', () => {
    log.info('Found update for the app! Downloading...');
  });

  autoUpdater.on('update-not-available', () => {
    log.info('No updates found. Checking again in 5 minutes...');
    setTimeout(checkForUpdates, ms('5m'));
  });
};

export default () => {
  log.info('Inititate updates.js...', process.env.NODE_ENV);

  if (process.platform === 'linux') {
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    startAppUpdates();
  }
};
