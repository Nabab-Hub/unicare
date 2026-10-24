const express = require('express');
const router = express.Router();
const { HospitalBed, BedBooking } = require('../models/HospitalBed');
const { auth, authorize } = require('../middleware/auth');

// Get available hospital beds
router.get('/', async (req, res) => {
  try {
    const { wardType, city, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, availableBeds: { $gt: 0 } };
    if (wardType) query.wardType = wardType;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const total = await HospitalBed.countDocuments(query);
    const beds = await HospitalBed.find(query)
      .populate('hospital', 'name address providerProfile.businessName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, beds, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching beds' });
  }
});

// Add hospital beds (provider)
router.post('/', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const bed = await HospitalBed.create({ ...req.body, hospital: req.user._id });
    res.status(201).json({ success: true, bed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding bed' });
  }
});

// Book hospital bed
router.post('/book', auth, authorize('patient'), async (req, res) => {
  try {
    const { bedId, admissionDate, estimatedDays, patientCondition, paymentMethod } = req.body;

    const bed = await HospitalBed.findById(bedId);
    if (!bed || bed.availableBeds <= 0) {
      return res.status(400).json({ success: false, message: 'No beds available' });
    }

    const totalAmount = bed.pricePerDay * (estimatedDays || 1);

    const booking = await BedBooking.create({
      patient: req.user._id,
      hospital: bed.hospital,
      bed: bedId,
      hospitalName: bed.hospitalName,
      wardType: bed.wardType,
      admissionDate: new Date(admissionDate),
      estimatedDays,
      pricePerDay: bed.pricePerDay,
      totalAmount,
      patientCondition,
      paymentMethod
    });

    bed.availableBeds -= 1;
    await bed.save();

    await booking.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'hospital', select: 'name providerProfile.businessName address' }
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Bed booking error:', error);
    res.status(500).json({ success: false, message: 'Error booking bed' });
  }
});

// Get my bed bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient: req.user._id }
      : req.user.role === 'provider'
      ? { hospital: req.user._id }
      : {};

    const bookings = await BedBooking.find(query)
      .populate('patient', 'name email phone')
      .populate('hospital', 'name providerProfile.businessName address')
      .populate('doctorAssigned', 'name doctorProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// Update bed booking status
router.put('/bookings/:id/status', auth, authorize('provider', 'authority'), async (req, res) => {
  try {
    const { status, doctorAssigned, notes, dischargeDate } = req.body;
    const update = { status };
    if (doctorAssigned) update.doctorAssigned = doctorAssigned;
    if (notes) update.notes = notes;

    if (status === 'discharged' || status === 'cancelled') {
      const booking = await BedBooking.findById(req.params.id);
      if (booking) {
        await HospitalBed.findByIdAndUpdate(booking.bed, { $inc: { availableBeds: 1 } });
        if (dischargeDate) update.dischargeDate = new Date(dischargeDate);
      }
    }

    const booking = await BedBooking.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('patient', 'name email phone')
      .populate('hospital', 'name address');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating booking' });
  }
});

module.exports = router;
