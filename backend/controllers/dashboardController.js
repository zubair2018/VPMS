const Visitor = require('../models/Visitor');
const Appointment = require('../models/Appointment');
const Pass = require('../models/Pass');
const CheckLog = require('../models/CheckLog');

const getStats = async (_req, res) => {
  try {
    const [visitors, appointments, issuedPasses, checkedIns, logs] = await Promise.all([
      Visitor.countDocuments(),
      Appointment.countDocuments(),
      Pass.countDocuments(),
      Pass.countDocuments({ status: 'checked-in' }),
      CheckLog.find().populate({ path: 'pass', populate: { path: 'visitor' } }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({ visitors, appointments, issuedPasses, checkedIns, recentLogs: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
