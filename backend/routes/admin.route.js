/**
 * @file admin.route.js
 * @description Admin endpoints for user management
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-19
 *
 * @routes
 *   GET   /api/admin/users      — search and list all users
 *   PATCH /api/admin/users/:id  — change user role or branch
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

// Models imported inside routes to avoid issues before
// B's schemas are merged to main
// Will be available after feature/token-api is merged

// ─────────────────────────────────────────────────────
// GET /api/admin/users — search and list all users
// ─────────────────────────────────────────────────────
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { search } = req.query;

    // Build search filter
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
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/admin/users/:id — change role or branch
// ─────────────────────────────────────────────────────
router.patch('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { role, branchId } = req.body;

    // Validate role if provided
    const validRoles = ['customer', 'staff', 'manager', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Build update object with only provided fields
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
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;