/*eslint no-console: ["error", { allow: ["log"] }] */
/* 
Request handlers
*/

// Dependencies
const _data = require('./data');
const { hash } = require('./helpers');

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
// @@@TODO: only let authenticated user access their own object
handlers._users.get = (data, callback) => {
  // Validate required field
  const queryPhone = data.queryStringObject.phone.trim();
  const phone =
    typeof queryPhone === 'string' && queryPhone.length == 10
      ? queryPhone
      : false;
  if (phone) {
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
    callback(400, { Error: 'Missing required field' });
  }
};
// // Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @@@Todo: Only allow authenticated user to update their own object
handlers._users.put = (data, callback) => {
  // Validate required field
  const queryPhone = data.payload.phone.trim();
  const phone =
    typeof queryPhone === 'string' && queryPhone.length == 10
      ? queryPhone
      : false;

  // validate optional field(s)
  let firstName, lastName, password;

  if (data.payload.firstName) {
    const queryFirstName = data.payload.firstName.trim();
    firstName =
      typeof queryFirstName == 'string' && queryFirstName.length >= 1
        ? queryFirstName
        : false;
  }
  if (data.payload.lastName) {
    const queryLastName = data.payload.lastName.trim();
    lastName =
      typeof queryLastName == 'string' && queryLastName.length >= 1
        ? queryLastName
        : false;
  }
  if (data.payload.password) {
    const queryPassword = data.payload.password.trim();
    password =
      typeof queryPassword == 'string' && queryPassword.length >= 1
        ? queryPassword
        : false;
  }
  if (phone) {
    // Error if no update data is sent
    if (firstName || lastName || password) {
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
      callback(400, { Error: 'Missing data to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};
// Users - DELETE
// Required field: phone
// @@@TODO: Only allow authenticated use delete self
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
    callback(400, { Error: 'Missing required field' });
  }
};

module.exports = handlers;
