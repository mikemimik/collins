'use strict';

/**
 * @summary Error class for delivering errors with Collins
 *
 * @param {String} type Error type name
 * @param {Object} data Data given to the error
 */
class CollinsError extends Error {
  constructor (type, data) {
    super();
    this.name = this.constructor.name;
    this.data = data || {};
    this.type = type;
    this.message = `<${this.type}> error message received`;
    let reasons = this.data.details || this.data.reasons;
    if (reasons) {
      this.message += ': ';

      // INFO: check if `reasons` is an array
      if (Array.isArray(reasons)) {
        reasons.forEach((reason, index) => {
          this.message += `${index+1}> ${reason} `;
        });
      } else {
        this.message += `${reasons}`;
      }
    } else {
      this.message += '.';
    }
    this.message += '\nSee \'data\' for details.';
  }
}

module.exports = CollinsError;

/**
 * @summary Enum of possible errors to create
 */
 /**
  * FileReadError => error:FileRead
  * ConfigError => error:config
  *             => error:configure
  *
  */
