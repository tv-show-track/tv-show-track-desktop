import { clipboard, ipcMain } from 'electron';
import Trakt from 'trakt.tv';
import TraktMatcher from 'trakt.tv-matcher';
import TraktImages from 'trakt.tv-images';
import _ from 'lodash';
import moment from 'moment';

import { syncWatchedEpisodes } from './listeners';
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
ipcMain.on('set-as-viewed', setAsViewed);

async function setAsViewed(event, ids) {
  const post = {};
  const item = { ids };
  post.episodes = [item];

  await trakt.sync.history.add(post);

  event.sender.send('setted-as-viewed');
}

function setEpisodeAsWatched(episode) {
  const post = {};
  const item = { ids: { tvdb: episode.tvdb } };
  post.episodes = [item];

  return trakt.sync.history.add(post);
}

async function getHistory(startedAt) {
  // const sixMonthAgo = moment().subtract(6, 'months');
  const history = await trakt.sync.history.get({ type: 'episodes', limit: 100 });

  const uniqHistory = _.uniqBy(history, e => e.episode && e.episode.ids.trakt);
  return uniqHistory;
}

async function connectTrakt(event) {
  try {
    const auth = await authTrakt(event);
    await setAsConfigured(auth);
  } catch (e) {
    const errMsg = 'Trakt.tv api is actually unreachable or encounter an issue so please retry later.';
    event.sender.send('connect-trakt-error', errMsg);
  }
  listenVlc();
}

async function disconnectTrakt(event) {
  await Database.deleteSetting({
    key: 'authTraktTv'
  });
  await Database.deleteSetting({
    key: 'isConfigured'
  });

  await Database.deleteSetting({
    key: 'authTraktTv'
  });

  event.sender.send('trakt-disconnected');
}

async function isTraktConnected(event) {
  const res = await Database.getSetting({
    key: 'authTraktTv'
  });
  const isConnected = res && res.value;

  if (event && isConnected) {
    event.sender.send('trakt-connected');
  }

  return isConnected;
}

async function getCalendar(event) {
  try {
    await reAuthTrakt();
    const history = await trakt.sync.history.get({ type: 'shows', limit: 1000 });

    const uniqHistory = _.uniqBy(history, e => e.show && e.show.ids.trakt);

    let nextEpisodes = await Promise.all(uniqHistory.map(async watch => {
      const progress = await trakt.shows.progress.watched({ id: watch.show.ids.trakt });

      if (progress && progress.next_episode) {
        const result = progress.next_episode;
        result.show = watch.show;
        return result;
      }
    }));

    nextEpisodes = nextEpisodes.filter(el => el);

    event.sender.send('calendar', nextEpisodes);
  } catch (err) {
    console.log('error getting calendar', err);
  }
}

function reAuthTrakt() {
  return Database.getSetting({
    key: 'authTraktTv'
  }).then(res => {
    if (res && res.value && res.value.access_token) {
      return trakt.import_token(res.value)
        .then(() => (onReady()));
    }

    return false;
  }).catch(e => {
    console.log('error re-authenticating trakt.tv', e);
  });
}

async function authTrakt(event) {
  try {
    const poll = await Promise.race([
      trakt.get_codes(),
      new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
    ]);
    if (poll) {
      event.sender.send('trakt-connecting', poll);
      clipboard.writeText(poll.user_code);

      const auth = await trakt.poll_access(poll);

      onReady(true);

      if (auth && event) {
        await Database.writeSetting({
          key: 'authTraktTv',
          value: auth
        });
        event.sender.send('trakt-connected');
        return auth;
      }
    }
  } catch (err) {
    const errMsg = 'Trakt.tv api is actually unreachable or encounter an issue so please retry later.';
    event.sender.send('connect-trakt-error', errMsg);
  }
}

function onReady() {
  syncWatchedEpisodes('trakt');
}

async function matchTraktVideo(videoName) {
  const video = await trakt.matcher.match({
    filename: videoName
  });
  return video;
}

async function getTraktImages(video) {
  const request = video;
  request.title = video.show.title;
  request.type = 'show';
  request.imdb_id = video.show.ids.imdb;
  request.tvdb_id = video.show.ids.tvdb;
  const images = await trakt.images.get(request);

  return images;
}

export {
  isTraktConnected,
  authTrakt,
  getTraktImages,
  matchTraktVideo,
  setEpisodeAsWatched,
  getHistory
};
