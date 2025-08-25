const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart', // Reference to Cart collection
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to Product collection
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    selected_size: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    selected_color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
      min: 0
    },
    added_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // createdAt & updatedAt auto add
  }
);

module.exports = mongoose.model('CartItem', cartItemSchema);
