/*eslint no-console: ["error", { allow: ["log"] }] */
// Main file for the API

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Router
const config = require('./config');
const router = require('./router');

// Handle requests
const server = http.createServer((req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get path from the URL
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the headers as an object
  const headers = req.headers;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();
    // Choose correct handler for current request
    const chosenHandler = typeof router[trimmedPath] !== 'undefined'
      ? router[trimmedPath]
      : router.notFound;

    // Assemble data object for the handler
    const data = {
      headers,
      method,
      payload: buffer,
      queryStringObject,
      trimmedPath
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use status code returned by the handler or default to 200
      statusCode = typeof statusCode === 'number'
        ? statusCode
        : 200;
      // Use payload returned by the handler or default to empty object
      payload = typeof payload === 'object'
        ? payload
        : {};
      // Convert payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log request info
      console.log('Responding with: ', statusCode, payloadString);
    });    
  });  
});

// Start the server
server.listen(config.port, () => {
  console.log(`Server is listening at port ${config.port} in ${config.envName} mode`);
});
