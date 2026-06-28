/**
 * @file cron.service.js
 * @description Automated no-show scheduler using node-cron.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 */
const cron = require('node-cron');

const startCronJobs = () => {
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

        // Emit socket events so tracker and staff panel update instantly
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

  console.log('Cron jobs started — no-show scheduler active (60s interval)');
};

module.exports = { startCronJobs };