const asyncHandler = require('express-async-handler');
// const { Op } = require('connectDB');
const { Order, OrderItem, Cart, CartItem, Product, User, Address } = require('../models');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const { logger } = require('../utils/logger');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shipping_address,
    payment_method,
    items_price,
    shipping_price,
    tax_price,
    total_price,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No order items provided',
    });
  }

  // Validate and process order items
  const orderItems = [];
  let calculatedItemsPrice = 0;

  for (const item of items) {
    const product = await Product.findByPk(item.product_id);
    
    if (!product || !product.is_active || !product.in_stock) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.product_id} is not available`,
      });
    }

    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product ${product.name}`,
      });
    }

    const price = product.discount_price || product.price;
    const totalPrice = price * item.quantity;
    calculatedItemsPrice += totalPrice;

    orderItems.push({
      product_id: product.id,
      name: product.name,
      image: product.images[0]?.url || '',
      quantity: item.quantity,
      selected_size: item.selected_size,
      selected_color: item.selected_color,
      price: price,
      total_price: totalPrice,
    });
  }

  // Create order
  const order = await Order.create({
    user_id: req.user.id,
    shipping_address,
    payment_method,
    items_price: calculatedItemsPrice,
    shipping_price: shipping_price || 0,
    tax_price: tax_price || 0,
    total_price: calculatedItemsPrice + (shipping_price || 0) + (tax_price || 0),
    status_history: [
      {
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed successfully',
      },
    ],
  });

  // Create order items
  const createdOrderItems = await OrderItem.bulkCreate(
    orderItems.map(item => ({ ...item, order_id: order.id }))
  );

  // Update product stock and sold count
  for (const item of items) {
    await Product.decrement('stock_quantity', {
      by: item.quantity,
      where: { id: item.product_id },
    });
    
    await Product.increment('sold_count', {
      by: item.quantity,
      where: { id: item.product_id },
    });
  }

  // Clear user's cart
  const cart = await Cart.findOne({ where: { user_id: req.user.id } });
  if (cart) {
    await CartItem.destroy({ where: { cart_id: cart.id } });
    await cart.update({ total_items: 0, total_amount: 0 });
  }

  // Send order confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      template: 'orderConfirmation',
      data: {
        customerName: req.user.name,
        orderNumber: order.order_number,
        orderDate: order.created_at,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: orderItems,
        itemsPrice: order.items_price,
        shippingPrice: order.shipping_price,
        totalPrice: order.total_price,
      },
    });
  } catch (error) {
    logger.error('Failed to send order confirmation email:', error);
  }

  // Send SMS notification
  try {
    await sendSMS(req.user.phone, `Your Ambika order ${order.order_number} has been placed successfully! Track your order at ambika.com/track`);
  } catch (error) {
    logger.error('Failed to send order SMS:', error);
  }

  // Get complete order data
  const completeOrder = await Order.findByPk(order.id, {
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }],
      },
      {
        model: User,
        attributes: ['id', 'name', 'email', 'phone'],
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order: completeOrder },
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const whereClause = { user_id: req.user.id };

  if (req.query.status) {
    whereClause.order_status = req.query.status;
  }

  const { count, rows: orders } = await Order.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }],
      },
      {
        model: User,
        attributes: ['id', 'name', 'email', 'phone'],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: { order },
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Update status history
  const statusHistory = order.status_history || [];
  statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Order status changed to ${status}`,
  });

  // Update order
  await order.update({
    order_status: status,
    status_history: statusHistory,
    is_delivered: status === 'delivered',
    delivered_at: status === 'delivered' ? new Date() : order.delivered_at,
  });

  // Send notification
  try {
    await sendSMS(order.User.phone, `Your Ambika order ${order.order_number} status: ${status}. Track at ambika.com/track`);
  } catch (error) {
    logger.error('Failed to send status update SMS:', error);
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order },
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
    include: [{ model: OrderItem }],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Check if order can be cancelled
  const cancellableStatuses = ['placed', 'confirmed', 'processing'];
  if (!cancellableStatuses.includes(order.order_status)) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage',
    });
  }

  // Restore product stock
  for (const item of order.OrderItems) {
    await Product.increment('stock_quantity', {
      by: item.quantity,
      where: { id: item.product_id },
    });
    
    await Product.decrement('sold_count', {
      by: item.quantity,
      where: { id: item.product_id },
    });
  }

  // Update status history
  const statusHistory = order.status_history || [];
  statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Order cancelled by customer. Reason: ${reason}`,
  });

  // Update order
  await order.update({
    order_status: 'cancelled',
    cancellation_reason: reason,
    status_history: statusHistory,
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

// @desc    Return order
// @route   PUT /api/orders/:id/return
// @access  Private
exports.returnOrder = asyncHandler(async (req, res) => {
  const { reason, items } = req.body;
  
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Check if order can be returned
  if (order.order_status !== 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Only delivered orders can be returned',
    });
  }

  // Check return window (7 days)
  const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const timeSinceDelivery = Date.now() - new Date(order.delivered_at).getTime();
  
  if (timeSinceDelivery > returnWindow) {
    return res.status(400).json({
      success: false,
      message: 'Return window has expired',
    });
  }

  // Update status history
  const statusHistory = order.status_history || [];
  statusHistory.push({
    status: 'returned',
    timestamp: new Date(),
    note: `Return requested by customer. Reason: ${reason}`,
  });

  // Update order
  await order.update({
    order_status: 'returned',
    return_reason: reason,
    status_history: statusHistory,
  });

  res.json({
    success: true,
    message: 'Return request submitted successfully',
    data: { order },
  });
});

// @desc    Track order
// @route   GET /api/orders/track/:orderNumber
// @access  Private
exports.trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      order_number: req.params.orderNumber,
      user_id: req.user.id,
    },
    include: [
      {
        model: OrderItem,
        include: [{ model: Product }],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: { order },
  });
});

// @desc    Process payment
// @route   POST /api/orders/:id/payment
// @access  Private
exports.processPayment = asyncHandler(async (req, res) => {
  const { payment_result } = req.body;
  
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Update payment status
  await order.update({
    is_paid: true,
    paid_at: new Date(),
    payment_status: 'paid',
    payment_result,
    order_status: 'confirmed',
  });

  res.json({
    success: true,
    message: 'Payment processed successfully',
    data: { order },
  });
});