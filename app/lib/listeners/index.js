import * as _ from 'lodash';
import Database from '../database';
import {
  isTraktConnected,
  getHistory,
  setEpisodeAsWatched as setTracktEpisodeAsWatched,
  matchTraktVideo
} from '../trakt-tv';

async function setEpisodeAsWatched(episode) {
  const localEpisodeObj = {
    tvdb: episode.ids.tvdb,
    imdb: episode.ids.imdb,
    title: episode.title,
    season: episode.season,
    number: episode.number
  };

  if (global.isOnline) {
    return setEpisodeAsWatchedOn3Parties(localEpisodeObj);
  }

  return Database.setEpisodeAsWatched(localEpisodeObj);
}

async function setEpisodeAsWatchedOn3Parties(episode) {
  const traktConnected = await isTraktConnected();

  const episodeUpdated = episode;
  let res;
  if (traktConnected) {
    res = await setTracktEpisodeAsWatched(episode);
    console.log('setEpisodeAsWatchedOn3Parties trakt', episode, res)
    episodeUpdated.syncProvider = 'trakt';
  }

  return Database.setEpisodeAsWatched(episodeUpdated);
}

async function syncWatchedEpisodes(provider) {
  if (!global.isOnline) {
    return;
  }

  // providers to local
  await syncFrom3PartiesToLocal(provider);

  // local to providers
  await syncFromLocalTo3Parties(provider);
}

async function syncFromLocalTo3Parties(provider) {
  const nonSyncedEpisodes = await Database.getWatchedNotSynced(provider);
  console.log('nonSyncedEpisodes', nonSyncedEpisodes);
  for (const nonSyncedEpisode of nonSyncedEpisodes) {
    setEpisodeAsWatchedOn3Parties(nonSyncedEpisode)
  }
}

async function syncFrom3PartiesToLocal(provider) {
  const watchedEpisodes = [];

  if (provider === 'trakt') {
    const watchedItems = await getHistory();

    for (const watchedItem of watchedItems) {
      watchedEpisodes.push({
        tvdb: _.get(watchedItem, 'episode.ids.tvdb').toString(),
        imdb: _.get(watchedItem, 'episode.ids.imdb'),
        season: _.get(watchedItem, 'episode.season'),
        episode: _.get(watchedItem, 'episode.number'),
        title: _.get(watchedItem, 'episode.title'),
        date: watchedItem.watched_at,
        type: 'episode',
        syncProvider: 'trakt'
      });
    }
  }

  if (watchedEpisodes.length) {
    Database.setEpisodesAsWatched(watchedEpisodes);
  }
}

export { setEpisodeAsWatched, syncWatchedEpisodes };
