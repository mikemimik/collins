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
const Winston = require('winston');
const logOpts = require('../utils/winston-collins');

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

    // TODO: clean this up, I don't like how messy it looks
    this.logger = new Winston.Logger({
      level: this.config.logLevel || 'info',
      transports: logOpts.transports,
      filters: [ logOpts.filter.bind(this) ],
      levels: logOpts.config.levels,
      colors: logOpts.config.colors
    });
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
      this.logger.core('TESTING', this.constructor.name, 'finished start', results);
      // INFO: all the initializations have been completed
    });
  }
}

module.exports = Collins;