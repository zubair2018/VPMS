// Import JWT package
const jwt = require('jsonwebtoken');

// Import User model
const User = require('../models/User');

// Middleware to protect private routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If token is missing
    if (!token) {
      return res.status(401).json({
        message: 'No token, not authorizeRolesd',
      });
    }

    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from database and remove password field
    req.user = await User.findById(decoded.id).select('-password');

    // If user does not exist anymore
    if (!req.user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.message);

    return res.status(401).json({
      message: 'Token failed',
    });
  }
};

// Middleware for role checking
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};