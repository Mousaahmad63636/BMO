const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  updateElectricityPrice,
  getElectricityPrice,
  getDashboardStats,
  getRevenueReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

router.use(protect);
router.use(authorize('admin'));

router.route('/electricity-price')
  .get(getElectricityPrice)
  .put(
    [
      check('ratePerUnit', 'Rate per unit is required and must be a number').isNumeric(),
    ],
    validate,
    updateElectricityPrice
  );

router.get('/dashboard-stats', getDashboardStats);
router.get('/revenue-reports', getRevenueReports);

module.exports = router;