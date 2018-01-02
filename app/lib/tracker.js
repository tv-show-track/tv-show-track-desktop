import { init as initScrobbler } from './scrobbler';
import { watchConf } from './listeners/configuration';
import {
  isConfigured as isVlcConfigured,
  trackVlc,
  untrackVLC
} from './listeners/vlc';
import { trackChromeCast, untrackChromeCast } from './listeners/chromecast';
// import { listenAppleTV } from './listeners/apple-tv';

const mediaPlayers = [];

export default async function () {
  watchConf();
  initScrobbler();

  const vlcConfigured = await isVlcConfigured();
  if (vlcConfigured) {
    mediaPlayers.push({
      name: 'vlc',
      track: trackVlc,
      untrack: untrackVLC
    });
  }

  mediaPlayers.push({
    name: 'chromecast',
    track: trackChromeCast,
    untrack: untrackChromeCast
  });

  for (const mediaPlayer of mediaPlayers) {
    mediaPlayer.track();
  }
}
