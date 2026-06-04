const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Logged in user details
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Only admin can open this route
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
  res.json({
    message: 'Welcome admin',
  });
});

module.exports = router;