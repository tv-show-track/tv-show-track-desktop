import { clipboard, ipcMain, shell } from 'electron';
import Trakt from 'trakt.tv';
import TraktMatcher from 'trakt.tv-matcher';
import TraktImages from 'trakt.tv-images';
import _ from 'lodash';

import { listenVlc } from './listeners/vlc';
import Database from './database';
import { setAsConfigured } from './listeners/configuration';

const options = {
  client_id: '9868cafad65649b03fe962f9eabf2ccb92ef6b0ed220f6862412d94ecdf231b0',
  client_secret: 'ac6fba6cbc33befbb907711d5af20e95c39e8ba0dd63f999c2ff17de75f45722',
  plugins: {
    matcher: TraktMatcher,
    images: TraktImages,
  },
  options: {
    images: {
      tvdbApiKey: '2566B8501D53F2B8',
      fanartApiKey: '4ba5317680ccbc081c1d351eec057583',
      tmdbApiKey: 'eb245f8784a98c4f2fcba7ffa5c01af7',
    },
  },
};

const trakt = new Trakt(options);

ipcMain.on('is-trakt-connected', isTraktConnected);
ipcMain.on('connect-trakt', connectTrakt);
ipcMain.on('disconnect-trakt', disconnectTrakt);
ipcMain.on('get-calendar', getCalendar);

function setTraktVideoAsViewed(video) {
  const post = {};
  const item = { ids: { tvdb: video.episode.ids.tvdb } };
  post.episodes = [item];

  return trakt.sync.history.add(post);
}

function connectTrakt(event) {
  authTrakt(event)
    .then(setAsConfigured)
    .then(listenVlc)
    .catch(console.error);
}

async function disconnectTrakt(event) {
  await Database.deleteSetting({
    key: 'authTraktTv'
  });
  await Database.deleteSetting({
    key: 'isConfigured'
  });

  event.sender.send('trakt-disconnected');
}

async function isTraktConnected(event) {
  const res = await Database.getSetting({
    key: 'authTraktTv'
  });
  const isConnected = res && res.value;

  console.log('isConnected', isConnected);

  if (isConnected) {
    event.sender.send('trakt-connected');
  }

  return isConnected;
}

async function getCalendar(event) {
  await reAuthTrakt();
  const history = await trakt.sync.history.get();
  const filteredRes = _.uniqBy(history, e => e.show && e.show.ids.trakt);
  for (const e of filteredRes) {
    if (e && e.show) {
      e.progress = await trakt.shows.progress.watched({ id: e.show.ids.trakt });
    }
  }
  let res = _.filter(filteredRes, { action: 'watch' });
  res = _.map(res, e => ({
    episode: e.progress.next_episode,
    show: e.show,
  }));

  event.sender.send('calendar', res);
}

function reAuthTrakt() {
  return Database.getSetting({
    key: 'authTraktTv'
  }).then(res => {
    if (res && res.value && res.value.access_token) {
      return trakt.import_token(res.value);
    }

    return false;
  });
}

function authTrakt(event) {
  return new Promise((resolve, reject) => {
    trakt.get_codes()
      .then(poll => {
        event.sender.send('trakt-connecting', poll);
        clipboard.writeText(poll.user_code);
        // shell.openExternal(poll.verification_url);
        return trakt.poll_access(poll)
          .then(auth => (
            Database.writeSetting({
              key: 'authTraktTv',
              value: auth
            }).then(() => {
              resolve(auth);
              if (event) {
                event.sender.send('trakt-connected');
              }
              return false;
            })
          ));
      }, reject)
      .catch(reject);
  })
  .then(auth => (trakt.import_token(auth)))
  .catch(console.log);
}

function matchTraktVideo(videoName) {
  return trakt.matcher.match({
    filename: videoName
  });
}

function getTraktImages(video) {
  const request = video;
  request.title = video.show.title;
  request.type = 'show';
  request.imdb_id = video.show.ids.imdb;
  request.tvdb_id = video.show.ids.tvdb;
  return trakt.images.get(request);
}

export {
  authTrakt,
  getTraktImages,
  matchTraktVideo,
  setTraktVideoAsViewed
};
