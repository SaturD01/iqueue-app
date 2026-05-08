const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/analytics/summary — today's summary
router.get('/summary', verifyToken, requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { branchId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalServed = await Token.countDocuments({
      branchId,
      status: 'SERVED',
      servedAt: { $gte: today },
    });

    const totalNoShows = await Token.countDocuments({
      branchId,
      status: 'NO_SHOW',
      updatedAt: { $gte: today },
    });

    const servedTokens = await Token.find({
      branchId,
      status: 'SERVED',
      servedAt: { $gte: today },
      serviceTimeMinutes: { $ne: null },
    });

    const avgServiceTimeMinutes = servedTokens.length > 0
      ? servedTokens.reduce((sum, t) => sum + t.serviceTimeMinutes, 0) / servedTokens.length
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalServed,
        totalNoShows,
        avgServiceTimeMinutes: Math.round(avgServiceTimeMinutes * 10) / 10,
      },
    });

  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/analytics/hourly — hourly breakdown
router.get('/hourly', verifyToken, requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { branchId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tokens = await Token.find({
      branchId,
      status: 'SERVED',
      servedAt: { $gte: today },
    });

    const hourly = {};

    tokens.forEach(t => {
      const hour = new Date(t.servedAt).getHours();

      if (!hourly[hour]) hourly[hour] = 0;

      hourly[hour]++;
    });

    const result = Array.from({ length: 10 }, (_, i) => {
      const hour = i + 8;

      return {
        hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`,
        served: hourly[hour] || 0,
      };
    });

    res.status(200).json({
      success: true,
      hourly: result,
    });

  } catch (error) {
    console.error('Hourly error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;