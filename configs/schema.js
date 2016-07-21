'use strict';

const logger = require('./logger');

let defaultSchema = {
  name: {
    doc: 'Name of this instance of the application',
    format: 'string-nospace',
    default: 'Collins'
  },
  userAgent: {
    doc: 'User Agent to use while accessing networks',
    format: 'string-nospace',
    default: 'collins'
  },
  logLevel: {
    doc: 'Level at which to log events and errors',
    format: Object.keys(logger.logLevels.core),
    default: 'debug'
  }
};

module.exports = defaultSchema;
