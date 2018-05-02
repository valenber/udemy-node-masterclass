// Main file for the API

// Dependencies
const http = require('http');
const url = require('url');

// Handle requests
const server = http.createServer((req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get path from the URL
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Send reponse
  res.end('Hey there\n');

  // Log path
  console.log(`Received a request on path: ${trimmedPath}`);

})

// Start the server and listen on port 3000
server.listen(3000, () => {
  console.log('Server is listening at port 3000 now')
})
