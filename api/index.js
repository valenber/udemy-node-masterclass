// Main file for the API

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Handle requests
const server = http.createServer((req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get path from the URL
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the headers and an object
  const headers = req.headers;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  // Send reponse
  res.end('Hey there\n');

  //Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Log request info
    console.log('Request payload: ', buffer);
  });  
})

// Start the server and listen on port 3000
server.listen(3000, () => {
  console.log('Server is listening at port 3000 now')
})
