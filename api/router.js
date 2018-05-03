const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
  // Return HTTP status code and a payload object
  callback(406, {'name': 'sample handler'});
};
// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = {
  'notFound': handlers.notFound,
  'sample': handlers.sample
};