'use strict';

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * @summary Error class for delivering errors with Collins
 *
 * @param {String} type Error type name
 * @param {Object} data Data given to the error
 */
class CollinsError extends ExtendableError {
  constructor(type, data) {
    super('constructor');
    this.data = (data) ? data : {};
    this.type = type;
    this.message = '\'' + type + '\' error message received';
    let reason = data.details || data.reason;
    if (reason) {
      this.message += ':\n"' + reason + '"\n';
    } else {
      this.message += '. ';
    }
    this.message += 'See \'data\' for details.';
  }
}

module.exports = CollinsError;