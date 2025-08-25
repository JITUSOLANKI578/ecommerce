const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
// const { getRedisClient } = require('../../config/redis');
const { logger } = require('../utils/logger');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug images basePrice variants status isActive totalStock',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .populate('discount.coupon', 'code name type value');

    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }

    // Check product availability and update prices
    let cartUpdated = false;
    const updatedItems = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if product is still active and available
      if (!product || product.status !== 'active' || !product.isActive) {
        cartUpdated = true;
        continue; // Skip inactive products
      }

      // Find the specific variant
      const variant = product.variants.id(item.variant);
      if (!variant || !variant.isActive || variant.stock < item.quantity) {
        cartUpdated = true;
        // Adjust quantity to available stock or remove if no stock
        if (variant && variant.stock > 0) {
          item.quantity = variant.stock;
          item.totalPrice = item.quantity * (variant.discountPrice || variant.price);
        } else {
          continue; // Skip out of stock variants
        }
      }

      // Update price if changed
      const currentPrice = variant.discountPrice || variant.price;
      if (item.price !== currentPrice) {
        item.price = currentPrice;
        item.totalPrice = item.quantity * currentPrice;
        cartUpdated = true;
      }

      updatedItems.push(item);
    }

    if (cartUpdated) {
      cart.items = updatedItems;
      await cart.save();
    }

    // Cache cart
    // const redis = getRedisClient();
    // if (redis) {
    //   await redis.setex(`cart:${userId}`, 300, JSON.stringify(cart));
    // }

    res.json({
      success: true,
      data: { cart }
    });

  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity = 1 } = req.body;

    // Validate input
    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and variant ID are required'
      });
    }

    // Find product and variant
    const product = await Product.findOne({
      _id: productId,
      status: 'active',
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found or unavailable'
      });
    }

    // Check stock availability
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId &&
               item.variant.toString() === variantId
    );

    const price = variant.discountPrice || variant.price;

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${variant.stock} available in stock`
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.totalPrice = newQuantity * price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price,
        discountPrice: variant.discountPrice,
        totalPrice: quantity * price
      });
    }

    await cart.save();

    // Increment product cart add count
    await product.incrementCartAdd();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    // Clear cache
    // const redis = getRedisClient();
    // if (redis) {
    //   await redis.del(`cart:${userId}`);
    // }

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    const variant = product.variants.id(item.variant);

    if (quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`
      });
    }

    // Update item
    item.quantity = quantity;
    item.totalPrice = quantity * (item.discountPrice || item.price);

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    // Clear cache
    // const redis = getRedisClient();
    // if (redis) {
    //   await redis.del(`cart:${userId}`);
    // }

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    // Clear cache
    // const redis = getRedisClient();
    // if (redis) {
    //   await redis.del(`cart:${userId}`);
    // }

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    // Clear cache
    // const redis = getRedisClient();
    // if (redis) {
    //   await redis.del(`cart:${userId}`);
    // }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Apply coupon to cart
exports.applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Validate coupon
    const validation = coupon.canBeUsedBy(user, cart.subtotal, cart.items);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(cart.subtotal, cart.items);

    // Apply coupon to cart
    cart.discount = {
      amount: discountAmount,
      coupon: coupon._id,
      type: coupon.type
    };

    await cart.save();

    // Populate cart for response
    await cart.populate('discount.coupon', 'code name type value');

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart,
        discountAmount
      }
    });

  } catch (error) {
    logger.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon'
    });
  }
};

// Remove coupon from cart
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.discount = {
      amount: 0,
      coupon: null,
      type: null
    };

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon'
    });
  }
};

// Move item to saved for later
exports.saveForLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    item.savedForLater = true;
    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    res.json({
      success: true,
      message: 'Item saved for later',
      data: { cart }
    });

  } catch (error) {
    logger.error('Save for later error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save item for later'
    });
  }
};

// Move item back to cart from saved for later
exports.moveToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in saved items'
      });
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    const variant = product.variants.id(item.variant);

    if (item.quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`
      });
    }

    item.savedForLater = false;
    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    res.json({
      success: true,
      message: 'Item moved to cart',
      data: { cart }
    });

  } catch (error) {
    logger.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move item to cart'
    });
  }
};

// Sync cart (for guest to user conversion)
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart items'
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId });
    }

    // Process each item
    for (const item of items) {
      const { productId, variantId, quantity } = item;

      // Validate product and variant
      const product = await Product.findOne({
        _id: productId,
        status: 'active',
        isActive: true
      });

      if (!product) continue;

      const variant = product.variants.id(variantId);
      if (!variant || !variant.isActive || variant.stock < quantity) continue;

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.product.toString() === productId &&
                    cartItem.variant.toString() === variantId
      );

      const price = variant.discountPrice || variant.price;

      if (existingItemIndex > -1) {
        // Update existing item
        const existingItem = cart.items[existingItemIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, variant.stock);
        existingItem.quantity = newQuantity;
        existingItem.totalPrice = newQuantity * price;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          variant: variantId,
          quantity: Math.min(quantity, variant.stock),
          price,
          discountPrice: variant.discountPrice,
          totalPrice: Math.min(quantity, variant.stock) * price
        });
      }
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name slug images basePrice variants',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    res.json({
      success: true,
      message: 'Cart synced successfully',
      data: { cart }
    });

  } catch (error) {
    logger.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart'
    });
  }
};

module.exports = exports;