const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../middleware/authMiddleware');

// Import controller
const { getDashboardStats } = require('../controllers/dashboardController');

// Route to get dashboard stats
router.get('/stats', protect, getDashboardStats);

module.exports = router;