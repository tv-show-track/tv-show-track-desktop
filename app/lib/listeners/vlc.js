import fs from 'fs';
import os from 'os';
import axios from 'axios';
import xml2js from 'xml2js';
import * as _ from 'lodash';
import { ipcMain } from 'electron';
import getUsername from 'username'

import Database from '../database';
import { play, stop } from '../scrobbler';

const vlcServerURL = 'http://localhost:8888/requests/status.xml';
const config = {
  auth: {
    password: 'vlcrc'
  }
};

let cancelIntervalInfos;

ipcMain.on('is-vlc-installed', async (event) => {
  const res = await Database.getSetting({ key: 'vlcInstalled' });

  if (res && res.value) {
    event.sender.send('vlc-installed');
  }
});

ipcMain.on('is-vlc-configured', async (event) => {
  const res = await Database.getSetting({ key: 'vlcConfigured' });

  if (res && res.value) {
    event.sender.send('vlc-configured');
  }
});

ipcMain.on('check-vlc', (event) => {
  configureVlc()
    .then(listenVlc)
    .then(() => event.sender.send('vlc-checked'))
    .catch(err => {
      console.log('err', err);
      // event.sender.send('vlc-configure-error', err);
    });
});

function listenVlc() {
  if (cancelIntervalInfos) {
    clearInterval(cancelIntervalInfos);
  }
  cancelIntervalInfos = setInterval(getMediaInfos, 1000);
}

function configureVlc() {
  let configPath;

  return new Promise((resolve, reject) => {
    getUsername().then(username => {
      switch (os.platform()) {
        default:
        case 'darwin':
          configPath = `/Users/${username}/Library/Preferences/org.videolan.vlc/vlcrc`;
          break;
      }

      fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
          console.log('Error reading vlc config file', err);
          Database.writeSetting({
            key: 'vlcInstalled',
            value: false
          });
          return reject(err);
        }

        console.log('Reading VLC config file...', configPath);

        let result = data.replace(/\s#http-port?[^\s]+/g, '\r\nhttp-port=');
        result = result.replace(/\shttp-port=?[^\s]+/g, '\r\nhttp-port=8888');

        result = result.replace(/\s#http-password?[^\s]+/g, '\r\nhttp-password=');
        result = result.replace(/\shttp-password=?[^\s]+/g, '\r\nhttp-password=vlcrc');

        result = result.replace(/\s#extraintf?[^\s]+/g, '\r\nextraintf=');
        result = result.replace(/\sextraintf=?[^\s]+/g, '\r\nextraintf=http');

        fs.writeFile(configPath, result, 'utf8', async (error) => {
          if (error) {
            reject(error);
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
      });
      return true;
    }).catch(console.log);
  });
}

async function getMediaInfos() {
  try {
    const response = await axios.get(vlcServerURL, config);
    if (response && response.data) {
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
    console.log('Error reading vlc infos', err.code);
  }
}

export { configureVlc, listenVlc };
