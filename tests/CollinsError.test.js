'use strict';

const assert = require('assert');
const CollinsError = require('../libs/CollinsError');

describe('CollinsError', () => {
  let error = new CollinsError('TestError', 'test');
  it('should be an instance of Error', () => {
    assert.equal(error instanceof Error, true);
  });
  it('should also be an instance of CollinsError', () => {
    assert.equal(error instanceof CollinsError, true);
  });
  it('should have type `TestError`', () => {
    assert.equal(error.type, 'TestError');
  });
});