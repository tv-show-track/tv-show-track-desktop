import AirPlay from 'airplay-protocol';
import Bonjour from 'bonjour';
// import airplay from 'airplay-js';

const bonjour = new Bonjour();

function listenAppleTV() {
  console.log('listenAppleTV');
  const browser = bonjour.find({ type: 'airplay' }, tv => {
    browser.stop();
    const airplay = new AirPlay(tv.host, tv.port);
    console.log('airplay.state', airplay.state);
    airplay.serverInfo((err, res, body) => {
      if (err) throw err;
      console.log('Server info:', body);
    });
    airplay.on('event', (event) => {
      console.log('event', event);
    });
    // airplay.play('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', function (err) {
    //   if (err) throw err;
    //
    //   airplay.playbackInfo((err, res, body) => {
    //     if (err) throw err;
    //     console.log('Playback info:', body);
    //   });
    // });
  });
}

// function listenAppleTV() {
//   console.log('listenAppleTV');
//   const browser = airplay.createBrowser();
//   const devices = browser.getDevices();
//   console.log('devices', devices);
//   browser.on('deviceOn', device => {
//     console.log('device on', device);
//     setInterval(() => {
//       console.log('getInfo', device.getInfo());
//       device.status((a, b) => {
//         console.log('ab', a, b);
//       });
//     }, 1000);
//   });
//   browser.start();
// }

export { listenAppleTV };
