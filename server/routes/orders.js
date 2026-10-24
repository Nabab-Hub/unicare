const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

// Get my orders
router.get('/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : req.user.role === 'provider'
      ? { provider: req.user._id }
      : {};

    const { status, orderType } = req.query;
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const orders = await Order.find(query)
      .populate('patient', 'name email phone')
      .populate('provider', 'name providerProfile.businessName')
      .populate('deliveryPerson', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('patient', 'name email phone address')
      .populate('provider', 'name providerProfile phone')
      .populate('deliveryPerson', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
});

// Update order status (provider/employee/authority)
router.put('/:id/status', auth, authorize('provider', 'employee', 'authority'), async (req, res) => {
  try {
    const { status, deliveryPerson, trackingUpdate } = req.body;
    const update = { status };
    if (deliveryPerson) update.deliveryPerson = deliveryPerson;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (trackingUpdate) {
      order.trackingUpdates.push(trackingUpdate);
      await order.save();
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
});

// Track order location
router.get('/:id/track', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('status trackingUpdates deliveryAddress deliveryPerson')
      .populate('deliveryPerson', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, tracking: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking order' });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.patient.toString() !== req.user._id.toString() && req.user.role !== 'authority') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['dispatched', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order at this stage' });
    }

    order.status = 'cancelled';
    if (order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
    }
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling order' });
  }
});

module.exports = router;
