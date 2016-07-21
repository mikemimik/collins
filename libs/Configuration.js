'use strict';
const CollinsError = require('./CollinsError');
const Loader = require('../utils/Loader');
const async = require('async');
const fs = require('fs');

function Configuration () {
  this.isConfigured = false;
  this.path = '';
  this.options = {};
}


/**
 * @summary Function to initialize the configuration of system
 */
Configuration.prototype.configure = function configure () {
  async.series([
    Loader.init.bind(this),
    Loader.initConfig.bind(this)
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
      throw new CollinsError('error:config', {
        details: 'invaild configuration directory'
      });
    }
  });
}

module.exports = Configuration;
