// import CDP from 'chrome-remote-interface';
//
//
// export function init() {
//   console.log('init')
//   CDP((client) => {
//     console.log('client', client)
//     // extract domains
//     const { Network, Page } = client;
//     // setup handlers
//     Network.requestWillBeSent((params) => {
//       console.log(params.request.url);
//     });
//     Page.loadEventFired(() => {
//       client.close();
//     });
//     // enable events then start!
//     Promise.all([
//       Network.enable(),
//       Page.enable()
//     ]).then(() => {
//       return Page.navigate({url: 'https://github.com'});
//     }).catch((err) => {
//       console.error(err);
//       client.close();
//     });
//   }).on('error', (err) => {
//     // cannot connect to the remote endpoint
//     console.error(err);
//   });
// }
