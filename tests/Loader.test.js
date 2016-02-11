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

  /**
   * TODO:
   * - create proper mock
   *
   * Case:
   * Loader works with config files (need: mock files)
   * Loader works with instance of Collins (need: mock instance)
   * Loader works with services (need: mock service + service.configfile)
   *
   * Needed:
   * - mock config files
   * - mock instance of collins
   * - mock service + config file pre-setup
   */
  beforeEach((done) => {
    collins = new Collins(mockConfigFile);
    async.series([
      Loader.init.bind(collins),
      Loader.initConfig.bind(collins)
    ], (err) => {
      done(err);
    });
  });

  describe('#initConfig()', () => {
    it('should error if `configDir` is incorrect');
    it('should require index config');
    it('should require all service-gear configs');
    it('should require all service-cog configs');
    it('should error if any require fails');
    it('should properly propagate config.main into config.services');
    it('should create masterConfig file @ this.config');
  });

  describe('#initServices()', () => {
    it('should throw error if no services attached');
    it('should parse config files correctly');
  });
});