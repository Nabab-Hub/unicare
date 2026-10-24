const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all doctors (public)
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, search, city, page = 1, limit = 12 } = req.query;
    const query = { role: 'doctor', isActive: true };

    if (specialization) query['doctorProfile.specialization'] = specialization;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'doctorProfile.specialization': new RegExp(search, 'i') },
        { 'doctorProfile.hospital': new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(query);
    const doctors = await User.find(query)
      .select('-password')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, doctors, pagination: { current: Number(page), pages: Math.ceil(total / Number(limit)), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
});

// Get doctor by ID
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' }).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctor' });
  }
});

// Book appointment
router.post('/', auth, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, symptoms, paymentMethod } = req.body;

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointmentData = {
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      type: type || 'in_person',
      symptoms,
      consultationFee: doctor.doctorProfile.consultationFee || 500,
      paymentMethod
    };

    if (type === 'video') {
      appointmentData.videoCallRoom = uuidv4();
    }

    const appointment = await Appointment.create(appointmentData);
    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name email doctorProfile' }
    ]);

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Appointment error:', error);
    res.status(500).json({ success: false, message: 'Error booking appointment' });
  }
});

// Get patient's appointments
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const query = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };

    const { status } = req.query;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email phone doctorProfile avatar')
      .sort({ appointmentDate: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
});

// Update appointment status (doctor/authority)
router.put('/:id/status', auth, authorize('doctor', 'authority'), async (req, res) => {
  try {
    const { status, diagnosis, prescription, notes } = req.body;
    const update = { status };
    if (diagnosis) update.diagnosis = diagnosis;
    if (prescription) update.prescription = prescription;
    if (notes) update.notes = notes;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name doctorProfile');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating appointment' });
  }
});

// Cancel appointment
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.patient.toString() !== req.user._id.toString() &&
        appointment.doctor.toString() !== req.user._id.toString() &&
        req.user.role !== 'authority') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    if (appointment.paymentStatus === 'completed') {
      appointment.paymentStatus = 'refunded';
    }
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling appointment' });
  }
});

// Rate appointment
router.put('/:id/rate', auth, authorize('patient'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id, status: 'completed' },
      { rating, review },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Update doctor's average rating
    const stats = await Appointment.aggregate([
      { $match: { doctor: appointment.doctor, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(appointment.doctor, {
        'doctorProfile.rating': Math.round(stats[0].avgRating * 10) / 10,
        'doctorProfile.totalReviews': stats[0].count
      });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rating appointment' });
  }
});

module.exports = router;
