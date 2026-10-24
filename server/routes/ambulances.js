const express = require('express');
const router = express.Router();
const { Ambulance, AmbulanceBooking } = require('../models/Ambulance');
const { auth, authorize } = require('../middleware/auth');

// Get available ambulances
router.get('/', async (req, res) => {
  try {
    const { vehicleType, city, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, isAvailable: true };
    if (vehicleType) query.vehicleType = vehicleType;
    if (city) query.serviceArea = { $in: [new RegExp(city, 'i')] };

    const total = await Ambulance.countDocuments(query);
    const ambulances = await Ambulance.find(query)
      .populate('provider', 'name providerProfile.businessName phone')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, ambulances, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ambulances' });
  }
});

// Add ambulance (provider)
router.post('/', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const ambulance = await Ambulance.create({ ...req.body, provider: req.user._id });
    res.status(201).json({ success: true, ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding ambulance' });
  }
});

// Book ambulance
router.post('/book', auth, async (req, res) => {
  try {
    const { ambulanceId, pickupLocation, destination, emergencyType, patientCondition, paymentMethod } = req.body;

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance || !ambulance.isAvailable) {
      return res.status(400).json({ success: false, message: 'Ambulance not available' });
    }

    // Calculate estimated fare
    let distance = 10; // Default 10 km if coordinates not provided
    if (pickupLocation.lat && pickupLocation.lng && destination?.lat && destination?.lng) {
      const R = 6371;
      const dLat = (destination.lat - pickupLocation.lat) * Math.PI / 180;
      const dLon = (destination.lng - pickupLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pickupLocation.lat * Math.PI/180) * Math.cos(destination.lat * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const estimatedFare = ambulance.baseFare + (distance * ambulance.pricePerKm);

    const booking = await AmbulanceBooking.create({
      patient: req.user._id,
      ambulance: ambulanceId,
      provider: ambulance.provider,
      pickupLocation,
      destination,
      emergencyType,
      patientCondition,
      estimatedFare: Math.round(estimatedFare),
      distance: Math.round(distance * 10) / 10,
      paymentMethod: paymentMethod || 'cod'
    });

    ambulance.isAvailable = false;
    await ambulance.save();

    await booking.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'ambulance', select: 'vehicleNumber vehicleType driver' },
      { path: 'provider', select: 'name phone' }
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Ambulance booking error:', error);
    res.status(500).json({ success: false, message: 'Error booking ambulance' });
  }
});

// Get my ambulance bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : req.user.role === 'provider'
      ? { provider: req.user._id }
      : {};

    const bookings = await AmbulanceBooking.find(query)
      .populate('patient', 'name email phone')
      .populate('ambulance', 'vehicleNumber vehicleType driver currentLocation')
      .populate('provider', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// Update ambulance booking status
router.put('/bookings/:id/status', auth, authorize('provider', 'employee', 'authority'), async (req, res) => {
  try {
    const { status, trackingUpdate, finalFare } = req.body;
    const update = { status };
    if (finalFare) update.finalFare = finalFare;

    const booking = await AmbulanceBooking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (trackingUpdate) {
      booking.trackingUpdates.push(trackingUpdate);
      await booking.save();
    }

    // Release ambulance on completion or cancellation
    if (status === 'completed' || status === 'cancelled') {
      await Ambulance.findByIdAndUpdate(booking.ambulance, { isAvailable: true });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking' });
  }
});

// Update ambulance location (real-time tracking)
router.put('/:id/location', auth, authorize('provider', 'employee'), async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng, lastUpdated: new Date() } },
      { new: true }
    );
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    res.json({ success: true, ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating location' });
  }
});

module.exports = router;
