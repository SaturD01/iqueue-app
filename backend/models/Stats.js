const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  date: { type: String, required: true },
  hour: { type: Number, required: true },
  servedCount: { type: Number, default: 0 },
  noShowCount: { type: Number, default: 0 },
  totalServiceTimeMinutes: { type: Number, default: 0 },
}, { timestamps: true });

statsSchema.index({ branchId: 1, date: 1, hour: 1 }, { unique: true });

module.exports = mongoose.model('Stats', statsSchema);