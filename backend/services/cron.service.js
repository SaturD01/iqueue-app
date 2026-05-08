/**
 * @file cron.service.js
 * @description Automated no-show scheduler using node-cron.
 *              Runs every 60 seconds and marks tokens as NO_SHOW
 *              if the customer has not appeared within 5 minutes
 *              of being called.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 */

const cron = require('node-cron');

/**
 * startCronJobs
 * Initialises all scheduled background jobs for the iQueue system.
 * Called once on server startup from server.js.
 *
 * Jobs registered:
 * 1. No-show auto-trigger — runs every 60 seconds
 */
const startCronJobs = () => {

  // ── NO-SHOW AUTO TRIGGER ──────────────────────────────────────
  // Runs every 60 seconds.
  // Finds all tokens with status CALLED where calledAt was more
  // than 5 minutes ago — marks them NO_SHOW and increments the
  // user's noShowCount.
  // Note: requires MongoDB connection. Skips gracefully if
  // Token or User models are not yet available.
  // ─────────────────────────────────────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      // Import models inside the job to avoid circular dependency
      // issues at startup. Models are only available after
      // MongoDB connects.
      const Token = require('../models/Token');
      const User = require('../models/User');

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Find all tokens that have been called but not served
      // and were called more than 5 minutes ago
      const overdueTokens = await Token.find({
        status: 'CALLED',
        calledAt: { $lt: fiveMinutesAgo },
      });

      if (overdueTokens.length === 0) return;

      console.log(`No-show cron: found ${overdueTokens.length} overdue token(s)`);

      for (const token of overdueTokens) {
        // Mark token as no-show
        token.status = 'NO_SHOW';
        await token.save();

        // Increment the customer's noShowCount
        await User.findByIdAndUpdate(token.customerId, {
          $inc: { noShowCount: 1 }
        });

        console.log(`No-show: token ${token.tokenNumber} marked NO_SHOW`);
      }

    } catch (error) {
      // Silently skip if models not available yet (no DB connection)
      if (error.message.includes('Cannot find module')) return;
      console.error('No-show cron error:', error.message);
    }
  });

  console.log('Cron jobs started — no-show scheduler active (60s interval)');
};

module.exports = { startCronJobs };