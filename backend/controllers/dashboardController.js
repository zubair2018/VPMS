// Import models
const Visitor = require('../models/Visitor');
const Pass = require('../models/Pass');

// Controller function to get all dashboard data
const getDashboardStats = async (req, res) => {
  try {
    // Run all queries together for faster response
    const [
      totalVisitors,
      totalPasses,
      checkedInPasses,
      checkedOutPasses,
      issuedPasses,
      expiredPasses,
      recentVisitors,
      recentPasses,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Pass.countDocuments(),
      Pass.countDocuments({ status: 'checked-in' }),
      Pass.countDocuments({ status: 'checked-out' }),
      Pass.countDocuments({ status: 'issued' }),
      Pass.countDocuments({ status: 'expired' }),

      // Get latest 5 visitors
      Visitor.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Get latest 5 passes with visitor details
      Pass.find()
        .populate('visitor', 'fullName email phone')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Send response to frontend
    return res.status(200).json({
      totalVisitors,
      totalPasses,
      checkedInPasses,
      checkedOutPasses,
      issuedPasses,
      expiredPasses,
      recentVisitors,
      recentPasses,
    });
  } catch (error) {
    console.error('DASHBOARD ERROR:', error.message);

    return res.status(500).json({
      message: 'Could not load dashboard stats',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};