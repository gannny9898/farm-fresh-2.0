const express = require('express');
const path = require('path');

// Create Express app
const app = express();
const PORT = 8080;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve templates
app.get('/public/templates/:template', (req, res) => {
  const template = req.params.template;
  res.sendFile(path.join(__dirname, 'public', 'templates', template));
});

// Route all HTML files to their respective paths
app.get('/:page.html', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, `${page}.html`));
});

// Default route for the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Simple server running at http://localhost:${PORT}`);
  console.log(`View the website by opening http://localhost:${PORT} in your browser`);
});
