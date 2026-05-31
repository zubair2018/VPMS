const express = require('express');
const { createPass, getPasses, scanPass } = require('../controllers/passController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(protect, getPasses).post(protect, authorizeRoles('admin', 'security'), createPass);
router.post('/scan', protect, authorizeRoles('admin', 'security'), scanPass);

module.exports = router;
