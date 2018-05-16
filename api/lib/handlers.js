/*eslint no-console: ["error", { allow: ["log"] }] */
/* 
Request handlers
*/

// Dependencies
const _data = require('./data');
const { hash, createRandomString } = require('./helpers');

const handlers = {};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};
// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

handlers.users = (data, callback) => {
  const acceptedMethods = ['post', 'get', 'put', 'delete'];
  if (acceptedMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users subhandlers
handlers._users = {};

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  const isValidPayload = obj => {
    if (typeof obj.firstName !== 'string' || obj.firstName.trim().length < 1)
      return false;
    if (typeof obj.lastName !== 'string' || obj.lastName.trim().length < 1)
      return false;
    if (typeof obj.phone !== 'string' || obj.phone.trim().length !== 10)
      return false;
    if (typeof obj.password !== 'string' || obj.password.trim().length < 1)
      return false;
    if (typeof obj.tosAgreement !== 'boolean' || obj.tosAgreement != true)
      return false;
    return true;
  };

  if (isValidPayload(data.payload)) {
    // Extract values from payload
    const { firstName, lastName, phone, password } = data.payload;
    // Verify the user doesn't already exist
    _data.read('users', phone, err => {
      if (err) {
        // Hash the password
        const hashedPassword = hash(password);
        if (hashedPassword) {
          // Create user object
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          };
          // Store the user
          _data.create('users', phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create new user' });
            }
          });
        } else {
          callback(500, { Error: 'Could not hash user\'s password' });
        }
      } else {
        callback(400, {
          Error: 'A user with that phone number already exists'
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};
// Users - GET
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // Validate required field
  const queryPhone = data.queryStringObject.phone.trim();
  const phone =
    typeof queryPhone === 'string' && queryPhone.length == 10
      ? queryPhone
      : false;
  if (phone) {
    // Get token from the headers
    const token = typeof data.headers.token === 'string'
      ? data.headers.token
      : false;
    // Verify the provided token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the user object
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {Error: 'Missing required token in header or token is invalid'});
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};
// // Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // Validate required field
  const queryPhone = data.payload.phone.trim();
  const phone = typeof queryPhone === 'string' && queryPhone.length == 10
    ? queryPhone
    : false;

  // validate optional field(s)
  let firstName, lastName, password;

  if (data.payload.firstName) {
    const queryFirstName = data.payload.firstName.trim();
    firstName = typeof queryFirstName == 'string' && queryFirstName.length >= 1
      ? queryFirstName
      : false;
  }
  if (data.payload.lastName) {
    const queryLastName = data.payload.lastName.trim();
    lastName = typeof queryLastName == 'string' && queryLastName.length >= 1
      ? queryLastName
      : false;
  }
  if (data.payload.password) {
    const queryPassword = data.payload.password.trim();
    password = typeof queryPassword == 'string' && queryPassword.length >= 1
      ? queryPassword
      : false;
  }
  if (phone) {
    // Error if no update data is sent
    if (firstName || lastName || password) {
      // Get token from the headers
      const token = typeof data.headers.token === 'string'
        ? data.headers.token
        : false;
      handlers._tokens.verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // Update the user data
              if (firstName) userData.firstName = firstName;
              if (lastName) userData.lastName = lastName;
              if (password) userData.hashedPassword = hash(password);
              // Store the updated userData object
              _data.update('users', phone, userData, err => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: 'Could not update the user' });
                }
              });
            } else {
              callback(400, { Error: 'Requested user does not exist' });
            }
          });
        } else {
          callback(403, {Error: 'Missing required token in header or token is invalid'});
        }
      });
    } else {
      callback(400, { Error: 'Missing data to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};
// Users - DELETE
// Required field: phone
// @@@TODO: Cleanup (delete) any data files associated with this use
handlers._users.delete = (data, callback) => {
  // Validate required field
  const queryPhone = data.queryStringObject.phone.trim();
  const phone =
    typeof queryPhone === 'string' && queryPhone.length == 10
      ? queryPhone
      : false;
  // Lookup the user
  if (phone) {
    // Get token from the headers
    const token = typeof data.headers.token === 'string'
      ? data.headers.token
      : false;
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Lookup user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, {Error: 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400, {Error: 'Could not find the specified user'});
          }
        });
      } else {
        callback(403, {Error: 'Missing required token in header or token is invalid'});
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

//Tokens
handlers.tokens = (data, callback) => {
  const acceptedMethods = ['post', 'get', 'put', 'delete'];
  if (acceptedMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for tokens methods
handlers._tokens = {};

// Tokens - POST
// Required data: phone, password
handlers._tokens.post = (data, callback) => {
  const isValidPayload = obj => {
    if (typeof obj.phone !== 'string' || obj.phone.trim().length !== 10) return false;
    if (typeof obj.password !== 'string' || obj.password.trim().length < 1) return false;
    return true;
  };
  if(isValidPayload(data.payload)) {
    const { phone, password } = data.payload;
    // Lookup the user
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Validate the password
        const hashedPassword = hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // Create token: random name, TTL 1 hour
          const tokenId = createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60; // 1 hour
          const tokenObj = {
            id: tokenId,
            phone,
            expires
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObj, err => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, {Error: 'Could not create the new token'});
            }
          });
        } else {
          callback(400, {Error: 'Password did not match'});
        }
      } else {
        callback(400, {Error: 'Could not find the specified user'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required fields'});
  }
};

// Tokens - GET
// Required data: id
handlers._tokens.get = (data, callback) => {
  // Validate ID
  const queryId = data.queryStringObject.id.trim();
  const id = typeof queryId === 'string' && queryId.length === 20
    ? queryId
    : false;

  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {Error: 'Missing required field'});
  }
};

