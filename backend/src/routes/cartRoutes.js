const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  saveForLater,
  moveToCart,
  syncCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/sync', syncCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/coupon/apply', applyCoupon);
router.delete('/coupon/remove', removeCoupon);
router.put('/items/:itemId/save-for-later', saveForLater);
router.put('/items/:itemId/move-to-cart', moveToCart);

module.exports = router;