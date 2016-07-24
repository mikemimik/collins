'use strict';
const CollinsError = require('./CollinsError');
const convict = require('convict');
const Loader = require('../utils/Loader');
const Config = require('../configs');
const async = require('async');
const path = require('path');
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
};

/**
 * @summary Synchronous function to set/validate path given for Configuration
 *
 * @param {String} path to configuration directory
 */
Configuration.prototype.setPath = function setPath (p) {
  let resolvedPath = path.resolve(process.cwd(), p);
  try {
    let pathInfo = fs.statSync(resolvedPath);
    if (pathInfo.isDirectory()) {
      this.path = resolvedPath;
    } else {
      throw new CollinsError('Invalid:Input', {
        details: 'config path supplied not directory'
      });
    }
  } catch (e) {
    throw CollinsError.convert('Invalid:Input', e);
  }
};

module.exports = Configuration;
