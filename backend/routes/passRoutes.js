const express = require('express');
const { createPass, getPasses, scanPass } = require('../controllers/passController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(protect, getPasses).post(protect, authorize('admin', 'security'), createPass);
router.post('/scan', protect, authorize('admin', 'security'), scanPass);

module.exports = router;
