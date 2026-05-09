const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

const createAppointment = async (req, res) => {
  try {
    const { visitor, host, visitDate, notes } = req.body;

    if (!visitor || !host || !visitDate) {
      return res.status(400).json({
        message: 'Visitor, host, and visit date are required'
      });
    }

    const hostUser = await User.findById(host);
    if (!hostUser || hostUser.role !== 'employee') {
      return res.status(400).json({
        message: 'Selected host must be a valid employee'
      });
    }

    const appointment = await Appointment.create({
      visitor,
      host,
      visitDate,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    const visitorDoc = await Visitor.findById(visitor);

    if (visitorDoc?.email) {
      await sendEmail({
        to: visitorDoc.email,
        subject: 'Visit appointment created',
        html: `<p>Your appointment with ${hostUser.name} has been created and is awaiting approval.</p>`
      });
    }

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { host: req.user._id } : {};

    const appointments = await Appointment.find(filter)
      .populate('visitor')
      .populate('host', 'name email role')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = req.body.status || appointment.status;
    appointment.notes = req.body.notes ?? appointment.notes;

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
};