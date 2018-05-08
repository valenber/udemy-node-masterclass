/*eslint no-console: ["error", { allow: ["log"] }] */
/* 
Request handlers
*/

// Dependencies
const _data = require('./data');
const hash = require('./helpers').hash;

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

// const firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 
//   ? data.payload.firstName.trim()
//   : false;
// const lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 
//   ? data.payload.lastName.trim()
//   : false;
// const phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length == 10 
//   ? data.payload.phone.trim()
//   : false;
// const password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 
//   ? data.payload.password.trim()
//   : false;
// const tosAgreement = typeof data.payload.tosAgreement == 'boolean' && data.payload.tosAgreement == true 
//   ? true
//   : false;

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  const isValidPayload = obj => {
    if (typeof obj.firstName !== 'string' || obj.firstName.trim().length < 1) return false;
    if (typeof obj.lastName !== 'string' || obj.lastName.trim().length < 1) return false;
    if (typeof obj.phone !== 'string' || obj.phone.trim().length !== 10) return false;
    if (typeof obj.password !== 'string' || obj.password.trim().length < 1) return false;
    if (typeof obj.tosAgreement !== 'boolean' || obj.tosAgreement != true) return false;
    return true;
  };

  if (isValidPayload(data.payload)) {
    // Extract values from payload
    const { firstName, lastName, phone, password } = data.payload;
    // Verify the user doesn't already exist
    _data.read('users', phone, (err) => {
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
              callback(500, {Error: 'Could not create new user'});
            }
          });
        } else {
          callback(500, {Error: 'Could not hash user\'s password'});
        }
      } else {
        callback(400, {Error: 'A user with that phone number already exists'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required fields'});
  }
};
// Users - GET
// Required data: phone
// Optional data: none
// @@@TODO: only let authenticated user access their own object
handlers._users.get = (data, callback) => {
  const queryPhone = data.queryString.phone.trim();
  const phone = typeof queryPhone === 'string' &&  queryPhone.length == 10
    ? phone
    : false;
  if (phone) {

  } else {
    callback(400, {Error: 'Missing required field'});
  }
};
// // Users - PUT
// handlers._users.put = (data, callback) => {
  
// };
// // Users - DELETE
// handlers._users.delete = (data, callback) => {
  
// };

module.exports = handlers;