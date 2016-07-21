'use strict';

const convict = require('convict');
const schema = require('./schema');

convict.addFormat({
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
});

const config = convict(schema);

module.exports = {
  logger: require('./logger'),
  tools: config
};
