const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('phone', 'Phone number is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
    ],
    validate,
    createCustomer
  );

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;