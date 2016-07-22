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
        throw new CollinsError('InvalidInput', {
          details: 'no config path supplied'
        });
      }
    }
  }

  include (serviceGear) {
    switch (typeof serviceGear) {
      case 'string':

        // INFO: need to require package
        // 1) check name formatting 'collins-gearName'
        // 2) require package name (where will require look?)
        // 3) push required package into `this.services`
        break;
      case 'function':

        // INFO: package already required, just push to array
        this.services.push(serviceGear);
        break;
      default:

        // INFO: not a supported type, throw error
        throw new CollinsError('InvalidInput', {
          details: 'invalid function params'
        });
    }
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
