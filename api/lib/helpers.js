/* 
Helper functions for various tasks
*/

// Dependencies
const crypto = require('crypto');
const config = require('./config');

// Helpers container
const helpers = {};

// SHA256 string hashing
helpers.hash = string => {
  if (typeof string === 'string' && string.length >0 ) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(string)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

//Parse JSON string into object, without throwing
helpers.parseJsonToObject = string => {
  try {
    const object = JSON.parse(string);
    return object;
  } catch(e) {
    return {};
  }
};

module.exports = helpers;