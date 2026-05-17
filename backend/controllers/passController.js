// backend/controllers/passController.js

const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const generatePassAssets = require('../utils/generatePassAssets');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/sendEmail');

const createPass = async (req, res) => {
  try {
    const { visitorId, appointmentId, validFrom, validTill } = req.body;

    if (!visitorId || !validFrom || !validTill) {
      return res.status(400).json({
        message: 'visitorId, validFrom and validTill are required',
      });
    }

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    let appointment = null;

    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
    }

    const passNumber = `VP-${Date.now()}`;

    const { qrCodeDataUrl, pdfPath } = await generatePassAssets({
      passNumber,
      visitorName: visitor.fullName,
      purpose: visitor.purpose,
      validTill,
    });

    const pass = await Pass.create({
      visitor: visitor._id,
      appointment: appointment ? appointment._id : null,
      issuedBy: req.user._id,
      passNumber,
      qrCodeDataUrl,
      validFrom,
      validTill,
      pdfPath,
    });

    const populatedPass = await Pass.findById(pass._id)
      .populate('visitor')
      .populate('appointment')
      .populate('issuedBy', 'name role');

    // SMS is sent in the background so the API does not feel slow to the user.
    // Even if SMS fails, the pass is already created and should still be usable.
    if (visitor.phone) {
      const smsText = `Your visitor pass is generated.
Pass: ${passNumber}
Valid: ${new Date(validFrom).toLocaleString()} - ${new Date(validTill).toLocaleString()}`;

      sendSms(visitor.phone, smsText).catch((err) => {
        console.error('SMS send failed:', err.message);
      });
    }

    // Email is useful because we can share pass details and the PDF link more clearly.
    if (visitor.email) {
      const subject = `Visitor Pass Generated - ${passNumber}`;

      const text = `Hello ${visitor.fullName},

Your visitor pass has been generated successfully.

Pass Number: ${passNumber}
Purpose: ${visitor.purpose || 'N/A'}
Valid From: ${new Date(validFrom).toLocaleString()}
Valid Till: ${new Date(validTill).toLocaleString()}

Please keep this pass with you during your visit.`;

      await sendEmail({
        to: visitor.email,
        subject,
        text,
      });
    }

    return res.status(201).json(populatedPass);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to create pass',
    });
  }
};

const getPasses = async (req, res) => {
  try {
    const passes = await Pass.find()
      .populate('visitor')
      .populate('appointment')
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });

    return res.json(passes);
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to fetch passes',
    });
  }
};

const scanPass = async (req, res) => {
  try {
    const { passNumber } = req.body;

    if (!passNumber) {
      return res.status(400).json({ message: 'Pass number is required' });
    }

    const pass = await Pass.findOne({ passNumber }).populate('visitor');

    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    let action = '';
    let nextStatus = '';

    if (pass.status === 'issued') {
      action = 'check-in';
      nextStatus = 'checked-in';
    } else if (pass.status === 'checked-in') {
      action = 'check-out';
      nextStatus = 'checked-out';
    } else {
      return res.status(400).json({
        message: `Pass cannot be scanned when status is ${pass.status}`,
      });
    }

    pass.status = nextStatus;
    await pass.save();

    const log = await CheckLog.create({
      pass: pass._id,
      action,
      scannedBy: req.user._id,
    });

    return res.json({
      message: `Pass ${action} recorded`,
      pass,
      log,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to scan pass',
    });
  }
};

module.exports = {
  createPass,
  getPasses,
  scanPass,
};