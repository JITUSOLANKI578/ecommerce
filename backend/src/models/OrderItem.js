const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 255
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selected_size: {
    type: String,
    required: true,
    maxlength: 50
  },
  selected_color: {
    type: String,
    required: true,
    maxlength: 50
  },
  price: {
    type: Number, // Agar exact decimal chahiye toh mongoose.Decimal128 use kar sakte ho
    required: true,
    min: 0
  },
  total_price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
