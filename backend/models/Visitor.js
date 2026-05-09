const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: String,
    purpose: { type: String, required: true },
    photoUrl: String,
    idProofType: String,
    idProofNumber: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
