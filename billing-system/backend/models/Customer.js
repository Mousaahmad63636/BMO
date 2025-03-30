const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  initialCounterValue: {
    type: Number,
    default: 0,
  },
  currentCounterValue: {
    type: Number,
    default: 0,
  },
  hasElectricityService: {
    type: Boolean,
    default: true,
  },
  hasWifiService: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model('Customer', CustomerSchema);