// Tokens - PUT
// Required data: id, extend
handlers._tokens.put = (data, callback) => {
  const isValidPayload = obj => {
    if (typeof obj.id !== 'string' || obj.id.trim().length !== 20) return false;
    if (typeof obj.extend !== 'boolean' || obj.extend != true) return false;
    return true;
  };
  if(isValidPayload(data.payload)) {
    const { id } = data.payload;
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check the token has not expired
        if( tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60; // 1 hour
          _data.update('tokens', id, tokenData, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {Error: 'Could not extend the token'});
            }
          });
        } else {
          callback(400, {Error: 'Specified token has already expired and can not be extended'});
        }
      } else {
        callback(400, {Error: 'Specified token does not exist'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// Tokens - DELETE
// Required data: id
handlers._tokens.delete = (data, callback) => {
  // Validate id
  const queryId = data.queryStringObject.id.trim();
  const id = typeof queryId === 'string' && queryId.length === 20
    ? queryId
    : false;

  if (id) {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Delete the token
        _data.delete('tokens', id, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, {Error: 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400, {Error: 'Specified token doesn not exist'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// Verify a token id is currently valid for given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check the token is for given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Checks
handlers.checks = (data, callback) => {
  const acceptedMethods = ['post', 'get', 'put', 'delete'];
  if (acceptedMethods.includes(data.method)) {
    handlers.checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for checks methods
handlers._checks = {};

// Checks - POST
// Required data: protocol, url, method, sucessCodes, timeoutSeconds
handlers._checks.post = (data, callback) => {
  // Validate payload
  const isValidPayload = obj => {
    if (typeof obj.protocol !== 'string' || !['http', 'https'].includes(obj.protocol)) return false;
    if (typeof obj.url !== 'string' || obj.extend.length <= 0) return false;
    if (typeof obj.method !== 'string' 
      || !['post', 'get', 'put', 'delete'].includes(obj.method)) return false;
    if (!Array.isArray(obj.sucessCodes) || obj.sucessCodes.length <= 0) return false;
    if (typeof obj.timeoutSeconds !== 'number' 
      || obj.timeoutSeconds % 1 !== 0 
      || obj.timeoutSeconds < 1
      || obj.timeoutSeconds > 5) return false;
    return true;
  };
  if (isValidPayload(data.payload)) {
    const { protocol, url, method, sucessCodes, timeoutSeconds } = data.payload;
    //  
  } else {
    callback(400);
  }
};
// Checks - GET
handlers._checks.get = (data, callback) => {

};
// Checks - PUT
handlers._checks.put = (data, callback) => {

};
// Checks - DELETE
handlers._checks.delete = (data, callback) => {

};

module.exports = handlers;
