const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  markSubscriptionAsPaid,
  getCustomerSubscriptions,
  renewSubscription,
} = require('../controllers/wifiController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

router.use(protect);

// Subscription Plan Routes
router.route('/plans')
  .get(getSubscriptionPlans)
  .post(
    authorize('admin'),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required and must be a number').isNumeric(),
      check('durationDays', 'Duration in days is required and must be a number').isNumeric(),
      check('features', 'Features must be an array').isArray(),
    ],
    validate,
    createSubscriptionPlan
  );

router.route('/plans/:id')
  .put(authorize('admin'), updateSubscriptionPlan)
  .delete(authorize('admin'), deleteSubscriptionPlan);

// Subscription Routes
router.route('/')
  .get(getSubscriptions)
  .post(
    [
      check('customer', 'Customer ID is required').not().isEmpty(),
      check('plan', 'Plan ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').not().isEmpty(),
    ],
    validate,
    createSubscription
  );

router.route('/:id')
  .get(getSubscription)
  .put(updateSubscription)
  .delete(authorize('admin'), deleteSubscription);

router.route('/:id/pay')
  .put(markSubscriptionAsPaid);

router.route('/:id/renew')
  .post(renewSubscription);

router.route('/customer/:customerId')
  .get(getCustomerSubscriptions);

module.exports = router;