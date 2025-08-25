const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  trackOrder,
  processPayment,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// User routes
router.post('/', validateOrder, createOrder);
router.get('/', getOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', returnOrder);
router.post('/:id/payment', processPayment);

// Admin routes
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;