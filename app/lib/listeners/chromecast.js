import { Client, DefaultMediaReceiver } from 'castv2-client';
import scanner from 'chromecast-scanner';
import _ from 'lodash';
import { play, stop } from '../scrobbler';

let pollInterval;
let tracking = false;

function track() {
  tracking = true;
  scanner((err, service) => {
    if (service && service.data && tracking) {
      onDeviceUp(service.data);
    }
  });
}

function untrack() {
  tracking = false;
  if (pollInterval) {
    clearInterval(pollInterval);
  }
}

function onDeviceUp(host) {
  const client = new Client();

  try {
    client.on('error', err => {
      console.log('Chromecast client error', err);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      track();
    });
    client.connect(host, () => {
      pollInterval = setInterval(() => {
        if (client) {
          getMediaInfos(client);
        } else {
          stop('chromecast');
        }
      }, 1000);
    });
  } catch (e) {
    console.log(e);
  }
}

function getMediaInfos(client) {
  try {
    client.getSessions((err, sessions) => {
      if (sessions && sessions.length) {
        const session = sessions[0];
        client.join(session, DefaultMediaReceiver, (e, app) => {
          app.getStatus((er, status) => {
            let position;
            let title;

            if (session.displayName.indexOf('Videostream') > -1) {
              title = _.get(status, 'media.customData.title');
              position = _.get(status, 'currentTime', 0) / _.get(status, 'media.customData.duration', 0);
            } else {
              title = _.get(status, 'media.metadata.title');
              position = _.get(status, 'currentTime', 0) / _.get(status, 'media.duration', 0);
            }

            if (title && position) {
              play({ provider: 'chromecast', title, position });
            } else {
              stop('chromecast');
            }
          });
        });
      } else {
        stop('chromecast');
      }
    });
  } catch (e) {
    console.log('Error getting session or during joining it', e);
  }
}

export {
  track as trackChromeCast,
  untrack as untrackChromeCast
};
