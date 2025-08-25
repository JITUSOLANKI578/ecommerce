const express = require('express');
const {
  getProducts,
  getProduct,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  addReview,
  getRecommendations,
  getFilters,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/search', optionalAuth, searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/filters', getFilters);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/recommendations', getRecommendations);

// Protected routes
router.post('/:id/reviews', protect, validateReview, addReview);

// Admin product CRUD routes
router.post('/', protect, createProduct); // Add product
router.put('/:id', protect, updateProduct); // Update product
router.delete('/:id', protect, deleteProduct); // Delete product

module.exports = router;
