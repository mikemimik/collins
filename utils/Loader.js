'use strict';
const CollinsError = require('../libs/CollinsError');
const async = require('async');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class Loader {
  static init(next) {
    next(null);
  }

  static initConfig(next) {

    // INFO: build system wide config object
    let configDir = path.join(__dirname, '..', 'configs');
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
            if (file.split('.').length === 3) {
              let serviceName = file.split('.')[0];
              if (!masterConfig.services) { masterConfig.services = {}; }
              masterConfig.services[serviceName] = require(path.join(configDir, file));
            } else {
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
          let serviceConfigKeys = _.keys(this.config.services);
          async.each(serviceConfigKeys, (serviceConfigKey, each_done) => {
            async.forEachOf(this.config.services[serviceConfigKey], (value, key, eachOf_done) => {
              if (value === 'inherit') {
                if (key === 'username' || key === 'name') {
                  this.config
                    .services[serviceConfigKey][key] = this.config.main.name;
                } else {
                  this.config
                    .services[serviceConfigKey][key] = this.config.main[key];
                }
              }
              eachOf_done(null);
            }, (eachOf_err) => {

              // INFO: all service properties have been inherited
              each_done(null);
            }); // INFO: async.forEachof:done over properties
          }, (each_err) => {

            // INFO: all serviceConfigs have been processed for inheritance
            next(null);
          }); // INFO: async.each:done over serviceConfigs
        }); // INFO: async.each:done over files
      } // INFO: end of else
    });
  }

  static initServices(next) {
    console.log('>>', 'Loader', 'initServices', 'this:', this); // TESTING
    console.log('>>', 'TESTING', 'lenght', this.services.length);
    console.log('>>', 'TESTING', 'object', this.services);
    if (this.services.length === 0) {

      // INFO: there are no services attached
      // TODO: control flow: is passing an error correct?
      // TODO: handle this error somewhere
      let error = new CollinsError('ServiceError', { details: 'No services attached.' });
      next(error);
    } else {
      async.each(this.services, (Service, done) => {
        // console.log('>>', 'Loader', 'initServ', 'Service:', Service); // TESTING
        let regEx = /(?=[A-Z])/;
        let configFile = Service.name
          .split(regEx)
          .map(x => x.toLowerCase())
          .filter(n => n !== 'collins')
          .join('.') + '.config.js';
        configFile = path.join(__dirname, '..', 'configs', configFile);
        fs.stat(configFile, (err, stats) => {
          if (err) {
            let data = { details: 'Could not find config file for service.' };
            let error = new CollinsError('FileReadError', data);
            done(error);
          } else {
            const serviceConfig = require(configFile);
            let service = new Service(serviceConfig);
            this.services[this.services.indexOf(Service)] = service;
            service.init((err) => {
              done(err);
            });
          }
        });
      }, (err) => {
        next(err);
      });
    }
  }

  static connectServices(next) {
    async.each(
      this.services,
      (service, done) => {
        service.connect((err) => {
          done(err);
        });
      }, (err) => {
        next(err);
      }
    );
  }

  static initServiceCogs(next) {
    next(null);
  }

  static initActions(next) {
    next(null);
  }

  static validateConfig(config) {

    // TODO: validate config file
    return config;
  }
}

module.exports = Loader;