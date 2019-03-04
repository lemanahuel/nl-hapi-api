const config = require('./config/config');
const Hapi = require('hapi');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const db = require('./integrations/mongodb');

db.connect();

const server = Hapi.server({
  port: config.PORT,
  host: 'localhost',
  // debug: { request: ['error'] }
});

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});

// server.log(['error', 'database', 'read']);
server.events.on('response', request => {
  console.log(request.method.toUpperCase() + ' ' + request.raw.req.url + ' --> ' + request.response.statusCode);
});
server.events.on('log', (event, tags) => {
  if (tags.error) {
    console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
  }
});

(async function init() {
  await server.register({
    plugin: require('hapi-cors'),
    options: {
      methods: ['POST, GET, PUT, DELETE, OPTIONS'],
      origins: ['*'],
      // origins: config.DOMAINS_WHITE_LIST
    }
  });

  await new Promise((resolve, reject) => {
    glob('./modules/**/*.routes.js', {}, (err, files) => {
      async.each(files, (file, cb) => {
        require(path.resolve(file))(server);
        cb(null);
      }, resolve);
    })
  });

  await server.start();
  console.log(`KOA-API server started on ${server.info.uri}`);
})();