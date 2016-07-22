'use strict';

/**
 * @summary when creating an error follow the following type syntax
 *          ex. 'what':'who'
 *          ex. Invalid:File
 *          ex. Missing:Config
*/
let ErrorTypes = [
  'Invalid',
  'Missing',
  /* --- */
  'Config',
  'Input',
  'File',
  /* --- */
  'TypeError',
  'TestError'
];

module.exports = ErrorTypes.map(type => type.toLowerCase());
