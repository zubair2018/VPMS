const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const generatePassAssets = require('../utils/generatePassAssets');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/mailer');

const createPass = async (req, res) => {
  try {
    const { visitorId, appointmentId, validFrom, validTill } = req.body;

    if (!visitorId || !validFrom || !validTill) {
      return res.status(400).json({
        message: 'Visitor, valid from and valid till are required',
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

    const passNumber = 'VP-' + Date.now();

    const passFiles = await generatePassAssets({
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
      qrCodeDataUrl: passFiles.qrCodeDataUrl,
      pdfPath: passFiles.pdfPath,
      validFrom,
      validTill,
    });

    const savedPass = await Pass.findById(pass._id)
      .populate('visitor')
      .populate({
        path: 'appointment',
        populate: {
          path: 'host',
          select: 'name email role',
        },
      })
      .populate('issuedBy', 'name role');

    if (visitor.phone) {
      try {
        const smsText =
          `Your visitor pass is ready. Pass Number: ${passNumber}. ` +
          `Valid From: ${new Date(validFrom).toLocaleString()}. ` +
          `Valid Till: ${new Date(validTill).toLocaleString()}`;

        await sendSms(visitor.phone, smsText);
      } catch (smsError) {
        console.log('SMS not sent');
      }
    }

    if (visitor.email) {
      try {
        await sendEmail({
          to: visitor.email,
          subject: 'Visitor Pass Generated',
          html: `
            <p>Hello ${visitor.fullName},</p>
            <p>Your visitor pass has been generated.</p>
            <p><strong>Pass Number:</strong> ${passNumber}</p>
            <p><strong>Purpose:</strong> ${visitor.purpose || 'N/A'}</p>
            <p><strong>Valid From:</strong> ${new Date(validFrom).toLocaleString()}</p>
            <p><strong>Valid Till:</strong> ${new Date(validTill).toLocaleString()}</p>
          `,
        });
      } catch (emailError) {
        console.log('Email not sent');
      }
    }

    res.status(201).json(savedPass);
  } catch (error) {
    console.log('Create pass error:', error.message);
    res.status(500).json({ message: 'Could not create pass' });
  }
};

const getPasses = async (req, res) => {
  try {
    const passes = await Pass.find()
      .populate('visitor')
      .populate({
        path: 'appointment',
        populate: {
          path: 'host',
          select: 'name email role',
        },
      })
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(passes);
  } catch (error) {
    console.log('Get passes error:', error.message);
    res.status(500).json({ message: 'Could not get passes' });
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

    if (pass.status === 'issued') {
      pass.status = 'checked-in';
      action = 'check-in';
    } else if (pass.status === 'checked-in') {
      pass.status = 'checked-out';
      action = 'check-out';
    } else {
      return res.status(400).json({
        message: 'This pass cannot be scanned now',
      });
    }

    await pass.save();

    const log = await CheckLog.create({
      pass: pass._id,
      action,
      scannedBy: req.user._id,
    });

    res.json({
      message: `Pass ${action} successful`,
      pass,
      log,
    });
  } catch (error) {
    console.log('Scan pass error:', error.message);
    res.status(500).json({ message: 'Could not scan pass' });
  }
};

module.exports = {
  createPass,
  getPasses,
  scanPass,
};