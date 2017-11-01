'use strict';

const CollinsError = require('collins-error');

class ServiceGearWrapper {
  constructor (gear) {
    if (typeof gear !== 'function') {
      throw new CollinsError('invalid function call');
    }
    this.logger = null;
    this.logLevel = null;
    this.Creator = gear;
    this.instance = null;
    this.config = null;
  }
}

module.exports = ServiceGearWrapper;

// TODO: create functions for accessing data on this object
  // TODO: this.prototype.CreateInstance()
    // TODO: should return instance AND set this.instance
  // TODO: this.prototype.setLogger()
  // TODO: this.prototype.setLogLevel()
  // TODO: this.prototype.setConfig() / this.prototype.getConfig()
