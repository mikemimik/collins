'use strict';
const CollinsError = require('./CollinsError');
const convict = require('convict');
const Loader = require('../utils/Loader');
const Config = require('../configs');
const async = require('async');
const fs = require('fs');

function Configuration () {
  this.isConfigured = false;
  this.options = {};
  this.path = '';
  this.files = [];

  // INFO: initialize convict
  Config.formats.forEach((f) => { convict.addFormat(f); });
  this.configObj = convict(Config.schema);
}


/**
 * @summary Function to initialize the configuration of system
 */
Configuration.prototype.configure = function configure () {
  async.series([
    Loader.init.bind(this),
    Loader.initConfig.bind(this),
    Loader.initServices.bind(this)
  ], (error, results) => {

    // INFO: we got an error from some init Loader
    if (error) {
      this.logger.error(this.constructor.name, 'core:error:configuration:configure', error);
      this.emit('error:configure', error);
    }
    results.forEach((result) => {
      if (result) {
        this.logger.info(this.constructor.name, 'core:configure', result);
      }
    });
  });
}

/**
 * @summary Function to set/validate path given for Configuration
 *
 * @param {String} path to configuration directory
 */
Configuration.prototype.setPath = function setPath (p) {
  fs.stat(p, (err, stats) => {
    if (err) {

    }
    if (stats.isDirectory()) {
      this.path = p;
    } else {
      throw new CollinsError('Invalid:Input', {
        details: 'invaild configuration directory'
      });
    }
  });
}

module.exports = Configuration;
