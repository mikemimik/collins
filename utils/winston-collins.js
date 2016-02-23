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
    verbose: 3,
    core: 4,
    gear: 5,
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
  return this.config.main.name
    + ' > '
    + msg;
};

exports.transports = [
  CollinsDefault
];