/**
 * Collins Module
 * @module collins
 * @see module:collins
 */

'use strict';

// INFO: collins specific modules
const CollinsError = require('./CollinsError');
const Loader = require('../utils/Loader');
const Configuration = require('./Configuration');

// INFO: common modules
const async = require('async');
const Emitter = require('eventemitter2').EventEmitter2;

class Collins extends Emitter {
  constructor (dirPath) {
    super({
      wildcard: true,
      delimiter: ':'
    });

    // TODO: check if config is valid
    this.services = [];
    this.configuration = new Configuration();
    this.Runtime = require('../utils/Runtime');
    if (dirPath) {
      this.configuration.setPath(dirPath);
    }
  }

  configure (dirPath) {
    if (dirPath) {
      this.configuration.setPath(dirPath);
      this.configuration.configure.bind(this);
    } else {
      if (!this.configuration.path) {
        throw new CollinsError('error:config', {
          details: 'no config path suppled'
        });
      }
    }
  }

  include (service_gear) {
    this.services.push(service_gear);
  }

  start (callback) {
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
        this.logger.error(this.constructor.name, 'Core#start', error);
        this.emit('error:start', error);
      }
      results.forEach((result) => {
        if (result) {
          this.logger.info(this.constructor.name, 'Core#start', result);
        }
      });

      // INFO: all the initializations have been completed
      this.logger.core(this.constructor.name, 'Core#start', 'complete');
      if (callback && typeof callback === 'function') {
        callback(this);
      }
    });
  }
}

module.exports = Collins;
