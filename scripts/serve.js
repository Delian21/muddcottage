/**
 * Simple local preview server for Mudd Cottage Herbhome.
 * Usage:  node scripts/serve.js  (then open http://localhost:4599)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4599;
const ROOT = path.join(__dirname, '..');

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon'
};

http.createServer(function (req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, function () {
  console.log('Mudd Cottage preview running at http://localhost:' + PORT);
});
