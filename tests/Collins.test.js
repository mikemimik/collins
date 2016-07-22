'use strict';

const assert = require('assert');
const Collins = require('../libs/Collins');

describe('Collins', () => {
  it('should expose a constructor', () => {
    assert(typeof Collins, 'function');
  });
});
