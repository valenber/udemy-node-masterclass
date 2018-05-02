// Primary file for the API

// Dependencies
const http = require('http');

// Respond to all requests with a string
const server = http.createServer((req, res) => {
  res.end('Hey there\n')
})

// Start the server and listen on port 4000\
server.listen(3000, () => {
  console.log('Server is listening at port 3000 now')
})
