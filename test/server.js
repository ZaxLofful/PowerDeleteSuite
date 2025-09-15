#!/usr/bin/env node
// Minimal static server that serves the repo root and test data on port 8000.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || 8000;

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    if (contentType) res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  // map root to /test/index.html
  if (url === '/' || url === '/index.html') {
    sendFile(res, path.join(root, 'test', 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  // Serve powerdeletesuite.js from repo root
  if (url === '/powerdeletesuite.js') {
    sendFile(res, path.join(root, 'powerdeletesuite.js'), 'application/javascript; charset=utf-8');
    return;
  }

  // Serve test data JSON files
  if (url.startsWith('/test/data/')) {
    const fp = path.join(root, url);
    sendFile(res, fp, 'application/json; charset=utf-8');
    return;
  }

  // Fallback: try to serve static file from repo root
  const fp = path.join(root, url);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    const ext = path.extname(fp).toLowerCase();
    const mime = ext === '.json' ? 'application/json' : ext === '.js' ? 'application/javascript' : 'text/plain';
    sendFile(res, fp, mime + '; charset=utf-8');
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(port, () => {
  console.log('Test server running at http://localhost:' + port + '/');
  console.log('Open that URL in a browser to run the harness (it will show PASS/FAIL results).');
});
