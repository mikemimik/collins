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
