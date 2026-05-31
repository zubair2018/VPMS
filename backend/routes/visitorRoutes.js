const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createAppointment,
  getAppointments,
} = require('../controllers/appointmentController');

// Import auth middlewares
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// GET all appointments
// POST create new appointment
router
  .route('/')
  .get(protect, getAppointments)
  .post(protect, authorizeRoles('admin', 'employee'), createAppointment);

module.exports = router;