const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: Number,
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  savedForLater: {
    type: Boolean,
    default: false
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    amount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    type: { type: String, enum: ['percentage', 'fixed'] }
  },
  tax: {
    amount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 }
  },
  shipping: {
    amount: { type: Number, default: 0 },
    method: String,
    estimatedDelivery: Date
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ lastModified: -1 });

// Pre-save middleware
cartSchema.pre('save', function(next) {
  // Calculate totals
  this.totalItems = this.items.reduce((total, item) => {
    return total + (item.savedForLater ? 0 : item.quantity);
  }, 0);
  
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.savedForLater ? 0 : item.totalPrice);
  }, 0);
  
  // Calculate tax (assuming 18% GST for India)
  this.tax.rate = 18;
  this.tax.amount = (this.subtotal * this.tax.rate) / 100;
  
  // Calculate total
  this.total = this.subtotal + this.tax.amount + this.shipping.amount - this.discount.amount;
  
  this.lastModified = Date.now();
  next();
});

// Instance methods
cartSchema.methods.addItem = function(productId, variantId, quantity, price, discountPrice) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() && 
    item.variant.toString() === variantId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * (discountPrice || price);
  } else {
    this.items.push({
      product: productId,
      variant: variantId,
      quantity,
      price,
      discountPrice,
      totalPrice: quantity * (discountPrice || price)
    });
  }
  
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = quantity;
    item.totalPrice = quantity * (item.discountPrice || item.price);
    return this.save();
  }
  throw new Error('Item not found in cart');
};

cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.applyCoupon = function(coupon) {
  if (coupon.type === 'percentage') {
    this.discount.amount = (this.subtotal * coupon.value) / 100;
  } else {
    this.discount.amount = coupon.value;
  }
  this.discount.coupon = coupon._id;
  this.discount.type = coupon.type;
  return this.save();
};

cartSchema.methods.removeCoupon = function() {
  this.discount = { amount: 0, coupon: null, type: null };
  return this.save();
};

cartSchema.methods.moveToSavedForLater = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.savedForLater = true;
    return this.save();
  }
  throw new Error('Item not found in cart');
};

cartSchema.methods.moveToCart = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.savedForLater = false;
    return this.save();
  }
  throw new Error('Item not found in saved items');
};

module.exports = mongoose.model('Cart', cartSchema);