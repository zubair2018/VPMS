const express = require('express');
const router = express.Router();

const {
  createPass,
  getPasses,
  scanPass,
} = require('../controllers/passController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getPasses);

router.post('/', protect, authorizeRoles('admin', 'security'), createPass);

router.post('/scan', protect, authorizeRoles('admin', 'security'), scanPass);

module.exports = router;