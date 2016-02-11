'use strict';

// INFO: base Collins requirements
const Collins = require('./libs/Collins');
const config = require('./configs');

// INFO: Collins service-gear
const mumbleGear = require('collins-mumble');
const slackGear = require('collins-slack');

// INFO: create new instance of Collins
let collins = new Collins(config);

collins.use(mumbleGear);
collins.use(slackGear);

// INFO: repl module and config
const replify = require('replify');
replify({
  name: 'collins-io',
  path: '/tmp',
  extention: '.sock',
  app: collins
});
// replify('collins-io', collins);

// INFO: no arrow functions (need context intact)
collins.on('error:*', function(error) {
  // console.log('>>', 'EVENT', this.event); // TESTING
  // console.log('>>', 'THIS:', this); // TESTING
  console.log('>>', 'Error', error);
});

collins.start();