'use strict';

const assert = require('assert');
const Loader = require('../utils/Loader');
const Collins = require('../libs/Collins');
const CollinsError = require('../libs/CollinsError');
const async = require('async');
const _ = require('lodash');
/**
 * Test to see if Loader.initServices parces the config files correctly
 */

const mockConfigFile = {
  name: 'Collins',
  debug: true
};

let collins = null;
describe('Loader', () => {
  beforeEach((done) => {
    collins = new Collins(mockConfigFile);
    async.series([
      Loader.init.bind(collins),
      Loader.initConfig.bind(collins)
    ], (err) => {
      done(err);
    });
  });
  describe('#initServices()', () => {
    it('should throw error if no services attached', (done) => {
      assert.throws(
        Loader.initServices.bind(collins, (err) => {
          console.log('>>', 'return from Loader', err);
          done(err);
        }),
        CollinsError
      );
    });
    it('should parse config files correctly', (done) => {
      console.log('>>', 'done', done.toString());
      Loader.initServices.bind(collins, (err) => {
        console.log('>>', 'return from Loader', err);
        done(err);
      })();
    });
  });
});