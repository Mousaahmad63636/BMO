const PriceSetting = require('../models/PriceSetting');
const ElectricityBill = require('../models/ElectricityBill');
const WifiSubscription = require('../models/WifiSubscription');

exports.updateElectricityPrice = async (req, res) => {
  try {
    const { ratePerUnit } = req.body;

    if (!ratePerUnit || ratePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Rate per unit must be a positive number',
      });
    }

    let priceSetting = await PriceSetting.findOne({ name: 'electricity' });

    if (priceSetting) {
      priceSetting = await PriceSetting.findOneAndUpdate(
        { name: 'electricity' },
        {
          ratePerUnit,
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } else {
      priceSetting = await PriceSetting.create({
        name: 'electricity',
        ratePerUnit,
      });
    }

    res.status(200).json({
      success: true,
      data: priceSetting,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getElectricityPrice = async (req, res) => {
  try {
    const priceSetting = await PriceSetting.findOne({ name: 'electricity' });

    if (!priceSetting) {
      return res.status(404).json({
        success: false,
        message: 'Electricity price setting not found',
      });
    }

    res.status(200).json({
      success: true,
      data: priceSetting,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total unpaid electricity bills
    const unpaidElectricityBills = await ElectricityBill.countDocuments({ status: 'unpaid' });
    
    // Get total paid electricity bills
    const paidElectricityBills = await ElectricityBill.countDocuments({ status: 'paid' });
    
    // Get total electricity revenue
    const electricityRevenue = await ElectricityBill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$billAmount' } } }
    ]);
    
    // Get total unpaid wifi subscriptions
    const unpaidWifiSubscriptions = await WifiSubscription.countDocuments({ paymentStatus: 'unpaid' });
    
    // Get total paid wifi subscriptions
    const paidWifiSubscriptions = await WifiSubscription.countDocuments({ paymentStatus: 'paid' });
    
    // Get total wifi revenue
    const wifiRevenue = await WifiSubscription.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$billAmount' } } }
    ]);
    
    // Get top 5 customers with highest electricity bills
    const topElectricityCustomers = await ElectricityBill.aggregate([
      { $group: { _id: '$customer', totalAmount: { $sum: '$billAmount' } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customerDetails' } },
      { $unwind: '$customerDetails' },
      { $project: { _id: 0, customerId: '$_id', customerName: '$customerDetails.name', totalAmount: 1 } }
    ]);
    
    // Get top 5 customers with highest wifi bills
    const topWifiCustomers = await WifiSubscription.aggregate([
      { $group: { _id: '$customer', totalAmount: { $sum: '$billAmount' } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customerDetails' } },
      { $unwind: '$customerDetails' },
      { $project: { _id: 0, customerId: '$_id', customerName: '$customerDetails.name', totalAmount: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        electricityStats: {
          unpaidBills: unpaidElectricityBills,
          paidBills: paidElectricityBills,
          revenue: electricityRevenue.length > 0 ? electricityRevenue[0].total : 0,
          topCustomers: topElectricityCustomers
        },
        wifiStats: {
          unpaidSubscriptions: unpaidWifiSubscriptions,
          paidSubscriptions: paidWifiSubscriptions,
          revenue: wifiRevenue.length > 0 ? wifiRevenue[0].total : 0,
          topCustomers: topWifiCustomers
        },
        totalRevenue: (electricityRevenue.length > 0 ? electricityRevenue[0].total : 0) + 
                      (wifiRevenue.length > 0 ? wifiRevenue[0].total : 0)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRevenueReports = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    
    let electricityRevenue = [];
    let wifiRevenue = [];
    
    if (!type || type === 'electricity' || type === 'both') {
      electricityRevenue = await ElectricityBill.aggregate([
        { 
          $match: { 
            status: 'paid',
            paymentDate: { $gte: start, $lte: end }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } 
            },
            amount: { $sum: '$billAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }
    
    if (!type || type === 'wifi' || type === 'both') {
      wifiRevenue = await WifiSubscription.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            paymentDate: { $gte: start, $lte: end }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } 
            },
            amount: { $sum: '$billAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }
    
    res.status(200).json({
      success: true,
      data: {
        electricityRevenue,
        wifiRevenue
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};