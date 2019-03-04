const _ = require('lodash');
const Boom = require('boom');
const config = require('./config/config');

module.exports = {
  isValidDomain: (request, h) => {
    if (_.indexOf(config.DOMAINS_WHITE_LIST, request.url.origin) > -1) {
      return true;
    }
    return Boom.badRequest('err-invalid-origin-domain', { origin: request.url.origin });
  }
};