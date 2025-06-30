// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (req, res) {
  let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  if (extname === '.js') contentType = 'text/javascript';
  else if (extname === '.css') contentType = 'text/css';

  fs.readFile(filePath, function (error, content) {
    if (error) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(8080);

console.log('Server running at http://localhost:8080/');
