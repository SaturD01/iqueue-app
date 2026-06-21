/**
 * @file seed.js
 * @description Seeds the database with 3 test branches and 3 test users.
 *              Uses fixed ObjectIds so branch IDs never change between runs.
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-19
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Branch = require('../models/Branch');
const User = require('../models/User');

// Fixed branch IDs — these never change regardless of how many times seed runs
const BRANCH_IDS = {
  colombo: new mongoose.Types.ObjectId('aaaaaa000000000000000001'),
  kandy:   new mongoose.Types.ObjectId('aaaaaa000000000000000002'),
  galle:   new mongoose.Types.ObjectId('aaaaaa000000000000000003'),
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // ── SEED BRANCHES ──────────────────────────────────────────────
    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    await Branch.insertMany([
      { _id: BRANCH_IDS.colombo, name: 'Colombo Fort Branch', address: '1 Bank Road, Colombo Fort', city: 'Colombo', isActive: true },
      { _id: BRANCH_IDS.kandy,   name: 'Kandy Branch',        address: '45 Peradeniya Road, Kandy', city: 'Kandy',   isActive: true },
      { _id: BRANCH_IDS.galle,   name: 'Galle Branch',        address: '12 Main Street, Galle Fort', city: 'Galle',  isActive: true },
    ]);
    console.log('Seeded 3 branches');
    console.log(`  - Colombo Fort Branch (${BRANCH_IDS.colombo})`);
    console.log(`  - Kandy Branch (${BRANCH_IDS.kandy})`);
    console.log(`  - Galle Branch (${BRANCH_IDS.galle})`);

    // ── SEED ADMIN ─────────────────────────────────────────────────
    const existingAdmin = await User.findOne({ email: 'admin@iqueue.app' });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin123456', 12);
      await User.create({ name: 'iQueue Admin', email: 'admin@iqueue.app', phone: '0112345678', passwordHash, role: 'admin', branchId: BRANCH_IDS.colombo });
      console.log('Admin user created');
    } else {
      await User.updateOne({ email: 'admin@iqueue.app' }, { branchId: BRANCH_IDS.colombo });
      console.log('Admin user updated with fixed branchId');
    }

    // ── SEED STAFF ─────────────────────────────────────────────────
    const existingStaff = await User.findOne({ email: 'staff@iqueue.app' });
    if (!existingStaff) {
      const passwordHash = await bcrypt.hash('staff123456', 12);
      await User.create({ name: 'Colombo Staff', email: 'staff@iqueue.app', phone: '0112345679', passwordHash, role: 'staff', branchId: BRANCH_IDS.colombo });
      console.log('Staff user created');
    } else {
      await User.updateOne({ email: 'staff@iqueue.app' }, { branchId: BRANCH_IDS.colombo });
      console.log('Staff user updated with fixed branchId');
    }

    // ── SEED MANAGER ───────────────────────────────────────────────
    const existingManager = await User.findOne({ email: 'manager@iqueue.app' });
    if (!existingManager) {
      const passwordHash = await bcrypt.hash('manager123456', 12);
      await User.create({ name: 'Colombo Manager', email: 'manager@iqueue.app', phone: '0112345680', passwordHash, role: 'manager', branchId: BRANCH_IDS.colombo });
      console.log('Manager user created');
    } else {
      await User.updateOne({ email: 'manager@iqueue.app' }, { branchId: BRANCH_IDS.colombo });
      console.log('Manager user updated with fixed branchId');
    }

    console.log('');
    console.log('Seed complete. Fixed branch IDs:');
    console.log(`  Colombo Fort: aaaaaa000000000000000001`);
    console.log(`  Kandy:        aaaaaa000000000000000002`);
    console.log(`  Galle:        aaaaaa000000000000000003`);
    console.log('');
    console.log('Test credentials:');
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