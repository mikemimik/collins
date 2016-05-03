'use strict';

// INFO: base Collins requirements
const Collins = require('./'); // INFO: requiring 'index.js'
const config = require('./configs');

// INFO: Collins service-gear
// const mumbleGear = require('collins-mumble');
const slackGear = require('collins-slack');
const webGear = require('collins-web');

// INFO: create new instance of Collins
let collins = new Collins(config);

// collins.use(mumbleGear);
collins.use(slackGear);
collins.use(webGear);

// INFO: repl module and config
try {
  const replify = require('replify');
  replify({
    name: 'collins-io',
    path: '/tmp',
    extention: '.sock',
    app: collins
  });
} catch(e) {
  console.log('repl modules not found');
}

// INFO: no arrow functions (need context intact)
collins.on('error:*', function(error) {
  // console.log('>>', 'EVENT', this.event); // TESTING
  // console.log('>>', 'THIS:', this); // TESTING
  console.log('>>', 'Error', error);
});

collins.start();