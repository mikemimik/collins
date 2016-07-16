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
    super(type);
    this.data = data || {};
    this.type = type;
    this.message = '\'' + type + '\' error message received';
    let reasons = data.details || data.reasons;
    if (reasons) {
      this.message += ':';
      if (Array.isArray(reasons)) {
        reasons.forEach((reason) => {
          this.message += '\n\t"' + reason + '"';
        });
      } else {
        this.message += '\n"' + reasons + '"\n';
      }
    } else {
      this.message += '. ';
    }
    this.message += '\nSee \'data\' for details.';
  }
}

module.exports = CollinsError;
