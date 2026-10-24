const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const { BloodTestBooking } = require('../models/BloodTest');
const { BedBooking } = require('../models/HospitalBed');
const { AmbulanceBooking } = require('../models/Ambulance');
const { auth, authorize } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', auth, authorize('authority'), async (req, res) => {
  try {
    const [
      totalUsers, totalDoctors, totalProviders, totalOrders,
      totalAppointments, totalRevenue, recentOrders, recentAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'provider' }),
      Order.countDocuments(),
      Appointment.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('patient', 'name').populate('provider', 'name'),
      Appointment.find().sort({ createdAt: -1 }).limit(10).populate('patient', 'name').populate('doctor', 'name')
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalDoctors, totalProviders, totalOrders,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard' });
  }
});

// All users management
router.get('/users', auth, authorize('authority'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, users, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Toggle user status
router.put('/users/:id/status', auth, authorize('authority'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;
    await user.save();

    res.json({ success: true, user: { id: user._id, name: user.name, isActive: user.isActive, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
});

// All orders for admin
router.get('/orders', auth, authorize('authority'), async (req, res) => {
  try {
    const { status, orderType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('patient', 'name email phone')
      .populate('provider', 'name providerProfile.businessName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, orders, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

module.exports = router;
