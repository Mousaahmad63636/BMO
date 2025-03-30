const mongoose = require('mongoose');

const WifiSubscriptionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  billAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid',
  },
  paymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WifiSubscription', WifiSubscriptionSchema);