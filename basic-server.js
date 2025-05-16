const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle favicon.ico requests
  if (req.url === '/favicon.ico') {
    res.statusCode = 204; // No content
    res.end();
    return;
  }
  
  // Normalize URL path
  let filePath = req.url;
  
  // Default to index.html for root path
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Get the absolute file path
  const absolutePath = path.join(__dirname, filePath);
  
  // Check if file exists
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File ${absolutePath} not found`);
      res.statusCode = 404;
      res.end('404 Not Found');
      return;
    }
    
    // Get file extension and set content type
    const ext = path.extname(absolutePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(absolutePath, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        res.statusCode = 500;
        res.end('500 Internal Server Error');
        return;
      }
      
      res.setHeader('Content-Type', contentType);
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Basic server running at http://localhost:${PORT}`);
  console.log(`View the website by opening http://localhost:${PORT} in your browser`);
});
