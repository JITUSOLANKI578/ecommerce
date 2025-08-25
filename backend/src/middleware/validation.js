const { body, validationResult } = require('express-validator');

// Handle validation errors
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

// Registration validation
exports.validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must be 2-100 characters and contain only letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Product validation
exports.validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be 2-200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount price must be a positive number'),
  
  body('category')
    .isIn(['Lehengas', 'Chaniya Choli', 'Gowns', 'Sarees', 'Kurta Sets', 'Accessories'])
    .withMessage('Invalid category'),
  
  body('subcategory')
    .trim()
    .notEmpty()
    .withMessage('Subcategory is required'),
  
  body('fabric')
    .trim()
    .notEmpty()
    .withMessage('Fabric information is required'),
  
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),
  
  body('colors')
    .isArray({ min: 1 })
    .withMessage('At least one color is required'),
  
  handleValidationErrors
];

// Order validation
exports.validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required'),
  
  body('shippingAddress.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('paymentMethod')
    .isIn(['razorpay', 'paytm', 'paypal', 'cod', 'netbanking', 'upi'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// Review validation
exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Review comment must be 5-500 characters'),
  
  handleValidationErrors
];

// Address validation
exports.validateAddress = [
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('pincode')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  
  handleValidationErrors
];

module.exports = exports;