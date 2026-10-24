const express = require('express');
const router = express.Router();
const { BloodTest, BloodTestBooking } = require('../models/BloodTest');
const { auth, authorize } = require('../middleware/auth');

// Get all blood tests
router.get('/', async (req, res) => {
  try {
    const { category, search, city, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = new RegExp(search, 'i');
    if (city) query.serviceAreas = { $in: [new RegExp(city, 'i')] };

    const total = await BloodTest.countDocuments(query);
    const tests = await BloodTest.find(query)
      .populate('provider', 'name providerProfile.businessName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, tests, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching blood tests' });
  }
});

// Get single test
router.get('/:id', async (req, res) => {
  try {
    const test = await BloodTest.findById(req.params.id).populate('provider', 'name providerProfile');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching test' });
  }
});

// Add blood test (provider)
router.post('/', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const test = await BloodTest.create({ ...req.body, provider: req.user._id });
    res.status(201).json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding test' });
  }
});

// Book blood test
router.post('/book', auth, authorize('patient'), async (req, res) => {
  try {
    const { testIds, providerId, collectionDate, collectionTimeSlot, collectionAddress, paymentMethod } = req.body;

    const tests = await BloodTest.find({ _id: { $in: testIds } });
    if (tests.length === 0) return res.status(400).json({ success: false, message: 'No valid tests selected' });

    let totalAmount = 0;
    const testItems = tests.map(t => {
      totalAmount += t.sellingPrice;
      return { test: t._id, name: t.name, price: t.sellingPrice };
    });

    const booking = await BloodTestBooking.create({
      patient: req.user._id,
      tests: testItems,
      provider: providerId || tests[0].provider,
      collectionDate: new Date(collectionDate),
      collectionTimeSlot,
      collectionAddress,
      totalAmount,
      paymentMethod
    });

    await booking.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'provider', select: 'name providerProfile.businessName' }
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Blood test booking error:', error);
    res.status(500).json({ success: false, message: 'Error booking blood test' });
  }
});

// Get my bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : req.user.role === 'provider'
      ? { provider: req.user._id }
      : {};

    const bookings = await BloodTestBooking.find(query)
      .populate('patient', 'name email phone')
      .populate('provider', 'name providerProfile.businessName')
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// Update booking status
router.put('/bookings/:id/status', auth, authorize('provider', 'employee', 'authority'), async (req, res) => {
  try {
    const { status, collector, reportUrl, trackingUpdate } = req.body;
    const update = { status };
    if (collector) update.collector = collector;
    if (reportUrl) update.reportUrl = reportUrl;

    const booking = await BloodTestBooking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (trackingUpdate) {
      booking.trackingUpdates.push(trackingUpdate);
      await booking.save();
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking' });
  }
});

module.exports = router;
