// backend/controllers/passController.js

const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const generatePassAssets = require('../utils/generatePassAssets');
const sendSms = require('../utils/sendSms');

const createPass = async (req, res) => {
  try {
    const { visitorId, appointmentId, validFrom, validTill } = req.body;

    if (!visitorId || !validFrom || !validTill) {
      return res.status(400).json({
        message: 'Visitor, valid from, and valid till are required'
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
      validTill
    });

    const pass = await Pass.create({
      visitor: visitorId,
      appointment: appointmentId || null,
      issuedBy: req.user._id,
      passNumber,
      qrCodeDataUrl,
      validFrom,
      validTill,
      pdfPath
    });

    // Fire-and-forget SMS to visitor
    if (visitor.phone) {
      const smsText = `Your visitor pass is generated.
Pass: ${passNumber}
Valid: ${new Date(validFrom).toLocaleString()} - ${new Date(
        validTill
      ).toLocaleString()}`;

      // Do not await here so API response is not delayed by SMS
      sendSms(visitor.phone, smsText);
    }

    const populatedPass = await Pass.findById(pass._id)
      .populate('visitor')
      .populate('appointment')
      .populate('issuedBy', 'name role');

    res.status(201).json(populatedPass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPasses = async (_req, res) => {
  try {
    const passes = await Pass.find()
      .populate('visitor')
      .populate('appointment')
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(passes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scanPass = async (req, res) => {
  try {
    const pass = await Pass.findOne({
      passNumber: req.body.passNumber
    }).populate('visitor');

    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    const nextAction = pass.status === 'issued' ? 'check-in' : 'check-out';
    pass.status = nextAction === 'check-in' ? 'checked-in' : 'checked-out';
    await pass.save();

    const log = await CheckLog.create({
      pass: pass._id,
      action: nextAction,
      scannedBy: req.user._id
    });

    res.json({
      message: `Pass ${nextAction} recorded`,
      pass,
      log
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPass,
  getPasses,
  scanPass
};