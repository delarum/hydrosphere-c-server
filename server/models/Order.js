// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'RecycledProduct' },
    quantity: Number,
    price: Number,
    impact: {
      plasticRemoved: Number,
      co2Prevented: Number,
      waterSaved: Number,
      itemsRecycled: Number
    }
  }],
  totalAmount: Number,
  totalImpact: {
    plasticRemoved: Number,
    co2Prevented: Number,
    waterSaved: Number,
    itemsRecycled: Number
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    country: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', mongoose.model('Order', orderSchema));