const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const Address = require('./Address');
const Coupon = require('./Coupon');

// Mongoose me associations ko hum `ref` ke through define karte hain
// Aur populate() method use karke fetch karte hain
// Example models me already ref: 'User', ref: 'Product' waale fields honge

module.exports = {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  Wishlist,
  Address,
  Coupon
};
