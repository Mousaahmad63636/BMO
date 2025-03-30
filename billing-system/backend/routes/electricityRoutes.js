const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getCustomerBills,
} = require('../controllers/electricityController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

router.use(protect);

router.route('/')
  .get(getBills)
  .post(
    [
      check('customer', 'Customer ID is required').not().isEmpty(),
      check('currentReading', 'Current reading is required').isNumeric(),
      check('billingMonth', 'Billing month is required').not().isEmpty(),
      check('dueDate', 'Due date is required').not().isEmpty(),
    ],
    validate,
    createBill
  );

router.route('/:id')
  .get(getBill)
  .put(updateBill)
  .delete(authorize('admin'), deleteBill);

router.route('/:id/pay')
  .put(markBillAsPaid);

router.route('/customer/:customerId')
  .get(getCustomerBills);

module.exports = router;