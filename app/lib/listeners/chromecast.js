import { Client, DefaultMediaReceiver } from 'castv2-client';
import scanner from 'chromecast-scanner';
import { play, stop } from '../scrobbler';

function listenChromeCast() {
  scanner((err, service) => {
    if (service && service.data) {
      onDeviceUp(service.data);
    }
  });
}

function onDeviceUp(host) {
  const client = new Client();

  try {
    client.connect(host, () => {
      setInterval(() => {
        if (client) {
          getMediaInfos(client);
        }
      }, 1000);
    });
  } catch (e) {
    console.log(e);
  }
}

function getMediaInfos(client) {
  client.getSessions((err, sessions) => {
    if (sessions && sessions.length) {
      const session = sessions[0];
      client.join(session, DefaultMediaReceiver, (e, app) => {
        app.getStatus((er, status) => {
          console.log('status', status);
          if (
            status &&
            status.media &&
            status.media.duration &&
            status.media.metadata &&
            status.media.metadata.title &&
            status.currentTime
          ) {
            const position = status.currentTime / status.media.duration;
            const title = status.media.metadata.title;
            play({ provider: 'chromecast', title, position });
          } else {
            stop('chromecast');
          }
        });
      });
    }
  });
}

export { listenChromeCast }
