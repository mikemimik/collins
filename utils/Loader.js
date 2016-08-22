'use strict';
const CollinsError = require('../libs/collins-error');
const Config = require('../configs');
const Async = require('async');
const Path = require('path');
const Fs = require('fs');
const _ = require('lodash');

class Loader {

  /**
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
   * @static
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
          try {
            this.configuration.configObj.validate();
          } catch (e) {
            // INFO: catch error when config invalid
            let validationError = CollinsError.convert('Invalid:Config', e);
            next(validationError);
          }
          // INFO: at this point the core config file has been loaded/validated
          this.logger = new Config.logger.Init({
            level: this.configuration.configObj.get('logLevel'),
            transports: Config.logger.transports,
            // filters: [ Config.logger.filter.bind(this) ],
            levels: Config.logger.logLevels.core,
            colors: Config.logger.logColors
          });
          next(null);
        }
      }
    });
  }

  /**
   * @desc initConfigs function sorts the filenames listed in the
   *       `this.configuration.files` array property. The function then
   *       collects all the names of the service gears that have been included
   *       in this instance of the application, and compares those names
   *       against the list of config filenames. If there is a service gear
   *       which doesn't have a corresponding config file then an error
   *       is thrown.
   * @summary service gear / config file cross check
   * @static
   * @param {Function} next Callback function
   */
  static initConfigs (next) {
    this.logger.debug('started initConfigs()'); // TESTING
    /**
     * INFO:
     *  - remove index.js (already processed)
     *  - using `_([..array..]).pull('..item..')` syntax to avoid mutating
     *    `[..array..]`
     */
    // TODO: check if variable reference is safe
    let serviceConfigFiles = sortConfigFiles(_(this.configuration.files).pull('index.js'));
    // INFO: get list of services attached to this instance
    let serviceNameList = this.services.map(s => reduceServiceName(s.name));
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
        let filename = buildFilename({ service: configName });
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
            this.serviceConfigMap[configName] = serviceConfig;
            doneNeededFile(null);
          }
        });
      }, (errNeededFiles) => {
        // INFO: if err happens, invalid config file props
        next(errNeededFiles);
      });
    }

    /**
     * @desc A function which takes a component, which is an Object which
     *       contains only one (1) property. The function will `switch` over
     *       the property of the component and act accordingly. The function
     *       will return a string representing the filename for the
     *       configuration file for that component.
     * @summary Construct the full filename of a given component.
     * @param  {Object} component           Object with component information
     * @param  {String} [component.service] The name portion of the service to
     *                                      build a filename for.
     * @return {String}                     Filename for the config of the
     *                                      given component.
     */
    function buildFilename (component) {
      if (Object.keys(component).length > 1) {
        throw new CollinsError('Invalid:Input', {
          details: 'too many properties on input object'
        });
      }
      switch (Object.keys(component).join().toLowerCase()) {
        case 'service':
          return component.service + '.config.js';
        default:
          throw new CollinsError('Invalid:Input', {
            details: 'invalid function params'
          });
      }
    }

    /**
     * @desc Sorts an array of configuration files for the Collins system.
     *       Each filename follows a paradigm. The first being
     *       `serviceGearName.config.js` for the name of a configuration file
     *       for a service gear. The second being
     *       `serviceGearName.cogName.config.js` for the name of a configuration
     *       file for the cog of a specific service gear.
     * @summary Sort array of configuration filenames
     * @param  {String[]} files Array of filenames for configuration files.
     * @return {String[]}       Sorted array of filenames.
     */
    function sortConfigFiles (files) {
      return files
        // INFO: sort by service gear
        .sortBy(f => f.split('.')[0])
        // INFO: sort by cog
        .sortBy(f => f.split('.').length)
        // INFO: pull value from chaining function
        .value();
    }
  }

  static initServices (next) {
    // TODO: pass all relevant config files to each service
    this.logger.core(this.constructor.name, 'Loader#initServices');
    Async.each(this.services, (Service, done) => {
      let regEx = /(?=[A-Z])/;
      let configFileName = Service.name
        .split(regEx)
        .map(x => x.toLowerCase())
        .filter(n => n !== 'collins')
        .join() + '.config.js';

      let configFile = require(Path.join(this.configuration.path, configFileName));
      let service = new Service();
      service.init((configFile, initErr) => {
        /**
        * err:
        *  - `null`: everything is fine
        *  - `error`: service failed to initialize
        */
        done(initErr);
      });
      this.services[this.services.indexOf(Service)] = service;
    }, (err) => {
      this.logger.core(this.constructor.name, 'Loader#initServices', 'complete');
      next(err);
    });
  }

  static connectServices (next) {
    this.logger.core(this.constructor.name, 'Loader#connectServices');
    Async.each(this.services, (service, done) => {
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
        return true;
      } else {
        return false;
      }
    }
  }
}

module.exports = Loader;
