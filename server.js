const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Bypass iframe block
app.get("/go", async (req, res) => {
  const target = req.query.url;
  const apiKey = process.env.SCRAPER_API_KEY;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const finalURL = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(target)}`;
    const response = await fetch(finalURL);
    let html = await response.text();

    // Parse HTML and rewrite all resource links
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Rewrite all <a>, <link>, <script>, <img> URLs
    const attrsToRewrite = [
      { tag: "a", attr: "href" },
      { tag: "link", attr: "href" },
      { tag: "script", attr: "src" },
      { tag: "img", attr: "src" },
      { tag: "iframe", attr: "src" }
    ];

    attrsToRewrite.forEach(({ tag, attr }) => {
      doc.querySelectorAll(`${tag}[${attr}]`).forEach(el => {
        let val = el.getAttribute(attr);
        if (val && !val.startsWith("http") && !val.startsWith("data:")) {
          // Convert relative URL to absolute based on target
          const abs = new URL(val, target).href;
          el.setAttribute(attr, `/go?url=${encodeURIComponent(abs)}`);
        } else if (val && val.startsWith("http")) {
          el.setAttribute(attr, `/go?url=${encodeURIComponent(val)}`);
        }
      });
    });

    // Send modified HTML
    res.setHeader("Content-Type", "text/html");
    res.send(dom.serialize());

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at port ${PORT}`);
});
