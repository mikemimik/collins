'use strict';

/**
 * Sample config for Collins
 * @module config
 * @see module:config
 * @example
 */

module.exports = {
  /**
   * Name of the system
   * @alias module:config.name
   * @property
   * @required
   */
  name: 'Collins',

  /**
   * Value used by system when making requests
   * @alias module:config.userAgent
   * @property
   * @required
   */
  userAgent: 'collins',

  /**
   * logLevel of system
   * @alias module:config.logLevel
   * @property
   * @required
   */
  logLevel: 'info'
};