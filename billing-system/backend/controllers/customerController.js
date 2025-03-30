const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, location, initialCounterValue, hasElectricityService, hasWifiService } = req.body;

    const customer = await Customer.create({
      name,
      phone,
      location,
      initialCounterValue: initialCounterValue || 0,
      currentCounterValue: initialCounterValue || 0,
      hasElectricityService: hasElectricityService !== undefined ? hasElectricityService : true,
      hasWifiService: hasWifiService !== undefined ? hasWifiService : false,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};