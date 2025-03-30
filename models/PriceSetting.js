const mongoose = require('mongoose');

const PriceSettingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    enum: ['electricity'],
    unique: true,
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Please add a rate per unit'],
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PriceSetting', PriceSettingSchema);