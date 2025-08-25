const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const exists = await Wishlist.findOne({ user: userId, product: productId });
    if (exists) return res.status(400).json({ message: 'Already in wishlist' });
    await Wishlist.create({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    await Wishlist.findOneAndDelete({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: -1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.find({ user: userId }).populate('product');
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};
