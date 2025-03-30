const Customer = require('../models/Customer');
const ElectricityBill = require('../models/ElectricityBill');
const PriceSetting = require('../models/PriceSetting');

exports.getBills = async (req, res) => {
  try {
    const bills = await ElectricityBill.find()
      .populate('customer', 'name phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bill = await ElectricityBill.findById(req.params.id)
      .populate('customer', 'name phone location');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { customer: customerId, currentReading, billingMonth, dueDate } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!customer.hasElectricityService) {
      return res.status(400).json({
        success: false,
        message: 'This customer does not have electricity service',
      });
    }

    const priceSetting = await PriceSetting.findOne({ name: 'electricity' });
    
    if (!priceSetting) {
      return res.status(400).json({
        success: false,
        message: 'Electricity price setting not found',
      });
    }

    const previousReading = customer.currentCounterValue;
    const consumptionUnits = currentReading - previousReading;
    const billAmount = consumptionUnits * priceSetting.ratePerUnit;

    const bill = await ElectricityBill.create({
      customer: customerId,
      previousReading,
      currentReading,
      consumptionUnits,
      ratePerUnit: priceSetting.ratePerUnit,
      billAmount,
      billingMonth: new Date(billingMonth),
      dueDate: new Date(dueDate),
      status: 'unpaid',
    });

    await Customer.findByIdAndUpdate(
      customerId,
      {
        currentCounterValue: currentReading,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBill = async (req, res) => {
  try {
    let bill = await ElectricityBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (req.body.currentReading && req.body.previousReading) {
      const priceSetting = await PriceSetting.findOne({ name: 'electricity' });
      const consumptionUnits = req.body.currentReading - req.body.previousReading;
      req.body.consumptionUnits = consumptionUnits;
      req.body.billAmount = consumptionUnits * (req.body.ratePerUnit || bill.ratePerUnit || priceSetting.ratePerUnit);
    }

    bill = await ElectricityBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.currentReading) {
      await Customer.findByIdAndUpdate(
        bill.customer,
        {
          currentCounterValue: req.body.currentReading,
          updatedAt: Date.now(),
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await ElectricityBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await bill.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markBillAsPaid = async (req, res) => {
  try {
    let bill = await ElectricityBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill = await ElectricityBill.findByIdAndUpdate(
      req.params.id,
      {
        status: 'paid',
        paymentDate: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCustomerBills = async (req, res) => {
  try {
    const bills = await ElectricityBill.find({ customer: req.params.customerId })
      .sort({ billingMonth: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};