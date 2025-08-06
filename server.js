const express = require("express");
const path = require("path");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://", // ✅ Required to avoid undefined error
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
    router: (req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      return url.searchParams.get("url");
    },
    onProxyReq: (proxyReq, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const target = url.searchParams.get("url");
      if (target) {
        const targetUrl = new URL(target);
        proxyReq.setHeader("Host", targetUrl.host);
      }
    },
    logLevel: "debug",
  })
);

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
});
