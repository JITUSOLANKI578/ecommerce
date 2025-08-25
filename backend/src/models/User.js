const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const socialLinksSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  isVerified: { type: Boolean, default: false }
});

const preferencesSchema = new mongoose.Schema({
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'INR' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
    showPurchaseHistory: { type: Boolean, default: false }
  }
});

const loyaltySchema = new mongoose.Schema({
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  totalSpent: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid phone number'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    url: String,
    publicId: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'vendor', 'moderator'],
    default: 'user',
    index: true
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isTwoFactorEnabled: { type: Boolean, default: false },
  
  // Personal Information
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  occupation: String,
  
  // Addresses
  addresses: [addressSchema],
  
  // Social Links
  socialLinks: [socialLinksSchema],
  
  // Preferences
  preferences: preferencesSchema,
  
  // Loyalty Program
  loyalty: loyaltySchema,
  
  // Wishlist
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Recently Viewed
  recentlyViewed: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now }
  }],
  
  // Search History
  searchHistory: [{
    query: String,
    searchedAt: { type: Date, default: Date.now }
  }],
  
  // Verification tokens
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorSecret: String,
  
  // Session management
  refreshTokens: [String],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  
  // Status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: String,
  
  // Analytics
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  lastOrderDate: Date,
  
  // Referral System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ phone: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'loyalty.tier': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  // Generate referral code if not exists
  if (!this.referralCode && this.isNew) {
    this.referralCode = this.name.substring(0, 3).toUpperCase() + 
                       Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // Update loyalty tier based on total spent
  if (this.isModified('loyalty.totalSpent')) {
    const spent = this.loyalty.totalSpent;
    if (spent >= 100000) this.loyalty.tier = 'platinum';
    else if (spent >= 50000) this.loyalty.tier = 'gold';
    else if (spent >= 20000) this.loyalty.tier = 'silver';
    else this.loyalty.tier = 'bronze';
  }
  
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.addToRecentlyViewed = function(productId) {
  this.recentlyViewed = this.recentlyViewed.filter(
    item => !item.product.equals(productId)
  );
  this.recentlyViewed.unshift({ product: productId });
  this.recentlyViewed = this.recentlyViewed.slice(0, 20); // Keep only last 20
  return this.save();
};

userSchema.methods.addToSearchHistory = function(query) {
  this.searchHistory = this.searchHistory.filter(
    item => item.query !== query
  );
  this.searchHistory.unshift({ query });
  this.searchHistory = this.searchHistory.slice(0, 50); // Keep only last 50
  return this.save();
};

// Static methods
userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier }
    ],
    isActive: true
  });
};

module.exports = mongoose.model('User', userSchema);