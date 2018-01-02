import { ipcMain } from 'electron';

import {
  getTraktImages,
  matchTraktVideo
} from './trakt-tv';

import {
  setEpisodeAsWatched
} from './listeners';

let watchNotificationEvent;
let watchNewVideoEvent;
let watchProgressionEvent;
let currentTitle;
let currentMedia;
let currentProvider;

function init() {
  ipcMain.on('watch-progression', (event) => {
    watchProgressionEvent = event;
    currentMedia = null;
    currentTitle = null;
  });
  ipcMain.on('watch-current-video', (event) => {
    watchNewVideoEvent = event;
    currentMedia = null;
    currentTitle = null;
  });
  ipcMain.on('notification', (event) => {
    watchNotificationEvent = event;
  });
}

async function play(status) {
  const { position, provider } = status;
  let { title } = status;

  currentProvider = provider;

  console.log('play', status);

  if (title) {
    if (watchProgressionEvent && position) {
      watchProgressionEvent.sender.send('progression', { pc: position * 100 });
    }

    if (currentTitle !== title) {
      currentTitle = title;
      const video = await matchTraktVideo(title, position);
      console.log('video', video);

      if (video && video.show) {
        let images;

        const res = await Promise.race([
          getTraktImages(video),
          new Promise((resolve, reject) =>
            setTimeout(() => reject(new Error('timeout')), 2000)
          )
        ])
        .catch(e => { console.log('Error getting img', e); });

        if (res) {
          images = res;
        }

        currentMedia = { ...video, images, source: 'vlc' };
        console.log('currentMedia', currentMedia);
        if (watchNewVideoEvent) {
          watchNewVideoEvent.sender.send('new-current-video', currentMedia);
        }
        return currentMedia;
      }
    }

    if (currentMedia && currentMedia.episode && position > 0.80 && !currentMedia.viewed) {
      currentMedia.viewed = true;
      const episode = currentMedia.episode;
      const show = currentMedia.show;
      try {
        await setEpisodeAsWatched(episode, show);
        const twoDigits = nb => ((`0${nb}`).slice(-2));
        if (watchNotificationEvent) {
          watchNotificationEvent.sender.send('notification', {
            title: `${currentMedia.title} ${currentMedia.episode.season}x${twoDigits(currentMedia.episode.number)}`,
            body: 'Episode set as viewed!'
          });
        }
        currentMedia = null;
        return true;
      } catch (e) {
        currentMedia.viewed = false;
        console.log(e);
      }
    }
  } else {
    if (currentTitle) {
      stop();
    }
    currentTitle = null;
    title = null;
  }
}

function stop(provider) {
  if (watchNewVideoEvent && provider === currentProvider) {
    currentTitle = null;
    watchNewVideoEvent.sender.send('new-current-video', null);
  }
}

export { init, play, stop };
