const express = require('express');
const router = express.Router();

const {
  createVisitor,
  getVisitors,
  publicRegisterVisitor,
  getVisitorPassByEmail,
} = require('../controllers/visitorController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public visitor registration
router.post('/register', publicRegisterVisitor);

// Public pass lookup by email
router.get('/pass', getVisitorPassByEmail);

// Get all visitors
router.get('/', protect, getVisitors);

// Create visitor manually
router.post('/', protect, authorizeRoles('admin', 'employee'), createVisitor);

module.exports = router;