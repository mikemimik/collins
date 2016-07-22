'use strict';

let ErrorTypes = [
  'Config',
  'InvalidInput',
  'TestError',
  'InvalidErrorType'
];

module.exports = ErrorTypes.map(type => type.toLowerCase());
