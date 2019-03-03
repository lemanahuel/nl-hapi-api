const config = require('../config/config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = class DB {

  static connect() {
    return mongoose.connect(config.MONGODB_URI, {
      promiseLibrary: global.Promise,
      useNewUrlParser: true
    });
  }

}