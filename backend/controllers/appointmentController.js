const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const visitorId = req.body.visitor;
    const hostId = req.body.host;
    const visitDate = req.body.visitDate;
    const notes = req.body.notes;

    // Basic validation
    if (!visitorId || !hostId || !visitDate) {
      return res.status(400).json({
        message: 'Visitor, host and visit date are required',
      });
    }

    // Check visitor
    const visitorData = await Visitor.findById(visitorId);
    if (!visitorData) {
      return res.status(404).json({
        message: 'Visitor not found',
      });
    }

    // Check host user
    const hostData = await User.findById(hostId);
    if (!hostData) {
      return res.status(404).json({
        message: 'Host not found',
      });
    }

    // Only employee can be host
    if (hostData.role !== 'employee') {
      return res.status(400).json({
        message: 'Selected host must be an employee',
      });
    }

    // Save appointment
    const newAppointment = await Appointment.create({
      visitor: visitorId,
      host: hostId,
      visitDate: visitDate,
      notes: notes,
    });

    // Get appointment with full visitor and host details
    const savedAppointment = await Appointment.findById(newAppointment._id)
      .populate('visitor')
      .populate('host', 'name email role');

    // Send email to visitor if email exists
    if (visitorData.email) {
      const emailHtml = `
        <p>Hello ${visitorData.fullName},</p>
        <p>Your appointment has been created.</p>
        <p><strong>Host:</strong> ${hostData.name}</p>
        <p><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleString()}</p>
        <p><strong>Notes:</strong> ${notes || 'No notes added'}</p>
        <p>Your appointment is waiting for approval.</p>
      `;

      await sendEmail({
        to: visitorData.email,
        subject: 'Appointment Created',
        html: emailHtml,
      });
    }

    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({
      message: 'Could not create appointment',
    });
  }
};

// Get appointments
const getAppointments = async (req, res) => {
  try {
    let findData = {};

    // If employee is logged in, only show their appointments
    if (req.user.role === 'employee') {
      findData.host = req.user._id;
    }

    const list = await Appointment.find(findData)
      .populate('visitor')
      .populate('host', 'name email role')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch appointments',
    });
  }
};

// Update appointment status or notes
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const status = req.body.status;
    const notes = req.body.notes;

    const appointmentData = await Appointment.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    const validStatusList = ['pending', 'approved', 'rejected', 'completed'];

    // Check if status is valid
    if (status && !validStatusList.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value',
      });
    }

    // Update status if provided
    if (status) {
      appointmentData.status = status;
    }

    // Update notes if provided
    if (notes !== undefined) {
      appointmentData.notes = notes;
    }

    await appointmentData.save();

    const updatedAppointment = await Appointment.findById(appointmentData._id)
      .populate('visitor')
      .populate('host', 'name email role');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({
      message: 'Could not update appointment',
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};