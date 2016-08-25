'use strict';

const Winston = require('winston');
const Colors = require('colors/safe');

const CollinsDefault = new Winston.transports.Console({
  colorize: true,
  prettyPrint: function removeMeta () { return ''; },
  depth: 1
});

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
  Init: Winston.Logger
};
