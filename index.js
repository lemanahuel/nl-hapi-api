const config = require('./config/config');
const Hapi = require('hapi');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const Mustache = require('mustache');
const db = require('./integrations/mongodb');

db.connect();

const server = Hapi.server({
  port: config.PORT,
  // host: 'localhost',
  // debug: { request: ['error'] }
});

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
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
  await server.register(require('inert'));
  await server.register(require('vision'));

  if (process.argv.NODE_ENV !== 'production') {
    await server.register({
      plugin: require('good'),
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
          }, {
            module: 'good-console'
          }, 'stdout']
        }
      },
    });
  }

  server.views({
    engines: {
      html: {
        compile: template => {
          // Mustache.parse(template)
          return context => {
            return Mustache.render(template, context);
          };
        }
      }
    },
    relativeTo: __dirname,
    path: '.'
  });

  await new Promise((resolve, reject) => {
    glob('./modules/**/*.routes.js', {}, (err, files) => {
      async.each(files, (file, cb) => {
        require(path.resolve(file))(server);
        cb(null);
      }, resolve);
    })
  });

  server.route({
    method: 'GET',
    path: '/static',
    handler: (request, h) => {
      return h.file('public/static.html');
    }
  });
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.redirect('/docs');
    }
  });
  server.route({
    method: 'GET',
    path: '/docs',
    handler: (request, h) => {
      return h.view('public/docs.html', {
        app: {
          title: 'Probando templates en HAPI y MUSTACHE con VISION'
        },
        endpoints: _.map(server.table(), item => {
          return {
            method: item.method,
            path: item.path,
          };
        })
      });
    },
    options: {
      cache: {
        expiresIn: 1,
        privacy: 'private'
      }
    }
  });

  await server.start();
  console.log(`HAPI-API server started on ${server.info.uri}`);
})();