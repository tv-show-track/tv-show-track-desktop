import fs from 'fs';
import os from 'os';
import axios from 'axios';
import xml2js from 'xml2js';
import * as _ from 'lodash';
import { ipcMain } from 'electron';
import notifier from 'node-notifier';

import {
  getTraktImages,
  matchTraktVideo,
  setTraktVideoAsViewed
} from '../trakt-tv';


const vlcServerURL = 'http://localhost:8888/requests/status.xml';
const config = {
  auth: {
    password: 'vlcrc'
  }
};

let currentVideoName;
let currentVideo;
let progression;
let watchNewVideoEvent;
let watchProgressionEvent;
let cancelIntervalInfos;

ipcMain.on('watch-current-video', (event) => {
  console.log('watch-current-video');
  currentVideo = null;
  currentVideoName = null;
  watchNewVideoEvent = event;
  listenVlc();
});

ipcMain.on('watch-progression', (event) => {
  progression = null;
  currentVideoName = null;
  watchProgressionEvent = event;
  listenVlc();
});

function listenVlc() {
  if (cancelIntervalInfos) {
    clearInterval(cancelIntervalInfos);
  }
  cancelIntervalInfos = setInterval(getInfos, 1000);
}

function configureVlc() {
  let configPath;

  switch (os.platform()) {
    default:
    case 'darwin':
      configPath = `${process.env.HOME}/Library/Preferences/org.videolan.vlc/vlcrc`;
      break;
  }

  return new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }

      let result = data.replace(/\s#http-port?[^\s]+/g, '\r\nhttp-port=');
      result = result.replace(/\shttp-port=?[^\s]+/g, '\r\nhttp-port=8888');

      result = result.replace(/\s#http-password?[^\s]+/g, '\r\nhttp-password=');
      result = result.replace(/\shttp-password=?[^\s]+/g, '\r\nhttp-password=vlcrc');

      result = result.replace(/\s#extraintf?[^\s]+/g, '\r\nextraintf=');
      result = result.replace(/\sextraintf=?[^\s]+/g, '\r\nextraintf=http');

      fs.writeFile(configPath, result, 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });
}

function getInfos() {
  return axios.get(vlcServerURL, config)
    .then(response => {
      xml2js.parseString(response.data, (err, result) => {
        let infos = _.get(result, 'root.information[0].category[0].info');
        const filenameFinder = _.find(infos, n => n.$.name === 'filename');

        let videoName = _.get(filenameFinder, '_');
        const position = _.get(result, 'root.position[0]');

        if (videoName) {
          if (
            watchProgressionEvent &&
            (!progression || (progression && progression.pc !== position * 100))
          ) {
            watchProgressionEvent.sender.send('progression', { pc: position * 100 });
          }

          if (currentVideoName !== videoName) {
            currentVideoName = videoName;
            matchTraktVideo(videoName, position)
              .then(video => (
                getTraktImages(video)
                  .then(images => {
                    currentVideo = { ...video, images, source: 'vlc' };
                    if (watchNewVideoEvent) {
                      watchNewVideoEvent.sender.send('new-current-video', currentVideo);
                    }
                    return currentVideo;
                  })
              ))
              .catch(console.error);
          }

          if (currentVideo && position > 0.80 && !currentVideo.viewed) {
            setTraktVideoAsViewed(currentVideo)
              .then(() => {
                currentVideo.viewed = true;
                notifier.notify({
                  message: `${currentVideo.title} has been set as viewed on trakt.tv!`,
                  sound: true,
                });
                currentVideo = null;
              });
          }
        } else {
          if (currentVideoName) {
            watchNewVideoEvent.sender.send('new-current-video', null);
          }
          currentVideoName = null;
          videoName = null;
        }
      });
    })
    .catch(console.log);
}

export { configureVlc, listenVlc };
