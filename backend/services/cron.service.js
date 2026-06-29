/**
 * @file cron.service.js
 * @description Automated no-show scheduler and daily stale token reset.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 * @updated 2026-06-29
 */
const cron = require('node-cron');

const startCronJobs = () => {

  // ── Job 1: No-show scheduler — runs every 60 seconds ──────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const Token = require('../models/Token');
      const User = require('../models/User');
      const socketService = require('./socket.service');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const overdueTokens = await Token.find({
        status: 'CALLED',
        calledAt: { $lt: fiveMinutesAgo },
      });

      if (overdueTokens.length === 0) return;

      console.log(`No-show cron: found ${overdueTokens.length} overdue token(s)`);

      for (const token of overdueTokens) {
        token.status = 'NO_SHOW';
        await token.save();

        await User.findByIdAndUpdate(token.customerId, {
          $inc: { noShowCount: 1 }
        });

        console.log(`No-show: token ${token.tokenNumber} marked NO_SHOW`);

        socketService.emitTokenServed(token.branchId.toString(), token);

        const updatedQueue = await Token.find({
          branchId: token.branchId,
          status: { $in: ['CALLABLE', 'CALLED'] },
        }).sort({ position: 1 });

        socketService.emitQueueUpdated(token.branchId.toString(), updatedQueue);
      }
    } catch (error) {
      if (error.message.includes('Cannot find module')) return;
      console.error('No-show cron error:', error.message);
    }
  });

  // ── Job 2: Daily stale token reset — runs every day at 3:30 PM ────────
  cron.schedule('30 15 * * *', async () => {
    try {
      const Token = require('../models/Token');
      const socketService = require('./socket.service');

      const staleTokens = await Token.find({
        status: { $in: ['CALLABLE', 'HELD', 'PRIORITY'] },
      });

      if (staleTokens.length === 0) {
        console.log('Daily reset: no stale tokens found');
        return;
      }

      console.log(`Daily reset: expiring ${staleTokens.length} stale token(s)`);

      // Group by branch for socket emissions
      const branchIds = [...new Set(staleTokens.map(t => t.branchId.toString()))];

      await Token.updateMany(
        { status: { $in: ['CALLABLE', 'HELD', 'PRIORITY'] } },
        { status: 'CANCELLED', cancelledAt: new Date() }
      );

      // Emit queue:updated to each affected branch
      for (const branchId of branchIds) {
        const updatedQueue = await Token.find({
          branchId,
          status: { $in: ['CALLABLE', 'CALLED'] },
        }).sort({ position: 1 });

        socketService.emitQueueUpdated(branchId, updatedQueue);
        console.log(`Daily reset: emitted queue:updated to branch ${branchId}`);
      }

      console.log('Daily reset complete — all stale tokens cancelled');
    } catch (error) {
      console.error('Daily reset cron error:', error.message);
    }
  });

  console.log('Cron jobs started — no-show scheduler (60s) + daily reset (15:30) active');
};

module.exports = { startCronJobs };