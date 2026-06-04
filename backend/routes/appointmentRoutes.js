const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getAppointments,
} = require('../controllers/appointmentController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Get all appointments
router.get('/', protect, getAppointments);

// Create a new appointment
router.post('/', protect, authorizeRoles('admin', 'employee'), createAppointment);

module.exports = router;