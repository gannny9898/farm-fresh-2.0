require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger, requestLogger, errorLogger } = require('./utils/logger');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const path = require('path');

// Middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve templates
app.get('/templates/:template', (req, res) => {
  const template = req.params.template;
  res.sendFile(path.join(__dirname, 'public', 'templates', template));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Handle HTML routes
const htmlRoutes = ['/', '/index.html', '/admin-dashboard.html', '/farmer-dashboard.html', '/customer-dashboard.html'];
app.get(htmlRoutes, (req, res) => {
  const route = req.path === '/' ? '/index.html' : req.path;
  res.sendFile(path.join(__dirname, 'public', route));
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Handle 404
app.use((req, res) => {
  logger.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

db.sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to connect to the database:', err);
    process.exit(1);
  }); 