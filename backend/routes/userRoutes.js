const express = require('express');
const { protect, authorizeRolesRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

router.get('/admin-only', protect, authorizeRolesRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome admin' });
});

module.exports = router;