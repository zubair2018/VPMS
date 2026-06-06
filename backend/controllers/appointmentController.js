const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

const createAppointment = async (req, res) => {
  try {
    const { visitor, host, visitDate, notes } = req.body;

    if (!visitor || !host || !visitDate) {
      return res.status(400).json({
        message: 'Visitor, host and visit date are required',
      });
    }

    const visitorData = await Visitor.findById(visitor);
    if (!visitorData) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    const hostData = await User.findById(host);
    if (!hostData) {
      return res.status(404).json({ message: 'Host not found' });
    }

    if (hostData.role !== 'employee') {
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

    const savedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    if (visitorData.email) {
      try {
        await sendEmail({
          to: visitorData.email,
          subject: 'Appointment Created',
          html: `
            <p>Hello ${visitorData.fullName},</p>
            <p>Your appointment has been created.</p>
            <p><strong>Host:</strong> ${hostData.name}</p>
            <p><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleString()}</p>
            <p><strong>Notes:</strong> ${notes || 'No notes added'}</p>
            <p>Your appointment is waiting for approval.</p>
          `,
        });
      } catch (emailError) {
        console.log('Appointment email not sent');
      }
    }

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.log('Create appointment error:', error.message);
    res.status(500).json({ message: 'Could not create appointment' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'employee') {
      filter.host = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('visitor')
      .populate('host', 'name email role')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.log('Get appointments error:', error.message);
    res.status(500).json({ message: 'Could not fetch appointments' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (status) {
      appointment.status = status;
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    res.json(updatedAppointment);
  } catch (error) {
    console.log('Update appointment error:', error.message);
    res.status(500).json({ message: 'Could not update appointment' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};