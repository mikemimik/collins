'use strict';

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

module.exports.reduceServiceName = reduceServiceName;
