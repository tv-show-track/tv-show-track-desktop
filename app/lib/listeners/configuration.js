import { ipcMain } from 'electron';
import Database from '../database';

export function watchconf() {
  ipcMain.on('is-first-time', isFirstTime);
  ipcMain.on('is-configured', isConfigured);
}

async function isFirstTime(event) {
  try {
    await checkConfiguration();
    event.sender.send('is-first-time', true);
  } catch (e) {
    event.sender.send('is-first-time', false);
  }
  setLastUsage();
}

async function isConfigured(event) {
  const res = await checkConfiguration();
  event.sender.send('is-configured', !!res);
}

function setLastUsage() {
  Database.writeSetting({
    key: 'lastUsage',
    value: new Date()
  });
}

export function checkConfiguration() {
  return Database
    .getSetting({ key: 'isConfigured' })
    .then(doc => (
      new Promise((resolve, reject) => {
        if (doc && doc.value) {
          return resolve();
        }

        return reject();
      })
    ));
}

export async function setAsConfigured() {
  const res = await Database.writeSetting({ key: 'isConfigured', value: true });
  return res;
}
