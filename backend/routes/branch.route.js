const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// GET /api/branches — get all active branches
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true })
      .select('name address city')
      .sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: branches.length,
      branches,
    });
  } catch (error) {
    console.error('Get branches error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;