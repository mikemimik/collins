'use strict';

const Winston = require('winston');
const Colors = require('colors/safe');

const CollinsDefault = new Winston.transports.Console({
  colorize: true,
  prettyPrint: function removeMeta () { return ''; },
  depth: 1
});

const logLevels = {
  core: {
    error: 0, warn: 1, info: 2,
    core: 3, gear: 4,
    verbose: 5, debug: 6
  },
  gear: {
    error: 0, warn: 1, info: 2,
    cog: 3,
    verbose: 4, debug: 5
  }
};

const logColors = {
  error: 'red', warn: 'yellow', info: 'green',
  core: 'cyan', gear: 'magenta', cog: 'magenta',
  verbose: 'grey', debug: 'blue'
};

const loggingOutputFilter = function loggingOutputFilter (level, msg, meta) {
  if (meta) {
    if (meta.from) {
      return '<' + Colors.cyan(meta.from) + '> ' + msg;
    }
  }
  return msg;
};

module.exports = {
  filter: loggingOutputFilter,
  transports: [ CollinsDefault ],
  logLevels: logLevels,
  logColors: logColors,
  Init: Winston.Logger
};
