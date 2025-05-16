const validateRegistration = (req, res, next) => {
  const { email, password, full_name, phone, user_type } = req.body;

  if (!email || !password || !full_name || !phone || !user_type) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided'
    });
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  if (!['farmer', 'customer', 'admin'].includes(user_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user type'
    });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, unit, category_id } = req.body;

  if (!name || !price || !unit || !category_id) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided'
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number'
    });
  }

  next();
};

const validateOrder = (req, res, next) => {
  const { items, delivery_address, payment_method } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Order must contain at least one item'
    });
  }

  if (!delivery_address) {
    return res.status(400).json({
      success: false,
      message: 'Delivery address is required'
    });
  }

  if (!payment_method) {
    return res.status(400).json({
      success: false,
      message: 'Payment method is required'
    });
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item in order'
      });
    }
  }

  next();
};

module.exports = {
  validateRegistration,
  validateProduct,
  validateOrder
}; 