const express = require("express");
const cors = require("cors");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Example free proxies — update frequently!
const PROXIES = [
  "http://103.216.82.19:6667",
  "http://103.216.82.20:6667",
  "http://103.216.82.21:6667",
  "http://103.216.82.22:6667",
  "http://103.216.82.23:6667"
];

function getRandomProxy() {
  const index = Math.floor(Math.random() * PROXIES.length);
  return PROXIES[index];
}

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/proxy", async (req, res, next) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing ?url= parameter.");
  }

  try {
    const proxy = getRandomProxy();

    console.log(`🌍 Using proxy: ${proxy}`);
    console.log(`➡️  Forwarding to: ${targetUrl}`);

    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      secure: false,
      pathRewrite: () => "",
      agent: require("http-proxy-agent")(proxy),
      onError: (err, req, res) => {
        console.error("Proxy error:", err.message);
        res.status(500).send("Proxy failed.");
      },
    })(req, res, next);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Unexpected server error.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ VPN proxy server running on port ${PORT}`);
});
