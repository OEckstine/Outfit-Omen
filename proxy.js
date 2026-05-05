const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 4000;
const TARGET = 'https://newsapi.org';
const API_KEY = '078e724887cd4d3fa49a5a5e89537325'; 

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const targetUrl = url.parse(TARGET);
  const parsedReq = url.parse(req.url, true);

  const query = new URLSearchParams({
    ...parsedReq.query,
    apiKey: API_KEY,
  });

  const forwardPath = `${parsedReq.pathname}?${query.toString()}`;
  console.log('Requesting:', forwardPath); 

  const options = {
  hostname: targetUrl.hostname,
  port: 443,
  path: forwardPath,
  method: 'GET',
  headers: { 
    host: targetUrl.hostname,
    'User-Agent': 'MyNewsApp/1.0',  
  },
};

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': 'application/json',
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});