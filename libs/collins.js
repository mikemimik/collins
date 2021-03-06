/**
 * Collins Module
 * @module collins
 * @see module:collins
 */

'use strict';

// INFO: collins specific modules
const ServiceGearWrapper = require('./service-gear-wrapper');
const CollinsError = require('collins-error');
const LocalConfig = require('../configs');
const DataStore = require('collins-core-datastore');
const Helpers = require('../utils/helpers');
const Loader = require('../utils/loader');

// INFO: common modules
const Async = require('async');
const Emitter = require('eventemitter2').EventEmitter2;

class Collins extends Emitter {
  constructor (dirPath) {
    super({ wildcard: true, delimiter: ':' });
    this.logger = null;
    this.serviceMap = new Map();
    this.serviceMap.keyArray = function keyArray () {
      let r = [];
      for (let k of this.keys()) { r.push(k); }
      return r;
    };
    // INFO: create dataStore
    this.dataStore = new DataStore();
    // INFO: load custom formats for schema
    this.dataStore.loadFormats(LocalConfig.formats);
    // INFO: load schema
    this.dataStore.loadSchema(LocalConfig.schema);
    this.Runtime = require('../utils/Runtime');
    if (dirPath) {
      this.dataStore.setPath(dirPath);
    }
  }

  configure (dirPath) {
    // INFO: passing `dirPath` here overrides `dirPath` supplied to constructor
    if (dirPath) {
      this.dataStore.setPath(dirPath);
    } else {
      if (!this.dataStore.hasPath()) {
        throw new CollinsError('Missing:Config', {
          details: 'no config path supplied'
        });
      }
    }
    Async.series([
      Loader.init.bind(this),
      Loader.initConfigs.bind(this),
      Loader.initServices.bind(this)
    ], (err, results) => {
      if (err) {
        this.logger.error(this.constructor.name, err);
      }
      results.forEach((result) => {
        this.logger.verbose(this.constructor.name, 'core:configure', result);
      });
      this.emit('ready', this);
    });
    return this;
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

        // INFO: package already required, just set into map
        this.serviceMap.set(
          Helpers.reduceServiceName(serviceGear.name),
          new ServiceGearWrapper(serviceGear)
        );
        break;
      default:

        // INFO: not a supported type, throw error
        throw new CollinsError('Invalid:Input', {
          details: 'invalid function params'
        });
    }
  }

  start (callback) {
    this.logger.debug(this.constructor.name, 'Core#start', { from: 'core' });
    Async.series([
      Loader.connectServices.bind(this)
      // Loader.initServiceCogs.bind(this),
      // Loader.initActions.bind(this)
    ], (error, results) => {
      // INFO: we got an error from some init loader
      if (error) {
        this.logger.error(this.constructor.name, 'Core#start', error);
        this.emit('error:start', error);
      }
      results.forEach((result) => {
        if (result) {
          this.logger.verbose(this.constructor.name, 'Core#start', result);
        }
      });

      // INFO: all the initializations have been completed
      this.logger.debug(this.constructor.name, 'Core#start', 'complete', { from: 'core' });
      this.emit('started', this);
      if (callback && typeof callback === 'function') {
        callback(this);
      }
    });
  }
}

module.exports = Collins;
