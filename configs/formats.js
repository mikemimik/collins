'use strict';

module.exports = [
  {
    name: 'string-nospace',
    validate: function validateType (val) {
      if (typeof val === 'string') {
        if (val.split(' ').length > 1) {
          throw new Error('must not contain spaces');
        }
      } else {
        throw new Error('must be a string');
      }
    }
  },
];
