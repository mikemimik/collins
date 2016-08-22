'use strict';

const CollinsError = require('../libs/collins-error');

/**
 * @desc Breaks down the full service name given to the function into a
 *       base service name. Service names (if following the paradigm) will
 *       be a combination of terms (Eg. CollinsSlack, CollinsMumble).
 * @summary Split the name of the service down to it's bare name
 * @param  {String} fullServiceName Full name of a service to be used.
 * @return {String}                 Reduced name of service.
 */
function reduceServiceName (fullServiceName) {
  let regEx = /(?=[A-Z])/;
  // INFO: split the name of the module
  return fullServiceName.split(regEx)
    // INFO: convert to lower case
    .map(x => x.toLowerCase())
    // INFO: remove the 'collins' convention from module name
    .filter(n => n !== 'collins')
    // INFO: coerce array into string
    .join();
}

/**
 * @desc A function which takes a component, which is an Object which
 *       contains only one (1) property. The function will `switch` over
 *       the property of the component and act accordingly. The function
 *       will return a string representing the filename for the
 *       configuration file for that component.
 * @summary Construct the full filename of a given component.
 * @param  {Object} component           Object with component information
 * @param  {String} [component.service] The name portion of the service to
 *                                      build a filename for.
 * @return {String}                     Filename for the config of the
 *                                      given component.
 */
function buildFilename (component) {
  if (Object.keys(component).length > 1) {
    throw new CollinsError('Invalid:Input', {
      details: 'too many properties on input object'
    });
  }
  switch (Object.keys(component).join().toLowerCase()) {
    case 'service':
      return component.service + '.config.js';
    default:
      throw new CollinsError('Invalid:Input', {
        details: 'invalid function params'
      });
  }
}

module.exports.reduceServiceName = reduceServiceName;
module.exports.buildFilename = buildFilename;
