const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getAppointments);

router.post('/', protect, authorizeRoles('admin', 'employee'), createAppointment);

router.put(
  '/:id/status',
  protect,
  authorizeRoles('admin', 'employee'),
  updateAppointmentStatus
);

module.exports = router;