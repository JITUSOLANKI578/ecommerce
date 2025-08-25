const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorCode: String,
  sku: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true },
  discountPrice: Number,
  stock: { type: Number, default: 0 },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  measurements: {
    bust: String,
    waist: String,
    hip: String,
    length: String,
    shoulder: String,
    sleeve: String
  },
  weight: Number,
  isActive: { type: Boolean, default: true }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true },
  images: [{
    url: String,
    publicId: String
  }],
  isVerified: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const seoSchema = new mongoose.Schema({
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  canonicalUrl: String,
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  structuredData: mongoose.Schema.Types.Mixed
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: 'text'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
    index: 'text'
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Pricing
  basePrice: { type: Number, required: true, min: 0 },
  comparePrice: Number,
  costPrice: Number,
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  subcategory: String,
  brand: String,
  
  // Product Details
  fabric: { type: String, required: true },
  care: { type: String, default: 'Dry clean only' },
  occasion: [String],
  season: [String],
  style: String,
  pattern: String,
  neckline: String,
  sleeves: String,
  
  // Variants (sizes, colors, etc.)
  variants: [variantSchema],
  
  // Images
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }],
  
  // Video
  video: {
    url: String,
    publicId: String,
    thumbnail: String
  },
  
  // Inventory
  totalStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  trackQuantity: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },
  
  // Shipping
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingClass: String,
  
  // Reviews & Ratings
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 }
  },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  cartAddCount: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  
  // Tags & Search
  tags: [{ type: String, index: true }],
  searchKeywords: [String],
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false, index: true },
  isBestSeller: { type: Boolean, default: false, index: true },
  isOnSale: { type: Boolean, default: false, index: true },
  
  // Dates
  publishedAt: Date,
  availableFrom: Date,
  availableUntil: Date,
  
  // FAQ
  faqs: [faqSchema],
  
  // SEO
  seo: seoSchema,
  
  // Related Products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Vendor (for marketplace)
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Custom Fields
  customFields: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1, isActive: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ 'variants.stock': 1 });

// Virtual fields
productSchema.virtual('inStock').get(function() {
  return this.totalStock > 0;
});

productSchema.virtual('isLowStock').get(function() {
  return this.totalStock <= this.lowStockThreshold;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.basePrice < this.comparePrice) {
    return Math.round(((this.comparePrice - this.basePrice) / this.comparePrice) * 100);
  }
  return 0;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  // Calculate total stock from variants
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((total, variant) => {
      return total + (variant.stock || 0);
    }, 0);
  }
  
  // Update rating distribution and average
  if (this.isModified('reviews')) {
    this.totalReviews = this.reviews.length;
    
    if (this.totalReviews > 0) {
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;
      
      this.reviews.forEach(review => {
        distribution[review.rating]++;
        totalRating += review.rating;
      });
      
      this.ratingDistribution = distribution;
      this.averageRating = totalRating / this.totalReviews;
    } else {
      this.averageRating = 0;
      this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }
  }
  
  // Set published date
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Instance methods
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

productSchema.methods.addToWishlist = function() {
  this.wishlistCount += 1;
  return this.save();
};

productSchema.methods.removeFromWishlist = function() {
  this.wishlistCount = Math.max(0, this.wishlistCount - 1);
  return this.save();
};

productSchema.methods.incrementCartAdd = function() {
  this.cartAddCount += 1;
  return this.save();
};

productSchema.methods.incrementSoldCount = function(quantity = 1) {
  this.soldCount += quantity;
  this.conversionRate = this.viewCount > 0 ? (this.soldCount / this.viewCount) * 100 : 0;
  return this.save();
};

productSchema.methods.updateStock = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant) {
    variant.stock = Math.max(0, variant.stock - quantity);
    this.totalStock = this.variants.reduce((total, v) => total + v.stock, 0);
    return this.save();
  }
  return Promise.reject(new Error('Variant not found'));
};

productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  return this.save();
};

// Static methods
productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { category: categoryId, status: 'active', isActive: true };
  return this.find(query, null, options).populate('category');
};

productSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    status: 'active', 
    isActive: true 
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({ 
    status: 'active', 
    isActive: true 
  })
  .sort({ soldCount: -1 })
  .limit(limit);
};

productSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', productSchema);