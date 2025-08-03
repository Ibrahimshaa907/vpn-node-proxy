const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use('/proxy', createProxyMiddleware({
  changeOrigin: true,
  secure: false,
  router: req => {
    const url = req.query.url;
    return url || 'https://example.com';
  },
  onProxyReq: (proxyReq, req) => {
    const url = req.query.url;
    if (url) {
      const u = new URL(url);
      proxyReq.setHeader('Host', u.host);
      proxyReq.path = u.pathname + (u.search || '');
    }
  },
  logLevel: 'debug',
}));

app.listen(PORT, () => console.log(`✅ Proxy running on port ${PORT}`));