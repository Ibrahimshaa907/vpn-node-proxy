const express = require("express");
const path = require("path");
require("dotenv").config(); // .env se API key read karega
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Default API key fallback
const DEFAULT_API_KEY = "11637b5e460294bcfc8a1d999647a964";

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Proxy endpoint
app.get("/go", (req, res) => {
  const target = req.query.url;
  const apiKey = process.env.SCRAPER_API_KEY || DEFAULT_API_KEY; // fallback use karega

  if (!target) {
    return res.status(400).send("Missing ?url=");
  }

  const encodedTarget = encodeURIComponent(target);
  const finalURL = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodedTarget}`;

  // Redirect to scraper-proxied URL
  res.redirect(finalURL);
});

app.listen(PORT, () => {
  console.log(`✅ ScraperAPI Proxy Server running on port ${PORT}`);
});
