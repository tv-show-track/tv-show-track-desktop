import { ipcMain } from 'electron';
import Database from '../database';

export function watchconf() {
  ipcMain.on('is-configured', isFirstTime);
}

function isFirstTime(event) {
  Database
    .getSetting({ key: 'isConfigured' })
    .then(doc => {
      event.sender.send('is-configured', !!doc);

      setLastUsage();
      return true;
    })
    .catch(console.error);
}

function setLastUsage() {
  Database.writeSetting({
    key: 'lastUsage',
    value: new Date()
  });
}

export function isConfigured() {
  return Database
    .getSetting({ key: 'isConfigured' })
    .then(doc => (
      new Promise((resolve, reject) => {
        console.log('isConfigured', doc);
        if (doc && doc.value) {
          return resolve();
        }

        console.log('reject');
        return reject();
      })
    ));
}

export function setAsConfigured() {
  return Database
    .writeSetting({ key: 'isConfigured', value: true })
    .catch(console.error);
}
