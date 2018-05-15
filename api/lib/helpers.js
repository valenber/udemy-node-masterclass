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

// Parse JSON string into object, without throwing
helpers.parseJsonToObject = string => {
  try {
    const object = JSON.parse(string);
    return object;
  } catch(e) {
    return {};
  }
};

// Generate random alphanum string of a given length
helpers.createRandomString = strLength => {
  const length = typeof strLength === 'number' && strLength > 0
    ? strLength
    : false;

  if (length) {
    const validCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 1; i <= length; i++) {
      const rndChar = validCharacters.charAt(Math.floor(Math.random() * validCharacters.length));
      result += rndChar;
    }
    return result;
  } else {
    return false;
  }
};

module.exports = helpers;