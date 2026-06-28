/**
 * @file admin.route.js
 * @description Admin endpoints for user management
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-19
 */

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/admin/users — search and list all users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { search } = req.query;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id — change role or branch
router.patch('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { role, branchId } = req.body;

    const validRoles = ['customer', 'staff', 'manager', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const updateFields = {};
    if (role) updateFields.role = role;
    if (branchId) updateFields.branchId = branchId;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update: role or branchId',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
      .select('-passwordHash')
      .populate('branchId', 'name city');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });

  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/ai-recommendation — AI staffing recommendation
router.post('/ai-recommendation', verifyToken, requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { servedCount, avgWaitMinutes, noShowCount } = req.body;

    const { getStaffingRecommendation } = require('../services/claude.service');

    // Build simplified hourly stats from today's summary
    const hourlyStats = [
      { hour: 10, avgServed: Math.round(servedCount * 0.3), avgServiceTimeMinutes: avgWaitMinutes || 5 },
      { hour: 11, avgServed: Math.round(servedCount * 0.25), avgServiceTimeMinutes: avgWaitMinutes || 5 },
      { hour: 14, avgServed: Math.round(servedCount * 0.25), avgServiceTimeMinutes: avgWaitMinutes || 5 },
      { hour: 9, avgServed: Math.round(servedCount * 0.1), avgServiceTimeMinutes: avgWaitMinutes || 5 },
      { hour: 15, avgServed: Math.round(servedCount * 0.1), avgServiceTimeMinutes: avgWaitMinutes || 5 },
    ];

    const sevenDayTrend = [
      {
        date: new Date().toISOString().split('T')[0],
        totalServed: servedCount,
        noShowRate: servedCount > 0 ? noShowCount / (servedCount + noShowCount) : 0,
      }
    ];

    const result = await getStaffingRecommendation({ hourlyStats, sevenDayTrend });

    res.status(200).json({
      success: true,
      recommendation: result.summary || 'Analysis complete. Review peak hours and teller recommendations.',
    });

  } catch (error) {
    console.error('AI recommendation error:', error.message);
    res.status(500).json({ success: false, message: 'AI service unavailable' });
  }
});

module.exports = router;