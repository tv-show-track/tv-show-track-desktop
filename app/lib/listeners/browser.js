import hoxy from 'hoxy';

const proxy = hoxy.createServer().listen(9999);
proxy.intercept({

  // intercept during the response phase
  phase: 'response',

  // only intercept html pages
  mimeType: 'text/html',

  // expose the response body as a cheerio object
  // (cheerio is a jQuery clone)
  as: '$'
}, (req, resp) => {
  console.log('request made to: ', req.headers, req.url, req.method);
  resp.$('title').text('Unicorns!');
  console.log('video tag', resp.$('iframe').length);

  if (resp.$('iframe').length) {
    resp.$('iframe').each((i, el) => {
      console.log('iframe', i, el.attribs.src);
      console.log('video length', el);
    });
  }
});

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
