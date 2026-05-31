const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const generatePassAssets = require('../utils/generatePassAssets');
const sendSms = require('../utils/sendSms');
const sendEmail = require('../utils/mailer');

// Create new pass
const createPass = async (req, res) => {
  try {
    const visitorId = req.body.visitorId;
    const appointmentId = req.body.appointmentId;
    const validFrom = req.body.validFrom;
    const validTill = req.body.validTill;

    // Check required fields
    if (!visitorId || !validFrom || !validTill) {
      return res.status(400).json({
        message: 'Visitor, valid from and valid till are required',
      });
    }

    // Find visitor
    const visitorData = await Visitor.findById(visitorId);

    if (!visitorData) {
      return res.status(404).json({
        message: 'Visitor not found',
      });
    }

    // If appointment is sent, check it
    let appointmentData = null;

    if (appointmentId) {
      appointmentData = await Appointment.findById(appointmentId);

      if (!appointmentData) {
        return res.status(404).json({
          message: 'Appointment not found',
        });
      }
    }

    // Make a simple pass number
    const passNumber = 'VP-' + Date.now();

    // Generate QR code and PDF
    // This function creates the pass assets based on visitor details
    const passFiles = await generatePassAssets({
      passNumber: passNumber,
      visitorName: visitorData.fullName,
      purpose: visitorData.purpose,
      validTill: validTill,
    });

    // Save pass in database
    const newPass = await Pass.create({
      visitor: visitorData._id,
      appointment: appointmentData ? appointmentData._id : null,
      issuedBy: req.user._id,
      passNumber: passNumber,
      qrCodeDataUrl: passFiles.qrCodeDataUrl,
      pdfPath: passFiles.pdfPath,
      validFrom: validFrom,
      validTill: validTill,
    });

    // Populate related data so frontend gets full names instead of only ids
    const savedPass = await Pass.findById(newPass._id)
      .populate('visitor')
      .populate({
        path: 'appointment',
        populate: {
          path: 'host',
          select: 'name email role',
        },
      })
      .populate('issuedBy', 'name role');

    // Send SMS if visitor phone exists
    if (visitorData.phone) {
      const smsText =
        'Your visitor pass is ready. Pass Number: ' +
        passNumber +
        '. Valid From: ' +
        new Date(validFrom).toLocaleString() +
        '. Valid Till: ' +
        new Date(validTill).toLocaleString();

      try {
        await sendSms(visitorData.phone, smsText);
      } catch (smsError) {
        console.log('SMS not sent');
      }
    }

    // Send email if visitor email exists
    if (visitorData.email) {
      const emailHtml = `
        <p>Hello ${visitorData.fullName},</p>
        <p>Your visitor pass has been generated.</p>
        <p><strong>Pass Number:</strong> ${passNumber}</p>
        <p><strong>Purpose:</strong> ${visitorData.purpose || 'N/A'}</p>
        <p><strong>Valid From:</strong> ${new Date(validFrom).toLocaleString()}</p>
        <p><strong>Valid Till:</strong> ${new Date(validTill).toLocaleString()}</p>
      `;

      try {
        await sendEmail({
          to: visitorData.email,
          subject: 'Visitor Pass Generated',
          html: emailHtml,
        });
      } catch (emailError) {
        console.log('Email not sent');
      }
    }

    res.status(201).json(savedPass);
  } catch (error) {
    res.status(500).json({
      message: 'Could not create pass',
    });
  }
};

// Get all passes
const getPasses = async (req, res) => {
  try {
    const passList = await Pass.find()
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

    res.json(passList);
  } catch (error) {
    res.status(500).json({
      message: 'Could not get passes',
    });
  }
};

// Scan pass for check-in and check-out
const scanPass = async (req, res) => {
  try {
    const passNumber = req.body.passNumber;

    if (!passNumber) {
      return res.status(400).json({
        message: 'Pass number is required',
      });
    }

    const passData = await Pass.findOne({ passNumber: passNumber }).populate('visitor');

    if (!passData) {
      return res.status(404).json({
        message: 'Pass not found',
      });
    }

    let action = '';

    // First scan means visitor entered
    if (passData.status === 'issued') {
      passData.status = 'checked-in';
      action = 'check-in';
    }
    // Second scan means visitor left
    else if (passData.status === 'checked-in') {
      passData.status = 'checked-out';
      action = 'check-out';
    }
    // Other states are not allowed
    else {
      return res.status(400).json({
        message: 'This pass cannot be scanned now',
      });
    }

    await passData.save();

    // Save scan activity in check log
    const checkLog = await CheckLog.create({
      pass: passData._id,
      action: action,
      scannedBy: req.user._id,
    });

    res.json({
      message: 'Pass ' + action + ' successful',
      pass: passData,
      log: checkLog,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not scan pass',
    });
  }
};

module.exports = {
  createPass,
  getPasses,
  scanPass,
};