'use strict';

// INFO: base Collins requirements
const Collins = require('./libs/Collins');
const config = require('./configs');

// INFO: Collins service-gear
const mumbleGear = require('collins-mumble');

// INFO: create new instance of Collins
let collins = new Collins(config);

collins.use(mumbleGear);

// INFO: no arrow functions (need context intact)
collins.on('error:*', function(error) {
  // console.log('>>', 'EVENT', this.event); // TESTING
  // console.log('>>', 'THIS:', this); // TESTING
  console.log('>>', 'Error', error);
});

collins.start();