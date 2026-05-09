const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
  {
    pass: { type: mongoose.Schema.Types.ObjectId, ref: 'Pass', required: true },
    action: { type: String, enum: ['check-in', 'check-out'], required: true },
    time: { type: Date, default: Date.now },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CheckLog', checkLogSchema);
