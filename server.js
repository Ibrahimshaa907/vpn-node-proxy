const express = require("express");
const path = require("path");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Proxy route
app.use(
  "/proxy",
  async (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({
        status: 400,
        error: {
          title: "Missing URL",
          message: "Please provide a ?url=https://example.com",
        },
      });
    }

    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: { "^/proxy": "" },
      secure: false,
      headers: {
        host: new URL(targetUrl).host,
      },
      onError(err, req, res) {
        res.status(500).json({ error: "Proxy error", details: err.message });
      },
    })(req, res, next);
  }
);

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
});
