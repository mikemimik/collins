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
        files = _.sortBy(files, (f) => f.split('-').length);
        async.each(
          files,
          (file, done) => {
            if (file.split('.')[0] === 'index') {
              masterConfig.main = require(path.join(configDir, file));
            } else {
              if (file.split('-').length === 2) {
                let serviceName = file.split('-')[1].split('.')[0];
                if (!masterConfig.services) { masterConfig.services = {}; }
                masterConfig.services[serviceName] = require(path.join(configDir, file));
              } else {
                let serviceName = file.split('-')[1];
                let cogName = file.split('-')[2].split('.')[0];
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
            next(err);
          }
        );
      }
    });
  }

  static initServices(next) {
    console.log('>>', 'Loader', 'initServices', 'this:', this); // TESTING
    async.each(
      this.services,
      (Service, done) => {
        // console.log('>>', 'Loader', 'initServ', 'Service:', Service); // TESTING
        let regEx = /(?=[A-Z])/;
        let configFile = Service.name.split(regEx).map(x => x.toLowerCase()).join('-') + '.js';
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
      }
    );
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