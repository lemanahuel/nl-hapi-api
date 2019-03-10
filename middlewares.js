const _ = require('lodash');
const Boom = require('boom');
const config = require('./config/config');

module.exports = {
  isValidDomain: (req, h) => {
    if (_.includes(config.DOMAINS_WHITE_LIST, req.url.origin)) {
      return true;
    }
    return Boom.badRequest({ origin: req.url.origin });
  }
};