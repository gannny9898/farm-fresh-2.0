const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const isFarmer = (req, res, next) => {
  if (req.user.user_type !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Farmer role required.'
    });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.user_type !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isFarmer,
  isCustomer,
  isAdmin
}; 