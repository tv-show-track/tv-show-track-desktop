import fs from 'fs';
import os from 'os';
import axios from 'axios';
import xml2js from 'xml2js';
import { spawn } from 'child_process'

import * as _ from 'lodash';
import { ipcMain } from 'electron';
import vlcCommand from 'vlc-command';

import Database from '../database';
import { play, stop } from '../scrobbler';

const vlcServerURL = 'http://localhost:8888/requests/status.xml';
const config = {
  auth: {
    password: 'vlcrc'
  }
};

let cancelIntervalInfos;
let cantReadInfos = false;

ipcMain.on('is-vlc-installed', async (event) => {
  const res = await Database.getSetting({ key: 'vlcInstalled' });

  if (res && res.value) {
    event.sender.send('vlc-installed');
  }
});

ipcMain.on('is-vlc-installed', async (event) => {
  const vlcInstalled = await checkIfInstalled();

  event.sender.send('vlc-installed', vlcInstalled);
});

ipcMain.on('is-vlc-configured', async (event) => {
  const vlcIsConfigured = await isConfigured();

  event.sender.send('vlc-configured', vlcIsConfigured);
});

ipcMain.on('is-vlc-installed-and-configured', async (event) => {
  const vlcInstalled = await checkIfInstalled();
  const vlcConfigured = await isConfigured();

  event.sender.send('vlc-installed-and-configured', { vlcInstalled, vlcConfigured });
});

ipcMain.on('set-vlc-config-path', async (event, arg) => {
  await Database.writeSetting({ key: 'vlcConfigPath', value: arg });

  event.sender.send('vlc-config-path-setted');
});

ipcMain.on('check-vlc', async (event) => {
  const vlcInstalled = await checkIfInstalled();

  if (vlcInstalled) {
    configureVlc()
      .then(() => {
        trackVlc();
        event.sender.send('vlc-checked', {
          installed: true,
          configured: true
        });
      }, (err) => {
        return event.sender.send('vlc-checked', {
          installed: true,
          configured: false,
          configPathErr: err.configPathErr || false
        });
      })
      .catch(err => {
        event.sender.send('vlc-checked', {
          installed: true,
          configured: false
        });
      });
  } else {
    await Database.writeSetting({
      key: 'vlcInstalled',
      value: false
    });
    event.sender.send('vlc-checked', {
      installed: false,
      configured: false
    });
  }
});

async function isConfigured() {
  const res = await Database.getSetting({ key: 'vlcConfigured' });
  return res && res.value;
}

function trackVlc() {
  if (cancelIntervalInfos) {
    clearInterval(cancelIntervalInfos);
  }
  cancelIntervalInfos = setInterval(getMediaInfos, 1000);
}

function untrackVlc() {
  if (cancelIntervalInfos) {
    clearInterval(cancelIntervalInfos);
  }
}



function checkIfInstalled() {
  console.log('checkIfInstalled');
  return new Promise(resolve => {
    vlcCommand((err, vlcPath) => {
      console.log('vlcCommand err', err, vlcPath);
      resolve(!err);
    });
  });
}

function configureVlc() {
  return new Promise(async (resolve, reject) => {
    const res = await Database.getSetting({ key: 'vlcConfigPath' });
    if (res && res.value) {
      const configPath = res.value;
      try {
        fs.readFile(configPath, 'utf8', async (err, data) => {
          if (err) {
            console.log('Error reading vlc config file', err);
            await Database.writeSetting({
              key: 'vlcConfigured',
              value: false
            });
            reject({ configPathErr: false });
          } else {
            console.log('Reading VLC config file...', configPath);

            let result = data.replace(/\s#http-port?[^\s]+/g, '\r\nhttp-port=');
            result = result.replace(/\shttp-port=?[^\s]+/g, '\r\nhttp-port=8888');

            result = result.replace(/\s#http-password?[^\s]+/g, '\r\nhttp-password=');
            result = result.replace(/\shttp-password=?[^\s]+/g, '\r\nhttp-password=vlcrc');

            result = result.replace(/\s#extraintf?[^\s]+/g, '\r\nextraintf=');
            result = result.replace(/\sextraintf=?[^\s]+/g, '\r\nextraintf=http');

            fs.writeFile(configPath, result, 'utf8', async (error) => {
              if (error) {
                throw new Error(error);
              } else {
                try {
                  await Database.writeSetting({
                    key: 'vlcInstalled',
                    value: true
                  });
                  await Database.writeSetting({
                    key: 'vlcConfigured',
                    value: true
                  });
                  console.log('VLC installed and configured');
                } catch (e) {
                  console.log('Error setting VLC as installed and as configured', e);
                }
                resolve();
              }
            });
          }
        });
      } catch (err) {
        Database.writeSetting({
          key: 'vlcConfigured',
          value: false
        });
        reject();
      }
    } else {
      reject({ configPathErr: true });
    }
  });
}

async function getMediaInfos() {
  try {
    const response = await axios.get(vlcServerURL, config);
    if (response && response.data) {
      cantReadInfos = false;
      xml2js.parseString(response.data, async (err, result) => {
        const infos = _.get(result, 'root.information[0].category[0].info');
        const filenameFinder = _.find(infos, n => n.$.name === 'filename');

        const title = _.get(filenameFinder, '_');
        const position = _.get(result, 'root.position[0]');

        if (title) {
          play({ provider: 'vlc', title, position });
        } else {
          stop('vlc');
        }
      });
    }
  } catch (err) {
    if (!cantReadInfos) {
      stop('vlc');
      cantReadInfos = true;
    }

    console.log('Error reading vlc infos', err.code);
  }
}

export { configureVlc, isConfigured, trackVlc };
