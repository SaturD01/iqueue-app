const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const Branch = require('../models/Branch');
const verifyToken = require('../middleware/auth');

// POST /api/tokens — book a new token
router.post('/', verifyToken, async (req, res) => {
  try {
    const { branchId, serviceName, arrivalTime } = req.body;

    if (!branchId || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'branchId and serviceName are required',
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch || !branch.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found or inactive',
      });
    }

    const lastToken = await Token.findOne({ branchId })
      .sort({ createdAt: -1 });

    const nextNumber = lastToken
      ? parseInt(lastToken.tokenNumber.split('-')[1]) + 1
      : 1;

    const tokenNumber = `CF-${String(nextNumber).padStart(3, '0')}`;

    const position = await Token.countDocuments({
      branchId,
      status: { $in: ['CALLABLE', 'HELD', 'PRIORITY'] },
    }) + 1;

    const status = arrivalTime ? 'HELD' : 'CALLABLE';

    const token = await Token.create({
      tokenNumber,
      branchId,
      customerId: req.user.id,
      serviceName,
      status,
      position,
      arrivalTime: arrivalTime || null,
    });

    res.status(201).json({
      success: true,
      message: 'Token booked successfully',
      token,
    });

  } catch (error) {
    console.error('Book token error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/tokens/queue — get full queue for a branch
router.get('/queue', verifyToken, async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'branchId is required',
      });
    }

    const tokens = await Token.find({
      branchId,
      status: { $in: ['CALLABLE', 'HELD', 'CALLED', 'PRIORITY'] },
    })
      .populate('customerId', 'name phone noShowCount totalVisits')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      count: tokens.length,
      tokens,
    });

  } catch (error) {
    console.error('Get queue error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/tokens/my — get current user token
router.get('/my', verifyToken, async (req, res) => {
  try {
    const token = await Token.findOne({
      customerId: req.user.id,
      status: { $in: ['HELD', 'CALLABLE', 'CALLED', 'PRIORITY'] },
    })
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'No active token found',
      });
    }

    const position = await Token.countDocuments({
      branchId: token.branchId,
      status: { $in: ['CALLABLE', 'PRIORITY'] },
      position: { $lt: token.position },
    });

    const nowServing = await Token.findOne({
      branchId: token.branchId,
      status: 'CALLED',
    }).sort({ calledAt: -1 });

    res.status(200).json({
      success: true,
      token,
      position: position + 1,
      nowServing: nowServing ? nowServing.tokenNumber : null,
    });

  } catch (error) {
    console.error('Get my token error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/tokens/call-next — staff calls next token
router.post('/call-next', verifyToken, async (req, res) => {
  try {
    const { branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'branchId is required',
      });
    }

    const next = await Token.findOne({
      branchId,
      status: { $in: ['PRIORITY', 'CALLABLE'] },
    }).sort({ status: -1, position: 1 });

    if (!next) {
      return res.status(404).json({
        success: false,
        message: 'No callable tokens in queue',
      });
    }

    next.status = 'CALLED';
    next.calledAt = new Date();

    await next.save();

    res.status(200).json({
      success: true,
      message: `Now calling ${next.tokenNumber}`,
      token: next,
    });

  } catch (error) {
    console.error('Call next error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/tokens/:id/served — mark token as served
router.patch('/:id/served', verifyToken, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: 'SERVED', servedAt: new Date() },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token marked as served',
      token,
    });

  } catch (error) {
    console.error('Served error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/tokens/:id/no-show — mark token as no-show
router.patch('/:id/no-show', verifyToken, async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.id,
      { status: 'NO_SHOW' },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token marked as no-show',
      token,
    });

  } catch (error) {
    console.error('No-show error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;