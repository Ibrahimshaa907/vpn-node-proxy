// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// A short list of example free HTTP proxies.
// ⚠️ Free proxies can be unreliable; swap these out with fresh ones regularly.
const PROXIES = [
  "http://51.158.68.68:8811",
  "http://103.216.82.173:6667",
  "http://138.201.223.250:31288",
  "http://165.225.124.6:8060",
  "http://45.77.24.239:8080"
];

// helper to pick one at random
function getRandomProxy() {
  const idx = Math.floor(Math.random() * PROXIES.length);
  return PROXIES[idx];
}

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.use("/proxy", (req, res, next) => {
  // parse target URL from query
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url= parameter");

  // pick a random upstream proxy
  const upstream = getRandomProxy();

  // mount a proxy middleware instance on the fly
  createProxyMiddleware({
    target: upstream,
    changeOrigin: true,
    secure: false,
    pathRewrite: (path, req) => {
      // strip off “/proxy” and leave the real target URL as the path
      return new URL(targetUrl).pathname + (new URL(targetUrl).search || "");
    },
    router: () => targetUrl,
    onProxyReq: (proxyReq, req) => {
      // set the Host header to the real target’s host
      const host = new URL(targetUrl).host;
      proxyReq.setHeader("Host", host);
    },
    logLevel: "debug"
  })(req, res, next);
});

app.listen(PORT, () =>
  console.log(`✅ Proxy server running on port ${PORT} with rotating IPs`)
);
