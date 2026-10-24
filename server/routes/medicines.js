const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

// Get all medicines (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { sellingPrice: 1 };
    if (sort === 'price_high') sortOption = { sellingPrice: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'discount') sortOption = { discount: -1 };

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .populate('provider', 'name providerProfile.businessName')
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      medicines,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medicines' });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('provider', 'name providerProfile');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medicine' });
  }
});

// Add medicine (provider only)
router.post('/', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const medicine = await Medicine.create({ ...req.body, provider: req.user._id });
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding medicine' });
  }
});

// Update medicine
router.put('/:id', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      req.body,
      { new: true }
    );
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating medicine' });
  }
});

// Delete medicine
router.delete('/:id', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    await Medicine.findOneAndUpdate({ _id: req.params.id, provider: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing medicine' });
  }
});

// Place medicine order
router.post('/order', auth, authorize('patient'), async (req, res) => {
  try {
    const { items, paymentMethod, deliveryAddress, prescriptionImage, notes } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine || medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${medicine?.name || 'Medicine'} is out of stock or insufficient quantity`
        });
      }
      const itemTotal = medicine.sellingPrice * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        item: medicine._id,
        itemModel: 'Medicine',
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.sellingPrice
      });
      medicine.stock -= item.quantity;
      await medicine.save();
    }

    const order = await Order.create({
      patient: req.user._id,
      orderType: 'medicine',
      items: orderItems,
      totalAmount,
      discount: 0,
      finalAmount: totalAmount,
      paymentMethod,
      deliveryAddress,
      prescriptionImage,
      notes,
      provider: orderItems[0]?.item ? (await Medicine.findById(items[0].medicineId))?.provider : undefined,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    await order.populate('patient', 'name email phone');

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
});

module.exports = router;
