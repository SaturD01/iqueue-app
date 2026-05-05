const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'manager', 'admin'], default: 'customer' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  noShowCount: { type: Number, default: 0 },
  totalVisits: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);