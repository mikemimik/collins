'use strict';

const CollinsError = require('collins-error');
const Helpers = require('./helpers');
const CoreHelper = require('collins-core-helper');
const Async = require('async');
const Path = require('path');
const Fs = require('fs');
const _ = require('lodash');

class Loader {

  /**
   * @static
   * @desc init function reads the current path given to the configuration
   *       object, then it filters non `.js` files from the array of file
   *       names. The function will then check to see if the `index.js` file
   *       is present in the array of filenames; if it's _not_ present then
   *       an error is thrown. If the file is present then that file is
   *       `required` and loaded into the `configObj` which is present on
   *       the configuration object. `validate()` is then called on that
   *       config file. If no errors are thrown, the `logger` is then
   *       configured and the `next` callback function is then called
   *       with `null`.
   * @summary core config validation and logger initialization
   * @param {Function} next Callback function
   */
  static init (next) {
    Fs.readdir(this.configuration.path, (err, files) => {
      if (err) {
        let readError = CollinsError.convert('Missing:File', err);
        next(readError);
      } else {
        // INFO: filter out unusable files
        // INFO: broke up line below for readbility
        this.configuration.files = _.filter(
          files,
          f => f.split('.')[f.split('.').length - 1] === 'js'
        );
        let filePresent = _.find(this.configuration.files, f => f === 'index.js');
        if (!filePresent) {
          // INFO: 'index.js' was not found, throw error
          let noConfigError = new CollinsError('Missing:Config', {
            details: `no index.js config path: ${this.configuration.path}`
          });
          next(noConfigError);
        } else {
          let configFile = require(Path.join(this.configuration.path, 'index.js'));
          this.configuration.configObj.load(configFile);
          let validationError = null;
          try {
            this.configuration.configObj.validate();
          } catch (e) {
            validationError = CollinsError.convert('Invalid:Config', e);
          }
          this.logger = CoreHelper.getLogger(this.configuration.configObj.get('logLevel'), 'core');
          this.logger.debug(this.constructor.name, 'Loader#init', 'complete', { from: 'core' });
          next(validationError);
        }
      }
    });
  }

  /**
   * @static
   * @desc initConfigs function sorts the filenames listed in the
   *       `this.configuration.files` array property. The function then
   *       collects all the names of the service gears that have been included
   *       in this instance of the application, and compares those names
   *       against the list of config filenames. If there is a service gear
   *       which doesn't have a corresponding config file then an error
   *       is thrown.
   * @summary service gear / config file cross check
   * @param {Function} next Callback function
   */
  static initConfigs (next) {
    this.logger.debug(this.constructor.name, 'Loader#initConfigs', { from: 'core' });
    /**
     * INFO:
     *  - remove index.js (already processed)
     *  - using `_([..array..]).pull('..item..')` syntax to avoid mutating
     *    `[..array..]`
     */
    // TODO: check if variable reference is safe
    let serviceConfigFiles = Helpers.sortConfigFiles(_(this.configuration.files).pull('index.js'));
    // INFO: get list of services attached to this instance
    let serviceNameList = this.serviceMap
      .keyArray()
      .map(n => Helpers.reduceServiceName(n));
    // INFO: get list of services we have configs for (from config directory)
    let configNameList = _.chain(serviceConfigFiles)
      .map(f => f.split('.')[0])
      .uniq()
      .value();
    // INFO: compare list of modules included in instance against config files
    let missingConfigs = _.difference(serviceNameList, configNameList);
    if (missingConfigs.length) {
      // INFO: missing configs, throw error
      let noConfigError = new CollinsError('Missing:Config', {
        details: 'missing config for services: ' + missingConfigs
      });
      next(noConfigError);
    } else {
      // INFO: we have a corresponding config file for services in instance.
      // TODO: deal with inheritance in the config files
      // INFO: get name of needed config files
      let neededConfigFiles = _.intersection(serviceNameList, configNameList);
      Async.each(neededConfigFiles, (configName, doneNeededFile) => {
        let filename = Helpers.buildFilename({ service: configName });
        let serviceConfigPath = Path.join(this.configuration.path, filename);
        // INFO: create javascript object from filepath
        let serviceConfig = require(serviceConfigPath);
        // INFO: check each property from the config and inherit from `this`
        Async.each(Object.keys(serviceConfig), (prop, doneServiceProp) => {
          if (serviceConfig[prop] === 'inherit') {
            if (this.configuration.configObj.has(prop)) {
              serviceConfig[prop] = this.configuration.configObj.get(prop);
              doneServiceProp(null);
            } else {
              let invalidPropError = new CollinsError('Invalid:Config', {
                details: filename + ' has invalid key/value pair'
              });
              doneServiceProp(invalidPropError);
            }
          } else {
            doneServiceProp(null);
          }
          // INFO: end of async.each(serviceConfig)
        }, (errServiceConfig) => {
          // INFO: if (errServiceConfig) invalid key/value pair
          if (errServiceConfig) {
            // INFO: propogate error up
            doneNeededFile(errServiceConfig);
          } else {
            this.serviceMap.get(configName).config = serviceConfig;
            doneNeededFile(null);
          }
        });
      }, (errNeededFiles) => {
        // INFO: if err happens, invalid config file props
        this.logger.debug(this.constructor.name, 'Loader#initConfigs', 'complete', { from: 'core' });
        next(errNeededFiles);
      });
    }
  }

  static initServices (next) {
    // TODO: pass all relevant config files to each service
    this.logger.debug(this.constructor.name, 'Loader#initServices', { from: 'core' });
    Async.each(this.serviceMap.keyArray(), (key, doneServiceInit) => {
      // INFO: attach a logLevel at which system is logging
      this.serviceMap.get(key).logLevel = this.configuration.configObj.get('logLevel');
      // INFO: step-by-step because constructor must start with capital letter
      let ServiceCreator = this.serviceMap.get(key).Creator;
      let service = new ServiceCreator();
      service.init(this.serviceMap.get(key), (initErr) => {
        /**
        * err:
        *  - `null`: everything is fine
        *  - `error`: service failed to initialize
        */
        if (initErr) {
          doneServiceInit(initErr);
        } else {
          this.serviceMap.get(key).instance = service;
          doneServiceInit(null);
        }
      });
    }, (serviceErr) => {
      this.logger.debug(this.constructor.name, 'Loader#initServices', 'complete', { from: 'core' });
      next(serviceErr);
    });
  }

  static connectServices (next) {
    this.logger.debug(this.constructor.name, 'Loader#connectServices', { from: 'core' });
    Async.each(this.serviceMap.keyArray(), (key, doneService) => {
      this.serviceMap.get(key).instance.connect((err) => {
        doneService(err);
      });
    }, (err) => {
      if (err) {
        this.logger.error(this.constructor.name, 'Loader#connectServices', err);
      }
      this.logger.debug(this.constructor.name, 'Loader#connectServices', 'complete', { from: 'core' });
      next(err);
    });
  }

  static initServiceCogs (next) {
    this.logger.debug(this.constructor.name, 'Loader#initServiceCogs', { from: 'core' });
    next(null);
  }

  static initActions (next) {
    this.logger.debug(this.constructor.name, 'Loader#initActions', { from: 'core' });
    next(null);
  }
}

module.exports = Loader;
