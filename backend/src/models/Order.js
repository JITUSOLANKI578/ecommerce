const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  sku: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: String,
  addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['razorpay', 'stripe', 'paypal', 'cod', 'wallet', 'upi', 'netbanking', 'card']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  gateway: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  paidAt: Date,
  refundId: String,
  refundAmount: { type: Number, default: 0 },
  refundedAt: Date
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  
  // Pricing
  subtotal: { type: Number, required: true, min: 0 },
  discount: {
    amount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    type: String
  },
  tax: {
    amount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 }
  },
  shipping: {
    amount: { type: Number, default: 0 },
    method: String,
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  
  // Addresses
  shippingAddress: { type: shippingAddressSchema, required: true },
  billingAddress: shippingAddressSchema,
  
  // Payment
  payment: paymentSchema,
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending'
  },
  
  // Dates
  placedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  returnedAt: Date,
  
  // Additional Info
  notes: String,
  internalNotes: String,
  cancellationReason: String,
  returnReason: String,
  
  // Status History
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Notifications
  notifications: {
    orderConfirmation: { sent: Boolean, sentAt: Date },
    orderShipped: { sent: Boolean, sentAt: Date },
    orderDelivered: { sent: Boolean, sentAt: Date }
  },
  
  // Analytics
  source: { type: String, default: 'web' }, // web, mobile, app
  utm: {
    source: String,
    medium: String,
    campaign: String
  },
  
  // Reviews
  reviewRequested: { type: Boolean, default: false },
  reviewRequestedAt: Date,
  
  // Invoice
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ placedAt: -1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Generate order number
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.orderNumber = `AMB-${timestamp}-${random}`.toUpperCase();
  }
  
  // Add to status history when status changes
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
    
    // Update specific date fields
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'shipped':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
      case 'returned':
        this.returnedAt = now;
        break;
    }
  }
  
  next();
});

// Instance methods
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
};

orderSchema.methods.canBeReturned = function() {
  if (!this.deliveredAt || this.status !== 'delivered') return false;
  
  const returnPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
  const timeSinceDelivery = Date.now() - this.deliveredAt.getTime();
  
  return timeSinceDelivery <= returnPeriod;
};

orderSchema.methods.calculateEstimatedDelivery = function() {
  const deliveryDays = this.shipping.amount === 0 ? 7 : 3; // Free shipping takes longer
  this.shipping.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
  return this.save();
};

orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  if (note || updatedBy) {
    this.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note,
      updatedBy
    });
  }
  return this.save();
};

orderSchema.methods.addTrackingInfo = function(carrier, trackingNumber) {
  this.shipping.carrier = carrier;
  this.shipping.trackingNumber = trackingNumber;
  return this.save();
};

orderSchema.methods.generateInvoice = function() {
  // This would integrate with a PDF generation service
  const invoiceNumber = `INV-${this.orderNumber}`;
  this.invoice = {
    number: invoiceNumber,
    generatedAt: new Date()
  };
  return this.save();
};

// Static methods
orderSchema.statics.getOrderStats = function(userId, dateRange) {
  const matchQuery = { user: userId };
  if (dateRange) {
    matchQuery.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);