const { body, validationResult } = require('express-validator');

// Common validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {})
    });
  }
  next();
};

// Add to cart validation
const validateAddToCart = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('selected_size').notEmpty().withMessage('Size selection is required'),
  body('selected_color').notEmpty().withMessage('Color selection is required'),
  handleValidationErrors
];

// Update cart item validation
const validateUpdateCartItem = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

module.exports = {
  validateAddToCart,
  validateUpdateCartItem
};
