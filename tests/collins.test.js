'use strict';

const assert = require('assert');
const Collins = require('../libs/collins');

describe('Collins', () => {
  it('should expose a constructor', () => {
    assert(typeof Collins, 'function');
  });
});