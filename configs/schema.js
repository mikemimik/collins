'use strict';

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
    format: [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ],
    default: 'debug'
  }
};

module.exports = defaultSchema;
