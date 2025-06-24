const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://thegrandhotel.manyiridevs.xyz');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Proxy endpoint for booking form
app.post('/api/book', async (req, res) => {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbx9ijbikVsGgPUR01jmE0g0gagivGVFgAw9uwenFks7goPrHeKxFTEM-C-5x4D8Bool/exec', {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Apps Script error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ status: 'error', message: `Server error: ${error.message}` });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Proxy server is running' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});