// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Handle image upload if using multer/cloudinary
    let productData = req.body;
    if (req.file || req.files) {
      // If using single or multiple image upload
      const images = req.files ? req.files.map(f => ({ url: f.path, publicId: f.filename })) : [{ url: req.file.path, publicId: req.file.filename }];
      productData.images = images;
    }
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;
    if (req.file || req.files) {
      const images = req.files ? req.files.map(f => ({ url: f.path, publicId: f.filename })) : [{ url: req.file.path, publicId: req.file.filename }];
      updateData.images = images;
    }
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
// const { getRedisClient } = require('../../config/redis');
const { getESClient } = require('../../config/elasticsearch');
const { logger } = require('../utils/logger');
const { validateProduct } = require('../utils/validation');

// Get all products with advanced filtering
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      size,
      color,
      fabric,
      brand,
      occasion,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      featured,
      newArrival,
      bestSeller,
      onSale,
      inStock = true
    } = req.query;

    // Build query
    const query = {
      status: 'active',
      isActive: true
    };

    // Category filter
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) query.category = categoryDoc._id;
      }
    }

    // Subcategory filter
    if (subcategory) query.subcategory = new RegExp(subcategory, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    // Variant-based filters
    if (size || color) {
      const variantQuery = {};
      if (size) variantQuery['variants.size'] = new RegExp(size, 'i');
      if (color) variantQuery['variants.color'] = new RegExp(color, 'i');
      Object.assign(query, variantQuery);
    }

    // Other filters
    if (fabric) query.fabric = new RegExp(fabric, 'i');
    if (brand) query.brand = new RegExp(brand, 'i');
    if (occasion) query.occasion = { $in: [new RegExp(occasion, 'i')] };

    // Boolean filters
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (onSale === 'true') query.isOnSale = true;
    if (inStock === 'true') query.totalStock = { $gt: 0 };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with aggregation for better performance
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $addFields: {
          minPrice: {
            $min: '$variants.price'
          },
          maxPrice: {
            $max: '$variants.price'
          },
          availableSizes: '$variants.size',
          availableColors: '$variants.color'
        }
      },
      { $sort: sortOptions },
      {
        $facet: {
          products: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);
    const products = result.products;
    const totalProducts = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Cache the result
    // const redis = getRedisClient();
    // if (redis) {
    //   const cacheKey = `products:${JSON.stringify(req.query)}`;
    //   await redis.setex(cacheKey, 300, JSON.stringify({
    //     products,
    //     pagination: {
    //       currentPage: pageNum,
    //       totalPages,
    //       totalProducts,
    //       hasNextPage,
    //       hasPrevPage,
    //       limit: limitNum
    //     }
    //   }));
    // }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get single product by ID or slug
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    // const redis = getRedisClient();
    // if (redis) {
    //   const cached = await redis.get(`product:${id}`);
    //   if (cached) {
    //     const product = JSON.parse(cached);

    //     // Increment view count asynchronously
    //     Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    //     return res.json({
    //       success: true,
    //       data: { product }
    //     });
    //   }
    // }

    // Find by ID or slug
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { slug: id };

    const product = await Product.findOne({
      ...query,
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar')
    .populate('relatedProducts', 'name slug basePrice images averageRating');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViewCount();

    // Add to user's recently viewed (if authenticated)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { recentlyViewed: { product: product._id } }
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          recentlyViewed: {
            $each: [{ product: product._id }],
            $position: 0,
            $slice: 20
          }
        }
      });
    }

    // Cache the result
    // if (redis) {
    //   await redis.setex(`product:${id}`, 600, JSON.stringify(product));
    // }

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Search products with Elasticsearch
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12, filters = {} } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Add to user's search history (if authenticated)
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { searchHistory: { query: q } }
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          searchHistory: {
            $each: [{ query: q }],
            $position: 0,
            $slice: 50
          }
        }
      });
    }

    const esClient = getESClient();

    if (esClient) {
      // Use Elasticsearch for advanced search
      const searchBody = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: ['name^3', 'description^2', 'tags', 'searchKeywords'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              { term: { status: 'active' } },
              { term: { isActive: true } }
            ]
          }
        },
        highlight: {
          fields: {
            name: {},
            description: {}
          }
        },
        aggs: {
          categories: {
            terms: { field: 'category.keyword' }
          },
          priceRanges: {
            range: {
              field: 'basePrice',
              ranges: [
                { to: 1000 },
                { from: 1000, to: 5000 },
                { from: 5000, to: 10000 },
                { from: 10000 }
              ]
            }
          }
        }
      };

      const response = await esClient.search({
        index: 'products',
        body: searchBody,
        from: (page - 1) * limit,
        size: limit
      });

      const products = response.body.hits.hits.map(hit => ({
        ...hit._source,
        _score: hit._score,
        highlight: hit.highlight
      }));

      return res.json({
        success: true,
        data: {
          products,
          total: response.body.hits.total.value,
          aggregations: response.body.aggregations,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(response.body.hits.total.value / limit),
            totalProducts: response.body.hits.total.value
          }
        }
      });
    }

    // Fallback to MongoDB text search
    const products = await Product.find({
      $text: { $search: q },
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments({
      $text: { $search: q },
      status: 'active',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        products,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });

  } catch (error) {
    logger.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    logger.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isNewArrival: true,
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    logger.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals'
    });
  }
};

