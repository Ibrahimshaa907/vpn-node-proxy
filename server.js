const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Proxy endpoint
app.get("/go", (req, res) => {
  const target = req.query.url;
  const apiKey = process.env.SCRAPER_API_KEY; // API key from Railway Variables

  if (!target) {
    return res.status(400).send("Missing ?url=");
  }

  if (!apiKey) {
    return res.status(500).send("Missing API key in environment variables.");
  }

  const encodedTarget = encodeURIComponent(target);
  const finalURL = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodedTarget}`;

  // Redirect to scraper-proxied URL
  res.redirect(finalURL);
});

app.listen(PORT, () => {
  console.log(`✅ ScraperAPI Proxy Server running on port ${PORT}`);
});
