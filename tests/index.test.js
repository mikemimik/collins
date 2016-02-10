'use strict';

const assert = require('assert');
const Collins = require('../libs/Collins');

describe('Collins', function() {
  it('should expose a constructor', function() {
    assert(typeof Collins, 'function');
  });
});