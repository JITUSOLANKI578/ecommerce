const validator = require('validator');

// Validation rules
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must be 2-100 characters and contain only letters and spaces'
  },
  email: {
    required: true,
    isEmail: true,
    message: 'Please provide a valid email address'
  },
  phone: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    message: 'Please provide a valid 10-digit Indian mobile number'
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
    message: 'Password must be at least 6 characters long'
  }
};

// Validate input function
exports.validateInput = (data) => {
  const errors = {};
  let isValid = true;

  Object.keys(data).forEach(field => {
    const value = data[field];
    const rules = validationRules[field];

    if (!rules) return;

    // Required check
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      return;
    }

    // Skip other validations if field is not required and empty
    if (!rules.required && (!value || value.toString().trim() === '')) {
      return;
    }

    const stringValue = value.toString().trim();

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
      isValid = false;
      return;
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors[field] = rules.message || `${field} cannot exceed ${rules.maxLength} characters`;
      isValid = false;
      return;
    }

    // Email validation
    if (rules.isEmail && !validator.isEmail(stringValue)) {
      errors[field] = rules.message || 'Invalid email format';
      isValid = false;
      return;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors[field] = rules.message || `Invalid ${field} format`;
      isValid = false;
      return;
    }
  });

  return { isValid, errors };
};

// Validate product data
exports.validateProduct = (productData) => {
  const errors = {};
  let isValid = true;

  const required = ['name', 'description', 'price', 'category', 'subcategory', 'fabric'];
  
  required.forEach(field => {
    if (!productData[field] || productData[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });

  // Price validation
  if (productData.price !== undefined) {
    const price = parseFloat(productData.price);
    if (isNaN(price) || price < 0) {
      errors.price = 'Price must be a valid positive number';
      isValid = false;
    }
  }

  // Discount price validation
  if (productData.discountPrice !== undefined && productData.discountPrice !== '') {
    const discountPrice = parseFloat(productData.discountPrice);
    const price = parseFloat(productData.price);
    
    if (isNaN(discountPrice) || discountPrice < 0) {
      errors.discountPrice = 'Discount price must be a valid positive number';
      isValid = false;
    } else if (discountPrice >= price) {
      errors.discountPrice = 'Discount price must be less than regular price';
      isValid = false;
    }
  }

  // Images validation
  if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
    errors.images = 'At least one product image is required';
    isValid = false;
  }

  // Sizes validation
  if (!productData.sizes || !Array.isArray(productData.sizes) || productData.sizes.length === 0) {
    errors.sizes = 'At least one size option is required';
    isValid = false;
  }

  // Colors validation
  if (!productData.colors || !Array.isArray(productData.colors) || productData.colors.length === 0) {
    errors.colors = 'At least one color option is required';
    isValid = false;
  }

  return { isValid, errors };
};

// Validate order data
exports.validateOrder = (orderData) => {
  const errors = {};
  let isValid = true;

  const required = ['items', 'shippingAddress', 'paymentMethod'];
  
  required.forEach(field => {
    if (!orderData[field]) {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });

  // Items validation
  if (orderData.items && Array.isArray(orderData.items)) {
    if (orderData.items.length === 0) {
      errors.items = 'Order must contain at least one item';
      isValid = false;
    }

    orderData.items.forEach((item, index) => {
      if (!item.product || !item.quantity || !item.selectedSize || !item.selectedColor) {
        errors[`item_${index}`] = `Item ${index + 1} is missing required fields`;
        isValid = false;
      }

      if (item.quantity < 1) {
        errors[`item_${index}_quantity`] = `Item ${index + 1} quantity must be at least 1`;
        isValid = false;
      }
    });
  }

  // Shipping address validation
  if (orderData.shippingAddress) {
    const addressRequired = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    addressRequired.forEach(field => {
      if (!orderData.shippingAddress[field] || orderData.shippingAddress[field].toString().trim() === '') {
        errors[`address_${field}`] = `Shipping ${field} is required`;
        isValid = false;
      }
    });

    // Pincode validation
    if (orderData.shippingAddress.pincode && !/^\d{6}$/.test(orderData.shippingAddress.pincode)) {
      errors.address_pincode = 'Pincode must be 6 digits';
      isValid = false;
    }

    // Phone validation
    if (orderData.shippingAddress.phone && !/^[6-9]\d{9}$/.test(orderData.shippingAddress.phone)) {
      errors.address_phone = 'Please provide a valid 10-digit mobile number';
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Sanitize input
exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = exports.sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
};

// Validate MongoDB ObjectId
exports.isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Validate image file
exports.validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { isValid: true };
};