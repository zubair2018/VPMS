const express = require('express');
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(protect, getAppointments).post(protect, authorize('admin', 'employee'), createAppointment);
router.put('/:id/status', protect, authorize('admin', 'employee'), updateAppointmentStatus);

module.exports = router;
