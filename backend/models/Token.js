const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: { type: String, required: true, trim: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceName: {
    type: String,
    required: true,
    enum: [
      'Cash Deposit',
      'Account Opening',
      'Card Services',
      'Loan Inquiry',
      'Document Submission',
      'General Inquiry'
    ],
  },
  status: {
    type: String,
    enum: ['HELD', 'CALLABLE', 'CALLED', 'SERVED', 'NO_SHOW', 'PRIORITY'],
    default: 'CALLABLE'
  },
  position: { type: Number, required: true },
  arrivalTime: { type: Date, default: null },
  calledAt: { type: Date, default: null },
  servedAt: { type: Date, default: null },
  serviceTimeMinutes: { type: Number, default: null },
  isWalkIn: { type: Boolean, default: false },
  walkInName: { type: String, default: null, trim: true },
  walkInEmail: { type: String, default: null, trim: true },
  priorityReason: { type: String, default: null, enum: ['Elderly', 'Disability', 'VIP', 'Pregnant', 'Other', null] },
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);