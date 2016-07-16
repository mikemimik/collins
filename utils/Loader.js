'use strict';
const CollinsError = require('../libs/CollinsError');
const Winston = require('winston');
const logOpts = require('./winston-collins');
const async = require('async');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class Loader {
  static init (next) {
    this.logger = new Winston.Logger({
      level: this.config.logLevel || 'debug',
      transports: logOpts.transports,
      filters: [ logOpts.filter.bind(this) ],
      levels: logOpts.config.levels,
      colors: logOpts.config.colors
    });

    this.logger.core(this.constructor.name, 'Core#start');
    next(null);
  }

  static initConfig (next) {

    // INFO: build system wide config object
    let configDir = path.join(__dirname, '..', 'configss');
    let masterConfig = {};
    fs.readdir(configDir, (err, files) => {
      if (err) {
        next(err);
      } else {

        // INFO: sort by split length, so gears get required before cogs
        files = _.sortBy(files, (f) => f.split('.').length);
        async.each(files, (file, done) => {
          if (file.split('.')[0] === 'index') {
            masterConfig.main = require(path.join(configDir, file));
          } else {

            // INFO: [service-gear-name, config, js], length === 3
            if (file.split('.').length === 3) {
              let serviceName = file.split('.')[0];
              if (!masterConfig.services) { masterConfig.services = {}; }
              masterConfig.services[serviceName] = require(path.join(configDir, file));
            } else {

              // INFO: [service-gear-name, cog-name, config, js], length === 4
              let serviceName = file.split('.')[0];
              let cogName = file.split('.')[1];
              if (!masterConfig.services[serviceName].cogs) {
                masterConfig.services[serviceName].cogs = {};
              }
              masterConfig
                .services[serviceName]
                .cogs[cogName] = require(path.join(configDir, file));
            }
          }
          done(null);
        }, (err) => {
          this.config = masterConfig;

          // INFO: if we received an error here, we have a broken config file
          if (err) { next(err); }

          // TODO: propogate main config into service configs
          let serviceList = _.keys(this.config.services);
          async.each(serviceList, (serviceItem, each_done) => {

            // TODO: rename `key` to `servItemKey`
            async.forEachOf(this.config.services[serviceItem], (value, key, eachOf_done) => {
              if (value === 'inherit') {
                if (key === 'username' || key === 'name') {
                  this.config
                    .services[serviceItem][key] = this.config.main.name;
                } else if (key === 'userAgent') {
                  this.config
                    .services[serviceItem][key] = this.config.main[key] + '-' + serviceItem;
                } else if (key === 'logger') {
                  this.config
                    .services[serviceItem][key] = this.logger;
                } else {
                  this.config
                    .services[serviceItem][key] = this.config.main[key];
                }
              }
              eachOf_done(null);
            }, (eachOf_err) => {

              // INFO: all service properties have been inherited
              each_done(null);
            }); // INFO: async.forEachof:done over properties
          }, (each_err) => {

            // INFO: all serviceConfigs have been processed for inheritance
            this.logger.core(this.constructor.name, 'Loader#initConfig');
            next(null);
          }); // INFO: async.each:done over serviceList
        }); // INFO: async.each:done over files; generate master config
      } // INFO: end of else
    });
  }

  static initServices(next) {
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
          let error = new CollinsError('FileReadError', data);
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

  static connectServices(next) {
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

  static initServiceCogs(next) {
    this.logger.core(this.constructor.name, 'Loader#initServiceCogs');
    next(null);
  }

  static initActions(next) {
    this.logger.core(this.constructor.name, 'Loader#initActions');
    next(null);
  }

  static validateConfig(config) {

    // INFO: must be a synchronous function
    // TODO: validate config file
    return config;
  }
}

module.exports = Loader;