'use strict';
const CollinsError = require('../libs/CollinsError');
const Config = require('../configs');
const async = require('async');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class Loader {
  static init (next) {
    this.logger = new Config.logger.Init({
      level: this.config.logLevel,
      transports: Config.logger.transports,
      filters: [ Config.logger.filter.bind(this) ],
      levels: Config.logger.logLevels.core,
      colors: Config.logger.logColors
    });

    this.logger.core(this.constructor.name, 'Core#start');
    next(null);
  }

  static initConfig (next) {

    // 1) read directory
    fs.readdir(this.configuration.path, (err, files) => {
      if (err) {
        next(err);
      } else {

        // 2) sort directory list of files
        // 2.1) ignore unknown files (eg. not .js, or correct naming convention)
        files = _.chain(files)

          // INFO: filter out any non .js files
          .filter(f => f.split('.')[f.split('.').length-1] === 'js')
          // INFO: sort by service gear
          .sortBy(f => f.split('.')[0])
          // INFO: sort by cog
          .sortBy(f => f.split('.').length)
          .value(); // INFO: pull value from chaining function

        // 3) validate core (index.js) config
        // INFO: check for index.js
        if (_.find(files, v => v === 'index.js') === -1) {
          let noConfigError = new CollinsError('Missing:Config', {
            details: 'no index config supplied'
          });
          next(noConfigError);
        } else {
          let configFile = require(path.join(this.configuration.path, 'index.js'));
          this.configuration.configObj.load(configFile);

          // INFO: check if config file is valid
          try { this.configuration.configObj.validate(); }
          catch (e) {

            // INFO: catch error when config invalid
            let validationError = CollinsError.convert('error:loader:initconfig', e);
            next(validationError);
          }

          // 4) compare list of conif files against modules included in instance
          // INFO: remove index.js (already processed)
          files = _.pull(files, 'index.js');
          let serviceList = this.services.map(s => return s.name);
          let configNameList = _.chain(files)
            .map(file => file.split('.')[0])
            .uniq()
            .value();
          let missingConfigs = _.difference(serviceList, configNameList);
          if (missingConfigs.length) {

            // INFO: missing configs, throw error
            let noConfigError = new CollinsError('Missing:Config', {
              details: 'missing config for the following services: ' + missingConfigs
            });
            next(noConfigError);
          } else {

            // INFO: not missing configs, continue
            this.configuration.files = files;
            next(null);
          }
        }
      }
    });
  }

  static initServices (next) {
    this.logger.core(this.constructor.name, 'Loader#initServices');
    async.each(this.services, (Service, done) => {
      let regEx = /(?=[A-Z])/;
      let configFile = Service.name
        .split(regEx)
        .map(x => x.toLowerCase())
        .filter(n => n !== 'collins')
        .join() + '.config.js';
      configFile = path.join(__dirname, '..', 'configs', configFile);
      fs.stat(configFile, (err, stats) => {
        if (err) {
          let data = { details: 'Could not find config file for service.' };
          let error = new CollinsError('Invalid:File', data);
          done(error);
        } else {

          // INFO: I have no idea how this works. Where is the inheritance?
          // INFO: object referencing? Is that how this works?
          const serviceConfig = require(configFile);
          // console.log('serviceConfig:', serviceConfig); // TESTING
          let service = new Service(serviceConfig);
          this.services[this.services.indexOf(Service)] = service;
          service.init((err) => {
            /**
             * err:
             *  - `null`: everything is fine
             *  - `error`: service failed to initialize
             */
            done(err);
          });
        }
      });
    }, (err) => {
      this.logger.core(this.constructor.name, 'Loader#initServices', 'complete');
      next(err);
    });
  }

  static connectServices (next) {
    this.logger.core(this.constructor.name, 'Loader#connectServices');
    async.each(this.services, (service, done) => {
      service.connect((err) => {
        done(err);
      });
    }, (err) => {
      if (err) {
        this.logger.error(this.constructor.name, 'Loader#connectServices', err);
      }
      this.logger.core(this.constructor.name, 'Loader#connectServices', 'complete');
      next(err);
    });
  }

  static initServiceCogs (next) {
    this.logger.core(this.constructor.name, 'Loader#initServiceCogs');
    next(null);
  }

  static initActions (next) {
    this.logger.core(this.constructor.name, 'Loader#initActions');
    next(null);
  }

  static validateConfig (config) {


    // TODO: validate config file
    let name = config.name;
    let userAgent = config.userAgent;
    let logLevel = config.logLevel;
    let errorObj = {
      type: 'Invalid:Input',
      reasons: []
    };

    // TODO: validate name prop
    if (name === null || name === undefined) {
      /* emit error */
      errorObj.reasons.push('config.name: missing');
    } else {
     if (hasSpaces(name)) {
       errorObj.reasons.push('config.name: no spaces allowed');
     }
    }

    // TODO: validate userAgent prop
    if (userAgent === null || userAgent === undefined) {
      /* emit error */
      errorObj.reasons.push('config.userAgent missing');
    } else {
      if (hasSpaces(userAgent)) {
        errorObj.reasons.push('config.userAgent: no spaces allowed');
      }
    }

    // TODO: validate logLevel prop
    if (logLevel === null || logLevel === undefined) {
      /* emit error */
      errorObj.reasons.push('config.logLevel missing');
    }
    if (errorObj.reasons.length > 0) {
      /* emit error */
      throw new CollinsError(errorObj.type, errorObj);
    } else {
      return config;
    }

    function hasSpaces (prop) {
      if (prop.split(' ').length > 1) {
        return true
      } else {
        return false;
      }
    }
  }
}

module.exports = Loader;
