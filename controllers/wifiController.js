const Customer = require('../models/Customer');
const WifiSubscription = require('../models/WifiSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, durationDays, features } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      description,
      price,
      durationDays,
      features,
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSubscriptionPlan = async (req, res) => {
  try {
    let plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.isActive = false;
    plan.updatedAt = Date.now();
    await plan.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await WifiSubscription.find()
      .populate('customer', 'name phone location')
      .populate('plan', 'name price durationDays')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await WifiSubscription.findById(req.params.id)
      .populate('customer', 'name phone location')
      .populate('plan', 'name price durationDays features');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { customer: customerId, plan: planId, startDate } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await Customer.findByIdAndUpdate(
      customerId,
      { hasWifiService: true, updatedAt: Date.now() },
      { new: true }
    );

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This plan is no longer active',
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const subscription = await WifiSubscription.create({
      customer: customerId,
      plan: planId,
      startDate: start,
      endDate: end,
      status: 'active',
      billAmount: plan.price,
      paymentStatus: 'unpaid',
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    let subscription = await WifiSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (req.body.plan && req.body.plan !== subscription.plan.toString()) {
      const plan = await SubscriptionPlan.findById(req.body.plan);
      
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }

      if (!plan.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This plan is no longer active',
        });
      }

      const startDate = req.body.startDate ? new Date(req.body.startDate) : subscription.startDate;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      req.body.endDate = endDate;
      req.body.billAmount = plan.price;
    }

    subscription = await WifiSubscription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('customer', 'name phone location')
      .populate('plan', 'name price durationDays features');

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await WifiSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await subscription.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markSubscriptionAsPaid = async (req, res) => {
  try {
    let subscription = await WifiSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    subscription = await WifiSubscription.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'paid',
        paymentDate: Date.now(),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCustomerSubscriptions = async (req, res) => {
  try {
    const subscriptions = await WifiSubscription.find({ customer: req.params.customerId })
      .populate('plan', 'name price durationDays features')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const subscription = await WifiSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const plan = await SubscriptionPlan.findById(subscription.plan);

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const startDate = new Date(subscription.endDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const newSubscription = await WifiSubscription.create({
      customer: subscription.customer,
      plan: subscription.plan,
      startDate,
      endDate,
      status: 'active',
      billAmount: plan.price,
      paymentStatus: 'unpaid',
    });

    res.status(201).json({
      success: true,
      data: newSubscription,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};