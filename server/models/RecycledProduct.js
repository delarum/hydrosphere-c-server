
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['fashion', 'home', 'accessories', 'tech', 'art']
  },
  // Environmental impact data
  impact: {
    plasticRemoved: { type: Number, default: 0 }, // kg
    co2Prevented: { type: Number, default: 0 }, // kg
    waterSaved: { type: Number, default: 0 }, // liters
    itemsRecycled: { type: Number, default: 0 } // count
  },
  stock: { type: Number, default: 100 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  reviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  badge: { type: String, default: '' } // 'Bestseller', 'New', 'Limited'
}, { timestamps: true });

module.exports = mongoose.model('RecycledProduct', productSchema);