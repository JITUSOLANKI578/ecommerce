const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Usage Limits
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  
  // Conditions
  minimumAmount: {
    type: Number,
    default: 0
  },
  maximumAmount: Number,
  maximumDiscount: Number,
  
  // Product/Category Restrictions
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // User Restrictions
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  userTiers: [{
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  }],
  newUsersOnly: {
    type: Boolean,
    default: false
  },
  
  // Date Restrictions
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Buy X Get Y specific fields
  buyQuantity: Number,
  getQuantity: Number,
  getProductDiscount: Number,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Usage Tracking
  usageHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    discountAmount: Number,
    usedAt: { type: Date, default: Date.now }
  }],
  
  // Analytics
  totalDiscountGiven: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Instance methods
couponSchema.methods.canBeUsedBy = function(user, orderAmount, cartItems) {
  // Check if coupon is valid
  if (!this.isValid) return { valid: false, reason: 'Coupon is not valid or has expired' };
  
  // Check minimum amount
  if (orderAmount < this.minimumAmount) {
    return { valid: false, reason: `Minimum order amount of ₹${this.minimumAmount} required` };
  }
  
  // Check maximum amount
  if (this.maximumAmount && orderAmount > this.maximumAmount) {
    return { valid: false, reason: `Maximum order amount of ₹${this.maximumAmount} exceeded` };
  }
  
  // Check user-specific restrictions
  if (this.applicableUsers.length > 0 && !this.applicableUsers.includes(user._id)) {
    return { valid: false, reason: 'This coupon is not applicable for your account' };
  }
  
  // Check user tier restrictions
  if (this.userTiers.length > 0 && !this.userTiers.includes(user.loyalty.tier)) {
    return { valid: false, reason: 'This coupon is not applicable for your membership tier' };
  }
  
  // Check new users only
  if (this.newUsersOnly && user.totalOrders > 0) {
    return { valid: false, reason: 'This coupon is only for new users' };
  }
  
  // Check usage limit per user
  const userUsageCount = this.usageHistory.filter(usage => 
    usage.user.toString() === user._id.toString()
  ).length;
  
  if (userUsageCount >= this.usageLimitPerUser) {
    return { valid: false, reason: 'You have already used this coupon maximum number of times' };
  }
  
  // Check product/category restrictions
  if (this.applicableProducts.length > 0 || this.applicableCategories.length > 0) {
    const hasApplicableItems = cartItems.some(item => {
      return this.applicableProducts.includes(item.product._id) ||
             this.applicableCategories.includes(item.product.category);
    });
    
    if (!hasApplicableItems) {
      return { valid: false, reason: 'This coupon is not applicable for items in your cart' };
    }
  }
  
  // Check excluded products/categories
  if (this.excludedProducts.length > 0 || this.excludedCategories.length > 0) {
    const hasExcludedItems = cartItems.some(item => {
      return this.excludedProducts.includes(item.product._id) ||
             this.excludedCategories.includes(item.product.category);
    });
    
    if (hasExcludedItems) {
      return { valid: false, reason: 'Some items in your cart are not eligible for this coupon' };
    }
  }
  
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function(orderAmount, cartItems) {
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = (orderAmount * this.value) / 100;
      if (this.maximumDiscount) {
        discount = Math.min(discount, this.maximumDiscount);
      }
      break;
      
    case 'fixed':
      discount = this.value;
      break;
      
    case 'free_shipping':
      // This would be handled separately in shipping calculation
      discount = 0;
      break;
      
    case 'buy_x_get_y':
      // Complex logic for buy X get Y offers
      // This is a simplified version
      const eligibleItems = cartItems.filter(item => 
        this.applicableProducts.length === 0 || 
        this.applicableProducts.includes(item.product._id)
      );
      
      const totalEligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
      const freeItems = Math.floor(totalEligibleQuantity / this.buyQuantity) * this.getQuantity;
      
      // Calculate discount based on cheapest items
      const sortedItems = eligibleItems.sort((a, b) => a.price - b.price);
      let remainingFreeItems = freeItems;
      
      for (const item of sortedItems) {
        if (remainingFreeItems <= 0) break;
        const freeQuantity = Math.min(remainingFreeItems, item.quantity);
        discount += freeQuantity * item.price * (this.getProductDiscount || 100) / 100;
        remainingFreeItems -= freeQuantity;
      }
      break;
  }
  
  return Math.min(discount, orderAmount);
};

couponSchema.methods.recordUsage = function(user, order, discountAmount) {
  this.usedCount += 1;
  this.totalDiscountGiven += discountAmount;
  this.usageHistory.push({
    user: user._id,
    order: order._id,
    discountAmount,
    usedAt: new Date()
  });
  
  return this.save();
};

// Static methods
couponSchema.statics.findValidCoupons = function(user, orderAmount, cartItems) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  }).then(coupons => {
    return coupons.filter(coupon => {
      const validation = coupon.canBeUsedBy(user, orderAmount, cartItems);
      return validation.valid;
    });
  });
};

module.exports = mongoose.model('Coupon', couponSchema);