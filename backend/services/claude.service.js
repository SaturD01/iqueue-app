/**
 * @file claude.service.js
 * @description Claude AI service — powers all 3 AI features of iQueue.
 *              Enforces strict privacy: never sends customer names,
 *              emails, or phone numbers to the Anthropic API.
 *              Only anonymised token IDs and aggregate statistics are sent.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 *
 * @outputs
 *   Output 1 — getStaffingRecommendation()
 *              Peak-hour analysis and teller count recommendations
 *              Triggered by: manager clicks Run AI Analysis
 *
 *   Output 2 — getNoShowRiskFlags()
 *              Per-token no-show risk level (HIGH/MEDIUM/LOW/NONE)
 *              Triggered by: staff panel loads queue
 *
 *   Output 3 — getNotifyThreshold()
 *              Smart notification position threshold
 *              Triggered by: once per branch per day at session start
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT 1 — STAFFING RECOMMENDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getStaffingRecommendation
 * Analyses 7-day queue statistics and returns peak-hour identification
 * and teller count recommendations for the manager dashboard.
 *
 * PRIVACY: Only aggregate hourly stats are sent. No customer PII.
 *
 * @param {Object} params
 * @param {Array} params.hourlyStats
 *   [{ hour: 9, avgServed: 14, avgServiceTimeMinutes: 6.2 }]
 * @param {Array} params.sevenDayTrend
 *   [{ date: '2026-04-01', totalServed: 87, noShowRate: 0.08 }]
 *
 * @returns {Object} {
 *   peakHours, normalHours, offPeakHours,
 *   tellersPeak, tellersNormal, tellersOffPeak, summary
 * }
 */
const getStaffingRecommendation = async ({ hourlyStats, sevenDayTrend }) => {
  try {
    const prompt = `You are an AI assistant for iQueue, a bank queue management system in Sri Lanka.

Analyse this branch queue data and provide staffing recommendations.

Hourly statistics (average over last 7 days):
${JSON.stringify(hourlyStats, null, 2)}

7-day trend:
${JSON.stringify(sevenDayTrend, null, 2)}

Respond ONLY with a JSON object in this exact format, no other text:
{
  "peakHours": [10, 11, 14],
  "normalHours": [9, 12, 13, 15, 16],
  "offPeakHours": [8, 17],
  "tellersPeak": 4,
  "tellersNormal": 2,
  "tellersOffPeak": 1,
  "summary": "Plain English paragraph the manager can act on immediately."
}`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text.trim();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error('Claude Output 1 error:', error.message);
    // Return sensible defaults if Claude fails
    return {
      peakHours: [10, 11, 14],
      normalHours: [9, 12, 13, 15, 16],
      offPeakHours: [8, 17],
      tellersPeak: 4,
      tellersNormal: 2,
      tellersOffPeak: 1,
      summary: 'AI analysis unavailable. Using default recommendations based on typical banking patterns.'
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT 2 — NO-SHOW RISK FLAGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getNoShowRiskFlags
 * Evaluates no-show risk for each token in the current queue.
 * Returns a risk level per token based on historical no-show behaviour.
 *
 * PRIVACY: Only anonymised tokenIds and counts are sent.
 *          Customer names and emails are NEVER included.
 *
 * @param {Array} tokenList
 *   [{ tokenId: 'CF-007', noShowCount: 3, totalVisits: 10 }]
 *
 * @returns {Array}
 *   [{ tokenId: 'CF-007', riskLevel: 'HIGH' }]
 *   riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
 */
const getNoShowRiskFlags = async (tokenList) => {
  // Return NONE for all if list is empty
  if (!tokenList || tokenList.length === 0) return [];

  try {
    const prompt = `You are an AI assistant for iQueue, a bank queue management system.

Evaluate no-show risk for each token based on historical data.
Note: tokenId values are anonymised identifiers, not customer names.

Token data:
${JSON.stringify(tokenList, null, 2)}

Risk level rules:
- HIGH: noShowCount >= 3
- MEDIUM: noShowCount is 1 or 2
- LOW: noShowCount is 0 but totalVisits > 1
- NONE: first visit (totalVisits <= 1 and noShowCount is 0)

Respond ONLY with a JSON array in this exact format, no other text:
[
  { "tokenId": "CF-007", "riskLevel": "HIGH" },
  { "tokenId": "CF-008", "riskLevel": "NONE" }
]`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text.trim();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error('Claude Output 2 error:', error.message);
    // Return NONE for all tokens if Claude fails
    return tokenList.map(t => ({ tokenId: t.tokenId, riskLevel: 'NONE' }));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT 3 — SMART NOTIFICATION THRESHOLD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getNotifyThreshold
 * Determines the optimal queue position at which to send the
 * "It's Your Turn" notification email based on today's service speed.
 *
 * PRIVACY: Only aggregate timing statistics are sent. No PII.
 *
 * @param {Object} params
 * @param {number} params.avgServiceTimeMinutes - Today's avg service time
 * @param {number} params.currentQueueLength - How many tokens in queue now
 * @param {number} params.historicalAvgGapMinutes - Avg gap between notification and arrival
 *
 * @returns {number} notifyWhenPosition — fire email when position <= this number
 */
const getNotifyThreshold = async ({
  avgServiceTimeMinutes,
  currentQueueLength,
  historicalAvgGapMinutes
}) => {
  try {
    const prompt = `You are an AI assistant for iQueue, a bank queue management system.

Determine the optimal queue position threshold for sending 
the "It's Your Turn" notification email to customers.

Today's branch statistics:
- Average service time per customer: ${avgServiceTimeMinutes} minutes
- Current queue length: ${currentQueueLength} tokens
- Historical average gap between notification and customer arrival: ${historicalAvgGapMinutes} minutes

Logic: if the branch is slow today (high avgServiceTime), notify 
customers earlier (larger threshold number) so they have time to arrive.
If the branch is fast, notify later (smaller threshold number).

Respond ONLY with a JSON object in this exact format, no other text:
{ "notifyWhenPosition": 3 }

The number must be an integer between 1 and 5.`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text.trim();
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.notifyWhenPosition || 3;

  } catch (error) {
    console.error('Claude Output 3 error:', error.message);
    // Default to position 3 if Claude fails
    return 3;
  }
};

module.exports = {
  getStaffingRecommendation,
  getNoShowRiskFlags,
  getNotifyThreshold,
};