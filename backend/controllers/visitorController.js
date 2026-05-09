const Visitor = require('../models/Visitor');
const Pass = require('../models/Pass');

const createVisitor = async (req, res) => {
  try {
    const photoUrl = req.files?.photo?.[0]
      ? `/uploads/${req.files.photo[0].filename}`
      : req.body.photoUrl || '';

    const idProofUrl = req.files?.idProof?.[0]
      ? `/uploads/${req.files.idProof[0].filename}`
      : req.body.idProofUrl || '';

    const visitor = await Visitor.create({
      ...req.body,
      photoUrl,
      idProofUrl,
      createdBy: req.user._id
    });

    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitors = async (_req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publicRegisterVisitor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      purpose,
      idProofType,
      idProofNumber
    } = req.body;

    if (!fullName || !email || !phone || !purpose) {
      return res.status(400).json({
        message: 'Full name, email, phone and purpose are required'
      });
    }

    const visitor = await Visitor.create({
      fullName,
      email,
      phone,
      company,
      purpose,
      idProofType,
      idProofNumber
    });

    res.status(201).json({
      message: 'Visitor registered successfully. Wait for pass issuance.',
      visitor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitorPassByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    const pass = await Pass.findOne({ visitor: visitor._id })
      .populate('visitor')
      .sort({ createdAt: -1 });

    if (!pass) {
      return res.status(404).json({
        message: 'No pass found yet for this visitor'
      });
    }

    res.json({
      visitor,
      pass
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVisitor,
  getVisitors,
  publicRegisterVisitor,
  getVisitorPassByEmail
};