'use strict';

class ServiceGear {
  constructor (gear) {
    if (typeof gear !== 'function') {
      throw new Error('invalid function call');
    }
    this.Creator = gear;
    this.instance = null;
    this.config = null;
  }
}

module.exports = ServiceGear;
