const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

const createAppointment = async (req, res) => {
  try {
    const { visitor, host, visitDate, notes } = req.body;

    if (!visitor || !host || !visitDate) {
      return res.status(400).json({
        message: 'visitor, host and visitDate are required',
      });
    }

    const visitorDoc = await Visitor.findById(visitor);
    if (!visitorDoc) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    const hostUser = await User.findById(host);
    if (!hostUser) {
      return res.status(404).json({ message: 'Host user not found' });
    }

    if (hostUser.role !== 'employee') {
      return res.status(400).json({
        message: 'Selected host must be an employee',
      });
    }

    const appointment = await Appointment.create({
      visitor,
      host,
      visitDate,
      notes,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    if (visitorDoc.email) {
      await sendEmail({
        to: visitorDoc.email,
        subject: 'Visit appointment created',
        html: `
          <p>Hello ${visitorDoc.fullName},</p>
          <p>Your appointment with ${hostUser.name} has been created and is waiting for approval.</p>
          <p><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleString()}</p>
          <p><strong>Notes:</strong> ${notes || 'No notes added'}</p>
        `,
      });
    }

    return res.status(201).json(populatedAppointment);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to create appointment',
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { host: req.user._id } : {};

    const appointments = await Appointment.find(filter)
      .populate('visitor')
      .populate('host', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to load appointments',
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected', 'completed'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid appointment status',
      });
    }

    if (status) {
      appointment.status = status;
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    return res.json(populatedAppointment);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to update appointment',
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};