// Get best sellers
exports.getBestSellers = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .sort({ soldCount: -1, averageRating: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    logger.error('Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best sellers'
    });
  }
};

// Add product review
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    const review = {
      user: userId,
      rating: parseInt(rating),
      title,
      comment,
      images: images || [],
      isVerified: false // Will be verified after purchase confirmation
    };

    product.reviews.push(review);
    await product.save();

    // Populate the new review
    await product.populate('reviews.user', 'name avatar');

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        product,
        review: product.reviews[product.reviews.length - 1]
      }
    });

  } catch (error) {
    logger.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

// Get product recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get recommendations based on category, tags, and price range
    const recommendations = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        {
          basePrice: {
            $gte: product.basePrice * 0.7,
            $lte: product.basePrice * 1.3
          }
        }
      ],
      status: 'active',
      isActive: true
    })
    .populate('category', 'name slug')
    .sort({ averageRating: -1, soldCount: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
};

// Get product filters
exports.getFilters = async (req, res) => {
  try {
    const { category } = req.query;

    const matchQuery = {
      status: 'active',
      isActive: true
    };

    if (category) {
      matchQuery.category = mongoose.Types.ObjectId(category);
    }

    const filters = await Product.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          subcategories: { $addToSet: '$subcategory' },
          brands: { $addToSet: '$brand' },
          fabrics: { $addToSet: '$fabric' },
          occasions: { $addToSet: '$occasion' },
          sizes: { $addToSet: '$variants.size' },
          colors: { $addToSet: '$variants.color' },
          priceRange: {
            $push: {
              min: { $min: '$variants.price' },
              max: { $max: '$variants.price' }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      }
    ]);

    const result = filters[0] || {};

    // Flatten arrays and remove nulls
    const cleanFilters = {
      categories: result.categoryDetails || [],
      subcategories: [...new Set(result.subcategories?.filter(Boolean))],
      brands: [...new Set(result.brands?.filter(Boolean))],
      fabrics: [...new Set(result.fabrics?.filter(Boolean))],
      occasions: [...new Set(result.occasions?.flat().filter(Boolean))],
      sizes: [...new Set(result.sizes?.flat().filter(Boolean))],
      colors: [...new Set(result.colors?.flat().filter(Boolean))],
      priceRange: {
        min: Math.min(...(result.priceRange?.map(p => p.min) || [0])),
        max: Math.max(...(result.priceRange?.map(p => p.max) || [0]))
      }
    };

    res.json({
      success: true,
      data: { filters: cleanFilters }
    });

  } catch (error) {
    logger.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters'
    });
  }
};

module.exports = exports;