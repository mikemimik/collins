'use strict';

const Winston = require('winston');
const CollinsDefault = new Winston.transports.Console({
  colorize: true,
  prettyPrint: true,
  depth: 1
});

exports.config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    core: 3,
    gear: 4,
    verbose: 5,
    debug: 6
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    verbose: 'grey',
    info: 'green',
    core: 'cyan',
    gear: 'magenta'
  }
};

exports.filter = function(level, msg, meta) {
  return this.constructor.name
    + ' > '
    + msg;
};

exports.transports = [
  CollinsDefault
];
