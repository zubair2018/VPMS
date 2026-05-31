const express = require('express');
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/').get(protect, getAppointments).post(protect, authorizeRoles('admin', 'employee'), createAppointment);
router.put('/:id/status', protect, authorizeRoles('admin', 'employee'), updateAppointmentStatus);

module.exports = router;
