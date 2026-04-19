/**
 * @file seed.js
 * @description Seeds the database with 3 test branches and 3 test users.
 *              Run once after MongoDB Atlas is connected.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-19
 *
 * @usage
 *   node backend/scripts/seed.js
 *
 * @test credentials created
 *   Admin:   admin@iqueue.app   / admin123456
 *   Staff:   staff@iqueue.app   / staff123456
 *   Manager: manager@iqueue.app / manager123456
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models — these are built by M4 Ilangasinghe on feature/token-api
// Will be available after B's PR is merged to main
const Branch = require('../models/Branch');
const User = require('../models/User');

const seed = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // ─────────────────────────────────────────
    // SEED BRANCHES
    // ─────────────────────────────────────────
    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    const branches = await Branch.insertMany([
      {
        name: 'Colombo Fort Branch',
        address: '1 Bank Road, Colombo Fort',
        city: 'Colombo',
        isActive: true,
      },
      {
        name: 'Kandy Branch',
        address: '45 Peradeniya Road, Kandy',
        city: 'Kandy',
        isActive: true,
      },
      {
        name: 'Galle Branch',
        address: '12 Main Street, Galle Fort',
        city: 'Galle',
        isActive: true,
      },
    ]);
    console.log(`Seeded ${branches.length} branches`);
    branches.forEach(b => console.log(`  - ${b.name} (${b._id})`));

    // ─────────────────────────────────────────
    // SEED ADMIN USER
    // ─────────────────────────────────────────
    const existingAdmin = await User.findOne({ email: 'admin@iqueue.app' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123456', 12);
      await User.create({
        name: 'iQueue Admin',
        email: 'admin@iqueue.app',
        phone: '0112345678',
        passwordHash,
        role: 'admin',
        branchId: branches[0]._id,
      });
      console.log('Admin user created: admin@iqueue.app / admin123456');
    } else {
      console.log('Admin user already exists — skipping');
    }

    // ─────────────────────────────────────────
    // SEED STAFF USER
    // ─────────────────────────────────────────
    const existingStaff = await User.findOne({ email: 'staff@iqueue.app' });
    if (!existingStaff) {
      const passwordHash = await bcrypt.hash('staff123456', 12);
      await User.create({
        name: 'Colombo Staff',
        email: 'staff@iqueue.app',
        phone: '0112345679',
        passwordHash,
        role: 'staff',
        branchId: branches[0]._id,
      });
      console.log('Staff user created: staff@iqueue.app / staff123456');
    } else {
      console.log('Staff user already exists — skipping');
    }

    // ─────────────────────────────────────────
    // SEED MANAGER USER
    // ─────────────────────────────────────────
    const existingManager = await User.findOne({ email: 'manager@iqueue.app' });
    if (!existingManager) {
      const passwordHash = await bcrypt.hash('manager123456', 12);
      await User.create({
        name: 'Colombo Manager',
        email: 'manager@iqueue.app',
        phone: '0112345680',
        passwordHash,
        role: 'manager',
        branchId: branches[0]._id,
      });
      console.log('Manager user created: manager@iqueue.app / manager123456');
    } else {
      console.log('Manager user already exists — skipping');
    }

    console.log('');
    console.log('Seed complete. Test credentials:');
    console.log('  Admin:   admin@iqueue.app / admin123456');
    console.log('  Staff:   staff@iqueue.app / staff123456');
    console.log('  Manager: manager@iqueue.app / manager123456');
    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();