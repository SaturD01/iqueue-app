const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Token = require('../models/Token');
const verifyToken = require('../middleware/auth');

// POST /api/ratings — submit a rating
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tokenId, score } = req.body;

    if (!tokenId || !score) {
      return res.status(400).json({
        success: false,
        message: 'tokenId and score are required',
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 5',
      });
    }

    const token = await Token.findById(tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    const existing = await Rating.findOne({ tokenId });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Rating already submitted for this token',
      });
    }

    const rating = await Rating.create({
      tokenId,
      branchId: token.branchId,
      score,
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating,
    });

  } catch (error) {
    console.error('Rating error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;