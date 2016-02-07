/**
 * Collins Module
 * @module collins
 * @see module:collins
 */

'use strict';

// INFO: collins specific modules
const CollinsError = require('./CollinsError');
const Loader = require('../utils/Loader');

// INFO: common modules
const async = require('async');
// const Emitter = require('events');
const Emitter = require('eventemitter2');

class Collins extends Emitter.EventEmitter2 {
  constructor(config) {
    super({
      wildcard: true,
      delimiter: ':'
    });

    // TODO: check if config is valid
    this.config = Loader.validateConfig(config);
    this.services = [];
    this.Runtime = require('../utils/Runtime');
  }

  use(service_gear) {
    this.services.push(service_gear);
  }

  start() {

    // TODO: call the Loader
    async.series([
      Loader.init.bind(this),
      Loader.initConfig.bind(this),
      Loader.initServices.bind(this),
      Loader.connectServices.bind(this),
      Loader.initServiceCogs.bind(this),
      Loader.initActions.bind(this)
    ], (error, results) => {

      // INFO: we got an error from some init loader
      if (error) {
        this.emit('error:start', error);
      }
      // INFO: all the initializations have been completed
    });
  }
}

module.exports = Collins;