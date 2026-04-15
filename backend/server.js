/**
 * @file server.js
 * @description Main entry point for the iQueue backend API server
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-13
 *
 * @routes registered
 *   /api/auth — authentication routes (register, login)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); 
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

// Start background cron jobs
const { startCronJobs } = require('./services/cron.service');
startCronJobs();

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'iQueue API is running',
    version: '1.0.0',
    project: 'CIT310_01_26_19 — Group 19',
    timestamp: new Date().toISOString()
  });
});
// Temporary Claude AI test routes — remove before final deployment
const { getStaffingRecommendation, getNoShowRiskFlags, getNotifyThreshold } = require('./services/claude.service');

app.get('/test-claude-1', async (req, res) => {
  const result = await getStaffingRecommendation({
    hourlyStats: [
      { hour: 8, avgServed: 5, avgServiceTimeMinutes: 5.1 },
      { hour: 9, avgServed: 12, avgServiceTimeMinutes: 6.3 },
      { hour: 10, avgServed: 22, avgServiceTimeMinutes: 7.1 },
      { hour: 11, avgServed: 25, avgServiceTimeMinutes: 7.8 },
      { hour: 14, avgServed: 19, avgServiceTimeMinutes: 6.9 },
      { hour: 17, avgServed: 3, avgServiceTimeMinutes: 4.5 },
    ],
    sevenDayTrend: [
      { date: '2026-04-08', totalServed: 82, noShowRate: 0.06 },
      { date: '2026-04-09', totalServed: 91, noShowRate: 0.04 },
      { date: '2026-04-10', totalServed: 78, noShowRate: 0.08 },
    ]
  });
  res.json(result);
});

app.get('/test-claude-2', async (req, res) => {
  const result = await getNoShowRiskFlags([
    { tokenId: 'CF-007', noShowCount: 3, totalVisits: 10 },
    { tokenId: 'CF-008', noShowCount: 1, totalVisits: 5 },
    { tokenId: 'CF-009', noShowCount: 0, totalVisits: 3 },
    { tokenId: 'CF-010', noShowCount: 0, totalVisits: 1 },
  ]);
  res.json(result);
});

app.get('/test-claude-3', async (req, res) => {
  const result = await getNotifyThreshold({
    avgServiceTimeMinutes: 7.2,
    currentQueueLength: 14,
    historicalAvgGapMinutes: 12,
  });
  res.json({ notifyWhenPosition: result });
});

// Database connection

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server running without database — limited functionality');
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`iQueue backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}`);
});

module.exports = { app, server };