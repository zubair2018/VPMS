const mongoose = require('mongoose');

const passSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    passNumber: { type: String, required: true, unique: true },
    qrCodeDataUrl: { type: String, required: true },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    status: {
      type: String,
      enum: ['issued', 'checked-in', 'checked-out', 'expired'],
      default: 'issued'
    },
    pdfPath: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pass', passSchema);
