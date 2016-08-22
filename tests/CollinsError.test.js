'use strict';

const assert = require('assert');
const CollinsError = require('../libs/collins-error');

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
  it('should throw when instanciated with an invalid ErrorType', () => {
    assert.throws(() => {
      let badError = new CollinsError('BadErrorType:MoreBadType');
      let noop = function (badErr) { return; };
      noop(badError);
    });
  });
  describe('convert', () => {
    let foreignError = new Error('testing');
    it('takes an Error', () => {
      assert.equal(foreignError instanceof Error, true);
      assert.equal(foreignError instanceof CollinsError, false);
    });
    it('should convert Error into CollinsError', () => {
      let convertedError = CollinsError.convert('TestError', foreignError);
      assert.equal(convertedError instanceof CollinsError, true);
    });
  });
});
