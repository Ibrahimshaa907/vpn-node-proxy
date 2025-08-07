const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SCRAPER_API_KEY = '11637b5e460294bcfc8a1d999647a964';

app.use(cors());

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({
      status: 400,
      error: {
        title: "Missing URL",
        message: "Please provide a 'url' query parameter."
      }
    });
  }

  try {
    const response = await axios.get('https://api.scraperapi.com/', {
      params: {
        api_key: SCRAPER_API_KEY,
        url: targetUrl
      }
    });

    res.send(response.data);
  } catch (err) {
    res.status(500).json({
      status: 500,
      error: {
        title: "Scraping Failed",
        message: err.message
      }
    });
  }
});

app.get('/', (req, res) => {
  res.send("✅ ScraperAPI proxy server is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
});
