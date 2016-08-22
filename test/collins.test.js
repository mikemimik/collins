'use strict';

const Assert = require('assert');
const Collins = require('../libs/collins');

describe('Collins', () => {
  it('should expose a constructor', () => {
    Assert.equal(typeof Collins, 'function');
  });
});
