const mongoose = require('mongoose');

const ElectricityBillSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  previousReading: {
    type: Number,
    required: true,
  },
  currentReading: {
    type: Number,
    required: true,
  },
  consumptionUnits: {
    type: Number,
    required: true,
  },
  ratePerUnit: {
    type: Number,
    required: true,
  },
  billAmount: {
    type: Number,
    required: true,
  },
  billingMonth: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
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
});

module.exports = mongoose.model('ElectricityBill', ElectricityBillSchema);