const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Static frontend serve karo
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Proxy endpoint
app.get("/go", (req, res) => {
  const target = req.query.url;
  const apiKey = "11637b5e460294bcfc8a1d999647a964";

  if (!target) {
    return res.status(400).send("Missing ?url=");
  }

  const encodedTarget = encodeURIComponent(target);
  const finalURL = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodedTarget}`;

  // Direct ScraperAPI URL pe redirect
  res.redirect(finalURL);
});

app.listen(PORT, () => {
  console.log(`✅ ScraperAPI Proxy Server running on port ${PORT}`);
});
