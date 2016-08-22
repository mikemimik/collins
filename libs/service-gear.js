'use strict';

const CollinsError = require('collins-error');

class ServiceGear {
  constructor (gear) {
    if (typeof gear !== 'function') {
      throw new CollinsError('invalid function call');
    }
    this.Creator = gear;
    this.instance = null;
    this.config = null;
  }
}

module.exports = ServiceGear;
