const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to User collection
      required: true
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number']
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      maxlength: 100
    },
    state: {
      type: String,
      required: true,
      maxlength: 100
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Invalid pincode']
    },
    country: {
      type: String,
      default: 'India'
    },
    is_default: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Address', addressSchema);
