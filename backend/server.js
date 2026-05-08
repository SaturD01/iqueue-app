/**
 * @file server.js
 * @description Main entry point for the iQueue backend API server
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-13
 *
 * @routes registered
 *   /api/auth       — authentication routes (register, login)
 *   /api/admin      — admin user management routes
 *   /api/branches   — branch listing routes
 *   /api/tokens     — token booking and queue management routes
 *   /api/analytics  — branch analytics routes
 *   /api/ratings    — service rating routes
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const connectDB = require('./config/db');
connectDB();

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

const adminRoutes = require('./routes/admin.route');
app.use('/api/admin', adminRoutes);

const branchRoutes = require('./routes/branch.route');
app.use('/api/branches', branchRoutes);

const tokenRoutes = require('./routes/token.route');
app.use('/api/tokens', tokenRoutes);

const analyticsRoutes = require('./routes/analytics.route');
app.use('/api/analytics', analyticsRoutes);

const ratingRoutes = require('./routes/rating.route');
app.use('/api/ratings', ratingRoutes);

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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`iQueue backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}`);
});

module.exports = { app, server };