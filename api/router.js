const handlers = {};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};
// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};


module.exports = {
  notFound: handlers.notFound,
  ping: handlers.ping
};