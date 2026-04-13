
const express = require('express');
const router = express.Router();
const Product = require('../models/RecycledProduct');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { category, sort, featured } = req.query;
    let query = {};
    
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.featured = true;
    
    let products = await Product.find(query);
    
    // Sorting
    if (sort === 'price-low') products = products.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') products = products.sort((a, b) => b.price - a.price);
    if (sort === 'impact') products = products.sort((a, b) => b.impact.plasticRemoved - a.impact.plasticRemoved);
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order (purchase)
router.post('/order', protect, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    // Calculate totals and impact
    let totalAmount = 0;
    let totalImpact = { plasticRemoved: 0, co2Prevented: 0, waterSaved: 0, itemsRecycled: 0 };
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product?.name || 'Product'} out of stock` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      const itemImpact = {
        plasticRemoved: product.impact.plasticRemoved * item.quantity,
        co2Prevented: product.impact.co2Prevented * item.quantity,
        waterSaved: product.impact.waterSaved * item.quantity,
        itemsRecycled: product.impact.itemsRecycled * item.quantity
      };
      
      totalImpact.plasticRemoved += itemImpact.plasticRemoved;
      totalImpact.co2Prevented += itemImpact.co2Prevented;
      totalImpact.waterSaved += itemImpact.waterSaved;
      totalImpact.itemsRecycled += itemImpact.itemsRecycled;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        impact: itemImpact
      });
      
      // Update stock
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }
    
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      totalImpact,
      shippingAddress
    });
    
    // Update user impact stats
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        'impactStats.plasticRemoved': totalImpact.plasticRemoved,
        'impactStats.co2Prevented': totalImpact.co2Prevented,
        'impactStats.waterSaved': totalImpact.waterSaved,
        'impactStats.itemsRecycled': totalImpact.itemsRecycled
      }
    });
    
    res.json({ success: true, order, totalImpact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's impact stats
router.get('/my-impact', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    const totalImpact = orders.reduce((acc, order) => ({
      plasticRemoved: acc.plasticRemoved + order.totalImpact.plasticRemoved,
      co2Prevented: acc.co2Prevented + order.totalImpact.co2Prevented,
      waterSaved: acc.waterSaved + order.totalImpact.waterSaved,
      itemsRecycled: acc.itemsRecycled + order.totalImpact.itemsRecycled
    }), { plasticRemoved: 0, co2Prevented: 0, waterSaved: 0, itemsRecycled: 0 });
    
    res.json({ success: true, impact: totalImpact, orderCount: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;